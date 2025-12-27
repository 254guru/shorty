// === Decorative Hearts ===
function initializeHearts() {
    const bg = document.getElementById('heartsBackground');
    if (!bg) return;
    const hearts = ['❤️', '💕', '💖', '🎉', '💗'];
    for (let i = 0; i < 12; i++) {
        const heart = document.createElement('div');
        heart.classList.add('heart');
        heart.textContent = hearts[Math.floor(Math.random() * hearts.length)];
        heart.style.left = Math.random() * 100 + '%';
        heart.style.top = Math.random() * 100 + '%';
        heart.style.animationDelay = Math.random() * 5 + 's';
        bg.appendChild(heart);
    }
}

// === Confetti ===
function triggerConfetti() {
    const colors = ['#c2185b', '#9c27b0', '#3f51b5', '#ff1493'];
    for (let i = 0; i < 20; i++) {
        const confetti = document.createElement('div');
        confetti.classList.add('confetti');
        confetti.textContent = ['💕', '✨', '💖', '🎉'][Math.floor(Math.random() * 4)];
        confetti.style.left = Math.random() * 100 + 'vw';
        confetti.style.top = '-10px';
        confetti.style.fontSize = Math.random() * 20 + 15 + 'px';
        confetti.style.color = colors[Math.floor(Math.random() * colors.length)];
        document.body.appendChild(confetti);
        setTimeout(() => confetti.remove(), 1500);
    }
}

// === Love Messages ===
const loveMessages = [
    'Every moment with you is a treasure I hold close to my heart. Thank you for being my person.',
    'In your eyes, I found my home. In your smile, I found my peace. In your love, I found myself.',
    'You are the best thing that ever happened to me. I fall in love with you more every single day.',
    'My love for you grows deeper with every passing day, every shared laugh, and every quiet moment together.',
    'You make my heart skip a beat and my spirit soar. You are my greatest blessing.',
    'With you, I found not just love, but my soulmate. Forever grateful for you.',
    'You are my sunshine, my moonlight, and all my stars. You make life beautiful.',
    'Every love song makes sense now because it is all about you.',
    "I didn't know what love was until I met you. Thank you for showing me.",
    'You are my favorite adventure, my greatest dream, and my sweetest reality.',
    'In a world of billions, my heart chose you. And I would not change it for anything.',
    "Your love is the greatest gift I've ever received. I cherish you more than words could ever say.",
    'You are my today and all of my tomorrows. I love you endlessly.',
    'With every heartbeat, I love you more. You are my forever.',
    'You make being alive feel like living. You are my reason to smile.',
    'My heart recognized you long before my mind caught up. You are my soulmate.',
    'Every day with you feels like a beautiful love story. I cannot wait for the next chapter.',
    'You are the answer to every prayer I have ever whispered. My forever love.',
    'In your arms is where I feel safe, loved, and completely myself.',
    'You are not just my love; you are my life, my heart, my everything.'
];

async function generateLoveMessage() {
    const messageElement = document.getElementById('dailyMessage');
    const refreshBtn = document.getElementById('refreshMessageBtn');
    if (!messageElement || !refreshBtn) return;

    refreshBtn.disabled = true;
    messageElement.innerHTML = '<span class="message-loading">Generating your message...</span>';

    try {
        const randomIndex = Math.floor(Math.random() * loveMessages.length);
        const message = loveMessages[randomIndex];
        await new Promise(resolve => setTimeout(resolve, 600));
        messageElement.textContent = message;
        messageElement.style.opacity = '0';
        setTimeout(() => {
            messageElement.style.opacity = '1';
            messageElement.style.transition = 'opacity 0.5s ease';
        }, 10);
    } finally {
        refreshBtn.disabled = false;
    }
}

// === Password Gate ===
function setupPasswordGate() {
    const passwordModal = document.getElementById('passwordModal');
    const welcomeScreen = document.getElementById('welcomeScreen');
    const mainContent = document.getElementById('mainContent');
    const navbar = document.getElementById('navbar');
    const passwordInput = document.getElementById('passwordInput');
    const submitPassword = document.getElementById('submitPassword');

    if (!passwordModal || !passwordInput || !submitPassword) return;

    function unlock() {
        passwordModal.style.display = 'none';
        setTimeout(() => {
            welcomeScreen.style.display = 'flex';
            setTimeout(() => {
                welcomeScreen.style.animation = 'fadeOut 0.8s ease forwards';
                setTimeout(() => {
                    welcomeScreen.style.display = 'none';
                    if (mainContent) mainContent.style.display = 'block';
                    if (navbar) navbar.style.display = 'flex';
                    initializeHearts();
                    generateLoveMessage();
                }, 800);
            }, 2500);
        }, 100);
    }

    function checkPassword() {
        if (passwordInput.value.trim().toLowerCase() === 'shorty') {
            unlock();
        } else {
            passwordInput.value = '';
            passwordInput.style.borderColor = '#ff4d4d';
            passwordInput.placeholder = 'Try again, my love...';
            setTimeout(() => {
                passwordInput.style.borderColor = 'var(--primary-light)';
                passwordInput.placeholder = 'Our special word...';
            }, 1500);
        }
    }

    submitPassword.addEventListener('click', checkPassword);
    passwordInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') checkPassword();
    });
}

// === Letter Toggle ===
function setupLetterToggle() {
    const loveLetter = document.getElementById('loveLetter');
    if (!loveLetter) return;
    loveLetter.addEventListener('click', () => {
        loveLetter.classList.toggle('expanded');
    });
}

// === Spotify Embed Navigation ===
const spotifyTracks = [
    { name: 'Favorite song', artist: 'Bensoul', id: '29LhW0Exeu0I9HOPNAdlDA' },
    { name: 'Aki Sioni', artist: 'Njerae', id: '0U9jyVnEkmWryh7sJpMS5e' },
    { name: 'Navigate', artist: 'Brandy Maina', id: '4DIP9hzCiOu0GzvabVPAwM' },
    { name: 'M.O.T.O', artist: 'X.O', id: '13RrmTzCsknCAV7jb1hPnx' },
    { name: 'Mi Nawe', artist: 'Nadia Mukami', id: '2G5O04iw55cwm413LsPzBX' }
];

let currentEmbedIndex = 0;

function updateSpotifyEmbed() {
    const track = spotifyTracks[currentEmbedIndex];
    const embedFrame = document.getElementById('spotifyEmbed');
    const trackTitle = document.getElementById('embedTrackTitle');
    const trackArtist = document.getElementById('embedTrackArtist');
    const trackCounter = document.getElementById('trackCounter');
    const prevBtn = document.getElementById('prevEmbedBtn');
    const nextBtn = document.getElementById('nextEmbedBtn');

    if (embedFrame) {
        embedFrame.src = `https://open.spotify.com/embed/track/${track.id}?utm_source=generator`;
    }
    if (trackTitle) trackTitle.textContent = track.name;
    if (trackArtist) trackArtist.textContent = track.artist;
    if (trackCounter) trackCounter.textContent = `${currentEmbedIndex + 1} / ${spotifyTracks.length}`;

    if (prevBtn) prevBtn.disabled = currentEmbedIndex === 0;
    if (nextBtn) nextBtn.disabled = currentEmbedIndex === spotifyTracks.length - 1;
}

function setupSpotifyEmbedNav() {
    const prevBtn = document.getElementById('prevEmbedBtn');
    const nextBtn = document.getElementById('nextEmbedBtn');

    if (prevBtn) {
        prevBtn.addEventListener('click', () => {
            if (currentEmbedIndex > 0) {
                currentEmbedIndex--;
                updateSpotifyEmbed();
                if (window.clearConfetti) window.clearConfetti();
            }
        });
    }

    if (nextBtn) {
        nextBtn.addEventListener('click', () => {
            if (currentEmbedIndex < spotifyTracks.length - 1) {
                currentEmbedIndex++;
                updateSpotifyEmbed();
                if (window.clearConfetti) window.clearConfetti();
            }
        });
    }

    updateSpotifyEmbed();
}

// === Scroll Nav Highlight ===
function setupNavHighlight() {
    let scrollTimeout;
    window.addEventListener('scroll', () => {
        if (scrollTimeout) return;
        scrollTimeout = setTimeout(() => {
            const navBtns = document.querySelectorAll('.nav-btn');
            const sections = [
                { id: 'hero', selector: '.hero' },
                { id: 'letter', selector: '#letterSection' },
                { id: 'music', selector: '#musicSection' },
                { id: 'notes', selector: '#notesSection' },
                { id: 'gallery', selector: '#gallerySection' }
            ];

            let current = 0;
            sections.forEach((section, index) => {
                const el = document.querySelector(section.selector);
                if (el && el.getBoundingClientRect().top <= 150) {
                    current = index;
                }
            });

            navBtns.forEach((btn, idx) => {
                btn.classList.toggle('active', idx === current);
            });
            scrollTimeout = null;
        }, 150);
    }, { passive: true });
}

// === Init ===
document.addEventListener('DOMContentLoaded', () => {
    setupPasswordGate();
    setupLetterToggle();
    const refreshBtn = document.getElementById('refreshMessageBtn');
    if (refreshBtn) refreshBtn.addEventListener('click', generateLoveMessage);
    setupSpotifyEmbedNav();
    setupNavHighlight();
});

/* --- Responsive Spotify + Confetti cleanup --- */
(function () {
  /*
  // Make Spotify embeds fully responsive via aspect-ratio wrapper
  function wrapSpotifyIframes(root = document) {
    const iframes = root.querySelectorAll('iframe[src*="spotify.com"]:not([data-ratio-wrapped])');
    iframes.forEach((iframe) => {
      const wrapper = document.createElement('div');
      wrapper.className = 'ratio-embed spotify-embed';

      iframe.setAttribute('data-ratio-wrapped', 'true');
      const parent = iframe.parentNode;
      if (!parent) return;

      parent.insertBefore(wrapper, iframe);
      wrapper.appendChild(iframe);
    });
  }

  // Initial wrap + observe for dynamically added iframes
  wrapSpotifyIframes(document);
  const embedObserver = new MutationObserver((mutations) => {
    for (const m of mutations) {
      if (m.type === 'childList') {
        m.addedNodes.forEach((n) => {
          if (n.nodeType !== 1) return;
          const el = (n);
          if (el.matches && el.matches('iframe[src*="spotify.com"]')) {
            wrapSpotifyIframes(document);
            clearConfetti(); // new embed --> clear confetti
          } else if (el.querySelector) {
            wrapSpotifyIframes(el);
          }
        });
      }
      if (m.type === 'attributes' && m.target instanceof Element) {
        const el = m.target;
        if (el.matches('iframe[src*="spotify.com"]') && m.attributeName === 'src') {
          // Embed source changed (prev/next) --> clear confetti
          clearConfetti();
        }
      }
    }
  });
  embedObserver.observe(document.body, {
    subtree: true,
    childList: true,
    attributes: true,
    attributeFilter: ['src']
  });
  */
  // Undo confetti on prev/next song
  function clearConfetti() {
    // canvas-confetti API
    if (window.confetti && typeof window.confetti.reset === 'function') {
      try { window.confetti.reset(); } catch (_) {}
    }
    // js-confetti API
    if (window.jsConfetti && typeof window.jsConfetti.clearCanvas === 'function') {
      try { window.jsConfetti.clearCanvas(); } catch (_) {}
    }
    // Fallback: remove any confetti-looking canvases
    document.querySelectorAll('canvas[id*="confetti"], canvas.confetti-canvas, canvas[data-confetti]')
      .forEach(c => { try { c.remove(); } catch (_) {} });
  }

  // Delegate clicks for common prev/next controls to clear confetti proactively
  document.addEventListener('click', (e) => {
    const t = e.target;
    if (!(t instanceof Element)) return;
    const el = t.closest('[data-action="prev"], [data-action="next"], .prev, .next, #prev, #next, #previous, #nextSong, [aria-label="Previous"], [aria-label="Next"]');
    if (el) clearConfetti();
  }, true);

  // Expose for direct use if existing code wants to call it explicitly
  window.clearConfetti = clearConfetti;
})();
