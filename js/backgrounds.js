/* ============================================
   Bridget Riley-Inspired p5.js Backgrounds
   Each section theme gets a unique op-art pattern
   drawn with p5.js in instance mode.
   ============================================ */

(function () {
  'use strict';

  const W = 1920;
  const H = 1080;

  // Opacity per theme — controls how visible the pattern is
  // Higher = more visible, lower = more subtle
  const THEME_OPACITY = {
    narrative: 0.14,
    pink:      0.10,
    blue:      0.13,
    purple:    0.09,
    green:     0.12,
    coral:     0.10,
    default:   0.12,
  };

  // Detect theme from slide element (walk up to parent section)
  function getTheme(slide) {
    let el = slide;
    while (el) {
      if (el.dataset && el.dataset.theme) return el.dataset.theme;
      el = el.parentElement;
      if (el && el.classList && el.classList.contains('slides')) break;
    }
    return 'default';
  }

  function isTitleSlide(slide) {
    return slide.classList.contains('slide-title');
  }

  let currentTheme = null;
  let currentIsTitle = false;

  // ============================================
  // PATTERN: Warped Checkerboard
  // Inspired by Riley's "Movement in Squares"
  // Column widths compress toward the center — center point drifts
  // ============================================
  function drawWarpedCheckerboard(p) {
    const rows = 18;
    const rowH = H / rows;
    const t = p.millis() * 0.0003;
    // Center of compression oscillates slowly
    const warpCenter = 0.5 + Math.sin(t) * 0.15;

    p.noStroke();

    for (let row = 0; row < rows; row++) {
      let x = 0;
      let col = 0;
      while (x < W) {
        const nx = x / W;
        const centerDist = Math.abs(nx - warpCenter) * 2;
        const minW = 8;
        const maxW = 90;
        const colW = minW + (maxW - minW) * Math.pow(Math.min(centerDist, 1), 1.8);

        if ((row + col) % 2 === 0) {
          p.fill(255);
          p.rect(x, row * rowH, colW + 1, rowH);
        }

        x += colW;
        col++;
      }
    }
  }

  // ============================================
  // PATTERN: Lens Stripes
  // Inspired by Riley's horizontal stripe + vesica piscis
  // Stripes phase-invert inside an elliptical lens
  // ============================================
  function drawLensStripes(p) {
    const stripeH = 28;
    const numStripes = Math.ceil(H / stripeH) + 1;
    const cx = W * 0.54;
    const cy = H / 2;
    const t = p.millis() * 0.0004;
    // Lens breathes — radius pulses gently
    const rx = W * (0.22 + Math.sin(t) * 0.04);
    const ry = H * (0.46 + Math.cos(t * 0.7) * 0.05);

    p.noStroke();

    for (let i = 0; i < numStripes; i++) {
      const y = i * stripeH;
      const isEvenStripe = i % 2 === 0;

      const dy = (y + stripeH / 2 - cy) / ry;
      const dySquared = dy * dy;

      if (dySquared < 1) {
        const xSpan = rx * Math.sqrt(1 - dySquared);
        const leftEdge = cx - xSpan;
        const rightEdge = cx + xSpan;

        if (isEvenStripe) {
          p.fill(255);
          p.rect(0, y, leftEdge, stripeH);
          p.rect(rightEdge, y, W - rightEdge, stripeH);
        } else {
          p.fill(255);
          p.rect(leftEdge, y, rightEdge - leftEdge, stripeH);
        }
      } else {
        if (isEvenStripe) {
          p.fill(255);
          p.rect(0, y, W, stripeH);
        }
      }
    }
  }

  // ============================================
  // PATTERN: Radial Vortex Checkerboard
  // Inspired by Riley's swirling tunnel piece
  // Polar-coordinate checkerboard with twist
  // ============================================
  function drawVortex(p) {
    const cx = W / 2;
    const cy = H / 2;
    const maxR = Math.sqrt(cx * cx + cy * cy);
    const numRings = 22;
    const numSegments = 28;
    const ringWidth = maxR / numRings;
    const t = p.millis() * 0.00015;
    // Twist slowly rotates over time
    const twist = 0.12 + Math.sin(t) * 0.06;
    const rotation = t * 0.5; // Slow global rotation

    p.noStroke();

    for (let ring = numRings - 1; ring >= 0; ring--) {
      const r1 = ring * ringWidth;
      const r2 = (ring + 1) * ringWidth;
      const segAngle = (Math.PI * 2) / numSegments;

      for (let seg = 0; seg < numSegments; seg++) {
        if ((ring + seg) % 2 !== 0) continue;

        const a1 = seg * segAngle + ring * twist + rotation;
        const a2 = a1 + segAngle;

        p.fill(255);
        p.beginShape();
        for (let a = a1; a <= a2; a += 0.05) {
          p.vertex(cx + Math.cos(a) * r2, cy + Math.sin(a) * r2);
        }
        for (let a = a2; a >= a1; a -= 0.05) {
          p.vertex(cx + Math.cos(a) * r1, cy + Math.sin(a) * r1);
        }
        p.endShape(p.CLOSE);
      }
    }
  }

  // ============================================
  // PATTERN: Curved Concentric Stripes
  // Inspired by Riley's "Fragment" — nested arcs
  // Concentric arcs forming a wave/arch shape
  // ============================================
  function drawCurvedStripes(p) {
    const t = p.millis() * 0.0003;
    // Arc centers drift slowly
    const cx = W / 2 + Math.sin(t * 0.8) * 40;
    const cy = H + 200 + Math.cos(t) * 30;
    const maxR = H * 1.6;
    const stripeW = 36;
    const numStripes = Math.ceil(maxR / stripeW);

    p.noFill();
    p.strokeCap(p.SQUARE);

    for (let i = 0; i < numStripes; i++) {
      if (i % 2 !== 0) continue;
      const r = i * stripeW + stripeW / 2;
      p.stroke(255);
      p.strokeWeight(stripeW - 2);
      p.arc(cx, cy, r * 2, r * 2, Math.PI + 0.3, Math.PI * 2 - 0.3);
    }

    const cx2 = W / 2 - 100 + Math.cos(t * 0.6) * 30;
    const cy2 = H + 350 + Math.sin(t * 0.9) * 25;
    for (let i = 0; i < numStripes; i++) {
      if (i % 2 !== 0) continue;
      const r = i * stripeW + stripeW / 2;
      p.stroke(255);
      p.strokeWeight(stripeW - 2);
      p.arc(cx2, cy2, r * 2, r * 2, Math.PI + 0.5, Math.PI * 2 - 0.5);
    }
  }

  // ============================================
  // PATTERN: Wavy Lines (Current)
  // Inspired by Riley's "Current" — dense undulating parallel lines
  // ============================================
  function drawWavyLines(p) {
    const numLines = 80;
    const spacing = H / numLines;
    const amplitude = 12;
    const freq = 0.008;
    const t = p.millis() * 0.0008; // Waves flow over time

    p.noFill();
    p.stroke(255);
    p.strokeWeight(2.5);

    for (let i = 0; i < numLines; i++) {
      const yBase = i * spacing + spacing / 2;
      const phase = i * 0.35 + t;
      const amp = amplitude + Math.sin(i * 0.15 + t * 0.3) * 6;
      const localFreq = freq + Math.sin(i * 0.08) * 0.002;

      p.beginShape();
      for (let x = 0; x <= W; x += 4) {
        const y = yBase + amp * Math.sin(x * localFreq + phase)
                        + (amp * 0.5) * Math.sin(x * localFreq * 2.3 + phase * 1.7);
        p.vertex(x, y);
      }
      p.endShape();
    }
  }

  // ============================================
  // PATTERN: Dense Wavy Lines Variant
  // For coral theme — tighter, more agitated waves
  // ============================================
  function drawWavyLinesDense(p) {
    const numLines = 110;
    const spacing = H / numLines;
    const amplitude = 8;
    const freq = 0.012;
    const t = p.millis() * 0.001; // Slightly faster agitation

    p.noFill();
    p.stroke(255);
    p.strokeWeight(1.8);

    for (let i = 0; i < numLines; i++) {
      const yBase = i * spacing + spacing / 2;
      const phase = i * 0.45 + t;
      const amp = amplitude + Math.sin(i * 0.2 + t * 0.4) * 4;

      p.beginShape();
      for (let x = 0; x <= W; x += 3) {
        const y = yBase + amp * Math.sin(x * freq + phase)
                        + (amp * 0.3) * Math.sin(x * freq * 3.1 + phase * 2.1);
        p.vertex(x, y);
      }
      p.endShape();
    }
  }

  // ============================================
  // PATTERN: Concentric Rings
  // For closing/default — clean concentric circles
  // ============================================
  function drawConcentricRings(p) {
    const cx = W / 2;
    const cy = H / 2;
    const maxR = Math.max(W, H) * 0.6;
    const ringW = 24;
    const numRings = Math.ceil(maxR / ringW);
    const t = p.millis() * 0.0005;

    p.noFill();
    p.stroke(255);

    for (let i = 0; i < numRings; i++) {
      if (i % 2 !== 0) continue;
      // Rings pulse outward like a ripple
      const pulse = Math.sin(t - i * 0.3) * 6;
      const r = i * ringW + ringW / 2 + pulse;
      p.strokeWeight(ringW - 4);
      p.ellipse(cx, cy, r * 2, r * 2);
    }
  }

  // ============================================
  // PATTERN: Title — Concentric Arcs + Movement in Squares hybrid
  // Special pattern for the opening slide
  // ============================================
  function drawTitlePattern(p) {
    const cx = W * 0.5;
    const cy = H * 0.5;
    const maxR = W * 0.55;
    const ringW = 30;
    const t = p.millis() * 0.0004;

    p.noFill();
    p.stroke(255);
    p.strokeCap(p.SQUARE);

    for (let i = 0; i < maxR / ringW; i++) {
      if (i % 2 !== 0) continue;
      // Rings expand and contract like a heartbeat
      const pulse = Math.sin(t - i * 0.25) * 8;
      const r = i * ringW + pulse;
      p.strokeWeight(ringW - 4);
      p.ellipse(cx, cy, r * 2, r * 2);
    }
  }

  // ============================================
  // MAIN DRAW DISPATCHER
  // ============================================
  function drawPattern(p, theme, isTitle) {
    p.clear();

    if (isTitle) {
      drawTitlePattern(p);
      return;
    }

    switch (theme) {
      case 'narrative': drawWavyLines(p);           break;
      case 'pink':      drawWarpedCheckerboard(p);  break;
      case 'blue':      drawLensStripes(p);         break;
      case 'purple':    drawVortex(p);              break;
      case 'green':     drawCurvedStripes(p);       break;
      case 'coral':     drawWavyLinesDense(p);      break;
      default:          drawConcentricRings(p);     break;
    }
  }

  // ============================================
  // INITIALIZATION
  // ============================================
  let animating = false;
  let sketchRef = null; // Reference to the p5 instance

  function createToggleButton() {
    const btn = document.createElement('button');
    btn.id = 'bg-anim-toggle';
    btn.setAttribute('aria-label', 'Toggle background animation');
    btn.innerHTML = '&#9654;'; // ▶ play icon (starts paused)
    Object.assign(btn.style, {
      position: 'fixed',
      top: '16px',
      left: '16px',
      zIndex: '9999',
      width: '36px',
      height: '36px',
      background: 'rgba(255,255,255,0.03)',
      border: '1px solid rgba(255,255,255,0.25)',
      borderRadius: '6px',
      color: '#fff',
      fontSize: '14px',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      transition: 'background 0.2s, border-color 0.2s',
      backdropFilter: 'blur(4px)',
      padding: '0',
      lineHeight: '1',
    });

    btn.addEventListener('mouseenter', () => {
      btn.style.background = 'rgba(255,255,255,0.18)';
      btn.style.borderColor = 'rgba(255,255,255,0.5)';
    });
    btn.addEventListener('mouseleave', () => {
      btn.style.background = animating ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.03)';
      btn.style.borderColor = 'rgba(255,255,255,0.25)';
    });

    btn.addEventListener('click', () => {
      animating = !animating;
      if (sketchRef) {
        if (animating) {
          sketchRef.loop();
          btn.innerHTML = '&#9724;'; // ◼ pause
          btn.style.background = 'rgba(255,255,255,0.08)';
        } else {
          sketchRef.noLoop();
          btn.innerHTML = '&#9654;'; // ▶ play
          btn.style.background = 'rgba(255,255,255,0.03)';
        }
      }
    });

    document.body.appendChild(btn);
    return btn;
  }

  function init() {
    const container = document.getElementById('riley-bg');
    if (!container) return;

    createToggleButton();

    new p5((p) => {
      sketchRef = p;

      p.setup = () => {
        const canvas = p.createCanvas(W, H);
        canvas.parent(container);
        p.pixelDensity(1);
        p.frameRate(30); // Smooth but performance-friendly
        p.noLoop(); // Start paused — user activates via play button
      };

      p.draw = () => {
        drawPattern(p, currentTheme, currentIsTitle);
      };

      // Exposed updater for Reveal.js integration
      function updateBackground(slide) {
        const theme = getTheme(slide);
        const isTitle = isTitleSlide(slide);

        if (theme === currentTheme && isTitle === currentIsTitle) return;

        currentTheme = theme;
        currentIsTitle = isTitle;

        // Set opacity based on theme
        const opacity = THEME_OPACITY[theme] || 0.12;
        container.style.opacity = opacity;

        // Smooth transition
        container.style.transition = 'opacity 0.6s ease';

        // If paused, redraw once for the new pattern
        if (!animating) p.redraw();
      }

      // Listen for Reveal slide changes
      Reveal.on('slidechanged', (event) => {
        updateBackground(event.currentSlide);
      });

      // Initial draw for the first slide
      const currentSlide = Reveal.getCurrentSlide();
      if (currentSlide) {
        updateBackground(currentSlide);
      }
    });
  }

  // Wait for Reveal.js to be ready — handles all timing scenarios
  function waitForReveal() {
    if (typeof Reveal === 'undefined') {
      // Reveal.js not yet loaded, retry
      setTimeout(waitForReveal, 100);
      return;
    }
    if (Reveal.isReady()) {
      init();
    } else {
      Reveal.on('ready', init);
    }
  }

  // Start checking after DOM is parsed
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', waitForReveal);
  } else {
    waitForReveal();
  }

})();
