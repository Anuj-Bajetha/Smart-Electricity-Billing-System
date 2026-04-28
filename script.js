'use strict';
const LOADER_MESSAGES = [
  'Connecting to power grid...',
  'Authenticating consumer database...',
  'Loading billing algorithms...',
  'Syncing tariff slabs...',
  'Initializing invoice engine...',
  'Calibrating energy meters...',
  'Securing data channels...',
  'Powering up the portal...',
  'Almost there — charging capacitors...',
  'System ready. Welcome to UPCL ⚡'
];

const FIXED_CHARGE = 50;
const GST_RATE     = 0.18;

let mouseX = window.innerWidth  / 2;
let mouseY = window.innerHeight / 2;
let cursorX = mouseX;
let cursorY = mouseY;
let glowX   = mouseX;
let glowY   = mouseY;

/* ─────────────────────────────────────────
   2. DOM READY
───────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  initCursor();
  initLoader();
  initParticles();
  initNavScroll();
  initRevealOnScroll();
  initStatCounters();
  initFormInteractions();
  initLiveGridOps();
  setFooterYear();
});

/* ─────────────────────────────────────────
   3. CUSTOM CURSOR
───────────────────────────────────────── */
function initCursor() {
  const dot  = document.getElementById('cursor-dot');
  const glow = document.getElementById('cursor-glow');
  if (!dot || !glow) return;

  document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
  }, { passive: true });

  function animateCursor() {
    cursorX += (mouseX - cursorX) * 0.18;
    cursorY += (mouseY - cursorY) * 0.18;
    dot.style.transform = `translate(${cursorX - 5}px, ${cursorY - 5}px)`;

    glowX += (mouseX - glowX) * 0.06;
    glowY += (mouseY - glowY) * 0.06;
    glow.style.transform = `translate(${glowX - 200}px, ${glowY - 200}px)`;

    requestAnimationFrame(animateCursor);
  }
  animateCursor();

  const hoverTargets = 'a, button, input, select, [data-index], .gal-item, .stat-card, .service-card, .fc-card';
  document.addEventListener('mouseover',  (e) => { if (e.target.closest(hoverTargets)) dot.classList.add('hovered'); }, { passive: true });
  document.addEventListener('mouseout',   (e) => { if (e.target.closest(hoverTargets)) dot.classList.remove('hovered'); }, { passive: true });
  document.addEventListener('mouseleave', () => { dot.style.opacity = '0'; glow.style.opacity = '0'; }, { passive: true });
  document.addEventListener('mouseenter', () => { dot.style.opacity = '1'; glow.style.opacity = '1'; }, { passive: true });
}

/* ─────────────────────────────────────────
   4. LOADER
───────────────────────────────────────── */
function initLoader() {
  const screen  = document.getElementById('loader-screen');
  const fill    = document.getElementById('power-bar-fill');
  const pct     = document.getElementById('loader-pct');
  const status  = document.getElementById('loader-status');
  const canvas  = document.getElementById('loader-canvas');
  const app     = document.getElementById('main-app');
  if (!screen || !app) return;

  initLoaderCanvas(canvas);

  let msgIdx   = 0;
  let msgTimer = null;
  document.body.classList.add('loader-active');

  function updateMessage() {
    if (msgIdx < LOADER_MESSAGES.length) {
      status.style.opacity = '0';
      setTimeout(() => {
        status.textContent   = LOADER_MESSAGES[msgIdx++];
        status.style.opacity = '1';
      }, 200);
    }
  }
  updateMessage();
  msgTimer = setInterval(updateMessage, 600);

  const duration  = 3000;
  const startTime = performance.now();

  function animateProgress(now) {
    const elapsed = now - startTime;
    const raw     = Math.min(elapsed / duration, 1);
    const progress = 1 - Math.pow(1 - raw, 3);
    const pctVal  = Math.round(progress * 100);
    fill.style.width    = pctVal + '%';
    pct.textContent     = pctVal + '%';

    if (raw < 1) {
      requestAnimationFrame(animateProgress);
    } else {
      clearInterval(msgTimer);
      status.textContent = LOADER_MESSAGES[LOADER_MESSAGES.length - 1];
      setTimeout(() => {
        screen.classList.add('fade-out');
        app.classList.remove('hidden-app');
        app.classList.add('visible-app');
        document.body.classList.remove('loader-active');
        setTimeout(() => {
          document.querySelectorAll('.reveal-section').forEach(s => checkReveal(s));
        }, 400);
      }, 400);
    }
  }
  requestAnimationFrame(animateProgress);
}

/* ─────────────────────────────────────────
   5. LOADER CANVAS — LIGHTNING GRID
───────────────────────────────────────── */
function initLoaderCanvas(canvas) {
  if (!canvas) return;
  const ctx  = canvas.getContext('2d');
  let W, H;

  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize, { passive: true });

  const COLS = 20, ROWS = 12;
  const nodes  = [];
  const sparks = [];

  function buildGrid() {
    nodes.length = 0;
    const cw = W / COLS;
    const rh = H / ROWS;
    for (let r = 0; r <= ROWS; r++) {
      for (let c = 0; c <= COLS; c++) {
        nodes.push({
          x:  c * cw + (Math.random() - 0.5) * cw * 0.3,
          y:  r * rh + (Math.random() - 0.5) * rh * 0.3,
          ox: c * cw,
          oy: r * rh,
          vx: (Math.random() - 0.5) * 0.4,
          vy: (Math.random() - 0.5) * 0.4
        });
      }
    }
  }
  buildGrid();

  function spawnSpark() {
    const a = nodes[Math.floor(Math.random() * nodes.length)];
    const b = nodes[Math.floor(Math.random() * nodes.length)];
    sparks.push({ a, b, life: 1, maxLife: 0.6 + Math.random() * 0.6, color: Math.random() > 0.5 ? '#FFD700' : '#00BFFF' });
  }

  let sparkTimer = 0;

  function drawFrame() {
    ctx.clearRect(0, 0, W, H);
    nodes.forEach(n => {
      n.x += n.vx;
      n.y += n.vy;
      n.vx += (n.ox - n.x) * 0.001;
      n.vy += (n.oy - n.y) * 0.001;
      n.vx *= 0.99; n.vy *= 0.99;
    });

    const cw = W / COLS;
    const rh = H / ROWS;
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        const idx = r * (COLS + 1) + c;
        const n   = nodes[idx];
        const nr  = nodes[idx + 1];
        const nd  = nodes[idx + (COLS + 1)];
        if (!n || !nr || !nd) continue;
        ctx.beginPath(); ctx.moveTo(n.x, n.y); ctx.lineTo(nr.x, nr.y);
        ctx.strokeStyle = 'rgba(255,180,0,0.07)'; ctx.lineWidth = 0.5; ctx.stroke();
        ctx.beginPath(); ctx.moveTo(n.x, n.y); ctx.lineTo(nd.x, nd.y);
        ctx.strokeStyle = 'rgba(0,150,255,0.05)'; ctx.lineWidth = 0.5; ctx.stroke();
      }
    }

    nodes.forEach(n => {
      ctx.beginPath();
      ctx.arc(n.x, n.y, 1.5, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255,200,0,0.15)';
      ctx.fill();
    });

    sparkTimer++;
    if (sparkTimer % 8 === 0) spawnSpark();

    for (let i = sparks.length - 1; i >= 0; i--) {
      const s = sparks[i];
      s.life -= 0.02;
      if (s.life <= 0) { sparks.splice(i, 1); continue; }

      const alpha = Math.pow(s.life / s.maxLife, 0.5) * 0.9;
      ctx.beginPath();
      ctx.moveTo(s.a.x, s.a.y);
      const steps = 5;
      const dx = s.b.x - s.a.x;
      const dy = s.b.y - s.a.y;
      for (let k = 1; k < steps; k++) {
        const t = k / steps;
        ctx.lineTo(s.a.x + dx * t + (Math.random() - 0.5) * 30, s.a.y + dy * t + (Math.random() - 0.5) * 30);
      }
      ctx.lineTo(s.b.x, s.b.y);
      ctx.strokeStyle = s.color.replace(')', `,${alpha})`).replace('rgb', 'rgba');
      ctx.lineWidth   = 1 + Math.random() * 1.5;
      ctx.shadowColor = s.color;
      ctx.shadowBlur  = 12;
      ctx.stroke();
      ctx.shadowBlur  = 0;
    }
    requestAnimationFrame(drawFrame);
  }
  requestAnimationFrame(drawFrame);
}

/* ─────────────────────────────────────────
   6. MAIN PARTICLES CANVAS
───────────────────────────────────────── */
function initParticles() {
  const canvas = document.getElementById('particle-canvas');
  if (!canvas) return;
  const ctx    = canvas.getContext('2d');
  let W, H, particles = [];

  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', () => { resize(); buildParticles(); }, { passive: true });

  function buildParticles() {
    const count = Math.min(Math.floor(W * H / 14000), 70);
    particles   = Array.from({ length: count }, createParticle);
  }

  function createParticle() {
    const isBolt = Math.random() < 0.08;
    return {
      x:     Math.random() * W,
      y:     Math.random() * H,
      vx:    (Math.random() - 0.5) * 0.4,
      vy:    (Math.random() - 0.5) * 0.4,
      size:  isBolt ? 3 : 1 + Math.random() * 1.8,
      alpha: 0.1 + Math.random() * 0.4,
      color: isBolt ? '#FFD700' : (Math.random() > 0.5 ? '#FFD700' : '#00BFFF'),
      isBolt,
      pulse:  Math.random() * Math.PI * 2,
      pulseS: 0.01 + Math.random() * 0.03
    };
  }

  const connectDist = 130;

  function draw() {
    ctx.clearRect(0, 0, W, H);
    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];
      p.x += p.vx; p.y += p.vy;
      p.pulse += p.pulseS;

      if (p.x < -10) p.x = W + 10;
      if (p.x > W + 10) p.x = -10;
      if (p.y < -10) p.y = H + 10;
      if (p.y > H + 10) p.y = -10;

      const mdx = mouseX - p.x;
      const mdy = mouseY - p.y;
      const mdist2 = mdx * mdx + mdy * mdy;
      if (mdist2 < 40000) {
        const mdist = Math.sqrt(mdist2);
        const force = (200 - mdist) / 200 * 0.015;
        p.vx += mdx / mdist * force;
        p.vy += mdy / mdist * force;
      }

      const speed2 = p.vx * p.vx + p.vy * p.vy;
      if (speed2 > 1.44) { p.vx *= 0.97; p.vy *= 0.97; }

      const a = p.alpha * (0.6 + 0.4 * Math.sin(p.pulse));
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fillStyle = hexToRgba(p.color, a);
      if (p.isBolt) { ctx.fillStyle = p.color; }
      ctx.fill();

      for (let j = i + 1; j < particles.length; j++) {
        const q  = particles[j];
        const dx = p.x - q.x;
        const dy = p.y - q.y;
        const d2 = dx * dx + dy * dy;
        if (d2 < connectDist * connectDist) {
          const d = Math.sqrt(d2);
          const lineAlpha = (1 - d / connectDist) * 0.1;
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(q.x, q.y);
          ctx.strokeStyle = hexToRgba('#FFD700', lineAlpha);
          ctx.lineWidth   = 0.5;
          ctx.stroke();
        }
      }
    }
    requestAnimationFrame(draw);
  }

  buildParticles();
  draw();
}

function hexToRgba(hex, alpha) {
  const r = parseInt(hex.slice(1,3), 16);
  const g = parseInt(hex.slice(3,5), 16);
  const b = parseInt(hex.slice(5,7), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

/* ─────────────────────────────────────────
   7. NAVBAR SCROLL BEHAVIOR
───────────────────────────────────────── */
function initNavScroll() {
  const navbar = document.getElementById('navbar');
  if (!navbar) return;
  const links    = navbar.querySelectorAll('.nav-link');
  const sections = ['hero-section','about-section','services-section','stats-section','billing-section'];

  function onScroll() {
    navbar.classList.toggle('scrolled', window.scrollY > 30);
    let current = 'hero-section';
    sections.forEach(id => {
      const el = document.getElementById(id);
      if (el && window.scrollY >= el.offsetTop - 120) current = id;
    });
    links.forEach(link => {
      link.classList.toggle('active', link.getAttribute('href') === '#' + current);
    });
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
}

/* ─────────────────────────────────────────
   8. SMOOTH NAV SCROLL
───────────────────────────────────────── */
function smoothNav(e, id) {
  if (e) e.preventDefault();
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: 'smooth' });
}

function scrollToBilling() {
  const el = document.getElementById('billing-section');
  if (el) el.scrollIntoView({ behavior: 'smooth' });
}

function toggleNav() {
  const ham  = document.getElementById('hamburger');
  const menu = document.getElementById('mobile-menu');
  if (!ham || !menu) return;
  ham.classList.toggle('open');
  menu.classList.toggle('open');
}

/* ─────────────────────────────────────────
   9. REVEAL ON SCROLL
───────────────────────────────────────── */
function initRevealOnScroll() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        entry.target.querySelectorAll('[data-index]').forEach(child => {
          const idx = parseInt(child.getAttribute('data-index')) || 0;
          child.style.transitionDelay = (idx * 0.1) + 's';
        });
      }
    });
  }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });

  document.querySelectorAll('.reveal-section').forEach(s => observer.observe(s));
}

function checkReveal(section) {
  const rect = section.getBoundingClientRect();
  if (rect.top < window.innerHeight - 60) section.classList.add('revealed');
}

/* ─────────────────────────────────────────
   10. STAT COUNTER ANIMATION
───────────────────────────────────────── */
function initStatCounters() {
  const cards = document.querySelectorAll('.stat-card');
  if (!cards.length) return;
  cards.forEach(card => {
    const target = card.getAttribute('data-target');
    const suffix = card.getAttribute('data-suffix') || '';
    const label  = card.getAttribute('data-label')  || '';
    const icon   = card.getAttribute('data-icon')   || '⚡';
    card.innerHTML = `
      <div class="stat-icon">${icon}</div>
      <span class="stat-number" data-target="${target}" data-suffix="${suffix}">0${suffix}</span>
      <span class="stat-label">${label}</span>
    `;
  });

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateStat(entry.target);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.4 });
  cards.forEach(c => observer.observe(c));
}

function animateStat(card) {
  const numEl  = card.querySelector('.stat-number');
  if (!numEl) return;
  const target = parseInt(numEl.getAttribute('data-target'));
  const suffix = numEl.getAttribute('data-suffix') || '';
  const dur    = 2200;
  const start  = performance.now();

  function update(now) {
    const t   = Math.min((now - start) / dur, 1);
    const val = Math.floor(easeOutExpo(t) * target);
    numEl.textContent = formatNumber(val) + suffix;
    if (t < 1) requestAnimationFrame(update);
    else numEl.textContent = formatNumber(target) + suffix;
  }
  requestAnimationFrame(update);
}

function easeOutExpo(t) {
  return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
}

function formatNumber(n) {
  if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M';
  if (n >= 1000)    return n.toLocaleString('en-IN');
  return n.toString();
}

/* ─────────────────────────────────────────
   11. FORM INTERACTIONS
───────────────────────────────────────── */
function initFormInteractions() {
  const monthInput = document.getElementById('inp-month');
  if (monthInput) {
    const now = new Date();
    monthInput.value = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  }
  document.querySelectorAll('.input-wrap input').forEach(input => {
    const glow = input.nextElementSibling;
    const icon = input.previousElementSibling;
    input.addEventListener('focus', () => {
      if (glow) glow.style.width = '80%';
      if (icon) icon.style.stroke = 'rgba(255,180,0,0.7)';
    });
    input.addEventListener('blur', () => {
      if (glow) glow.style.width = '0';
      if (icon) icon.style.stroke = '';
    });
  });
}

/* ─────────────────────────────────────────
   12. LIVE CALC PREVIEW
───────────────────────────────────────── */
function previewCalc() {
  const units = parseFloat(document.getElementById('inp-units').value);
  const state = document.getElementById('inp-state').value;
  if (isNaN(units) || units < 0 || !state) {
    ['prev-energy','prev-gst','prev-total'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.textContent = '₹ —';
    });
    return;
  }
  const { energy, gst, total, s1, s2, s3 } = calcBill(units, state);
  const setEl = (id, val) => {
    const el = document.getElementById(id);
    if (el) {
      el.textContent = `₹ ${val.toFixed(2)}`;
      el.style.color = '';
      setTimeout(() => el.style.color = 'var(--gold-300)', 10);
    }
  };
  setEl('prev-energy', energy);
  setEl('prev-gst',    gst);
  setEl('prev-total',  total);

  // Update dynamic tariff slab text
  const tr1 = document.getElementById('t-rate-1');
  const tr2 = document.getElementById('t-rate-2');
  const tr3 = document.getElementById('t-rate-3');
  if (tr1) tr1.textContent = `₹ ${s1.toFixed(2)}/unit`;
  if (tr2) tr2.textContent = `₹ ${s2.toFixed(2)}/unit`;
  if (tr3) tr3.textContent = `₹ ${s3.toFixed(2)}/unit`;
  const totalRow = document.querySelector('.cp-row.total-row');
  if (totalRow) {
    totalRow.style.transform = 'scale(1.02)';
    setTimeout(() => { totalRow.style.transform = ''; }, 150);
  }
}

function calcBill(units, state) {
  // Define base multiplier mapping using pseudo-rates for States
  // In a real prod environment, this would hit another API for exact live slabs
  let baseMultiplier = 1.0;
  if (state.includes('Maharashtra') || state.includes('Karnataka')) baseMultiplier = 1.4;
  else if (state.includes('Delhi') || state.includes('Punjab')) baseMultiplier = 0.8;
  else if (state.includes('Gujarat') || state.includes('Haryana')) baseMultiplier = 1.2;
  else if (state.includes('Uttar Pradesh') || state.includes('Uttarakhand')) baseMultiplier = 1.0;
  else baseMultiplier = 1.1; // average national proxy

  let energy = 0;
  let s1 = 4 * baseMultiplier;
  let s2 = 6 * baseMultiplier;
  let s3 = 8 * baseMultiplier;

  if (units <= 100)       energy = units * s1;
  else if (units <= 200)  energy = (100 * s1) + ((units - 100) * s2);
  else                    energy = (100 * s1) + (100 * s2) + ((units - 200) * s3);
  
  const gst   = energy * GST_RATE;
  const total = energy + gst + FIXED_CHARGE;
  return { energy, gst, total, s1, s2, s3 };
}

/* ─────────────────────────────────────────
   14. FORM VALIDATION
───────────────────────────────────────── */
function validateForm() {
  const fields = [
    { id: 'inp-name',     label: 'Consumer Name' },
    { id: 'inp-address',  label: 'Address' },
    { id: 'inp-house',    label: 'House Number' },
    { id: 'inp-consumer', label: 'Consumer ID' },
    { id: 'inp-state',    label: 'State' },
    { id: 'inp-district', label: 'District' },
    { id: 'inp-units',    label: 'Units Consumed' },
    { id: 'inp-month',    label: 'Billing Month' }
  ];
  for (const f of fields) {
    const el = document.getElementById(f.id);
    if (!el) continue;
    if (!el.value.trim()) {
      showToast(`⚠️ Please enter ${f.label}`, 'error');
      el.focus();
      el.parentElement.style.animation = 'shake 0.4s ease';
      setTimeout(() => { el.parentElement.style.animation = ''; }, 400);
      return false;
    }
  }
  const units = parseFloat(document.getElementById('inp-units').value);
  if (isNaN(units) || units < 0 || units > 9999) {
    showToast('⚠️ Please enter a valid unit count (0–9999)', 'error');
    return false;
  }
  return true;
}

/* ─────────────────────────────────────────
   15. DOWNLOAD PDF  ← CORE FIX
───────────────────────────────────────── */
async function downloadPDF() {
  if (!validateForm()) return;

  const btn = document.getElementById('generate-btn');
  if (btn) {
    btn.disabled = true;
    btn.querySelector('.gen-btn-content').innerHTML = `
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="animation:arcSpin 0.8s linear infinite"><path d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" opacity="0.3"/><path d="M12 3a9 9 0 019 9" stroke-linecap="round"/></svg>
      Generating Invoice...
    `;
  }

  try {
    // Gather values
    const name     = document.getElementById('inp-name').value.trim();
    const address  = document.getElementById('inp-address').value.trim();
    const house    = document.getElementById('inp-house').value.trim();
    const consumer = document.getElementById('inp-consumer').value.trim();
    const units    = parseFloat(document.getElementById('inp-units').value);
    const monthVal = document.getElementById('inp-month').value;
    const state    = document.getElementById('inp-state').value;
    const district = document.getElementById('inp-district').value;

    const { energy, gst, total, s1, s2, s3 } = calcBill(units, state);

    const [yr, mo]  = monthVal.split('-');
    const monthName = new Date(parseInt(yr), parseInt(mo) - 1).toLocaleString('en-IN', { month: 'long', year: 'numeric' });
    const billNo    = 'SEBG-' + String(Math.floor(Math.random() * 999999)).padStart(6, '0');
    const invoiceDate = new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
    const dueDate   = '15 ' + new Date(parseInt(yr), parseInt(mo)).toLocaleString('en-IN', { month: 'long', year: 'numeric' });
    const genTime   = new Date().toLocaleString('en-IN');

    let unitsRateStr = '';
    if (units <= 100)      unitsRateStr = `${units} units × ₹${s1.toFixed(1)}`;
    else if (units <= 200) unitsRateStr = `100@₹${s1.toFixed(1)} + ${units-100}@₹${s2.toFixed(1)}`;
    else                   unitsRateStr = `100@₹${s1.toFixed(1)} + 100@₹${s2.toFixed(1)} + ${units-200}@₹${s3.toFixed(1)}`;

    const setText = (id, val) => {
      const el = document.getElementById(id);
      if (el) el.textContent = val;
    };
    setText('i-name',        name);
    setText('i-address',     address);
    setText('i-house',       house);
    setText('i-state-disp',  state);
    setText('i-dist-disp',   district);
    setText('i-consumer',    consumer);
    setText('i-bill',        billNo);
    setText('i-bill-display',billNo);
    setText('i-date',        invoiceDate);
    setText('i-month',       monthName);
    setText('i-due',         dueDate);
    setText('i-units-rate',  unitsRateStr);
    setText('i-energy',      energy.toFixed(2));
    setText('i-gst',         gst.toFixed(2));
    setText('i-total',       '₹ ' + total.toFixed(2));
    setText('i-gen-time',    genTime);
    setText('i-year',        new Date().getFullYear());

    // QR Code
    const qrData = encodeURIComponent(`UPI://pay?pa=upcl@sbi&pn=Smart+Electrivity+Billing+Generator&am=${total.toFixed(2)}&cu=INR&tn=Bill+${billNo}`);
    const qrImg  = document.getElementById('qr');
    if (qrImg) {
      qrImg.crossOrigin = 'anonymous';
      qrImg.src = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&margin=4&data=${qrData}`;
    }

    // ── FIX: Temporarily bring invoice into the visible DOM flow ──
    const invoice = document.getElementById('invoice');

    // Save original styles
    const origPosition = invoice.style.position;
    const origLeft     = invoice.style.left;
    const origTop      = invoice.style.top;
    const origZIndex   = invoice.style.zIndex;
    const origDisplay  = invoice.style.display;
    const origVis      = invoice.style.visibility;

    // Place it off-screen but VISIBLE to html2canvas
    invoice.style.position   = 'fixed';
    invoice.style.left       = '-9999px';
    invoice.style.top        = '0px';
    invoice.style.zIndex     = '-1';
    invoice.style.display    = 'block';
    invoice.style.visibility = 'visible';

    // Wait for QR image to load
    if (qrImg) {
      await new Promise(resolve => {
        if (qrImg.complete && qrImg.naturalWidth > 0) { resolve(); return; }
        qrImg.onload  = resolve;
        qrImg.onerror = resolve;
        setTimeout(resolve, 3000); // fallback timeout
      });
    }

    // Extra buffer for layout settle
    await new Promise(r => setTimeout(r, 300));

    const cvs = await html2canvas(invoice, {
      scale: 2,
      useCORS: true,
      allowTaint: false,
      backgroundColor: '#ffffff',
      logging: false,
      width:  invoice.offsetWidth  || 794,
      height: invoice.offsetHeight || 900,
      x: 0,
      y: 0
    });

    // Restore invoice to hidden state
    invoice.style.position   = origPosition;
    invoice.style.left       = origLeft;
    invoice.style.top        = origTop;
    invoice.style.zIndex     = origZIndex;
    invoice.style.display    = origDisplay;
    invoice.style.visibility = origVis;

    if (!cvs || cvs.width === 0 || cvs.height === 0) {
      throw new Error('Canvas generation failed — empty result.');
    }

    const { jsPDF } = window.jspdf;
    const pdf    = new jsPDF('p', 'mm', 'a4');
    const pageW  = pdf.internal.pageSize.getWidth();
    const pageH  = pdf.internal.pageSize.getHeight();
    const imgH   = (cvs.height * pageW) / cvs.width;
    const imgData = cvs.toDataURL('image/png', 1.0);
    pdf.addImage(imgData, 'PNG', 0, 0, pageW, Math.min(imgH, pageH));
    pdf.save(`UPCL_Invoice_${billNo}_${name.replace(/\s+/g, '_')}.pdf`);

    showToast('✅ Invoice downloaded successfully!', 'success');

  } catch (err) {
    console.error('PDF generation error:', err);
    showToast(`❌ Error: ${err.message || err}`, 'error');
  } finally {
    if (btn) {
      btn.disabled = false;
      btn.querySelector('.gen-btn-content').innerHTML = `
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 10v6m0 0l-3-3m3 3l3-3M3 17V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" stroke-linecap="round" stroke-linejoin="round"/></svg>
        Download Invoice PDF
      `;
    }
  }
}

/* ─────────────────────────────────────────
   16. FORM RESET
───────────────────────────────────────── */
function resetForm() {
  ['inp-name','inp-address','inp-house','inp-consumer','inp-units'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = '';
  });
  const monthInput = document.getElementById('inp-month');
  if (monthInput) {
    const now = new Date();
    monthInput.value = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}`;
  }
  ['prev-energy','prev-gst','prev-total'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.textContent = '₹ —';
  });
  showToast('🔄 Form has been reset.', 'success');
}

/* ─────────────────────────────────────────
   17. TOAST NOTIFICATION
───────────────────────────────────────── */
function showToast(msg, type = 'success') {
  const toast = document.getElementById('toast');
  if (!toast) return;
  toast.textContent = msg;
  toast.className   = `toast ${type}`;
  void toast.offsetWidth;
  toast.classList.add('visible');
  clearTimeout(toast._timer);
  toast._timer = setTimeout(() => toast.classList.remove('visible'), 3500);
}

/* ─────────────────────────────────────────
   18. FOOTER YEAR
───────────────────────────────────────── */
function setFooterYear() {
  const yr = new Date().getFullYear();
  document.querySelectorAll('#footer-year').forEach(el => { el.textContent = yr; });
}

/* ─────────────────────────────────────────
   19. CARD TILT EFFECT (3D Hover)
───────────────────────────────────────── */
(function initTilt() {
  document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.service-card, .stat-card, .float-card').forEach(card => {
      card.addEventListener('mousemove', (e) => {
        const rect  = card.getBoundingClientRect();
        const x     = e.clientX - rect.left;
        const y     = e.clientY - rect.top;
        const tiltX = ((y - rect.height / 2) / rect.height) * 8;
        const tiltY = -((x - rect.width / 2) / rect.width) * 8;
        card.style.transform  = `perspective(600px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) translateY(-8px)`;
        card.style.transition = 'transform 0.05s linear';
      }, { passive: true });
      card.addEventListener('mouseleave', () => {
        card.style.transform  = '';
        card.style.transition = 'transform 0.5s cubic-bezier(0.175,0.885,0.32,1.275), box-shadow 0.5s ease';
      });
    });
  });
})();

/* ─────────────────────────────────────────
   20. GALLERY LIGHTBOX
───────────────────────────────────────── */
(function initLightbox() {
  document.addEventListener('DOMContentLoaded', () => {
    const overlay = document.createElement('div');
    overlay.id    = 'lightbox';
    overlay.style.cssText = `position:fixed;inset:0;z-index:9000;background:rgba(2,8,18,0.97);display:none;align-items:center;justify-content:center;backdrop-filter:blur(16px);cursor:none;`;
    const img = document.createElement('img');
    img.style.cssText = `max-width:90vw;max-height:90vh;border-radius:16px;box-shadow:0 30px 100px rgba(0,0,0,0.8);object-fit:contain;transform:scale(0.9);transition:transform 0.4s cubic-bezier(0.175,0.885,0.32,1.275);`;
    const cap = document.createElement('div');
    cap.style.cssText = `position:absolute;bottom:40px;left:50%;transform:translateX(-50%);font-size:14px;color:rgba(255,255,255,0.7);letter-spacing:1px;font-family:'Space Grotesk',sans-serif;`;
    const closeBtn = document.createElement('button');
    closeBtn.textContent = '✕';
    closeBtn.style.cssText = `position:absolute;top:24px;right:32px;width:44px;height:44px;border-radius:50%;border:1px solid rgba(255,255,255,0.2);background:rgba(255,255,255,0.08);color:#fff;font-size:18px;cursor:none;transition:all 0.3s;`;
    overlay.appendChild(img);
    overlay.appendChild(cap);
    overlay.appendChild(closeBtn);
    document.body.appendChild(overlay);


    function openLightbox(src, caption) {
      img.src = src;
      cap.textContent = caption;
      overlay.style.display = 'flex';
      requestAnimationFrame(() => { img.style.transform = 'scale(1)'; });
      document.body.style.overflow = 'hidden';
    }
    function closeLightbox() {
      img.style.transform = 'scale(0.9)';
      setTimeout(() => { overlay.style.display = 'none'; document.body.style.overflow = ''; }, 300);
    }
    overlay.addEventListener('click', (e) => { if (e.target === overlay) closeLightbox(); });
    closeBtn.addEventListener('click', closeLightbox);
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && overlay.style.display === 'flex') closeLightbox(); });
    document.querySelectorAll('.gal-item img').forEach(galImg => {
      galImg.parentElement.addEventListener('click', () => {
        const caption = galImg.parentElement.querySelector('.gal-caption')?.textContent || '';
        openLightbox(galImg.src, caption);
      });
    });
  });
})();

/* ─────────────────────────────────────────
   21. LIVE GRID SIMULATION
───────────────────────────────────────── */
function initLiveGridOps() {
  setInterval(() => {
    const base   = 142.4;
    const flux   = (Math.random() - 0.5) * 5;
    const totalMW = (base + flux).toFixed(1);
    const fcUnits = document.querySelector('.fc-2 .fc-value');
    if (fcUnits) fcUnits.innerHTML = `${totalMW} <span>MW</span>`;
    const dockLoad = document.getElementById('dock-load');
    if (dockLoad) dockLoad.textContent = `${totalMW} MW`;
  }, 3000);
}

/* ─────────────────────────────────────────
   22. MAGNETIC BUTTON EFFECT
───────────────────────────────────────── */
(function initMagnetic() {
  document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.hero-btn-primary, .nav-cta, .form-btn-generate, .f-social-btn').forEach(btn => {
      btn.addEventListener('mousemove', (e) => {
        const rect = btn.getBoundingClientRect();
        const dx   = (e.clientX - rect.left - rect.width  / 2) * 0.3;
        const dy   = (e.clientY - rect.top  - rect.height / 2) * 0.3;
        btn.style.transform = `translate(${dx}px, ${dy}px) scale(1.04)`;
        btn.style.transition = 'transform 0.1s linear';
      }, { passive: true });
      btn.addEventListener('mouseleave', () => {
        btn.style.transform  = '';
        btn.style.transition = 'transform 0.5s cubic-bezier(0.175,0.885,0.32,1.275)';
      });
    });
  });
})();

/* ─────────────────────────────────────────
   23. KONAMI CODE EASTER EGG
───────────────────────────────────────── */
(function initKonami() {
  const code    = [38,38,40,40,37,39,37,39,66,65];
  let   pointer = 0;
  document.addEventListener('keydown', (e) => {
    if (e.keyCode === code[pointer]) {
      pointer++;
      if (pointer === code.length) {
        pointer = 0;
        showToast('⚡ MAXIMUM POWER UNLOCKED! ⚡', 'success');
      }
    } else { pointer = 0; }
  });
})();

/* ─────────────────────────────────────────
   24. FLOATING LABEL ANIMATION
───────────────────────────────────────── */
(function initFloatingPlaceholders() {
  document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.input-group input').forEach(input => {
      function toggle() {
        input.closest('.input-group')?.classList.toggle('filled', !!input.value);
      }
      input.addEventListener('input',  toggle);
      input.addEventListener('change', toggle);
      toggle();
    });
  });
})();

let indiaStatesData = [];

document.addEventListener('DOMContentLoaded', async () => {
  const stateSel = document.getElementById('inp-state');
  if (stateSel) {
    try {
      const response = await fetch('https://raw.githubusercontent.com/sab99r/Indian-States-And-Districts/master/states-and-districts.json');
      const data = await response.json();
      indiaStatesData = data.states;
      
      stateSel.innerHTML = '<option value="">Choose State</option>';
      indiaStatesData.forEach(st => {
        const opt = document.createElement('option');
        opt.value = st.state;
        opt.textContent = st.state;
        stateSel.appendChild(opt);
      });
      
      // Force trigger state change for live calc updates
      stateSel.addEventListener('change', () => {
        previewCalc();
      });
    } catch (err) {
      console.error('Failed to load Indian states data:', err);
      stateSel.innerHTML = '<option value="">Error Loading States</option>';
    }
  }
});

function updateDistricts() {
  const stateSel = document.getElementById('inp-state');
  const distSel = document.getElementById('inp-district');
  const selectedState = stateSel.value;
  
  distSel.innerHTML = '';
  
  const stateRecord = indiaStatesData.find(s => s.state === selectedState);
  if (stateRecord && stateRecord.districts) {
    stateRecord.districts.forEach(d => {
      const opt = document.createElement('option');
      opt.value = d;
      opt.textContent = d;
      distSel.appendChild(opt);
    });
  } else {
    const opt = document.createElement('option');
    opt.value = "";
    opt.textContent = "Choose State First";
    distSel.appendChild(opt);
  }
}