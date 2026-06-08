// Initialize GSAP and ScrollTrigger
if (typeof gsap !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);
}

// --------------------------------------------------
// LENIS SMOOTH SCROLL INITIALIZATION
// --------------------------------------------------
let lenis;
if (typeof Lenis !== 'undefined') {
    lenis = new Lenis({
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

    gsap.ticker.add((time) => {
        lenis.raf(time * 1000);
    });

    gsap.ticker.lagSmoothing(0);
}

// Scroll Progress Bar
const progressBar = document.getElementById('scrollProgress');
if (progressBar && lenis) {
    lenis.on('scroll', ({ progress }) => {
        progressBar.style.width = `${progress * 100}%`;
    });
}

// Navbar scrolled styling
const navbar = document.querySelector('.y-navbar');
if (navbar && lenis) {
    lenis.on('scroll', ({ scroll }) => {
        if (scroll > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });
}

// --------------------------------------------------
// HERO & ENTRANCE ANIMATIONS (GSAP)
// --------------------------------------------------
window.addEventListener('DOMContentLoaded', () => {
    // Reveal hero elements
    const tl = gsap.timeline();
    
    tl.to('.y-badge', {
        y: 0, opacity: 1, duration: 0.6, ease: 'power2.out'
    })
    .to('.y-hero-title', {
        y: 0, opacity: 1, duration: 0.8, ease: 'power3.out'
    }, "-=0.4")
    .to('.y-hero-lead', {
        y: 0, opacity: 1, duration: 0.6, ease: 'power2.out'
    }, "-=0.4");

    // Fade-in cards scroll trigger
    const cards = gsap.utils.toArray('.y-card');
    cards.forEach((card, index) => {
        gsap.to(card, {
            scrollTrigger: {
                trigger: card,
                start: "top 90%",
                toggleActions: "play none none none"
            },
            y: 0,
            opacity: 1,
            duration: 0.7,
            ease: 'power2.out',
            delay: (index % 3) * 0.1 // Stagger row items
        });
    });
});

// --------------------------------------------------
// DESKTOP CUSTOM CURSOR
// --------------------------------------------------
let mm = gsap.matchMedia();
mm.add("(min-width: 900px)", () => {
    const cursor = document.getElementById('cursorGlow');
    let mouseX = 0, mouseY = 0;
    let cursorX = 0, cursorY = 0;

    const onMouseMove = (e) => {
        mouseX = e.clientX; 
        mouseY = e.clientY;
    };
    window.addEventListener('mousemove', onMouseMove);

    const renderCursor = () => {
        if (!cursor) return;
        cursorX += (mouseX - cursorX) * 0.15;
        cursorY += (mouseY - cursorY) * 0.15;
        cursor.style.transform = `translate(calc(${cursorX}px - 50%), calc(${cursorY}px - 50%))`;
    };
    gsap.ticker.add(renderCursor);

    return () => {
        window.removeEventListener('mousemove', onMouseMove);
        gsap.ticker.remove(renderCursor);
    };
});

// --------------------------------------------------
// MODAL OVERLAY & CLIPBOARD COPY SYSTEM
// --------------------------------------------------
const modal = document.getElementById('promptModal');
const modalBackdrop = document.getElementById('modalBackdrop');
const modalClose = document.getElementById('modalClose');
let isModalClosing = false;
const modalImg = document.getElementById('modalImg');
const modalTag = document.getElementById('modalTag');
const modalTitle = document.getElementById('modalTitle');
const modalDesc = document.getElementById('modalDesc');
const modalPromptText = document.getElementById('modalPromptText');
const modalTip = document.getElementById('modalTip');
const copyBtn = document.getElementById('modalCopyBtn');
const cardElements = document.querySelectorAll('.y-card');

// Dynamically adjust media container height based on image aspect ratio on mobile
const adjustModalMediaHeight = (imgElement) => {
    const mediaContainer = document.querySelector('.y-modal-media');
    if (!mediaContainer) return;

    if (window.innerWidth > 900) {
        mediaContainer.style.height = '';
        return;
    }
    
    if (!imgElement) {
        mediaContainer.style.height = '280px';
        return;
    }
    
    const applyHeight = (w, h) => {
        if (h > w) {
            // Vertical aspect ratio (e.g. 9:16 or 2:3) -> Needs vertical room
            mediaContainer.style.height = '420px';
        } else {
            // Horizontal aspect ratio (e.g. 16:9) -> Needs less height
            mediaContainer.style.height = '240px';
        }
    };

    if (imgElement.complete) {
        applyHeight(imgElement.naturalWidth, imgElement.naturalHeight);
    } else {
        imgElement.addEventListener('load', function onloadHandler() {
            applyHeight(imgElement.naturalWidth, imgElement.naturalHeight);
            imgElement.removeEventListener('load', onloadHandler);
        });
    }
};

// Open Modal
cardElements.forEach(card => {
    const openCardModal = () => {
        // Reset scroll positions of the modal content containers to the top
        const modalContainer = document.querySelector('.y-modal-container');
        if (modalContainer) modalContainer.scrollTop = 0;
        const modalInfo = document.querySelector('.y-modal-info');
        if (modalInfo) modalInfo.scrollTop = 0;

        // Retrieve dataset fields
        const imgPath = card.getAttribute('data-image');
        const title = card.getAttribute('data-title');
        const model = card.getAttribute('data-model');
        const prompt = card.getAttribute('data-prompt');
        const desc = card.getAttribute('data-desc');
        const tip = card.getAttribute('data-tip');

        // Populate Modal Content
        modalTag.textContent = model;
        modalTitle.textContent = title;
        modalDesc.textContent = desc;
        modalPromptText.textContent = prompt;
        modalTip.textContent = tip;

        // Reset copy button styling and text
        resetCopyButton();

        // Handle Slideshow or Static Image
        const isSlideshow = card.getAttribute('data-is-slideshow') === 'true';
        if (isSlideshow) {
            modalImg.style.display = 'none';
            const slideshow = document.getElementById('modalSlideshow');
            const wrapper = document.getElementById('modalSlidesWrapper');
            const indicatorContainer = document.getElementById('modalSlidesIndicators');
            
            slideshow.style.display = 'block';
            wrapper.innerHTML = '';
            indicatorContainer.innerHTML = '';
            
            const images = card.getAttribute('data-images').split(',');
            const positions = card.getAttribute('data-object-positions').split(',');
            
            images.forEach((src, idx) => {
                const img = document.createElement('img');
                img.src = src;
                img.alt = `${title} - Slide ${idx + 1}`;
                img.className = 'y-slide-img';
                img.style.objectPosition = 'center';
                if (idx === 0) img.classList.add('active');
                wrapper.appendChild(img);
                
                const btn = document.createElement('button');
                btn.className = 'y-indicator-num';
                if (idx === 0) btn.classList.add('active');
                btn.textContent = idx + 1;
                
                btn.addEventListener('click', () => {
                    clearInterval(slideTimer);
                    goToSlide(idx);
                });
                
                indicatorContainer.appendChild(btn);
            });
            
            const slideImages = wrapper.querySelectorAll('.y-slide-img');
            const indicatorBtns = indicatorContainer.querySelectorAll('.y-indicator-num');
            let currentSlide = 0;
            
            function goToSlide(idx) {
                slideImages[currentSlide].classList.remove('active');
                indicatorBtns[currentSlide].classList.remove('active');
                currentSlide = idx;
                slideImages[currentSlide].classList.add('active');
                indicatorBtns[currentSlide].classList.add('active');
                adjustModalMediaHeight(slideImages[currentSlide]);
            }
            
            const slideTimer = setInterval(() => {
                let next = (currentSlide + 1) % slideImages.length;
                goToSlide(next);
            }, 3000);
            
            modal.setAttribute('data-slideshow-timer', slideTimer);
            
            // Adjust height for the initial active slide
            adjustModalMediaHeight(slideImages[0]);
        } else {
            modalImg.style.display = 'block';
            document.getElementById('modalSlideshow').style.display = 'none';
            
            modalImg.setAttribute('src', imgPath);
            modalImg.setAttribute('alt', title);
            modalImg.style.objectPosition = 'center';
            
            // Adjust height for static image
            adjustModalMediaHeight(modalImg);
        }

        // Show Modal with smooth entry
        modal.classList.add('active');
        document.body.classList.add('lightbox-open'); // Stops scroll trigger parallax issues
        if (lenis) lenis.stop(); // Stop Lenis smooth scroll

        // Push state to browser history when modal is opened
        if (window.history.state === null || !window.history.state.modalOpen) {
            window.history.pushState({ modalOpen: true }, '');
        }

        // Focus close button for accessibility
        setTimeout(() => modalClose.focus(), 100);
    };

    // Click handler
    card.addEventListener('click', openCardModal);

    // Keyboard entry (Enter key)
    card.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            openCardModal();
        }
    });
});

// Close Modal Function
const closeModal = (fromHistory = false) => {
    // Clear any active slideshow timer
    const slideTimer = modal.getAttribute('data-slideshow-timer');
    if (slideTimer) {
        clearInterval(parseInt(slideTimer, 10));
        modal.removeAttribute('data-slideshow-timer');
    }

    modal.classList.remove('active');
    document.body.classList.remove('lightbox-open');
    if (lenis) lenis.start(); // Restart Lenis smooth scroll
    
    // Reset scroll positions of the modal content containers to the top
    const modalContainer = document.querySelector('.y-modal-container');
    if (modalContainer) modalContainer.scrollTop = 0;
    const modalInfo = document.querySelector('.y-modal-info');
    if (modalInfo) modalInfo.scrollTop = 0;
    
    // Reset media container height
    const mediaContainer = document.querySelector('.y-modal-media');
    if (mediaContainer) mediaContainer.style.height = '';

    // If manual close (not popstate), pop history state
    const actualFromHistory = (fromHistory === true);
    if (!actualFromHistory && window.history.state && window.history.state.modalOpen) {
        isModalClosing = true;
        window.history.back();
    }
};

// Listen for browser back button to close the active modal instead of navigating back
window.addEventListener('popstate', (e) => {
    if (modal.classList.contains('active')) {
        if (isModalClosing) {
            isModalClosing = false; // Reset the flag, this popstate was triggered by our manual close
        } else {
            closeModal(true); // Close the modal because user clicked the back button
        }
    }
});

// Window resize handler to maintain aspect ratio logic dynamically
window.addEventListener('resize', () => {
    if (modal.classList.contains('active')) {
        const activeImg = modalImg.style.display === 'block' ? modalImg : document.querySelector('.y-slide-img.active');
        adjustModalMediaHeight(activeImg);
    } else {
        const mediaContainer = document.querySelector('.y-modal-media');
        if (mediaContainer) mediaContainer.style.height = '';
    }
});

if (modalClose) modalClose.addEventListener('click', closeModal);
if (modalBackdrop) modalBackdrop.addEventListener('click', closeModal);

// Escape key to close modal
window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('active')) {
        closeModal();
    }
});

// --------------------------------------------------
// STABLE CLIPBOARD COPY FUNCTION (ALL DEVICE SUPPORTED)
// --------------------------------------------------
const resetCopyButton = () => {
    if (!copyBtn) return;
    copyBtn.classList.remove('success');
    const btnText = copyBtn.querySelector('.copy-btn-text');
    const copyIcon = copyBtn.querySelector('.copy-icon');
    const successIcon = copyBtn.querySelector('.success-icon');
    
    if (btnText) btnText.textContent = "Copy Prompt";
    if (copyIcon) copyIcon.style.display = "inline";
    if (successIcon) successIcon.style.display = "none";
};

const copyToClipboard = (text) => {
    // 1. Primary Method: navigator.clipboard.writeText (Modern Standard)
    if (navigator.clipboard && window.isSecureContext) {
        return navigator.clipboard.writeText(text);
    } else {
        // 2. Secondary/Fallback Method: Hidden TextArea (High Compatibility for Mobile Webviews/iPads)
        return new Promise((resolve, reject) => {
            const textArea = document.createElement("textarea");
            textArea.value = text;
            
            // Avoid scrolling to bottom in Safari/Chrome
            textArea.style.top = "0";
            textArea.style.left = "0";
            textArea.style.position = "fixed";
            textArea.style.opacity = "0";
            
            document.body.appendChild(textArea);
            textArea.focus();
            textArea.select();
            
            try {
                const successful = document.execCommand('copy');
                document.body.removeChild(textArea);
                if (successful) {
                    resolve();
                } else {
                    reject(new Error("document.execCommand failed"));
                }
            } catch (err) {
                document.body.removeChild(textArea);
                reject(err);
            }
        });
    }
};

if (copyBtn) {
    copyBtn.addEventListener('click', () => {
        const textToCopy = modalPromptText.textContent;
        
        copyToClipboard(textToCopy)
            .then(() => {
                // Success state animation
                copyBtn.classList.add('success');
                const btnText = copyBtn.querySelector('.copy-btn-text');
                const copyIcon = copyBtn.querySelector('.copy-icon');
                const successIcon = copyBtn.querySelector('.success-icon');
                
                if (btnText) btnText.textContent = "Copied!";
                if (copyIcon) copyIcon.style.display = "none";
                if (successIcon) successIcon.style.display = "inline";

                // Micro-bounce animation using GSAP
                gsap.fromTo(copyBtn, 
                    { scale: 0.95 },
                    { scale: 1, duration: 0.4, ease: 'back.out(2)' }
                );

                // Auto-reset state after 2 seconds
                setTimeout(() => {
                    gsap.to(copyBtn, {
                        scale: 1,
                        duration: 0.2,
                        onComplete: resetCopyButton
                    });
                }, 2000);
            })
            .catch((err) => {
                console.error("Clipboard copy failed: ", err);
                const btnText = copyBtn.querySelector('.copy-btn-text');
                if (btnText) btnText.textContent = "Failed to copy";
                setTimeout(resetCopyButton, 2000);
            });
    });
}
