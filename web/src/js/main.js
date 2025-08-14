// src/main.js

import '../input.css';

// --- Main script execution after the document is loaded ---
document.addEventListener('DOMContentLoaded', () => {

    // --- THEME TOGGLE SCRIPT (must be defined before canvas script uses it) ---
    if (localStorage.theme === 'light' || (!('theme' in localStorage) && !window.matchMedia('(prefers-color-scheme: dark)').matches)) {
        document.documentElement.classList.remove('dark');
    } else {
        document.documentElement.classList.add('dark');
    }

    const mobileMenuButton = document.getElementById("mobile-menu-button");
    const mobileMenu = document.getElementById("mobile-menu");
    mobileMenuButton.addEventListener("click", () => {A
        mobileMenu.classList.toggle("hidden");
    });

    const themeToggleBtn = document.getElementById("theme-toggle");
    const themeToggleDarkIcon = document.getElementById("theme-toggle-dark-icon");
    const themeToggleLightIcon = document.getElementById("theme-toggle-light-icon");
    const logoNav = document.getElementById("logo-nav");
    const logoAbout = document.getElementById("logo-about");
    const favicon = document.getElementById("favicon");

    // This function will be extended by the canvas script
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

    // --- INTERACTIVE DOT BACKGROUND SCRIPT ---
    const canvas = document.getElementById('interactive-bg');
    if (canvas) {
        const ctx = canvas.getContext('2d');
        let dots = [];
        const dotSpacing = 30;
        const dotRadius = 1.5;
        const mouseRadius = 100;

        let lightDotColor = 'rgba(203, 213, 225, 1)'; // Tailwind slate-300
        let darkDotColor = 'rgba(71, 85, 105, 1)';   // Tailwind slate-600
        let currentDotColor = lightDotColor;

        const mouse = { x: undefined, y: undefined };

        function resizeCanvas() {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            initDots();
        }

        class Dot {
            constructor(x, y) {
                this.x = x; this.y = y;
                this.originX = x; this.originY = y;
                this.vx = 0; this.vy = 0;
            }
            draw() {
                ctx.beginPath();
                ctx.arc(this.x, this.y, dotRadius, 0, Math.PI * 2);
                ctx.fillStyle = currentDotColor;
                ctx.fill();
            }
            update() {
                const dx = this.x - mouse.x;
                const dy = this.y - mouse.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                if (distance < mouseRadius) {
                    const forceDirectionX = dx / distance;
                    const forceDirectionY = dy / distance;
                    const force = (mouseRadius - distance) / mouseRadius;
                    this.vx += forceDirectionX * force * 2;
                    this.vy += forceDirectionY * force * 2;
                }
                this.vx += (this.originX - this.x) * 0.05;
                this.vy += (this.originY - this.y) * 0.05;
                this.vx *= 0.95;
                this.vy *= 0.95;
                this.x += this.vx;
                this.y += this.vy;
                this.draw();
            }
        }

        function initDots() {
            dots = [];
            for (let x = dotSpacing / 2; x < canvas.width; x += dotSpacing) {
                for (let y = dotSpacing / 2; y < canvas.height; y += dotSpacing) {
                    dots.push(new Dot(x, y));
                }
            }
        }

        function animate() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            dots.forEach(dot => dot.update());
            requestAnimationFrame(animate);
        }

        window.addEventListener('resize', resizeCanvas);
        window.addEventListener('mousemove', (e) => { mouse.x = e.clientX; mouse.y = e.clientY; });
        window.addEventListener('mouseout', () => { mouse.x = undefined; mouse.y = undefined; });
        
        // Extend the existing updateThemeUI function to also handle dot colors
        const originalUpdateThemeUI = updateThemeUI;
        updateThemeUI = () => {
            originalUpdateThemeUI(); // Call the original function
            currentDotColor = document.documentElement.classList.contains('dark') ? darkDotColor : lightDotColor;
        };

        resizeCanvas();
        animate();
    }

    // Call updateThemeUI once to set the initial state for everything
    updateThemeUI();

    // --- MODAL AND CAROUSEL SCRIPT ---
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
