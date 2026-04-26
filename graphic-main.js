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
const progressBar = document.getElementById('scrollProgress');
lenis.on('scroll', ({ progress }) => {
    if(progressBar) progressBar.style.width = `${progress * 100}%`;
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

// Lightbox System
const cards = document.querySelectorAll('.x-card');
const lightbox = document.getElementById('brochureLightbox');
const lightboxImg = document.getElementById('lightboxImage');
const lightboxClose = document.getElementById('lightboxClose');
const lightboxPrev = document.getElementById('lightboxPrev');
const lightboxNext = document.getElementById('lightboxNext');
const lightboxCounter = document.getElementById('lightboxCounter');

let currentImages = [];
let currentIndex = 0;

cards.forEach(card => {
    card.addEventListener('click', () => {
        const imagesData = card.getAttribute('data-images');
        if (!imagesData) return;
        
        // Use a split fallback for empty or malformed strings
        currentImages = imagesData.split(',').filter(src => src.trim() !== '');
        if (currentImages.length === 0) return;

        currentIndex = 0;
        
        updateLightbox();
        lightbox.classList.add('active');
        document.body.classList.add('lightbox-open');
        
        // Stop scroll interactions while reading brochure
        if (typeof lenis !== 'undefined') {
            lenis.stop();
        }
    });
});

const updateLightbox = () => {
    if (currentImages.length === 0) return;
    
    // Quick re-trigger animation hack
    lightboxImg.style.animation = 'none';
    lightboxImg.offsetHeight; // reflow
    lightboxImg.style.animation = 'slideFadeIn 0.5s ease';
    
    lightboxImg.src = currentImages[currentIndex].trim();
    lightboxCounter.textContent = `${currentIndex + 1} / ${currentImages.length}`;
};

const closeLightbox = () => {
    lightbox.classList.remove('active');
    document.body.classList.remove('lightbox-open');
    if (typeof lenis !== 'undefined') {
        lenis.start();
    }
};

if (lightboxClose) lightboxClose.addEventListener('click', closeLightbox);
if (lightbox) {
    lightbox.addEventListener('click', (e) => {
        // If they click the background (not the image or buttons), close it
        if (e.target === lightbox || e.target.classList.contains('x-lightbox-content')) {
            closeLightbox();
        }
    });
}

if (lightboxPrev) {
    lightboxPrev.addEventListener('click', () => {
        if (currentImages.length === 0) return;
        currentIndex = (currentIndex > 0) ? currentIndex - 1 : currentImages.length - 1;
        updateLightbox();
    });
}

if (lightboxNext) {
    lightboxNext.addEventListener('click', () => {
        if (currentImages.length === 0) return;
        currentIndex = (currentIndex < currentImages.length - 1) ? currentIndex + 1 : 0;
        updateLightbox();
    });
}

// Keyboard nav mapping
document.addEventListener('keydown', (e) => {
    if (!lightbox || !lightbox.classList.contains('active')) return;
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowLeft' && lightboxPrev) lightboxPrev.click();
    if (e.key === 'ArrowRight' && lightboxNext) lightboxNext.click();
});
