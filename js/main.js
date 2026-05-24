/**
 * Bryan Uppolo Portfolio — main.js
 * Animazioni con Motion.js + Vanilla JS
 */

'use strict';

/* ── Security ───────────────────────────────────────────────── */
function sanitize(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email);
}

/* ── Motion shorthand (with graceful fallback) ──────────────── */
const _M = typeof Motion !== 'undefined' ? Motion : {};
const animate = _M.animate || (() => ({ then: (f) => { f && f(); return { cancel: () => {} }; } }));
const inView  = _M.inView  || ((sel, cb) => { try { const el = typeof sel === 'string' ? document.querySelector(sel) : sel; if (el) cb(el); } catch(e) {} });
const scroll  = _M.scroll  || (() => {});
const stagger = _M.stagger || (() => 0);

/* ── Loader ─────────────────────────────────────────────────── */
function initLoader() {
  const loader = document.getElementById('loader');
  const fill   = loader?.querySelector('.loader-fill');
  if (!loader) return;

  if (fill) {
    requestAnimationFrame(() => { fill.style.width = '100%'; });
  }

  const hide = () => {
    loader.classList.add('hidden');
    loader.addEventListener('transitionend', () => loader.remove(), { once: true });
    startEntryAnimations();
  };

  if (document.readyState === 'complete') {
    setTimeout(hide, 1800);
  } else {
    window.addEventListener('load', () => setTimeout(hide, 1600), { once: true });
  }
}

/* ── Cursor ─────────────────────────────────────────────────── */
function initCursor() {
  if (window.matchMedia('(pointer: coarse)').matches) return;

  const cursor = document.getElementById('cursor');
  const trail  = document.getElementById('cursor-trail');
  if (!cursor || !trail) return;

  let mouseX = 0, mouseY = 0;
  let trailX = 0, trailY = 0;

  document.addEventListener('mousemove', e => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    cursor.style.left = mouseX + 'px';
    cursor.style.top  = mouseY + 'px';
  });

  function animateTrail() {
    trailX += (mouseX - trailX) * 0.12;
    trailY += (mouseY - trailY) * 0.12;
    trail.style.left = trailX + 'px';
    trail.style.top  = trailY + 'px';
    requestAnimationFrame(animateTrail);
  }
  animateTrail();
}

/* ── Navigation ─────────────────────────────────────────────── */
function initNavigation() {
  const header    = document.getElementById('site-header');
  const toggle    = document.querySelector('.nav-toggle');
  const mobileMenu= document.getElementById('mobile-menu');
  const progress  = document.getElementById('nav-progress-bar');
  const navLinks  = document.querySelectorAll('.nav-link');
  const sections  = document.querySelectorAll('section[id]');

  // Scroll progress bar
  scroll(({ y }) => {
    if (progress) progress.style.width = (y.progress * 100) + '%';
    if (header) header.classList.toggle('scrolled', y.current > 60);
  });

  // Mobile toggle
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
        toggle.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
        mobileMenu.classList.remove('open');
        mobileMenu.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
      });
    });
  }

  // Scroll spy
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.id;
        navLinks.forEach(l => {
          l.classList.toggle('active', l.dataset.section === id);
        });
      }
    });
  }, { rootMargin: '-40% 0px -55% 0px' });
  sections.forEach(s => observer.observe(s));
}

/* ── Hero canvas particles ──────────────────────────────────── */
function initParticles() {
  const canvas = document.getElementById('hero-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let W, H, particles = [], animId;

  const resize = () => {
    W = canvas.width  = canvas.offsetWidth;
    H = canvas.height = canvas.offsetHeight;
  };
  resize();
  window.addEventListener('resize', resize);

  const N = Math.min(60, Math.floor((W * H) / 16000));
  for (let i = 0; i < N; i++) {
    particles.push({
      x: Math.random() * W,
      y: Math.random() * H,
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.3,
      r: Math.random() * 1.5 + 0.5,
      a: Math.random() * 0.5 + 0.1,
    });
  }

  const colors = ['37,99,235', '124,58,237', '6,182,212'];

  function draw() {
    ctx.clearRect(0, 0, W, H);
    particles.forEach((p, i) => {
      p.x += p.vx; p.y += p.vy;
      if (p.x < 0) p.x = W; if (p.x > W) p.x = 0;
      if (p.y < 0) p.y = H; if (p.y > H) p.y = 0;

      const c = colors[i % colors.length];
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${c},${p.a})`;
      ctx.fill();

      particles.forEach((q, j) => {
        if (j <= i) return;
        const dx = p.x - q.x, dy = p.y - q.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 100) {
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(q.x, q.y);
          ctx.strokeStyle = `rgba(${c},${0.06 * (1 - dist / 100)})`;
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      });
    });
    animId = requestAnimationFrame(draw);
  }
  draw();

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    cancelAnimationFrame(animId);
  }
}

/* ── Typed text ─────────────────────────────────────────────── */
function initTypedText() {
  const el = document.getElementById('typed-role');
  if (!el) return;

  const words = ['Full Stack Developer', 'UX/UI Designer', 'Process Architect'];
  let wi = 0, ci = 0, deleting = false;

  const type = () => {
    const word = words[wi];
    el.textContent = deleting ? word.slice(0, ci--) : word.slice(0, ci++);

    if (!deleting && ci > word.length) {
      deleting = true;
      setTimeout(type, 1800);
    } else if (deleting && ci < 0) {
      deleting = false;
      wi = (wi + 1) % words.length;
      ci = 0;
      setTimeout(type, 300);
    } else {
      setTimeout(type, deleting ? 40 : 75);
    }
  };
  setTimeout(type, 600);
}

/* ── Stats counter ──────────────────────────────────────────── */
function initCounters() {
  const counters = document.querySelectorAll('.stat-number[data-target]');
  if (!counters.length) return;

  inView('.hero-stats', () => {
    counters.forEach(el => {
      const target = +el.dataset.target;
      const suffix = el.dataset.suffix || '';
      const start  = performance.now();
      const duration = 1400;

      const tick = (now) => {
        const t = Math.min((now - start) / duration, 1);
        const ease = 1 - Math.pow(1 - t, 4);
        el.textContent = Math.round(ease * target) + suffix;
        if (t < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    });
  });
}

/* ── Scroll reveal with Motion.js ──────────────────────────── */
function initScrollReveal() {
  const elements = document.querySelectorAll('.reveal-up');
  if (!elements.length) return;

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduced) {
    elements.forEach(el => el.classList.add('visible'));
    return;
  }

  const obs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      const delay = parseFloat(getComputedStyle(el).getPropertyValue('--delay')) || 0;

      animate(el,
        { opacity: [0, 1], y: [32, 0] },
        { duration: 0.65, delay, easing: [0.16, 1, 0.3, 1] }
      );
      el.classList.add('visible');
      obs.unobserve(el);
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

  elements.forEach(el => obs.observe(el));
}

/* ── Skill bars ─────────────────────────────────────────────── */
function initSkillBars() {
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  inView('.skills-grid', () => {
    document.querySelectorAll('.skill-fill[data-width]').forEach((fill, i) => {
      const w = fill.dataset.width;
      if (reduced) { fill.style.width = w + '%'; return; }
      animate(fill,
        { width: ['0%', w + '%'] },
        { duration: 0.9, delay: i * 0.05, easing: [0.16, 1, 0.3, 1] }
      );
    });
  }, { amount: 0.2 });
}

/* ── Project filters ────────────────────────────────────────── */
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
        const cats = card.dataset.category || '';
        const show = f === 'all' || cats.includes(f);
        if (show) {
          card.classList.remove('filtered-out');
          animate(card, { opacity: [0, 1], scale: [0.95, 1] }, { duration: 0.35, easing: 'ease-out' });
        } else {
          animate(card, { opacity: [1, 0], scale: [1, 0.95] }, { duration: 0.25 }).then(() => {
            card.classList.add('filtered-out');
          });
        }
      });
    });
  });
}

/* ── Project card hover (Motion.js) ────────────────────────── */
function initCardHovers() {
  if (window.matchMedia('(pointer: coarse)').matches) return;

  document.querySelectorAll('.project-card').forEach(card => {
    card.addEventListener('mouseenter', () => {
      animate(card, { boxShadow: ['0 2px 8px rgba(0,0,0,0.4)', '0 24px 60px rgba(0,0,0,0.7)'] },
        { duration: 0.3, easing: 'ease-out' });
    });
    card.addEventListener('mouseleave', () => {
      animate(card, { boxShadow: '0 2px 8px rgba(0,0,0,0.4)' }, { duration: 0.3 });
    });
  });
}

/* ── Coming soon buttons ────────────────────────────────────── */
function initDemoButtons() {
  document.querySelectorAll('[data-coming-soon]').forEach(btn => {
    btn.addEventListener('click', () => {
      showToast('Demo in arrivo prossimamente!', 'info');
      animate(btn, { scale: [1, 0.95, 1.02, 1] }, { duration: 0.3, easing: 'ease-in-out' });
    });
  });
}

/* ── Contact form ───────────────────────────────────────────── */
function initContactForm() {
  const form = document.getElementById('contact-form');
  if (!form) return;

  const nameInput = form.querySelector('#contact-name');
  const emailInput= form.querySelector('#contact-email');
  const msgInput  = form.querySelector('#contact-message');
  const submitBtn = document.getElementById('submit-btn');

  const showError = (input, msg) => {
    const err = input.parentElement.querySelector('.form-error');
    input.classList.add('error');
    if (err) err.textContent = msg;
  };
  const clearError = (input) => {
    input.classList.remove('error');
    const err = input.parentElement.querySelector('.form-error');
    if (err) err.textContent = '';
  };

  [nameInput, emailInput, msgInput].forEach(inp => {
    if (!inp) return;
    inp.addEventListener('input', () => clearError(inp));
  });

  form.addEventListener('submit', async e => {
    e.preventDefault();
    let valid = true;

    if (!nameInput?.value.trim()) { showError(nameInput, 'Inserisci il tuo nome.'); valid = false; }
    if (!isValidEmail(emailInput?.value.trim())) { showError(emailInput, 'Email non valida.'); valid = false; }
    if (!msgInput?.value.trim()) { showError(msgInput, 'Scrivi un messaggio.'); valid = false; }
    if (!valid) return;

    submitBtn.classList.add('loading');
    submitBtn.disabled = true;

    const data = new FormData();
    data.append('name',    sanitize(nameInput.value.trim()));
    data.append('email',   sanitize(emailInput.value.trim()));
    data.append('subject', sanitize(form.querySelector('#contact-subject')?.value.trim() || ''));
    data.append('message', sanitize(msgInput.value.trim()));

    try {
      const res = await fetch(form.action, { method: 'POST', body: data, headers: { 'Accept': 'application/json' } });
      if (res.ok) {
        form.reset();
        showToast('Messaggio inviato! Ti rispondo presto.', 'success');
        animate(form, { y: [0, -4, 0] }, { duration: 0.35, easing: 'ease-out' });
      } else {
        showToast('Errore nell\'invio. Riprova o scrivi direttamente.', 'error');
      }
    } catch {
      showToast('Errore di rete. Riprova tra poco.', 'error');
    } finally {
      submitBtn.classList.remove('loading');
      submitBtn.disabled = false;
    }
  });
}

/* ── Toast ──────────────────────────────────────────────────── */
function showToast(msg, type = 'info') {
  const toast = document.getElementById('toast');
  if (!toast) return;

  toast.textContent = msg;
  toast.className = `toast toast--${type}`;
  void toast.offsetWidth;
  toast.classList.add('show');

  setTimeout(() => toast.classList.remove('show'), 3500);
}

/* ── Hero entry animations ──────────────────────────────────── */
function startEntryAnimations() {
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduced) {
    document.querySelectorAll('.reveal-up').forEach(el => el.classList.add('visible'));
    return;
  }

  const heroItems = document.querySelectorAll('#hero .reveal-up');
  heroItems.forEach(el => {
    const delay = parseFloat(getComputedStyle(el).getPropertyValue('--delay')) || 0;
    animate(el,
      { opacity: [0, 1], y: [40, 0] },
      { duration: 0.75, delay, easing: [0.16, 1, 0.3, 1] }
    );
    el.classList.add('visible');
  });

  initScrollReveal();
}

/* ── Nav logo motion hover ──────────────────────────────────── */
function initNavHovers() {
  const logo = document.querySelector('.nav-logo');
  if (!logo) return;
  logo.addEventListener('mouseenter', () => {
    animate(logo, { scale: [1, 1.08, 1] }, { duration: 0.35, easing: 'ease-out' });
  });
}

/* ── Dynamic age ────────────────────────────────────────────── */
function initDynamicAge() {
  const el = document.getElementById('dynamic-age');
  if (!el) return;
  const birth = new Date(2003, 10, 24);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
  el.textContent = age;
}

/* ── Footer year ────────────────────────────────────────────── */
function initYear() {
  const el = document.getElementById('footer-year');
  if (el) el.textContent = new Date().getFullYear();
}

/* ── Smooth scroll ──────────────────────────────────────────── */
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const id = a.getAttribute('href').slice(1);
      const target = document.getElementById(id);
      if (!target) return;
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });
}

/* ── Form input Motion effects ──────────────────────────────── */
function initFormEffects() {
  document.querySelectorAll('.form-input').forEach(inp => {
    inp.addEventListener('focus', () => {
      animate(inp, { scale: [1, 1.01] }, { duration: 0.2 });
    });
    inp.addEventListener('blur', () => {
      animate(inp, { scale: [1.01, 1] }, { duration: 0.2 });
    });
  });
}

/* ── Channel card Motion ────────────────────────────────────── */
function initChannelHovers() {
  if (window.matchMedia('(pointer: coarse)').matches) return;
  document.querySelectorAll('.channel-card').forEach(card => {
    card.addEventListener('mouseenter', () => {
      animate(card, { x: [0, 4] }, { duration: 0.2, easing: 'ease-out' });
    });
    card.addEventListener('mouseleave', () => {
      animate(card, { x: [4, 0] }, { duration: 0.2 });
    });
  });
}

/* ── Init ───────────────────────────────────────────────────── */
function init() {
  initLoader();
  initCursor();
  initNavigation();
  initParticles();
  initTypedText();
  initCounters();
  initSkillBars();
  initProjectFilters();
  initCardHovers();
  initDemoButtons();
  initContactForm();
  initNavHovers();
  initDynamicAge();
  initYear();
  initSmoothScroll();
  initFormEffects();
  initChannelHovers();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
