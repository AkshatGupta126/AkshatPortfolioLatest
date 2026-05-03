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

// Progress Bar
const scrollProgressBar = document.getElementById('scrollProgress');
lenis.on('scroll', ({ progress }) => {
    if(scrollProgressBar) scrollProgressBar.style.width = `${progress * 100}%`;
});

// Navbar
const navbar = document.querySelector('.x-navbar');
lenis.on('scroll', ({ scroll }) => {
    if(!navbar) return;
    if (scroll > 50) navbar.classList.add('scrolled');
    else navbar.classList.remove('scrolled');
});

// Animations Initial
window.addEventListener('load', () => {
    gsap.to('.x-hero .fade-up', {
        y: 0, opacity: 1, duration: 1.2, ease: 'power3.out', stagger: 0.2
    });
});

// Generic fade
const fadeElements = gsap.utils.toArray('.fade-up:not(.x-hero .fade-up)');
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

let mm = gsap.matchMedia();

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
});

// Video Lightbox System
const cards = document.querySelectorAll('.x-card');
const lightbox = document.getElementById('videoLightbox');
const youtubeIframe = document.getElementById('youtubeIframe');
const lightboxClose = document.getElementById('lightboxClose');

cards.forEach(card => {
    card.addEventListener('click', () => {
        const youtubeId = card.getAttribute('data-youtube-id');
        if (!youtubeId) return;

        youtubeIframe.src = `https://www.youtube.com/embed/${youtubeId}?autoplay=1&rel=0&modestbranding=1`;
        
        lightbox.classList.add('active');
        document.body.classList.add('lightbox-open');
        
        // Stop scroll interactions
        if (typeof lenis !== 'undefined') {
            lenis.stop();
        }
    });
});

const closeLightbox = () => {
    lightbox.classList.remove('active');
    document.body.classList.remove('lightbox-open');
    
    // Clear iframe src to stop playback
    if (youtubeIframe) {
        youtubeIframe.src = "";
    }
    if (document.fullscreenElement) {
        document.exitFullscreen().catch(e => console.log(e));
    }
    
    if (typeof lenis !== 'undefined') {
        lenis.start();
    }
};

if (lightboxClose) lightboxClose.addEventListener('click', closeLightbox);
if (lightbox) {
    lightbox.addEventListener('click', (e) => {
        // If they click the background (not the video wrapper), close it
        if (e.target === lightbox || e.target.classList.contains('x-lightbox-content')) {
            closeLightbox();
        }
    });
}

// Keyboard nav mapping
document.addEventListener('keydown', (e) => {
    if (!lightbox || !lightbox.classList.contains('active')) return;
    if (e.key === 'Escape') {
        if (document.fullscreenElement) {
            document.exitFullscreen();
        } else {
            closeLightbox();
        }
    }
});
