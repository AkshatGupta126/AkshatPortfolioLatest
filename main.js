// Animated Browser Title
const tabTitles = ["Akshat Gupta | UI/UX Designer", "Akshat Gupta | Graphic Designer", "Akshat Gupta | Video Editor"];
let tabTitleIndex = 0;
setInterval(() => {
    document.title = tabTitles[tabTitleIndex];
    tabTitleIndex = (tabTitleIndex + 1) % tabTitles.length;
}, 2500);

// Verify GSAP and Lenis are loaded
if (typeof gsap === 'undefined' || typeof Lenis === 'undefined') {
    console.error("GSAP or Lenis is not loaded!");
}

// Register ScrollTrigger
gsap.registerPlugin(ScrollTrigger);

// Initialize Lenis for smooth scrolling
const lenis = new Lenis({
    duration: 1.2,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // smooth curve
    direction: 'vertical',
    gestureDirection: 'vertical',
    smooth: true,
    mouseMultiplier: 1,
    smoothTouch: false, // Leave native touch scrolling for better performance
    touchMultiplier: 2,
    infinite: false,
});

// Link GSAP's scroll position with Lenis
lenis.on('scroll', ScrollTrigger.update);

gsap.ticker.add((time) => {
    lenis.raf(time * 1000);
});

gsap.ticker.lagSmoothing(0);

// Scroll Progress Bar
const progressBar = document.getElementById('scrollProgress');
lenis.on('scroll', ({ progress }) => {
    progressBar.style.width = `${progress * 100}%`;
});

// Preloader Animation
window.addEventListener('load', () => {
    const hasPreloaderPlayed = sessionStorage.getItem('preloaderPlayed');

    if (hasPreloaderPlayed === 'true') {
        // Skip preloader animation completely
        gsap.set('.preloader', { yPercent: -100 });
        gsap.set('.hero-subtitle', { y: 0, opacity: 1 });
        gsap.set('.hero-title', { y: 0, opacity: 1 });
        gsap.set('.hero-role', { y: 0, opacity: 1 });
        startRoleAnimation();
        initTechCanvas();
    } else {
        // Play full preloader animation once
        sessionStorage.setItem('preloaderPlayed', 'true');
        const tl = gsap.timeline();

        tl.to('.loading-bar .fill', {
            width: '100%', duration: 0.8, ease: 'power2.inOut'
        })
            .to('.logo-text', {
                y: -20, opacity: 0, duration: 0.5, ease: 'power2.in'
            }, "+=0.2")
            .to('.preloader', {
                yPercent: -100, duration: 0.8, ease: 'power4.inOut'
            })
            // Start hero animations
            .from('.hero-subtitle', {
                y: 20, opacity: 0, duration: 0.6
            }, "-=0.2")
            .from('.hero-title', {
                y: 30, opacity: 0, duration: 0.8, ease: 'power2.out'
            }, "-=0.4")
            .from('.hero-role', {
                y: 20, opacity: 0, duration: 0.6,
                onComplete: () => {
                    startRoleAnimation();
                    initTechCanvas();
                }
            }, "-=0.4");
    }
});

// Role Text Animation Loop
function startRoleAnimation() {
    const roles = [
        "UI/UX Designer",
        "Graphic Designer",
        "Video Editor"
    ];
    let roleIndex = 0;
    const roleElement = document.querySelector('.hero-role');
    if (!roleElement) return;

    function animateNextRole() {
        gsap.to(roleElement, {
            y: -12,
            opacity: 0,
            duration: 0.35,
            ease: "power2.in",
            delay: 1.2,
            onComplete: () => {
                roleIndex = (roleIndex + 1) % roles.length;
                roleElement.textContent = roles[roleIndex];

                gsap.set(roleElement, { y: 12 });
                gsap.to(roleElement, {
                    y: 0,
                    opacity: 1,
                    duration: 0.35,
                    ease: "power2.out",
                    onComplete: animateNextRole
                });
            }
        });
    }

    animateNextRole();
}

// Navbar background on scroll
const navbar = document.querySelector('.navbar');
lenis.on('scroll', ({ scroll }) => {
    if (scroll > 50) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
});

// Mobile menu toggle
const mobileMenu = document.getElementById('mobile-menu');
const navLinks = document.querySelector('.nav-links');

if (mobileMenu && navLinks) {
    mobileMenu.addEventListener('click', () => {
        mobileMenu.classList.toggle('active');
        navLinks.classList.toggle('active');
    });

    // Close menu when a link is clicked
    document.querySelectorAll('.nav-links a').forEach(link => {
        link.addEventListener('click', () => {
            mobileMenu.classList.remove('active');
            navLinks.classList.remove('active');
        });
    });
}

// Smooth Scroll for Anchor Links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = this.getAttribute('href');
        lenis.scrollTo(target);
    });
});

// MatchMedia for Responsive Animations
let mm = gsap.matchMedia();

// --------------------------------------------------
// GLOBAL ANIMATIONS (Run on all devices)
// --------------------------------------------------

// Scroll-based background transitions
const bgTransitions = [
    { trigger: '.hero', color1: '#050608', color2: '#0D0F18' },
    { trigger: '.about', color1: '#090A10', color2: '#10121D' },
    { trigger: '.projects', color1: '#07080C', color2: '#0E1119' },
    { trigger: '.contact', color1: '#0B0C14', color2: '#050608' }
];

bgTransitions.forEach(st => {
    if(document.querySelector(st.trigger)) {
        ScrollTrigger.create({
            trigger: st.trigger,
            start: 'top 50%',
            end: 'bottom 50%',
            onEnter: () => gsap.to('body', { background: `linear-gradient(135deg, ${st.color1} 0%, ${st.color2} 100%)`, duration: 1 }),
            onEnterBack: () => gsap.to('body', { background: `linear-gradient(135deg, ${st.color1} 0%, ${st.color2} 100%)`, duration: 1 })
        });
    }
});

// Skills Fill Animation
const skillCards = gsap.utils.toArray('.skill-card');
skillCards.forEach(card => {
    const fill = card.querySelector('.level-fill');
    const width = fill.getAttribute('data-width');

    gsap.from(card, {
        scrollTrigger: {
            trigger: card, start: "top 85%",
        },
        y: 20, opacity: 0, duration: 0.5, ease: 'power2.out'
    });

    gsap.to(fill, {
        scrollTrigger: {
            trigger: card, start: "top 85%",
        },
        width: width, duration: 1.2, ease: 'power3.out', delay: 0.2
    });
});

// Timeline Line Drawing Animation
gsap.utils.toArray('.timeline').forEach(timeline => {
    const line = timeline.querySelector('.timeline-line');
    if (line) {
        gsap.fromTo(line,
            { height: 0 },
            {
                height: '100%',
                ease: "none",
                scrollTrigger: {
                    trigger: timeline,
                    start: "top 75%",
                    end: "bottom 75%",
                    scrub: true
                }
            }
        );
    }
});

// Timeline Items fade in one-by-one on scroll
gsap.utils.toArray('.timeline-item').forEach((item, i) => {
    gsap.from(item, {
        scrollTrigger: { trigger: item, start: "top 85%" },
        y: 20, opacity: 0, duration: 0.5, ease: 'power2.out'
    });
});

// --------------------------------------------------
// DESKTOP ONLY ANIMATIONS (Heavy/Parallax)
// --------------------------------------------------
mm.add("(min-width: 900px)", () => {

    // Custom cursor removed per request

    // About Section Parallax
    gsap.from('.about-text', {
        scrollTrigger: { trigger: '.about', start: "top 75%" },
        y: 50, opacity: 0, duration: 1, ease: 'power3.out'
    });

    gsap.from('.about-image-wrapper', {
        scrollTrigger: { trigger: '.about', start: "top 75%" },
        x: 50, opacity: 0, duration: 1, ease: 'power3.out', delay: 0.2
    });

    // Projects Horizontal Scroll
    const projectsWrapper = document.querySelector('.projects-wrapper');
    const container = document.querySelector('.projects-pin-container');

    let scrollWidth = projectsWrapper.scrollWidth - window.innerWidth;

    gsap.to(projectsWrapper, {
        x: -scrollWidth,
        ease: "none",
        scrollTrigger: {
            trigger: container,
            start: "top top",
            end: () => `+=${scrollWidth}`,
            pin: true,
            scrub: 1,
            anticipatePin: 1
        }
    });

    // Travel/Visits heavy Parallax
    gsap.utils.toArray('.visit-panel').forEach((panel) => {
        const img = panel.querySelector('.visit-img');
        gsap.fromTo(img, { yPercent: -15 }, {
            yPercent: 15, ease: "none",
            scrollTrigger: {
                trigger: panel, start: "top bottom", end: "bottom top", scrub: true
            }
        });

        const content = panel.querySelector('.visit-content');
        gsap.from(content, {
            scrollTrigger: { trigger: panel, start: "top 60%" },
            y: 40, opacity: 0, duration: 1
        });
    });

    return () => {
        // Custom cursor elements removed
    };
});

// --------------------------------------------------
// MOBILE ONLY ANIMATIONS (Lightweight)
// --------------------------------------------------
mm.add("(max-width: 899px)", () => {

    // Simpler fades for About
    gsap.from('.about-text, .about-image-wrapper', {
        scrollTrigger: { trigger: '.about', start: "top 85%" },
        y: 30, opacity: 0, duration: 0.6, stagger: 0.2
    });

    // Vertical fade-ins for Projects
    gsap.utils.toArray('.project-card').forEach(card => {
        gsap.from(card, {
            scrollTrigger: { trigger: card, start: "top 85%" },
            y: 30, opacity: 0, duration: 0.6
        });
    });

    // Lighter Travel/Visits reveals (no big parallax calculations)
    gsap.utils.toArray('.visit-panel').forEach((panel) => {
        const content = panel.querySelector('.visit-content');
        gsap.from(content, {
            scrollTrigger: { trigger: panel, start: "top 75%" },
            y: 20, opacity: 0, duration: 0.8
        });
    });

    return () => { };
});

// Interactive Tech Canvas Background
function initTechCanvas() {
    const canvas = document.getElementById('techCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    
    let width = canvas.width = canvas.offsetWidth;
    let height = canvas.height = canvas.offsetHeight;
    
    // Resize handler
    window.addEventListener('resize', () => {
        width = canvas.width = canvas.offsetWidth;
        height = canvas.height = canvas.offsetHeight;
    });
    
    const particles = [];
    const maxParticles = 45; // balanced for performance
    const connectionDist = 125;
    
    class Particle {
        constructor() {
            this.x = Math.random() * width;
            this.y = Math.random() * height;
            this.vx = (Math.random() - 0.5) * 0.5;
            this.vy = (Math.random() - 0.5) * 0.5;
            this.radius = Math.random() * 1.5 + 1;
        }
        
        update() {
            this.x += this.vx;
            this.y += this.vy;
            
            if (this.x < 0 || this.x > width) this.vx *= -1;
            if (this.y < 0 || this.y > height) this.vy *= -1;
        }
        
        draw() {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(255, 70, 85, 0.4)';
            ctx.fill();
        }
    }
    
    for (let i = 0; i < maxParticles; i++) {
        particles.push(new Particle());
    }
    
    // Track mouse in canvas space
    let mouseX = null;
    let mouseY = null;
    
    const heroSection = document.querySelector('.hero');
    if (heroSection) {
        heroSection.addEventListener('mousemove', (e) => {
            const rect = canvas.getBoundingClientRect();
            mouseX = e.clientX - rect.left;
            mouseY = e.clientY - rect.top;
        });
        
        heroSection.addEventListener('mouseleave', () => {
            mouseX = null;
            mouseY = null;
        });
    }
    
    function animate() {
        ctx.clearRect(0, 0, width, height);
        
        // Draw grid structure
        ctx.strokeStyle = 'rgba(255, 70, 85, 0.02)';
        ctx.lineWidth = 1;
        const gridSize = 60;
        for (let x = 0; x < width; x += gridSize) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, height);
            ctx.stroke();
        }
        for (let y = 0; y < height; y += gridSize) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(width, y);
            ctx.stroke();
        }
        
        particles.forEach(p => {
            p.update();
            p.draw();
        });
        
        // Draw lines
        ctx.lineWidth = 0.5;
        for (let i = 0; i < particles.length; i++) {
            const p1 = particles[i];
            
            // Connect to other particles
            for (let j = i + 1; j < particles.length; j++) {
                const p2 = particles[j];
                const dx = p1.x - p2.x;
                const dy = p1.y - p2.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                
                if (dist < connectionDist) {
                    const alpha = (1 - dist / connectionDist) * 0.15;
                    ctx.strokeStyle = `rgba(255, 70, 85, ${alpha})`;
                    ctx.beginPath();
                    ctx.moveTo(p1.x, p1.y);
                    ctx.lineTo(p2.x, p2.y);
                    ctx.stroke();
                }
            }
            
            // Connect to mouse
            if (mouseX !== null && mouseY !== null && window.innerWidth >= 900) {
                const dx = p1.x - mouseX;
                const dy = p1.y - mouseY;
                const dist = Math.sqrt(dx * dx + dy * dy);
                
                if (dist < 150) {
                    const alpha = (1 - dist / 150) * 0.25;
                    ctx.strokeStyle = `rgba(255, 70, 85, ${alpha})`;
                    ctx.beginPath();
                    ctx.moveTo(p1.x, p1.y);
                    ctx.lineTo(mouseX, mouseY);
                    ctx.stroke();
                }
            }
        }

        // Draw tactical gamer reticle on background canvas around the cursor
        if (mouseX !== null && mouseY !== null && window.innerWidth >= 900) {
            ctx.strokeStyle = 'rgba(255, 70, 85, 0.4)';
            ctx.lineWidth = 1.5;
            
            const size = 18;
            const gap = 6;
            
            // Top Left corner bracket
            ctx.beginPath();
            ctx.moveTo(mouseX - size, mouseY - size + gap);
            ctx.lineTo(mouseX - size, mouseY - size);
            ctx.lineTo(mouseX - size + gap, mouseY - size);
            ctx.stroke();
            
            // Top Right corner bracket
            ctx.beginPath();
            ctx.moveTo(mouseX + size, mouseY - size + gap);
            ctx.lineTo(mouseX + size, mouseY - size);
            ctx.lineTo(mouseX + size - gap, mouseY - size);
            ctx.stroke();
            
            // Bottom Left corner bracket
            ctx.beginPath();
            ctx.moveTo(mouseX - size, mouseY + size - gap);
            ctx.lineTo(mouseX - size, mouseY + size);
            ctx.lineTo(mouseX - size + gap, mouseY + size);
            ctx.stroke();
            
            // Bottom Right corner bracket
            ctx.beginPath();
            ctx.moveTo(mouseX + size, mouseY + size - gap);
            ctx.lineTo(mouseX + size, mouseY + size);
            ctx.lineTo(mouseX + size - gap, mouseY + size);
            ctx.stroke();
            
            // Glowing red target lock dot
            ctx.fillStyle = 'rgba(255, 70, 85, 0.8)';
            ctx.beginPath();
            ctx.arc(mouseX, mouseY, 2, 0, Math.PI * 2);
            ctx.fill();
        }
        
        requestAnimationFrame(animate);
    }
    
    animate();
}

// Mobile/Tablet Tapping Feedback (circular PUBG/BGMI crosshair tap indicator)
if ('ontouchstart' in window || navigator.maxTouchPoints > 0 || window.innerWidth < 900) {
    let activeIndicator = null;

    window.addEventListener('touchstart', (e) => {
        if (e.touches.length > 0) {
            const touch = e.touches[0];
            // Clear any active indicator immediately
            if (activeIndicator) {
                activeIndicator.classList.add('released');
                const temp = activeIndicator;
                setTimeout(() => temp.remove(), 500);
            }
            activeIndicator = createTapIndicator(touch.pageX, touch.pageY);
        }
    }, { passive: true });

    window.addEventListener('touchmove', (e) => {
        if (activeIndicator && e.touches.length > 0) {
            const touch = e.touches[0];
            activeIndicator.style.left = `${touch.pageX}px`;
            activeIndicator.style.top = `${touch.pageY}px`;
        }
    }, { passive: true });

    const handleTouchRelease = () => {
        if (activeIndicator) {
            activeIndicator.classList.add('released');
            const temp = activeIndicator;
            activeIndicator = null;
            setTimeout(() => temp.remove(), 500);
        }
    };

    window.addEventListener('touchend', handleTouchRelease, { passive: true });
    window.addEventListener('touchcancel', handleTouchRelease, { passive: true });
}

function createTapIndicator(x, y) {
    const tap = document.createElement('div');
    tap.className = 'pubg-tap-effect';
    tap.style.left = `${x}px`;
    tap.style.top = `${y}px`;
    tap.innerHTML = `
        <svg viewBox="0 0 40 40" width="40" height="40" style="display: block;">
            <circle cx="20" cy="20" r="2" fill="#FF4655" />
            <circle cx="20" cy="20" r="9" stroke="#FF4655" stroke-width="1.5" fill="none" />
            <line x1="20" y1="2" x2="20" y2="6" stroke="#FF4655" stroke-width="1.5" />
            <line x1="20" y1="34" x2="20" y2="38" stroke="#FF4655" stroke-width="1.5" />
            <line x1="2" y1="20" x2="6" y2="20" stroke="#FF4655" stroke-width="1.5" />
            <line x1="34" y1="20" x2="38" y2="20" stroke="#FF4655" stroke-width="1.5" />
        </svg>
    `;
    document.body.appendChild(tap);
    return tap;
}

// Click-and-Drag to Scroll with Momentum (Inertia) on Desktop/Laptop
let isDragging = false;
let isProjectsSection = false;
let isHorizontalDrag = false; // Track if the current drag is primarily horizontal
let startY = 0;
let startX = 0;
let startScroll = 0;
let lastY = 0;
let lastX = 0;
let lastTime = 0;
let velocity = 0;
let momentumId = null;

const getProjectsTrigger = () => {
    return ScrollTrigger.getAll().find(st => 
        st.trigger && st.trigger.classList.contains('projects-pin-container')
    );
};

window.addEventListener('mousedown', (e) => {
    // Only primary left button click triggers drag-scroll, and only on desktop sizes
    if (e.button !== 0 || window.innerWidth < 900) return;
    // Don't drag-scroll when interacting with buttons, links, inputs
    if (e.target.closest('a, button, .menu-toggle, input, textarea')) return;

    isDragging = true;
    isProjectsSection = !!e.target.closest('.projects, .projects-pin-container, .projects-wrapper');
    isHorizontalDrag = false;

    startY = e.clientY;
    startX = e.clientX;
    startScroll = lenis.scroll;
    lastY = e.clientY;
    lastX = e.clientX;
    lastTime = Date.now();
    velocity = 0;

    // Cancel any running momentum animation
    if (momentumId) {
        cancelAnimationFrame(momentumId);
        momentumId = null;
    }

    document.body.classList.add('is-dragging');
});

window.addEventListener('mousemove', (e) => {
    if (!isDragging) return;

    const now = Date.now();
    const dt = now - lastTime;
    const totalDy = e.clientY - startY;
    const totalDx = e.clientX - startX;

    // Dynamically lock target drag direction inside horizontal scroll section
    if (isProjectsSection) {
        if (Math.abs(totalDx) > Math.abs(totalDy)) {
            isHorizontalDrag = true;
        } else if (Math.abs(totalDy) > Math.abs(totalDx)) {
            isHorizontalDrag = false;
        }
    } else {
        isHorizontalDrag = false;
    }

    const dy = e.clientY - lastY;
    const dx = isHorizontalDrag ? (e.clientX - lastX) : 0;

    if (dt > 0) {
        const instantVelocity = isHorizontalDrag ? (dx / dt) : (dy / dt);
        velocity = velocity * 0.4 + instantVelocity * 0.6;
    }

    lastY = e.clientY;
    lastX = e.clientX;
    lastTime = now;

    let targetScroll = startScroll;

    if (isHorizontalDrag) {
        targetScroll = startScroll - totalDx;
        const st = getProjectsTrigger();
        if (st) {
            const pinStart = st.start;
            const pinEnd = st.end;
            if (targetScroll < pinStart) targetScroll = pinStart;
            if (targetScroll > pinEnd) targetScroll = pinEnd;
        }
    } else {
        targetScroll = startScroll - totalDy;
    }

    lenis.scrollTo(targetScroll, { immediate: true });
});

const handleDragRelease = () => {
    if (!isDragging) return;
    isDragging = false;
    document.body.classList.remove('is-dragging');

    const friction = 0.95; // Smooth slow down factor
    let currentScroll = lenis.scroll;

    if (Math.abs(velocity) > 0.05) {
        let lastFrameTime = Date.now();

        const animateMomentum = () => {
            const now = Date.now();
            const dt = now - lastFrameTime;
            lastFrameTime = now;

            const distance = velocity * dt * 1.25;
            currentScroll -= distance;

            // apply frame-normalized friction
            velocity *= Math.pow(friction, dt / 16);

            // Clamp and stop momentum if dragging horizontally in projects
            if (isHorizontalDrag) {
                const st = getProjectsTrigger();
                if (st) {
                    const pinStart = st.start;
                    const pinEnd = st.end;
                    if (currentScroll <= pinStart) {
                        currentScroll = pinStart;
                        velocity = 0; // stop sliding
                    } else if (currentScroll >= pinEnd) {
                        currentScroll = pinEnd;
                        velocity = 0; // stop sliding
                    }
                }
            }

            lenis.scrollTo(currentScroll, { immediate: true });

            if (Math.abs(velocity) > 0.02) {
                momentumId = requestAnimationFrame(animateMomentum);
            } else {
                momentumId = null;
            }
        };

        momentumId = requestAnimationFrame(animateMomentum);
    }
};

window.addEventListener('mouseup', handleDragRelease);
window.addEventListener('mouseleave', handleDragRelease);
