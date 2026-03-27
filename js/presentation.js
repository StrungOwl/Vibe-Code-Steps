// ============================================
// REVEAL.JS INITIALIZATION (standalone step-by-step)
// ============================================

Reveal.initialize({
  hash: true,
  history: true,
  controls: true,
  controlsLayout: 'edges',
  progress: true,
  center: true,
  transition: 'slide',
  transitionSpeed: 'default',
  backgroundTransition: 'fade',
  width: 1920,
  height: 1080,
  margin: 0.04,
  minScale: 0.2,
  maxScale: 2.0,
  slideNumber: 'c/t',
  keyboard: {
    // Space bar (32): only advance fragments, never change slides
    32: () => {
      const fragments = Reveal.availableFragments();
      if (fragments.next) {
        Reveal.nextFragment();
      }
      // Otherwise do nothing — arrow keys handle slide transitions
    }
  },
  overview: true,
  touch: true,
}).then(() => {
  console.log('Reveal.js initialized');
});

// ============================================
// POPOUT TOOLTIPS - Fixed position to escape Reveal overflow
// ============================================

(function initPopoutTooltips() {
  function setup() {
    document.querySelectorAll('.has-popout').forEach(card => {
      const tooltip = card.querySelector('.popout-tooltip');
      if (!tooltip) return;

      // Move tooltip to body so it isn't clipped
      document.body.appendChild(tooltip);

      let hideTimeout;

      function showTooltip() {
        clearTimeout(hideTimeout);
        document.querySelectorAll('.popout-tooltip.visible').forEach(t => {
          if (t !== tooltip) t.classList.remove('visible');
        });

        const rect = card.getBoundingClientRect();
        tooltip.classList.add('visible');

        const tooltipRect = tooltip.getBoundingClientRect();
        let left = rect.left + (rect.width / 2) - (tooltipRect.width / 2);
        let top = rect.bottom + 10;

        if (left < 10) left = 10;
        if (left + tooltipRect.width > window.innerWidth - 10) {
          left = window.innerWidth - tooltipRect.width - 10;
        }
        if (top + tooltipRect.height > window.innerHeight - 10) {
          top = rect.top - tooltipRect.height - 10;
          tooltip.classList.add('popout-above');
        } else {
          tooltip.classList.remove('popout-above');
        }
        if (top < 10) top = 10;

        tooltip.style.left = left + 'px';
        tooltip.style.top = top + 'px';
      }

      function hideTooltip() {
        hideTimeout = setTimeout(() => {
          tooltip.classList.remove('visible');
        }, 200);
      }

      card.addEventListener('mouseenter', showTooltip);
      card.addEventListener('mouseleave', hideTooltip);
      card.addEventListener('focus', showTooltip);
      card.addEventListener('blur', hideTooltip);

      tooltip.addEventListener('mouseenter', () => clearTimeout(hideTimeout));
      tooltip.addEventListener('mouseleave', hideTooltip);
    });

    Reveal.on('slidechanged', () => {
      document.querySelectorAll('.popout-tooltip.visible').forEach(t => {
        t.classList.remove('visible');
      });
    });
  }

  if (Reveal.isReady()) {
    setup();
  } else {
    Reveal.on('ready', setup);
  }
})();

// ============================================
// GLOBAL CLICK-TO-ENLARGE IMAGES
// ============================================

(function initImageEnlarge() {
  var overlay = document.createElement('div');
  overlay.id = 'img-enlarge-overlay';
  overlay.className = 'img-enlarge-overlay';
  overlay.innerHTML = '<img id="img-enlarge-target" class="img-enlarge-target">';
  document.body.appendChild(overlay);

  var enlargedImg = document.getElementById('img-enlarge-target');

  function openEnlarge(src, alt) {
    enlargedImg.src = src;
    enlargedImg.alt = alt || '';
    overlay.classList.add('visible');
  }
  window.openImageEnlarge = openEnlarge;

  function closeEnlarge() {
    overlay.classList.remove('visible');
    setTimeout(function () {
      if (!overlay.classList.contains('visible')) {
        enlargedImg.src = '';
      }
    }, 200);
  }

  document.addEventListener('click', function (e) {
    var img = e.target.closest('img');
    if (!img) return;
    if (img.closest('.reveal .controls') || img.closest('#img-enlarge-overlay')) return;
    if (!img.closest('.reveal .slides') && !img.closest('.popout-tooltip')) return;

    e.stopPropagation();
    openEnlarge(img.src || img.dataset.src, img.alt);
  });

  overlay.addEventListener('click', closeEnlarge);

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && overlay.classList.contains('visible')) {
      closeEnlarge();
    }
  });

  if (typeof Reveal !== 'undefined') {
    Reveal.on('slidechanged', closeEnlarge);
  }
})();

// ============================================
// CARD PARTICLE EFFECT
// ============================================

(function () {
  const canvas = document.createElement('canvas');
  canvas.id = 'card-particles';
  Object.assign(canvas.style, {
    position: 'fixed', top: '0', left: '0',
    width: '100%', height: '100%',
    pointerEvents: 'none', zIndex: '9990',
  });
  document.body.appendChild(canvas);

  const ctx = canvas.getContext('2d');
  let W, H;
  const particles = [];
  let activeRect = null;

  function resize() {
    W = canvas.width = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  function spawn(rect) {
    const edge = Math.random();
    let x, y, vx, vy;
    if (edge < 0.25) {
      x = rect.left + Math.random() * rect.width;
      y = rect.top;
      vx = (Math.random() - 0.5) * 0.8;
      vy = -(0.3 + Math.random() * 0.6);
    } else if (edge < 0.5) {
      x = rect.left + Math.random() * rect.width;
      y = rect.bottom;
      vx = (Math.random() - 0.5) * 0.8;
      vy = 0.3 + Math.random() * 0.6;
    } else if (edge < 0.75) {
      x = rect.left;
      y = rect.top + Math.random() * rect.height;
      vx = -(0.3 + Math.random() * 0.6);
      vy = (Math.random() - 0.5) * 0.8;
    } else {
      x = rect.right;
      y = rect.top + Math.random() * rect.height;
      vx = 0.3 + Math.random() * 0.6;
      vy = (Math.random() - 0.5) * 0.8;
    }
    particles.push({
      x, y, vx, vy,
      life: 1,
      decay: 0.004 + Math.random() * 0.008,
      size: 1 + Math.random() * 2,
    });
  }

  const SELECTORS = '.guide-card, .harness-card';

  document.addEventListener('mouseover', (e) => {
    const card = e.target.closest(SELECTORS);
    if (card) activeRect = card.getBoundingClientRect();
  });
  document.addEventListener('mouseout', (e) => {
    const card = e.target.closest(SELECTORS);
    if (card) activeRect = null;
  });

  function loop() {
    requestAnimationFrame(loop);
    ctx.clearRect(0, 0, W, H);

    if (activeRect) {
      for (let s = 0; s < 5; s++) spawn(activeRect);
    }

    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.life -= p.decay;
      if (p.life <= 0) {
        particles.splice(i, 1);
        continue;
      }
      ctx.globalAlpha = p.life * 0.6;
      ctx.fillStyle = '#fff';
      ctx.fillRect(p.x, p.y, p.size, p.size);
    }
    ctx.globalAlpha = 1;
  }
  loop();

  if (typeof Reveal !== 'undefined') {
    Reveal.on('slidechanged', () => {
      activeRect = null;
      particles.length = 0;
    });
  }
})();
