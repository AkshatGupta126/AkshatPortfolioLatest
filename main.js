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
            y: 20, opacity: 0, duration: 0.6
        }, "-=0.4")
        .from('.cta-button', {
            scale: 0.8, opacity: 0, duration: 0.5, ease: 'back.out(1.7)',
            onComplete: startRoleAnimation
        }, "-=0.3");
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

    function animateNextRole() {
        gsap.to(roleElement, {
            y: -15,
            opacity: 0,
            duration: 0.6,
            ease: "power2.in",
            delay: 2,
            onComplete: () => {
                roleIndex = (roleIndex + 1) % roles.length;
                roleElement.textContent = roles[roleIndex];

                gsap.set(roleElement, { y: 15 });
                gsap.to(roleElement, {
                    y: 0,
                    opacity: 1,
                    duration: 0.6,
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
    { trigger: '.hero', color1: '#0F0F14', color2: '#150027' },
    { trigger: '.about', color1: '#120020', color2: '#1a0033' },
    { trigger: '.projects', color1: '#0c0c10', color2: '#15151e' },
    { trigger: '.contact', color1: '#150027', color2: '#0F0F14' }
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

    // Custom Cursor logic
    const cursor = document.getElementById('cursorGlow');
    let mouseX = 0, mouseY = 0;
    let cursorX = 0, cursorY = 0;

    const onMouseMove = (e) => {
        mouseX = e.clientX; mouseY = e.clientY;
    };
    window.addEventListener('mousemove', onMouseMove);

    const renderCursor = () => {
        if (!cursor) return;
        cursorX += (mouseX - cursorX) * 0.15;
        cursorY += (mouseY - cursorY) * 0.15;
        cursor.style.transform = `translate(calc(${cursorX}px - 50%), calc(${cursorY}px - 50%))`;
    };
    gsap.ticker.add(renderCursor);

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
        window.removeEventListener('mousemove', onMouseMove);
        gsap.ticker.remove(renderCursor);
        // GSAP automatically cleans up the scroll triggers added within matchMedia
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
