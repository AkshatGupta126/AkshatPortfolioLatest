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
const lightboxClose = document.getElementById('lightboxClose');
const videoWrapper = document.getElementById('videoWrapper');

const playPauseBtn = document.getElementById('playPauseBtn');
const playIcon = document.getElementById('playIcon');
const pauseIcon = document.getElementById('pauseIcon');
const progressContainer = document.getElementById('progressContainer');
const progressBar = document.getElementById('progressBar');
const videoTime = document.getElementById('videoTime');
const fullscreenBtn = document.getElementById('fullscreenBtn');
const videoClickOverlay = document.getElementById('videoClickOverlay');

// Load YT API
const tag = document.createElement('script');
tag.src = "https://www.youtube.com/iframe_api";
const firstScriptTag = document.getElementsByTagName('script')[0];
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

let ytPlayer;
let isPlayerReady = false;
let progressInterval;

window.onYouTubeIframeAPIReady = function() {
    ytPlayer = new YT.Player('youtubePlayer', {
        height: '100%',
        width: '100%',
        videoId: '',
        playerVars: {
            'autoplay': 1,
            'controls': 0,
            'disablekb': 1,
            'fs': 0,
            'modestbranding': 1,
            'rel': 0,
            'iv_load_policy': 3,
            'playsinline': 1
        },
        events: {
            'onReady': onPlayerReady,
            'onStateChange': onPlayerStateChange
        }
    });
};

function onPlayerReady(event) {
    isPlayerReady = true;
}

function onPlayerStateChange(event) {
    if (event.data === YT.PlayerState.PLAYING) {
        if(playIcon) playIcon.style.display = 'none';
        if(pauseIcon) pauseIcon.style.display = 'block';
        startProgressLoop();
    } else {
        if(playIcon) playIcon.style.display = 'block';
        if(pauseIcon) pauseIcon.style.display = 'none';
        stopProgressLoop();
    }
}

const formatTime = (timeInSeconds) => {
    if (isNaN(timeInSeconds)) return "0:00";
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = Math.floor(timeInSeconds % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
};

function updateProgressBar() {
    if (!ytPlayer || !ytPlayer.getCurrentTime) return;
    const currentTime = ytPlayer.getCurrentTime();
    const duration = ytPlayer.getDuration();
    if (duration > 0) {
        const percent = (currentTime / duration) * 100;
        if(progressBar) progressBar.style.width = `${percent}%`;
        if(videoTime) videoTime.textContent = `${formatTime(currentTime)} / ${formatTime(duration)}`;
    }
}

function startProgressLoop() {
    stopProgressLoop();
    progressInterval = setInterval(updateProgressBar, 100);
}

function stopProgressLoop() {
    if (progressInterval) clearInterval(progressInterval);
}

const togglePlay = () => {
    if (!ytPlayer || !isPlayerReady) return;
    const state = ytPlayer.getPlayerState();
    if (state === YT.PlayerState.PLAYING) {
        ytPlayer.pauseVideo();
    } else {
        ytPlayer.playVideo();
    }
};

const scrub = (e) => {
    if (!ytPlayer || !isPlayerReady) return;
    const duration = ytPlayer.getDuration();
    if (!duration) return;
    const rect = progressContainer.getBoundingClientRect();
    let pos = (e.clientX - rect.left) / rect.width;
    pos = Math.max(0, Math.min(1, pos));
    ytPlayer.seekTo(pos * duration, true);
};

const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
        videoWrapper.requestFullscreen().catch(err => console.log(err));
    } else {
        document.exitFullscreen();
    }
};

if(playPauseBtn) playPauseBtn.addEventListener('click', togglePlay);
if(videoClickOverlay) videoClickOverlay.addEventListener('click', togglePlay);

let mousedown = false;
if(progressContainer) {
    progressContainer.addEventListener('click', scrub);
    progressContainer.addEventListener('mousemove', (e) => mousedown && scrub(e));
    progressContainer.addEventListener('mousedown', () => mousedown = true);
    progressContainer.addEventListener('mouseup', () => mousedown = false);
    progressContainer.addEventListener('mouseleave', () => mousedown = false);
}

// Settings Logic
const settingsBtn = document.getElementById('settingsBtn');
const settingsMenu = document.getElementById('settingsMenu');
const speedOpts = document.querySelectorAll('.speed-opt');
const qualityOpts = document.querySelectorAll('.quality-opt');

const settingsMainPane = document.getElementById('settingsMainPane');
const settingsSpeedPane = document.getElementById('settingsSpeedPane');
const settingsQualityPane = document.getElementById('settingsQualityPane');
const btnOpenSpeed = document.getElementById('btnOpenSpeed');
const btnOpenQuality = document.getElementById('btnOpenQuality');
const btnBackFromSpeed = document.getElementById('btnBackFromSpeed');
const btnBackFromQuality = document.getElementById('btnBackFromQuality');

if (settingsBtn && settingsMenu) {
    settingsBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const isActive = settingsMenu.classList.toggle('active');
        if (isActive) {
            settingsMainPane.style.display = 'block';
            settingsSpeedPane.style.display = 'none';
            settingsQualityPane.style.display = 'none';
        }
    });
}

if (btnOpenSpeed) {
    btnOpenSpeed.addEventListener('click', (e) => {
        e.stopPropagation();
        settingsMainPane.style.display = 'none';
        settingsSpeedPane.style.display = 'block';
    });
}

if (btnOpenQuality) {
    btnOpenQuality.addEventListener('click', (e) => {
        e.stopPropagation();
        settingsMainPane.style.display = 'none';
        settingsQualityPane.style.display = 'block';
    });
}

if (btnBackFromSpeed) {
    btnBackFromSpeed.addEventListener('click', (e) => {
        e.stopPropagation();
        settingsSpeedPane.style.display = 'none';
        settingsMainPane.style.display = 'block';
    });
}

if (btnBackFromQuality) {
    btnBackFromQuality.addEventListener('click', (e) => {
        e.stopPropagation();
        settingsQualityPane.style.display = 'none';
        settingsMainPane.style.display = 'block';
    });
}

document.addEventListener('click', (e) => {
    if (settingsMenu && settingsMenu.classList.contains('active') && settingsBtn && !settingsBtn.contains(e.target) && !settingsMenu.contains(e.target)) {
        settingsMenu.classList.remove('active');
    }
});

speedOpts.forEach(opt => {
    opt.addEventListener('click', () => {
        if (!ytPlayer || !isPlayerReady) return;
        const speed = parseFloat(opt.getAttribute('data-speed'));
        ytPlayer.setPlaybackRate(speed);
        
        speedOpts.forEach(o => o.classList.remove('active'));
        opt.classList.add('active');
        settingsMenu.classList.remove('active');
    });
});

qualityOpts.forEach(opt => {
    opt.addEventListener('click', () => {
        if (!ytPlayer || !isPlayerReady) return;
        const quality = opt.getAttribute('data-quality');
        ytPlayer.setPlaybackQuality(quality);
        
        qualityOpts.forEach(o => o.classList.remove('active'));
        opt.classList.add('active');
        settingsMenu.classList.remove('active');
    });
});

if(fullscreenBtn) fullscreenBtn.addEventListener('click', toggleFullscreen);

cards.forEach(card => {
    card.addEventListener('click', () => {
        const youtubeId = card.getAttribute('data-youtube-id');
        if (!youtubeId) return;

        if (isPlayerReady && ytPlayer) {
            ytPlayer.loadVideoById(youtubeId);
        } else if (!isPlayerReady) {
            // Fallback in case API isn't ready
            const checkReady = setInterval(() => {
                if (isPlayerReady && ytPlayer) {
                    ytPlayer.loadVideoById(youtubeId);
                    clearInterval(checkReady);
                }
            }, 100);
        }
        
        if(progressBar) progressBar.style.width = '0%';
        if(videoTime) videoTime.textContent = '0:00 / 0:00';
        if(playIcon) playIcon.style.display = 'none';
        if(pauseIcon) pauseIcon.style.display = 'block';
        
        lightbox.classList.add('active');
        document.body.classList.add('lightbox-open');
        
        if (typeof lenis !== 'undefined') {
            lenis.stop();
        }
    });
});

const closeLightbox = () => {
    lightbox.classList.remove('active');
    document.body.classList.remove('lightbox-open');
    
    if (ytPlayer && isPlayerReady) {
        ytPlayer.stopVideo();
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
        if (e.target === lightbox || e.target.classList.contains('x-lightbox-content')) {
            closeLightbox();
        }
    });
}

document.addEventListener('keydown', (e) => {
    if (!lightbox || !lightbox.classList.contains('active')) return;
    if (e.key === 'Escape') {
        if (document.fullscreenElement) {
            document.exitFullscreen();
        } else {
            closeLightbox();
        }
    }
    
    if(e.target.tagName.toLowerCase() === 'input') return;

    if (e.key === ' ' || e.key === 'k') {
        e.preventDefault();
        togglePlay();
    }
    if (e.key === 'f') toggleFullscreen();
});
