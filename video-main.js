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
const lightboxVideo = document.getElementById('lightboxVideo');
const lightboxClose = document.getElementById('lightboxClose');
const videoWrapper = document.getElementById('videoWrapper');

// Custom Controls Elements
const playPauseBtn = document.getElementById('playPauseBtn');
const playIcon = document.getElementById('playIcon');
const pauseIcon = document.getElementById('pauseIcon');
const progressContainer = document.getElementById('progressContainer');
const progressBar = document.getElementById('progressBar');
const muteBtn = document.getElementById('muteBtn');
const volumeIcon = document.getElementById('volumeIcon');
const muteIcon = document.getElementById('muteIcon');
const volumeSlider = document.getElementById('volumeSlider');
const videoTime = document.getElementById('videoTime');
const fullscreenBtn = document.getElementById('fullscreenBtn');

// Helper to format time
const formatTime = (timeInSeconds) => {
    if (isNaN(timeInSeconds)) return "0:00";
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = Math.floor(timeInSeconds % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
};

// Play / Pause Logic
const togglePlay = () => {
    if (lightboxVideo.paused) {
        lightboxVideo.play();
    } else {
        lightboxVideo.pause();
    }
};

const updatePlayIcon = () => {
    if (lightboxVideo.paused) {
        playIcon.style.display = 'block';
        pauseIcon.style.display = 'none';
    } else {
        playIcon.style.display = 'none';
        pauseIcon.style.display = 'block';
    }
};

// Update Progress
const handleProgress = () => {
    if(isNaN(lightboxVideo.duration)) return;
    const percent = (lightboxVideo.currentTime / lightboxVideo.duration) * 100;
    progressBar.style.width = `${percent}%`;
    videoTime.textContent = `${formatTime(lightboxVideo.currentTime)} / ${formatTime(lightboxVideo.duration)}`;
};

// Scrub Progress
const scrub = (e) => {
    if(isNaN(lightboxVideo.duration)) return;
    const rect = progressContainer.getBoundingClientRect();
    let pos = (e.clientX - rect.left) / rect.width;
    // clamp pos between 0 and 1
    pos = Math.max(0, Math.min(1, pos));
    lightboxVideo.currentTime = pos * lightboxVideo.duration;
};

// Volume Logic
const handleVolumeUpdate = () => {
    lightboxVideo.volume = volumeSlider.value;
    if (lightboxVideo.volume === 0) {
        lightboxVideo.muted = true;
    } else {
        lightboxVideo.muted = false;
    }
    updateMuteIcon();
};

const toggleMute = () => {
    lightboxVideo.muted = !lightboxVideo.muted;
    if (lightboxVideo.muted) {
        volumeSlider.value = 0;
    } else {
        volumeSlider.value = lightboxVideo.volume > 0 ? lightboxVideo.volume : 1;
        if(lightboxVideo.volume === 0) lightboxVideo.volume = 1;
    }
    updateMuteIcon();
};

const updateMuteIcon = () => {
    if (lightboxVideo.muted || lightboxVideo.volume === 0) {
        volumeIcon.style.display = 'none';
        muteIcon.style.display = 'block';
    } else {
        volumeIcon.style.display = 'block';
        muteIcon.style.display = 'none';
    }
};

// Fullscreen
const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
        videoWrapper.requestFullscreen().catch(err => console.log(err));
    } else {
        document.exitFullscreen();
    }
};

// Event Listeners for Controls
if(playPauseBtn) playPauseBtn.addEventListener('click', togglePlay);
if(lightboxVideo) {
    lightboxVideo.addEventListener('click', togglePlay);
    lightboxVideo.addEventListener('play', updatePlayIcon);
    lightboxVideo.addEventListener('pause', updatePlayIcon);
    lightboxVideo.addEventListener('timeupdate', handleProgress);
    lightboxVideo.addEventListener('loadedmetadata', handleProgress);
    
    // Disable right click to prevent video downloads
    lightboxVideo.addEventListener('contextmenu', (e) => e.preventDefault());
}

if(videoWrapper) {
    // Disable right click on the entire player wrapper
    videoWrapper.addEventListener('contextmenu', (e) => e.preventDefault());
}

let mousedown = false;
if(progressContainer) {
    progressContainer.addEventListener('click', scrub);
    progressContainer.addEventListener('mousemove', (e) => mousedown && scrub(e));
    progressContainer.addEventListener('mousedown', () => mousedown = true);
    progressContainer.addEventListener('mouseup', () => mousedown = false);
    // Handle mouse leaving the progress container while dragging
    progressContainer.addEventListener('mouseleave', () => mousedown = false);
}

if(volumeSlider) {
    volumeSlider.addEventListener('input', handleVolumeUpdate);
}
if(muteBtn) muteBtn.addEventListener('click', toggleMute);
if(fullscreenBtn) fullscreenBtn.addEventListener('click', toggleFullscreen);

// Settings Menu Logic
const settingsBtn = document.getElementById('settingsBtn');
const settingsMenu = document.getElementById('settingsMenu');
const qualityOptions = document.querySelectorAll('.settings-option');

if(settingsBtn) {
    settingsBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        settingsMenu.classList.toggle('active');
    });
}

// Close menu when clicking outside
document.addEventListener('click', (e) => {
    if(settingsMenu && settingsMenu.classList.contains('active') && !e.target.closest('.settings-container')) {
        settingsMenu.classList.remove('active');
    }
});

qualityOptions.forEach(option => {
    option.addEventListener('click', (e) => {
        e.stopPropagation();
        const quality = option.getAttribute('data-quality');
        
        // Update UI
        qualityOptions.forEach(opt => {
            opt.classList.remove('active');
            opt.querySelector('span').textContent = '';
        });
        option.classList.add('active');
        option.querySelector('span').textContent = '✓';
        
        // Handle Video Source Change (Simulated since static hosting)
        const currentTime = lightboxVideo.currentTime;
        const isPaused = lightboxVideo.paused;
        
        // Pause visually to indicate switching resolution
        lightboxVideo.pause();
        
        setTimeout(() => {
            lightboxVideo.currentTime = currentTime;
            if(!isPaused) {
                lightboxVideo.play().catch(e => console.log(e));
            }
        }, 150); // small delay to simulate switching stream
        
        settingsMenu.classList.remove('active');
    });
});

cards.forEach(card => {
    card.addEventListener('click', () => {
        const videoSrc = card.getAttribute('data-video');
        if (!videoSrc) return;

        lightboxVideo.src = videoSrc;
        // Reset controls state
        progressBar.style.width = '0%';
        videoTime.textContent = '0:00 / 0:00';
        updatePlayIcon();
        
        lightbox.classList.add('active');
        document.body.classList.add('lightbox-open');
        
        // Stop scroll interactions
        if (typeof lenis !== 'undefined') {
            lenis.stop();
        }
        
        // Auto play when opened
        lightboxVideo.play().catch(e => console.log(e));
    });
    
    // Autoplay thumbnails on hover logic
    const thumbVideo = card.querySelector('.x-card-thumb video');
    if (thumbVideo) {
        card.addEventListener('mouseenter', () => {
            thumbVideo.play().catch(e => console.log('Hover play prevented:', e));
        });
        card.addEventListener('mouseleave', () => {
            thumbVideo.pause();
            thumbVideo.currentTime = 0;
        });
    }
});

const closeLightbox = () => {
    lightbox.classList.remove('active');
    document.body.classList.remove('lightbox-open');
    
    // Pause video and clear source to stop playback
    if (lightboxVideo) {
        lightboxVideo.pause();
        lightboxVideo.src = "";
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
    
    // Check if user is typing in an input (though there shouldn't be any here)
    if(e.target.tagName.toLowerCase() === 'input') return;

    if (e.key === ' ' || e.key === 'k') {
        e.preventDefault();
        togglePlay();
    }
    if (e.key === 'm') toggleMute();
    if (e.key === 'f') toggleFullscreen();
});
