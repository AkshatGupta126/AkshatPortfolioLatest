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

// Lightbox System (Simple modal for single designs)
const cards = document.querySelectorAll('.x-card');
const lightbox = document.getElementById('brochureLightbox');
const lightboxImg = document.getElementById('lightboxImage');
const lightboxClose = document.getElementById('lightboxClose');

cards.forEach(card => {
    card.addEventListener('click', () => {
        const imagesData = card.getAttribute('data-images');
        if (!imagesData) return;
        
        const currentImages = imagesData.split(',').filter(src => src.trim() !== '');
        if (currentImages.length === 0) return;

        // Quick re-trigger animation hack
        lightboxImg.style.animation = 'none';
        lightboxImg.offsetHeight; // reflow
        lightboxImg.style.animation = 'slideFadeIn 0.5s ease';
        
        lightboxImg.src = currentImages[0].trim();
        
        lightbox.classList.add('active');
        document.body.classList.add('lightbox-open');
        
        // Stop scroll interactions while reading brochure
        if (typeof lenis !== 'undefined') {
            lenis.stop();
        }
    });
});

const closeLightbox = () => {
    if (lightbox) {
        lightbox.classList.remove('active');
    }
    const lightboxContent = document.querySelector('.x-lightbox-content');
    if (lightboxContent) {
        lightboxContent.classList.remove('zooming');
    }
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

// Keyboard nav mapping (Escape key close)
document.addEventListener('keydown', (e) => {
    if (!lightbox || !lightbox.classList.contains('active')) return;
    if (e.key === 'Escape') closeLightbox();
});

// Hover Magnifier Zoom Logic
const lightboxImgWrapper = document.getElementById('lightboxImgWrapper');
const zoomLens = document.getElementById('zoomLens');
const zoomWindow = document.getElementById('zoomWindow');
const lightboxContent = document.querySelector('.x-lightbox-content');

if (lightboxImgWrapper && lightboxImg && zoomLens && zoomWindow && lightboxContent) {
    const zoomFactor = 2.5;
    const windowSize = 400; // Match 400px width/height from CSS
    const gap = 40;

    const handleMouseEnter = () => {
        if (window.innerWidth < 900) return;

        lightboxContent.classList.add('zooming');
        zoomWindow.style.backgroundImage = `url('${lightboxImg.src}')`;

        const rect = lightboxImg.getBoundingClientRect();
        const lensWidth = rect.width / zoomFactor;
        const lensHeight = rect.height / zoomFactor;

        zoomLens.style.width = `${lensWidth}px`;
        zoomLens.style.height = `${lensHeight}px`;
        zoomWindow.style.backgroundSize = `${rect.width * zoomFactor}px ${rect.height * zoomFactor}px`;

        // Calculate position for zoom window
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;

        // Default: right side of the image
        let leftPos = rect.right + gap;

        // If it overflows viewport right side, place it on the left side of the image
        if (leftPos + windowSize > viewportWidth - gap) {
            leftPos = rect.left - gap - windowSize;
        }

        // If it still overflows (e.g. narrow screen), clamp it to the right boundary
        if (leftPos < gap) {
            leftPos = viewportWidth - gap - windowSize;
        }

        // Align vertical center with image vertical center
        let topPos = rect.top + (rect.height - windowSize) / 2;

        // Clamp vertically within screen boundaries
        if (topPos < gap) topPos = gap;
        if (topPos + windowSize > viewportHeight - gap) {
            topPos = viewportHeight - gap - windowSize;
        }

        zoomWindow.style.left = `${leftPos}px`;
        zoomWindow.style.top = `${topPos}px`;
    };

    const handleMouseMove = (e) => {
        if (window.innerWidth < 900 || !lightboxContent.classList.contains('zooming')) return;

        const rect = lightboxImg.getBoundingClientRect();
        let mouseX = e.clientX - rect.left;
        let mouseY = e.clientY - rect.top;

        const lensWidth = rect.width / zoomFactor;
        const lensHeight = rect.height / zoomFactor;

        let lensX = mouseX - lensWidth / 2;
        let lensY = mouseY - lensHeight / 2;

        // Clamp lens inside boundaries
        if (lensX < 0) lensX = 0;
        if (lensY < 0) lensY = 0;
        if (lensX > rect.width - lensWidth) lensX = rect.width - lensWidth;
        if (lensY > rect.height - lensHeight) lensY = rect.height - lensHeight;

        zoomLens.style.left = `${lensX}px`;
        zoomLens.style.top = `${lensY}px`;

        // Percentage mapping for background position
        const percentX = (lensX / (rect.width - lensWidth)) * 100;
        const percentY = (lensY / (rect.height - lensHeight)) * 100;

        zoomWindow.style.backgroundPosition = `${percentX}% ${percentY}%`;
    };

    const handleMouseLeave = () => {
        lightboxContent.classList.remove('zooming');
    };

    lightboxImgWrapper.addEventListener('mouseenter', handleMouseEnter);
    lightboxImgWrapper.addEventListener('mousemove', handleMouseMove);
    lightboxImgWrapper.addEventListener('mouseleave', handleMouseLeave);
}
