// src/js/main.js

import '../input.css';
import * as THREE from 'three';
import logoWhite from '../img/SMI_Logo_White.png';
import logoBlack from '../img/SMI_Logo_Black.png';
import faviconImg from '../img/favicon.ico';

document.addEventListener('DOMContentLoaded', () => {

    // --- THEME TOGGLE SCRIPT ---
    if (localStorage.theme === 'light' || (!('theme' in localStorage) && !window.matchMedia('(prefers-color-scheme: dark)').matches)) {
        document.documentElement.classList.remove('dark');
    } else {
        document.documentElement.classList.add('dark');
    }

    const mobileMenuButton = document.getElementById("mobile-menu-button");
    const mobileMenu = document.getElementById("mobile-menu");
    mobileMenuButton.addEventListener("click", () => {
        mobileMenu.classList.toggle("hidden");
    });

    const themeToggleBtn = document.getElementById("theme-toggle");
    const themeToggleDarkIcon = document.getElementById("theme-toggle-dark-icon");
    const themeToggleLightIcon = document.getElementById("theme-toggle-light-icon");
    const logoNav = document.getElementById("logo-nav");
    const logoAbout = document.getElementById("logo-about");
    const favicon = document.getElementById("favicon");

    let updateThemeUI = () => {
        const isDark = document.documentElement.classList.contains("dark");
        themeToggleLightIcon.classList.toggle("hidden", isDark);
        themeToggleDarkIcon.classList.toggle("hidden", !isDark);
        logoNav.src = isDark ? logoWhite : logoBlack;
        logoAbout.src = isDark ? logoWhite : logoBlack;
        favicon.href = faviconImg;
    };

    themeToggleBtn.addEventListener("click", () => {
        document.documentElement.classList.toggle("dark");
        localStorage.theme = document.documentElement.classList.contains("dark") ? "dark" : "light";
        updateThemeUI();
    });

// --- WIREFRAME WAVE BACKGROUND WITH CURSOR RIPPLES ---
const canvas = document.getElementById('interactive-bg');
if (canvas) {
    const scene = new THREE.Scene();

    // Low, tilted camera so the grid reads as a rolling surface fading into the distance
    const camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 1, 2000);
    camera.position.set(0, 90, 160);
    camera.lookAt(0, 0, -40);

    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(window.innerWidth, window.innerHeight);

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const timeScale = reduceMotion ? 0.25 : 1;

    // Colors for light/dark mode (fog matches the page background so the far edge fades out)
    const lightMode = {
        line: new THREE.Color(0xcbd5e1),   // slate-300
        ripple: new THREE.Color(0x10b981), // emerald-500
        fog: new THREE.Color(0xffffff)
    };
    const darkMode = {
        line: new THREE.Color(0x334155),   // slate-700
        ripple: new THREE.Color(0x34d399), // emerald-400
        fog: new THREE.Color(0x111827)
    };
    let currentColors = darkMode;
    scene.fog = new THREE.Fog(currentColors.fog, 120, 520);

    // A subdivided plane renders as a grid of triangles in wireframe mode
    const geometry = new THREE.PlaneGeometry(900, 600, 110, 70);
    geometry.rotateX(-Math.PI / 2);
    const positions = geometry.attributes.position;
    const vertexCount = positions.count;
    const colors = new Float32Array(vertexCount * 3);
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const material = new THREE.MeshBasicMaterial({
        wireframe: true,
        vertexColors: true,
        transparent: true,
        opacity: 0.7
    });
    scene.add(new THREE.Mesh(geometry, material));

    // --- Ripples ---
    const ripples = [];
    const maxRipples = 14;
    const rippleSpeed = 70;  // world units per second
    const rippleWidth = 14;  // thickness of the ripple ring
    const rippleDecay = 0.8; // how quickly a ripple fades over time
    const hoverAmplitude = 5;
    const clickAmplitude = 10;

    const clock = new THREE.Clock();
    const raycaster = new THREE.Raycaster();
    const groundPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
    const pointer = new THREE.Vector2();
    const hitPoint = new THREE.Vector3();
    let lastRipple = { x: Infinity, z: Infinity, time: -Infinity };

    function pointerToGround(event) {
        pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
        pointer.y = -(event.clientY / window.innerHeight) * 2 + 1;
        raycaster.setFromCamera(pointer, camera);
        return raycaster.ray.intersectPlane(groundPlane, hitPoint);
    }

    function addRipple(x, z, amplitude) {
        if (ripples.length >= maxRipples) ripples.shift();
        ripples.push({ x, z, amplitude, start: clock.elapsedTime });
        lastRipple = { x, z, time: clock.elapsedTime };
    }

    function onPointerMove(event) {
        if (reduceMotion || !pointerToGround(event)) return;
        // Only drop a new ripple once the cursor has travelled a bit, so it trails rather than piles up
        const moved = Math.hypot(hitPoint.x - lastRipple.x, hitPoint.z - lastRipple.z);
        if (moved > 30 || (moved > 8 && clock.elapsedTime - lastRipple.time > 0.4)) {
            addRipple(hitPoint.x, hitPoint.z, hoverAmplitude);
        }
    }

    function onPointerDown(event) {
        if (pointerToGround(event)) addRipple(hitPoint.x, hitPoint.z, clickAmplitude);
    }

    const mixColor = new THREE.Color();

    function animate() {
        requestAnimationFrame(animate);

        const now = clock.getElapsedTime();
        const t = now * timeScale;

        // Drop ripples that have faded out
        for (let r = ripples.length - 1; r >= 0; r--) {
            if (Math.exp(-(now - ripples[r].start) * rippleDecay) < 0.02) ripples.splice(r, 1);
        }

        for (let i = 0; i < vertexCount; i++) {
            const x = positions.getX(i);
            const z = positions.getZ(i);

            // Base swell: a few overlapping sine waves at different angles and speeds
            let y = Math.sin(x * 0.018 + t * 0.7) * 5
                  + Math.sin(z * 0.025 + t * 0.5) * 4
                  + Math.sin((x + z) * 0.012 + t * 1.1) * 3;

            // Ripples: an expanding ring that oscillates and fades with time
            let rippleY = 0;
            for (let r = 0; r < ripples.length; r++) {
                const ripple = ripples[r];
                const age = now - ripple.start;
                const dist = Math.hypot(x - ripple.x, z - ripple.z);
                const offset = dist - age * rippleSpeed;
                if (Math.abs(offset) > rippleWidth * 3) continue;
                const envelope = Math.exp(-(offset * offset) / (2 * rippleWidth * rippleWidth));
                rippleY += ripple.amplitude * Math.cos(offset * 0.3) * envelope * Math.exp(-age * rippleDecay);
            }
            y += rippleY;
            positions.setY(i, y);

            // Tint lines toward the accent color where ripples pass and on the crests
            const glow = Math.min(1, Math.abs(rippleY) / 6 + Math.max(0, y - 6) / 20);
            mixColor.copy(currentColors.line).lerp(currentColors.ripple, glow);
            colors[i * 3] = mixColor.r;
            colors[i * 3 + 1] = mixColor.g;
            colors[i * 3 + 2] = mixColor.b;
        }

        positions.needsUpdate = true;
        geometry.attributes.color.needsUpdate = true;

        renderer.render(scene, camera);
    }

    function onWindowResize() {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    }

    window.addEventListener('resize', onWindowResize);
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerdown', onPointerDown);

    const originalUpdateThemeUI = updateThemeUI;
    updateThemeUI = () => {
        originalUpdateThemeUI();
        currentColors = document.documentElement.classList.contains('dark') ? darkMode : lightMode;
        scene.fog.color.copy(currentColors.fog);
    };

    animate();
}

    updateThemeUI();

    // --- MODAL AND CAROUSEL SCRIPT ---
    // ... (rest of the file is unchanged)
    const projectCards = document.querySelectorAll("[data-modal-target]");
    projectCards.forEach((card) => {
        card.addEventListener("click", () => {
            const modal = document.querySelector(card.dataset.modalTarget);
            if (modal) {
                modal.classList.remove("hidden");
                setTimeout(() => {
                    modal.classList.remove("opacity-0");
                    modal.querySelector(".modal-content").classList.remove("scale-95");
                }, 10);
                initializeCarousel(modal);
            }
        });
    });

    function closeModal(modal) {
        const video = modal.querySelector("video");
        if (video) {
            video.pause();
            video.currentTime = 0;
        }
        modal.classList.add("opacity-0");
        modal.querySelector(".modal-content").classList.add("scale-95");
        setTimeout(() => {
            modal.classList.add("hidden");
        }, 300);
    }

    document.querySelectorAll(".close-modal-btn").forEach((btn) => {
        btn.addEventListener("click", () => {
            closeModal(btn.closest(".project-modal"));
        });
    });

    document.querySelectorAll(".project-modal").forEach((modal) => {
        modal.addEventListener("click", (event) => {
            if (event.target === modal) {
                closeModal(modal);
            }
        });
    });

    function initializeCarousel(modal) {
        const slides = modal.querySelectorAll(".carousel-slide");
        if (slides.length === 0) return;
        const prevButton = modal.querySelector(".carousel-prev");
        const nextButton = modal.querySelector(".carousel-next");
        let currentSlide = 0;

        function showSlide(index) {
            slides.forEach((slide, i) => {
                slide.classList.toggle("hidden", i !== index);
            });
        }

        if (prevButton && nextButton) {
            prevButton.addEventListener("click", (e) => {
                e.stopPropagation();
                currentSlide = currentSlide > 0 ? currentSlide - 1 : slides.length - 1;
                showSlide(currentSlide);
            });
            nextButton.addEventListener("click", (e) => {
                e.stopPropagation();
                currentSlide = currentSlide < slides.length - 1 ? currentSlide + 1 : 0;
                showSlide(currentSlide);
            });
        }
        showSlide(currentSlide);
    }

    // --- CONTACT FORM SCRIPT ---
    const form = document.getElementById("contact-form");
    const formStatus = document.getElementById("form-status");

    if (form) {
        async function handleSubmit(event) {
            event.preventDefault();
            const data = new FormData(event.target);
            fetch(event.target.action, {
                method: form.method,
                body: data,
                headers: { 'Accept': 'application/json' },
            }).then(response => {
                if (response.ok) {
                    formStatus.textContent = "Thanks for your submission!";
                    formStatus.classList.add("text-green-500");
                    form.reset();
                } else {
                    response.json().then(data => {
                        formStatus.textContent = data.errors?.map(error => error.message).join(", ") || "Oops! There was a problem.";
                        formStatus.classList.add("text-red-500");
                    });
                }
            }).catch(error => {
                formStatus.textContent = "Oops! There was a problem submitting your form";
                formStatus.classList.add("text-red-500");
            });
        }
        form.addEventListener("submit", handleSubmit);
    }
});