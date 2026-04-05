// Verify GSAP and Lenis
if (typeof gsap === 'undefined' || typeof Lenis === 'undefined') {
    console.error("GSAP or Lenis is not loaded!");
}

gsap.registerPlugin(ScrollTrigger);

// Initialize Lenis
const lenis = new Lenis({
    duration: 1.2,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    direction: 'vertical',
    gestureDirection: 'vertical',
    smooth: true,
    mouseMultiplier: 1,
    smoothTouch: false,
    touchMultiplier: 2,
    infinite: false,
});

lenis.on('scroll', ScrollTrigger.update);
gsap.ticker.add((time) => { lenis.raf(time * 1000); });
gsap.ticker.lagSmoothing(0);

// Scroll Progress Bar
const progressBar = document.getElementById('scrollProgress');
lenis.on('scroll', ({ progress }) => {
    progressBar.style.width = `${progress * 100}%`;
});

// Navbar background
const navbar = document.querySelector('.sp-navbar');
lenis.on('scroll', ({ scroll }) => {
    if (scroll > 50) navbar.classList.add('scrolled');
    else navbar.classList.remove('scrolled');
});

let mm = gsap.matchMedia();

// --------------------------------------------------
// GLOBAL ANIMATIONS
// --------------------------------------------------

// Initial Hero Reveal
window.addEventListener('load', () => {
    // Reveal all elements with .fade-up in the hero immediately
    gsap.to('.sp-hero .fade-up', {
        y: 0, opacity: 1, duration: 1, ease: 'power3.out', stagger: 0.2
    });
});

// Generic fade-up for scroll sections
const fadeElements = gsap.utils.toArray('.fade-up:not(.sp-hero .fade-up)');
fadeElements.forEach((el) => {
    // Check if it has a delay class or we just stagger siblings in a container
    let delayVal = 0;
    if (el.classList.contains('delay-1')) delayVal = 0.15;
    if (el.classList.contains('delay-2')) delayVal = 0.3;
    if (el.classList.contains('delay-3')) delayVal = 0.45;

    gsap.to(el, {
        scrollTrigger: {
            trigger: el,
            start: "top 85%",
        },
        y: 0, opacity: 1, duration: 0.8, ease: 'power3.out', delay: delayVal
    });
});

// Process Line drawing
const processLine = document.querySelector('.sp-process-line-fill');
const processSteps = gsap.utils.toArray('.sp-process-step');

if (processLine) {
    gsap.to(processLine, {
        scrollTrigger: {
            trigger: '.sp-process',
            start: "top 60%",
            end: "bottom 60%",
            scrub: 1,
            onUpdate: (self) => {
                const prog = self.progress;
                processSteps.forEach((step, i) => {
                    if (prog >= (i / (processSteps.length - 1)) * 0.9) {
                        step.classList.add('active');
                    } else {
                        step.classList.remove('active');
                    }
                });
            }
        },
        width: "100%",
        ease: "none"
    });
}

// --------------------------------------------------
// DESKTOP ONLY ANIMATIONS (Cursor & Parallax)
// --------------------------------------------------
mm.add("(min-width: 900px)", () => {
    // Custom Cursor
    const cursor = document.getElementById('cursorGlow');
    if (cursor) {
        let mouseX = 0, mouseY = 0;
        let cursorX = 0, cursorY = 0;

        const onMouseMove = (e) => {
            mouseX = e.clientX; mouseY = e.clientY;
        };
        window.addEventListener('mousemove', onMouseMove);

        const renderCursor = () => {
            cursorX += (mouseX - cursorX) * 0.15;
            cursorY += (mouseY - cursorY) * 0.15;
            cursor.style.transform = `translate(calc(${cursorX}px - 50%), calc(${cursorY}px - 50%))`;
        };
        gsap.ticker.add(renderCursor);
    }

    // Parallax Images
    gsap.utils.toArray('.parallax-img').forEach((img) => {
        gsap.fromTo(img, 
            { yPercent: -10 },
            {
                yPercent: 10,
                ease: "none",
                scrollTrigger: {
                    trigger: img.parentElement,
                    start: "top bottom",
                    end: "bottom top",
                    scrub: true
                }
            }
        );
    });

    return () => {
        // Cleanup not strictly necessary since GSAP handles media query revert
    };
});
