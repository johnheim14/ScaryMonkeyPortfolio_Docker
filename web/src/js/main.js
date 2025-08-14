// src/js/main.js

import '../input.css';
import * as THREE from 'three';

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
        logoNav.src = isDark ? "./img/SMI_Logo_White.png" : "./img/SMI_Logo_Black.png";
        logoAbout.src = isDark ? "./img/SMI_Logo_White.png" : "./img/SMI_Logo_Black.png";
        favicon.href = "./img/favicon.ico";
    };

    themeToggleBtn.addEventListener("click", () => {
        document.documentElement.classList.toggle("dark");
        localStorage.theme = document.documentElement.classList.contains("dark") ? "dark" : "light";
        updateThemeUI();
    });

// --- 3D CUBE BACKGROUND WITH ORGANIC TRAIL & FADED SHOCKWAVE ---
const canvas = document.getElementById('interactive-bg');
if (canvas) {
    const scene = new THREE.Scene();

    const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 200, 0);
    camera.lookAt(0, 0, 0);
    camera.up.set(0, 0, -1);

    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambientLight);
    const directionalLight = new THREE.DirectionalLight(0xfff2e5, 1.5);
    directionalLight.position.set(80, 150, 80);
    scene.add(directionalLight);

    let cubes = [];
    const spacing = 20;
    const cubeSize = spacing * 1.01;
    const initialHeight = 0.05;
    const hoverHeight = 15;
    const riseSpeed = 0.3;
    const fallSpeed = 0.02;

    // Colors for light/dark mode
    const lightMode = {
        cube: new THREE.Color(0xffffff),
        hover: new THREE.Color(0x374151), // dark gray
        shock: new THREE.Color(0xd1d5db)  // light gray
    };
    const darkMode = {
        cube: new THREE.Color(0x1e293b), // dark blue
        hover: new THREE.Color(0xd1d5db), // light gray
        shock: new THREE.Color(0xd1d5db)
    };
    let currentColors = lightMode;

    const geometry = new THREE.BoxGeometry(cubeSize, 1, cubeSize);
    const shockwaves = [];

    function initCubes() {
        cubes.forEach(c => {
            scene.remove(c);
            c.geometry.dispose();
            c.material.dispose();
        });
        cubes = [];

        const cols = Math.ceil(window.innerWidth / spacing);
        const rows = Math.ceil(window.innerHeight / spacing);

        for (let i = 0; i < cols; i++) {
            for (let j = 0; j < rows; j++) {
                const material = new THREE.MeshStandardMaterial({
                    color: currentColors.cube,
                    roughness: 0.35,
                    metalness: 0.25
                });
                const cube = new THREE.Mesh(geometry, material);

                cube.position.x = (i - cols / 2 + 0.5) * spacing;
                cube.position.z = (j - rows / 2 + 0.5) * spacing;
                cube.position.y = 0;
                cube.scale.y = initialHeight;

                cube.trail = 0;
                cube.randomOffset = Math.random() * 0.1;

                scene.add(cube);
                cubes.push(cube);
            }
        }
    }

    const mouse = new THREE.Vector2(-2, -2);

    function onMouseMove(event) {
        mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    }

    function onMouseClick(event) {
        const clickX = (event.clientX / window.innerWidth) * 2 - 1;
        const clickY = -(event.clientY / window.innerHeight) * 2 + 1;

        const raycaster = new THREE.Raycaster();
        raycaster.setFromCamera({ x: clickX, y: clickY }, camera);
        const plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
        const intersectPoint = new THREE.Vector3();
        raycaster.ray.intersectPlane(plane, intersectPoint);

        // Add shockwave
        shockwaves.push({
            center: intersectPoint.clone(),
            radius: 0,
            maxRadius: 300,
            strength: 1.2,
            decay: 0.97 // controls fade over distance/time
        });
    }

    function animate() {
        requestAnimationFrame(animate);

        const raycaster = new THREE.Raycaster();
        raycaster.setFromCamera(mouse, camera);
        const plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
        const intersectPoint = new THREE.Vector3();
        raycaster.ray.intersectPlane(plane, intersectPoint);

        const radius = 60;
        const baseColor = currentColors.cube;

        // Update shockwaves
        shockwaves.forEach((wave, index) => {
            wave.radius += 1.5; // slower travel
            wave.strength *= wave.decay; // fade over time
            if (wave.radius > wave.maxRadius || wave.strength < 0.01) shockwaves.splice(index, 1);
        });

        cubes.forEach(cube => {
    const dx = cube.position.x - intersectPoint.x;
    const dz = cube.position.z - intersectPoint.z;
    const dist = Math.sqrt(dx * dx + dz * dz);

    // Mouse hover trail
    if (dist < radius) {
        const proximity = 1 - dist / radius;
        cube.trail = Math.max(cube.trail, proximity);
    } else {
        cube.trail *= 0.95;
    }

    // Shockwave effects with ripple delay
    let shockFactor = 0;
    shockwaves.forEach(wave => {
        const sx = cube.position.x - wave.center.x;
        const sz = cube.position.z - wave.center.z;
        const sDist = Math.sqrt(sx * sx + sz * sz);

        const delay = 25;
        const waveInfluence = Math.max(0, 1 - Math.abs(sDist - wave.radius) / delay);
        shockFactor = Math.max(shockFactor, waveInfluence * wave.strength);

        if (waveInfluence > 0.01) cube.trail = Math.max(cube.trail, waveInfluence * 0.7);
    });

    const targetScaleY = initialHeight + (hoverHeight - initialHeight) * cube.trail + shockFactor;
    const colorFactor = Math.min(1, cube.trail * 0.7 + shockFactor * 0.8);
    const speed = cube.trail > 0 || shockFactor > 0 ? riseSpeed : fallSpeed;

    // Smooth interpolation with snap threshold
    const difference = targetScaleY - cube.scale.y;
    if (Math.abs(difference) < 0.001) cube.scale.y = targetScaleY;
    else cube.scale.y += difference * speed;

    // Adaptive jitter
    const jitterAmplitude = 0.02 * Math.min(1, Math.abs(difference) * 50);
    cube.scale.y += Math.sin(Date.now() * 0.002 + cube.randomOffset) * jitterAmplitude;

    // Height-based glow: brighter when taller
    const glowFactor = THREE.MathUtils.clamp((cube.scale.y - initialHeight) / (hoverHeight + 1), 0, 1);

    const targetColor = shockFactor > 0 ? currentColors.shock : currentColors.hover;
    const glowColor = targetColor.clone().lerp(new THREE.Color(0xffffff), glowFactor * 0.5); // Blend toward white
    cube.material.color.copy(baseColor).lerp(glowColor, colorFactor);
});


        renderer.render(scene, camera);
    }

    function onWindowResize() {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
        initCubes();
    }

    window.addEventListener('resize', onWindowResize);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('click', onMouseClick);

    const originalUpdateThemeUI = updateThemeUI;
    updateThemeUI = () => {
        originalUpdateThemeUI();
        currentColors = document.documentElement.classList.contains('dark') ? darkMode : lightMode;
    };

    initCubes();
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