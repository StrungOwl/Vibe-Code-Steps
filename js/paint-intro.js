/* ============================================
   Paint Drop Animation — Op Art B&W
   Reusable: triggers on load, layer transitions,
   and spacebar press.
   ============================================ */

(function () {
  'use strict';

  const DROP_COUNT = 14;
  const ANIMATION_DURATION = 3400;
  const FADE_DURATION = 900;
  const PATTERNS = ['stripes-h', 'stripes-v', 'stripes-diag', 'checker', 'concentric', 'solid'];

  // ============================================
  // OP-ART PATTERN TILES (built once)
  // ============================================

  const patternCanvases = {};

  function makePatternTile(size, colorFn) {
    const c = document.createElement('canvas');
    c.width = size;
    c.height = size;
    const cx = c.getContext('2d');
    const imgData = cx.createImageData(size, size);
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const v = colorFn(size, x, y) ? 255 : 0;
        const idx = (y * size + x) * 4;
        imgData.data[idx] = v;
        imgData.data[idx + 1] = v;
        imgData.data[idx + 2] = v;
        imgData.data[idx + 3] = 255;
      }
    }
    cx.putImageData(imgData, 0, 0);
    return c;
  }

  function buildPatterns() {
    const s = 24;
    patternCanvases['stripes-h'] = makePatternTile(s, (c, x, y) => Math.floor(y / 4) % 2 === 0);
    patternCanvases['stripes-v'] = makePatternTile(s, (c, x, y) => Math.floor(x / 4) % 2 === 0);
    patternCanvases['stripes-diag'] = makePatternTile(s, (c, x, y) => Math.floor((x + y) / 6) % 2 === 0);
    patternCanvases['checker'] = makePatternTile(s, (c, x, y) => (Math.floor(x / 6) + Math.floor(y / 6)) % 2 === 0);
    patternCanvases['concentric'] = makePatternTile(s * 2, (c, x, y) => {
      const d = Math.sqrt((x - c / 2) ** 2 + (y - c / 2) ** 2);
      return Math.floor(d / 4) % 2 === 0;
    });
  }

  buildPatterns();

  // ============================================
  // SEED GENERATOR — fresh random seeds per play
  // ============================================

  function generateSeeds() {
    const seeds = [];
    for (let i = 0; i < DROP_COUNT; i++) {
      const numPoints = 10 + Math.floor(Math.random() * 6);
      const wobbles = [];
      for (let j = 0; j <= numPoints; j++) wobbles.push(0.65 + Math.random() * 0.7);

      const subs = [];
      const subCount = 4 + Math.floor(Math.random() * 7);
      for (let j = 0; j < subCount; j++) {
        subs.push({
          angle: Math.random() * Math.PI * 2,
          dist: 0.5 + Math.random() * 1.3,
          r: 3 + Math.random() * 12,
        });
      }

      const drips = [];
      const dripCount = 2 + Math.floor(Math.random() * 3);
      for (let j = 0; j < dripCount; j++) {
        drips.push({
          offsetX: (Math.random() - 0.5) * 1.2,
          width: 2 + Math.random() * 5,
          speed: 0.3 + Math.random() * 0.5,
          maxLength: 40 + Math.random() * 140,
          delay: Math.random() * 300,
        });
      }

      seeds.push({
        wobbles, numPoints, subs, drips,
        pattern: PATTERNS[Math.floor(Math.random() * PATTERNS.length)],
        xPct: Math.random(),
        targetYPct: 0.15 + Math.random() * 0.65,
        radius: 30 + Math.random() * 60,
        gravity: 0.35 + Math.random() * 0.35,
        startY: -50 - Math.random() * 200,
      });
    }
    return seeds;
  }

  // ============================================
  // PAINT DROP CLASS
  // ============================================

  class PaintDrop {
    constructor(delay, seed, canvas) {
      this.delay = delay;
      this.seed = seed;
      this.canvas = canvas;
      this.started = false;
      this.x = seed.xPct * canvas.width;
      this.y = seed.startY;
      this.targetY = seed.targetYPct * canvas.height;
      this.radius = seed.radius;
      this.vy = 0;
      this.gravity = seed.gravity;
      this.splattered = false;
      this.splatTime = 0;
      this.splatScale = 0;
      this.dripStates = seed.drips.map(() => ({ y: 0, length: 0, speed: 0 }));
    }

    update(elapsed) {
      if (elapsed < this.delay) return;
      if (!this.started) {
        this.started = true;
        this.x = this.seed.xPct * this.canvas.width;
        this.targetY = this.seed.targetYPct * this.canvas.height;
      }

      if (!this.splattered) {
        this.vy += this.gravity;
        this.y += this.vy;
        if (this.y >= this.targetY) {
          this.y = this.targetY;
          this.splattered = true;
          this.splatTime = elapsed;
          for (let i = 0; i < this.seed.drips.length; i++) {
            this.dripStates[i].y = this.y + this.radius * 0.3;
            this.dripStates[i].speed = this.seed.drips[i].speed;
          }
        }
      } else {
        const splatElapsed = elapsed - this.splatTime;
        const t = Math.min(splatElapsed / 350, 1);
        this.splatScale = 1 - Math.pow(1 - t, 3) * Math.cos(t * Math.PI * 0.5);

        for (let i = 0; i < this.seed.drips.length; i++) {
          const drip = this.seed.drips[i];
          const state = this.dripStates[i];
          if (splatElapsed > drip.delay) {
            state.y += state.speed;
            state.speed += 0.04;
            state.length = Math.min(state.length + state.speed * 0.7, drip.maxLength);
          }
        }
      }
    }

    draw(ctx) {
      if (!this.started) return;
      ctx.save();

      if (!this.splattered) {
        ctx.fillStyle = '#FFF';
        ctx.beginPath();
        ctx.ellipse(this.x, this.y, this.radius * 0.25, this.radius * 0.45, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.globalAlpha = 0.3;
        ctx.beginPath();
        ctx.moveTo(this.x - this.radius * 0.12, this.y);
        ctx.lineTo(this.x, this.y - Math.min(this.vy * 3, 120));
        ctx.lineTo(this.x + this.radius * 0.12, this.y);
        ctx.fill();
      } else {
        const s = this.splatScale;
        const r = this.radius * s;
        const { wobbles, numPoints, subs, pattern } = this.seed;

        ctx.beginPath();
        for (let i = 0; i <= numPoints; i++) {
          const angle = (i / numPoints) * Math.PI * 2;
          const px = this.x + Math.cos(angle) * r * wobbles[i];
          const py = this.y + Math.sin(angle) * r * wobbles[i] * 0.6;
          if (i === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.closePath();

        if (pattern === 'solid') {
          ctx.fillStyle = '#FFF';
        } else {
          const tile = patternCanvases[pattern];
          ctx.fillStyle = tile ? ctx.createPattern(tile, 'repeat') : '#FFF';
        }
        ctx.fill();

        ctx.strokeStyle = '#FFF';
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.fillStyle = '#FFF';
        for (const sub of subs) {
          const sx = this.x + Math.cos(sub.angle) * sub.dist * this.radius * s;
          const sy = this.y + Math.sin(sub.angle) * sub.dist * this.radius * s * 0.6;
          ctx.beginPath();
          ctx.arc(sx, sy, sub.r * s, 0, Math.PI * 2);
          ctx.fill();
        }

        for (let i = 0; i < this.seed.drips.length; i++) {
          const drip = this.seed.drips[i];
          const state = this.dripStates[i];
          if (state.length > 0) {
            const dx = this.x + drip.offsetX * this.radius;
            ctx.fillStyle = '#FFF';
            ctx.beginPath();
            ctx.moveTo(dx - drip.width / 2, state.y);
            ctx.lineTo(dx + drip.width / 2, state.y);
            ctx.lineTo(dx + drip.width * 0.25, state.y + state.length);
            ctx.lineTo(dx - drip.width * 0.25, state.y + state.length);
            ctx.closePath();
            ctx.fill();
            ctx.beginPath();
            ctx.arc(dx, state.y + state.length, drip.width * 0.35, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      }

      ctx.restore();
    }
  }

  // ============================================
  // PLAY ANIMATION — creates overlay, runs, cleans up
  // ============================================

  let activeAnimation = null;

  function playPaintDrops() {
    // If already playing, skip
    if (activeAnimation) return;

    const overlay = document.createElement('div');
    overlay.id = 'paint-intro-overlay';
    overlay.style.cssText =
      'position:fixed;top:0;left:0;width:100vw;height:100vh;z-index:9999;' +
      'background:transparent;pointer-events:none;transition:opacity ' + FADE_DURATION + 'ms ease;';
    document.body.appendChild(overlay);

    const cvs = document.createElement('canvas');
    const cx = cvs.getContext('2d');
    cvs.width = window.innerWidth;
    cvs.height = window.innerHeight;
    cvs.style.cssText = 'width:100%;height:100%;display:block;';
    overlay.appendChild(cvs);

    function onResize() {
      cvs.width = window.innerWidth;
      cvs.height = window.innerHeight;
    }
    window.addEventListener('resize', onResize);

    // Fresh seeds each time for variety
    const seeds = generateSeeds();
    const drops = [];
    for (let i = 0; i < DROP_COUNT; i++) {
      const delay = i * (ANIMATION_DURATION * 0.5 / DROP_COUNT) + Math.random() * 200;
      drops.push(new PaintDrop(delay, seeds[i], cvs));
    }

    let startTime = null;
    let done = false;
    activeAnimation = true;

    function animate(timestamp) {
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime;

      cx.clearRect(0, 0, cvs.width, cvs.height);

      for (const drop of drops) {
        drop.update(elapsed);
        drop.draw(cx);
      }

      if (elapsed >= ANIMATION_DURATION && !done) {
        done = true;
        overlay.style.opacity = '0';
        setTimeout(() => {
          overlay.remove();
          window.removeEventListener('resize', onResize);
          activeAnimation = null;
        }, FADE_DURATION + 100);
      }

      if (!done || overlay.parentNode) {
        requestAnimationFrame(animate);
      }
    }

    requestAnimationFrame(animate);
  }

  // ============================================
  // TRIGGER: On initial load
  // ============================================

  playPaintDrops();

  // ============================================
  // TRIGGER: On layer / section-header slides
  // ============================================

  function waitForReveal() {
    if (typeof Reveal === 'undefined') {
      setTimeout(waitForReveal, 100);
      return;
    }

    function onReady() {
      Reveal.on('slidechanged', (event) => {
        const slide = event.currentSlide;
        // Trigger on section-header slides (Layer transitions)
        if (slide && slide.classList.contains('section-header')) {
          playPaintDrops();
        }
      });
    }

    if (Reveal.isReady && Reveal.isReady()) {
      onReady();
    } else {
      Reveal.on('ready', onReady);
    }
  }

  waitForReveal();

  // ============================================
  // TRIGGER: Spacebar press
  // ============================================

  document.addEventListener('keydown', (e) => {
    if (e.code === 'Space') {
      playPaintDrops();
    }
  });

})();
