if (typeof gsap === 'undefined' || typeof Lenis === 'undefined') {
    console.error("GSAP or Lenis is not loaded!");
}

gsap.registerPlugin(ScrollTrigger);

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
    if(progressBar) progressBar.style.width = `${progress * 100}%`;
});

// Navbar background
const navbar = document.querySelector('.ar-navbar');
lenis.on('scroll', ({ scroll }) => {
    if(!navbar) return;
    if (scroll > 50) navbar.classList.add('scrolled');
    else navbar.classList.remove('scrolled');
});

let mm = gsap.matchMedia();

// Initial Reveal
window.addEventListener('load', () => {
    gsap.to('.ar-hero .fade-up', {
        y: 0, opacity: 1, duration: 1.2, ease: 'power3.out', stagger: 0.2
    });
});

// Generic fade-up for scroll sections
const fadeElements = gsap.utils.toArray('.fade-up:not(.ar-hero .fade-up)');
fadeElements.forEach((el) => {
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
const processLine = document.querySelector('.ar-process-line-fill');
const processSteps = gsap.utils.toArray('.ar-process-step');

if (processLine) {
    gsap.to(processLine, {
        scrollTrigger: {
            trigger: '.ar-process',
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

// Hover micro-interactions defined globally for robust feeling
const glassCards = document.querySelectorAll('.ar-glass-card, .ar-insight-box');
glassCards.forEach(card => {
    card.addEventListener('mouseenter', () => {
        gsap.to(card, { scale: 1.02, duration: 0.3, ease: 'power2.out' });
    });
    card.addEventListener('mouseleave', () => {
        gsap.to(card, { scale: 1, duration: 0.3, ease: 'power2.out' });
    });
});

// Desktop specific animations
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

    // Subtle Parallax logic
    gsap.utils.toArray('.parallax-img').forEach((img) => {
        gsap.fromTo(img, 
            { yPercent: -5 },
            {
                yPercent: 5,
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
        // cleanup 
    };
});
