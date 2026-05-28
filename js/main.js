/**
 * Bryan Uppolo Portfolio — main.js v3
 * Ultra: 3D tilt · spotlight · magnetic · parallax · split-text · depth particles
 */

'use strict';

/* ── Motion with fallback ─────────────────────────────────────── */
const _M = typeof Motion !== 'undefined' ? Motion : {};
const animate = _M.animate || (() => ({ then: f => { f && f(); return { cancel: () => {} }; } }));
const inView  = _M.inView  || ((sel, cb) => { try { const el = typeof sel === 'string' ? document.querySelector(sel) : sel; if (el) cb(el); } catch(e) {} });
const scroll  = _M.scroll  || (() => {});
const stagger = _M.stagger || (() => 0);

/* ── Utils ────────────────────────────────────────────────────── */
function sanitize(str) {
  return String(str)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#x27;').replace(/\//g, '&#x2F;');
}
function isValidEmail(e) { return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(e); }
function lerp(a, b, t) { return a + (b - a) * t; }
function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }

/* ── Loader ───────────────────────────────────────────────────── */
function initLoader() {
  const loader = document.getElementById('loader');
  const fill   = loader?.querySelector('.loader-fill');
  if (!loader) return;
  if (fill) requestAnimationFrame(() => { fill.style.width = '100%'; });
  const hide = () => {
    loader.classList.add('hidden');
    loader.addEventListener('transitionend', () => loader.remove(), { once: true });
    startEntryAnimations();
  };
  if (document.readyState === 'complete') setTimeout(hide, 1800);
  else window.addEventListener('load', () => setTimeout(hide, 1600), { once: true });
}

/* ── Cursor ───────────────────────────────────────────────────── */
function initCursor() {
  if (window.matchMedia('(pointer: coarse)').matches) return;
  const dot  = document.getElementById('cursor');
  const ring = document.getElementById('cursor-trail');
  if (!dot || !ring) return;

  let mx = 0, my = 0, rx = 0, ry = 0;

  document.addEventListener('mousemove', e => {
    mx = e.clientX; my = e.clientY;
    dot.style.left = mx + 'px'; dot.style.top = my + 'px';
  });

  const interactiveEls = 'a, button, .project-card, .about-card, .channel-card, .filter-btn, input, textarea';
  document.querySelectorAll(interactiveEls).forEach(el => {
    el.addEventListener('mouseenter', () => { dot.classList.add('cursor--hover'); ring.classList.add('cursor-trail--hover'); });
    el.addEventListener('mouseleave', () => { dot.classList.remove('cursor--hover'); ring.classList.remove('cursor-trail--hover'); });
  });

  (function loop() {
    rx = lerp(rx, mx, 0.1); ry = lerp(ry, my, 0.1);
    ring.style.left = rx + 'px'; ring.style.top = ry + 'px';
    requestAnimationFrame(loop);
  })();
}

/* ── Navigation ─────────────────────────────────────────────── */
function initNavigation() {
  const header     = document.getElementById('site-header');
  const toggle     = document.querySelector('.nav-toggle');
  const mobileMenu = document.getElementById('mobile-menu');
  const progress   = document.getElementById('nav-progress-bar');
  const navLinks   = document.querySelectorAll('.nav-link');
  const sections   = document.querySelectorAll('section[id]');

  scroll(({ y }) => {
    if (progress) progress.style.width = (y.progress * 100) + '%';
    if (header)   header.classList.toggle('scrolled', y.current > 60);
  });

  if (toggle && mobileMenu) {
    toggle.addEventListener('click', () => {
      const open = toggle.classList.toggle('open');
      toggle.setAttribute('aria-expanded', open);
      mobileMenu.classList.toggle('open', open);
      mobileMenu.setAttribute('aria-hidden', !open);
      document.body.style.overflow = open ? 'hidden' : '';
    });
    mobileMenu.querySelectorAll('.mobile-link').forEach(link => {
      link.addEventListener('click', () => {
        toggle.classList.remove('open'); toggle.setAttribute('aria-expanded', 'false');
        mobileMenu.classList.remove('open'); mobileMenu.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
      });
    });
  }

  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) navLinks.forEach(l => l.classList.toggle('active', l.dataset.section === e.target.id));
    });
  }, { rootMargin: '-40% 0px -55% 0px' });
  sections.forEach(s => obs.observe(s));
}

/* ── 3D Depth Particles ───────────────────────────────────────── */
function initParticles() {
  const canvas = document.getElementById('hero-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let W, H, animId;
  let mouseX = 0, mouseY = 0, targetMX = 0, targetMY = 0;

  const resize = () => { W = canvas.width = canvas.offsetWidth; H = canvas.height = canvas.offsetHeight; };
  resize();
  window.addEventListener('resize', resize);

  document.addEventListener('mousemove', e => {
    targetMX = (e.clientX / window.innerWidth  - 0.5);
    targetMY = (e.clientY / window.innerHeight - 0.5);
  });

  const isMobile = window.matchMedia('(pointer: coarse)').matches;
  const N = isMobile
    ? Math.min(20, Math.floor((W * H) / 18000))
    : Math.min(90, Math.floor((W * H) / 10000));
  const particles = Array.from({ length: N }, () => ({
    x: Math.random() * W, y: Math.random() * H,
    z: Math.random(),
    vx: (Math.random() - 0.5) * 0.22,
    vy: (Math.random() - 0.5) * 0.22,
    vz: (Math.random() - 0.5) * 0.0015,
  }));
  const colors = ['37,99,235', '124,58,237', '6,182,212', '16,185,129'];

  function draw() {
    mouseX = lerp(mouseX, targetMX, 0.05);
    mouseY = lerp(mouseY, targetMY, 0.05);

    ctx.clearRect(0, 0, W, H);
    particles.forEach((p, i) => {
      p.x += p.vx; p.y += p.vy; p.z += p.vz;
      if (p.x < 0) p.x = W; if (p.x > W) p.x = 0;
      if (p.y < 0) p.y = H; if (p.y > H) p.y = 0;
      if (p.z < 0) p.z = 1; if (p.z > 1) p.z = 0;

      const scale = 0.4 + p.z * 1.4;
      const alpha = 0.08 + p.z * 0.5;
      const px = p.x + mouseX * 50 * p.z;
      const py = p.y + mouseY * 50 * p.z;
      const c  = colors[i % colors.length];

      ctx.beginPath();
      ctx.arc(px, py, scale, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${c},${alpha})`;
      ctx.fill();

      // glow on bright particles
      if (p.z > 0.7) {
        ctx.beginPath();
        ctx.arc(px, py, scale * 3, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${c},${0.03})`;
        ctx.fill();
      }

      if (!isMobile) particles.forEach((q, j) => {
        if (j <= i) return;
        const qx = q.x + mouseX * 50 * q.z;
        const qy = q.y + mouseY * 50 * q.z;
        const dx = px - qx, dy = py - qy;
        const d  = Math.hypot(dx, dy);
        if (d < 110) {
          const depthMatch = 1 - Math.abs(p.z - q.z) * 4;
          if (depthMatch <= 0) return;
          ctx.beginPath();
          ctx.moveTo(px, py);
          ctx.lineTo(qx, qy);
          ctx.strokeStyle = `rgba(${c},${0.04 * (1 - d/110) * depthMatch})`;
          ctx.lineWidth = p.z * 0.7;
          ctx.stroke();
        }
      });
    });
    animId = requestAnimationFrame(draw);
  }
  draw();
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) cancelAnimationFrame(animId);
}

/* ── Typed text ────────────────────────────────────────────────── */
function initTypedText() {
  const el = document.getElementById('typed-role');
  if (!el) return;
  const words = ['Full Stack Developer', 'UX/UI Designer', 'Process Architect'];
  let wi = 0, ci = 0, deleting = false;
  const type = () => {
    const w = words[wi];
    el.textContent = deleting ? w.slice(0, ci--) : w.slice(0, ci++);
    if (!deleting && ci > w.length) { deleting = true; setTimeout(type, 1800); }
    else if (deleting && ci < 0) { deleting = false; wi = (wi + 1) % words.length; ci = 0; setTimeout(type, 300); }
    else setTimeout(type, deleting ? 38 : 72);
  };
  setTimeout(type, 600);
}

/* ── Split-text hero name ─────────────────────────────────────── */
function initSplitText() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const nameEl = document.querySelector('.name-accent');
  if (!nameEl) return;
  const text = nameEl.textContent;
  nameEl.innerHTML = [...text].map(ch =>
    `<span class="sl" style="display:inline-block;opacity:0;transform:translateY(70px) rotate(10deg)">${ch}</span>`
  ).join('');
  const letters = nameEl.querySelectorAll('.sl');
  inView('.hero-title', () => {
    letters.forEach((l, i) => animate(l,
      { opacity: [0, 1], y: [70, 0], rotate: [10, 0] },
      { duration: 0.65, delay: 0.3 + i * 0.065, easing: [0.16, 1, 0.3, 1] }
    ));
  });
}

/* ── Counters ──────────────────────────────────────────────────── */
function initCounters() {
  const counters = document.querySelectorAll('.stat-number[data-target]');
  if (!counters.length) return;
  inView('.hero-stats', () => {
    counters.forEach(el => {
      const target = +el.dataset.target, suffix = el.dataset.suffix || '';
      const start = performance.now(), dur = 1500;
      const tick = now => {
        const t = Math.min((now - start) / dur, 1);
        el.textContent = Math.round((1 - Math.pow(1 - t, 4)) * target) + suffix;
        if (t < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    });
  });
}

/* ── Hero Scroll Parallax ─────────────────────────────────────── */
function initScrollParallax() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  if (window.matchMedia('(pointer: coarse)').matches) return;
  const heroContent = document.querySelector('.hero-content');
  const heroOrbs    = document.querySelector('.hero-orbs');
  if (!heroContent) return;

  let ticking = false;
  window.addEventListener('scroll', () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      const p = clamp(window.scrollY / window.innerHeight, 0, 1);
      heroContent.style.transform = `translateY(${p * 80}px)`;
      heroContent.style.opacity   = `${1 - p * 2}`;
      if (heroOrbs) heroOrbs.style.transform = `translateY(${p * 130}px)`;
      ticking = false;
    });
  }, { passive: true });
}

/* ── Hero spotlight (mouse-tracking radial) ────────────────────── */
function initSpotlight() {
  if (window.matchMedia('(pointer: coarse)').matches) return;
  const hero = document.getElementById('hero');
  const spot = document.getElementById('hero-spotlight');
  if (!hero || !spot) return;

  let raf;
  spot.style.background = 'radial-gradient(700px circle at 30% 50%, rgba(37,99,235,0.07) 0%, rgba(124,58,237,0.04) 40%, transparent 70%)';

  hero.addEventListener('mousemove', e => {
    cancelAnimationFrame(raf);
    raf = requestAnimationFrame(() => {
      const rect = hero.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width  * 100).toFixed(2);
      const y = ((e.clientY - rect.top)  / rect.height * 100).toFixed(2);
      spot.style.background = `radial-gradient(700px circle at ${x}% ${y}%, rgba(37,99,235,0.1) 0%, rgba(124,58,237,0.06) 35%, transparent 70%)`;
    });
  });
}

/* ── 3D Card Tilt + Spotlight ─────────────────────────────────── */
function initCardTilt() {
  if (window.matchMedia('(pointer: coarse)').matches) return;

  document.querySelectorAll('.project-card, .about-card, .skill-category, .channel-card, .contact-form').forEach(card => {
    // inject spotlight overlay
    const spot = document.createElement('div');
    spot.className = 'card-spotlight';
    card.insertBefore(spot, card.firstChild);

    let raf;
    card.addEventListener('mousemove', e => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const rect = card.getBoundingClientRect();
        const xPct = (e.clientX - rect.left) / rect.width;
        const yPct = (e.clientY - rect.top)  / rect.height;
        const rotX = (yPct - 0.5) * -18;
        const rotY = (xPct - 0.5) *  18;
        card.style.transform  = `perspective(900px) rotateX(${rotX}deg) rotateY(${rotY}deg) scale3d(1.03,1.03,1.02)`;
        card.style.transition = 'transform 0.08s ease-out, box-shadow 0.2s';
        card.style.zIndex     = '10';
        card.style.boxShadow  = `0 24px 60px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.08)`;
        spot.style.background = `radial-gradient(circle at ${xPct*100}% ${yPct*100}%, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0.04) 40%, transparent 65%)`;
        spot.style.opacity    = '1';
      });
    });

    card.addEventListener('mouseleave', () => {
      cancelAnimationFrame(raf);
      card.style.transition = 'transform 0.7s cubic-bezier(0.16,1,0.3,1), box-shadow 0.5s';
      card.style.transform  = '';
      card.style.boxShadow  = '';
      card.style.zIndex     = '';
      spot.style.opacity    = '0';
    });
  });
}

/* ── Magnetic buttons ──────────────────────────────────────────── */
function initMagnetic() {
  if (window.matchMedia('(pointer: coarse)').matches) return;
  document.querySelectorAll('.btn, .nav-cta').forEach(el => {
    el.addEventListener('mousemove', e => {
      const rect = el.getBoundingClientRect();
      const x = (e.clientX - (rect.left + rect.width  / 2)) * 0.38;
      const y = (e.clientY - (rect.top  + rect.height / 2)) * 0.38;
      animate(el, { x, y }, { duration: 0.35, easing: 'ease-out' });
    });
    el.addEventListener('mouseleave', () => {
      animate(el, { x: 0, y: 0 }, { duration: 0.65, easing: [0.16, 1, 0.3, 1] });
    });
  });
}

/* ── Scroll reveal ────────────────────────────────────────────── */
function initScrollReveal() {
  const els = document.querySelectorAll('.reveal-up');
  if (!els.length) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    els.forEach(el => el.classList.add('visible')); return;
  }
  const obs = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el    = entry.target;
      const delay = parseFloat(getComputedStyle(el).getPropertyValue('--delay')) || 0;
      animate(el, { opacity: [0, 1], y: [32, 0] }, { duration: 0.65, delay, easing: [0.16, 1, 0.3, 1] });
      el.classList.add('visible');
      obs.unobserve(el);
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });
  els.forEach(el => obs.observe(el));
}

/* ── Skill bars ────────────────────────────────────────────────── */
function initSkillBars() {
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  inView('.skills-grid', () => {
    document.querySelectorAll('.skill-fill[data-width]').forEach((fill, i) => {
      const w = fill.dataset.width;
      if (reduced) { fill.style.width = w + '%'; return; }
      animate(fill, { width: ['0%', w + '%'] }, { duration: 0.9, delay: i * 0.05, easing: [0.16, 1, 0.3, 1] });
    });
  }, { amount: 0.2 });
}

/* ── Project filters ───────────────────────────────────────────── */
function initProjectFilters() {
  const btns  = document.querySelectorAll('.filter-btn');
  const cards = document.querySelectorAll('.project-card');
  if (!btns.length) return;
  btns.forEach(btn => {
    btn.addEventListener('click', () => {
      btns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const f = btn.dataset.filter;
      cards.forEach(card => {
        const show = f === 'all' || (card.dataset.category || '').includes(f);
        if (show) {
          card.classList.remove('filtered-out');
          animate(card, { opacity: [0, 1], scale: [0.95, 1] }, { duration: 0.35, easing: 'ease-out' });
        } else {
          animate(card, { opacity: [1, 0], scale: [1, 0.92] }, { duration: 0.25 }).then(() => card.classList.add('filtered-out'));
        }
      });
    });
  });
}

/* ── Demo buttons ─────────────────────────────────────────────── */
function initDemoButtons() {
  document.querySelectorAll('[data-coming-soon]').forEach(btn => {
    btn.addEventListener('click', () => {
      showToast('Demo in arrivo prossimamente!', 'info');
      animate(btn, { scale: [1, 0.95, 1.04, 1] }, { duration: 0.35, easing: 'ease-in-out' });
    });
  });
}

/* ── Contact form ─────────────────────────────────────────────── */
function initContactForm() {
  const form = document.getElementById('contact-form');
  if (!form) return;
  const nameInput  = form.querySelector('#contact-name');
  const emailInput = form.querySelector('#contact-email');
  const msgInput   = form.querySelector('#contact-message');
  const submitBtn  = document.getElementById('submit-btn');

  const showErr  = (inp, msg) => { const e = inp?.parentElement?.querySelector('.form-error'); inp?.classList.add('error'); if (e) e.textContent = msg; };
  const clearErr = (inp) => { inp?.classList.remove('error'); const e = inp?.parentElement?.querySelector('.form-error'); if (e) e.textContent = ''; };
  [nameInput, emailInput, msgInput].forEach(inp => inp?.addEventListener('input', () => clearErr(inp)));

  form.addEventListener('submit', async e => {
    e.preventDefault();
    let valid = true;
    if (!nameInput?.value.trim())              { showErr(nameInput,  'Inserisci il tuo nome.'); valid = false; }
    if (!isValidEmail(emailInput?.value.trim())){ showErr(emailInput, 'Email non valida.');      valid = false; }
    if (!msgInput?.value.trim())               { showErr(msgInput,   'Scrivi un messaggio.');   valid = false; }
    if (!valid) return;

    submitBtn.classList.add('loading'); submitBtn.disabled = true;
    const data = new FormData();
    data.append('name',    sanitize(nameInput.value.trim()));
    data.append('email',   sanitize(emailInput.value.trim()));
    data.append('subject', sanitize(form.querySelector('#contact-subject')?.value.trim() || ''));
    data.append('message', sanitize(msgInput.value.trim()));
    try {
      const res = await fetch(form.action, { method: 'POST', body: data, headers: { 'Accept': 'application/json' } });
      if (res.ok) { form.reset(); showToast('Messaggio inviato! Ti rispondo presto.', 'success'); }
      else showToast("Errore nell'invio. Riprova o scrivi direttamente.", 'error');
    } catch { showToast('Errore di rete. Riprova tra poco.', 'error'); }
    finally { submitBtn.classList.remove('loading'); submitBtn.disabled = false; }
  });
}

/* ── Toast ─────────────────────────────────────────────────────── */
function showToast(msg, type = 'info') {
  const toast = document.getElementById('toast');
  if (!toast) return;
  toast.textContent = msg;
  toast.className = `toast toast--${type}`;
  void toast.offsetWidth;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 3500);
}

/* ── Hero entry animations ──────────────────────────────────────── */
function startEntryAnimations() {
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduced) { document.querySelectorAll('.reveal-up').forEach(el => el.classList.add('visible')); return; }
  document.querySelectorAll('#hero .reveal-up').forEach(el => {
    const delay = parseFloat(getComputedStyle(el).getPropertyValue('--delay')) || 0;
    animate(el, { opacity: [0, 1], y: [40, 0] }, { duration: 0.75, delay, easing: [0.16, 1, 0.3, 1] });
    el.classList.add('visible');
  });
  initScrollReveal();
}

/* ── Nav hover ────────────────────────────────────────────────── */
function initNavHovers() {
  const logo = document.querySelector('.nav-logo');
  if (logo) logo.addEventListener('mouseenter', () =>
    animate(logo, { scale: [1, 1.08, 1] }, { duration: 0.35, easing: 'ease-out' })
  );
}

/* ── Dynamic age ───────────────────────────────────────────────── */
function initDynamicAge() {
  const el = document.getElementById('dynamic-age');
  if (!el) return;
  const b = new Date(2003, 10, 24), t = new Date();
  let age = t.getFullYear() - b.getFullYear();
  if (t.getMonth() - b.getMonth() < 0 || (t.getMonth() === b.getMonth() && t.getDate() < b.getDate())) age--;
  el.textContent = age;
}

/* ── Footer year ───────────────────────────────────────────────── */
function initYear() {
  const el = document.getElementById('footer-year');
  if (el) el.textContent = new Date().getFullYear();
}

/* ── Smooth scroll ─────────────────────────────────────────────── */
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const target = document.getElementById(a.getAttribute('href').slice(1));
      if (!target) return;
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });
}

/* ── Form focus ────────────────────────────────────────────────── */
function initFormEffects() {
  document.querySelectorAll('.form-input').forEach(inp => {
    inp.addEventListener('focus', () => animate(inp, { scale: [1, 1.012] }, { duration: 0.2 }));
    inp.addEventListener('blur',  () => animate(inp, { scale: [1.012, 1] }, { duration: 0.2 }));
  });
}

/* ── Channel card arrows ─────────────────────────────────────────── */
function initChannelHovers() {
  if (window.matchMedia('(pointer: coarse)').matches) return;
  document.querySelectorAll('.channel-card').forEach(card => {
    const arrow = card.querySelector('.channel-arrow');
    if (!arrow) return;
    card.addEventListener('mouseenter', () => animate(arrow, { x: [0, 8] }, { duration: 0.25, easing: 'ease-out' }));
    card.addEventListener('mouseleave', () => animate(arrow, { x: [8, 0] }, { duration: 0.25, easing: 'ease-out' }));
  });
}

/* ── Scroll-driven section color shift ──────────────────────────── */
function initSectionColors() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const sections = ['about', 'skills', 'projects', 'contact'];
  sections.forEach(id => {
    const el = document.getElementById(id);
    if (!el) return;
    inView(el, () => {
      animate(el, { opacity: [0.7, 1] }, { duration: 1, easing: 'ease-out' });
    }, { amount: 0.1 });
  });
}

/* ── Init ───────────────────────────────────────────────────────── */
function init() {
  initLoader();
  initCursor();
  initNavigation();
  initParticles();
  initTypedText();
  initSplitText();
  initCounters();
  initScrollParallax();
  initSpotlight();
  initCardTilt();
  initMagnetic();
  initSkillBars();
  initProjectFilters();
  initDemoButtons();
  initContactForm();
  initNavHovers();
  initDynamicAge();
  initYear();
  initSmoothScroll();
  initFormEffects();
  initChannelHovers();
  initSectionColors();
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
else init();
