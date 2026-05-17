/**
 * Portfolio Bryan Uppolo — main.js
 * Vanilla JS: animazioni, interazioni, sicurezza form
 */

'use strict';

function sanitizeString(str) {
  if (typeof str !== 'string') return '';
  return str.trim()
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#039;').replace(/\//g, '&#x2F;');
}

function isValidEmail(email) {
  const re = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*\.[a-zA-Z]{2,}$/;
  return re.test(email) && email.length <= 254;
}

function initLoadingScreen() {
  const screen   = document.getElementById('loadingScreen');
  const progress = document.getElementById('loadingProgress');
  if (!screen || !progress) return;
  let value = 0;
  const interval = setInterval(() => {
    value += Math.random() * 25;
    if (value >= 100) {
      value = 100;
      clearInterval(interval);
      setTimeout(() => {
        screen.classList.add('hidden');
        screen.addEventListener('transitionend', () => screen.remove(), { once: true });
        document.body.style.overflow = '';
        startEntryAnimations();
      }, 200);
    }
    progress.style.width = `${value}%`;
  }, 150);
  document.body.style.overflow = 'hidden';
}

function initCursor() {
  if (window.matchMedia('(hover: none)').matches) return;
  const cursor   = document.getElementById('cursor');
  const follower = document.getElementById('cursorFollower');
  if (!cursor || !follower) return;
  let mouseX = 0, mouseY = 0, followerX = 0, followerY = 0;
  document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX; mouseY = e.clientY;
    cursor.style.left = `${mouseX}px`; cursor.style.top = `${mouseY}px`;
  });
  function animateFollower() {
    followerX += (mouseX - followerX) * 0.12;
    followerY += (mouseY - followerY) * 0.12;
    follower.style.left = `${followerX}px`; follower.style.top = `${followerY}px`;
    requestAnimationFrame(animateFollower);
  }
  animateFollower();
  document.querySelectorAll('a, button, .project-card, .skill-pill').forEach((el) => {
    el.addEventListener('mouseenter', () => document.body.classList.add('cursor-hover'));
    el.addEventListener('mouseleave', () => document.body.classList.remove('cursor-hover'));
  });
}

function initNavigation() {
  const header     = document.getElementById('navHeader');
  const toggle     = document.getElementById('navToggle');
  const mobileMenu = document.getElementById('mobileMenu');
  const mobileLinks = document.querySelectorAll('.mobile-link');
  const navLinks   = document.querySelectorAll('.nav-link');
  const sections   = document.querySelectorAll('section[id]');
  if (!header) return;
  const handleScroll = () => {
    header.classList.toggle('scrolled', window.scrollY > 20);
    let currentId = '';
    sections.forEach((s) => { if (window.scrollY >= s.offsetTop - 100) currentId = s.id; });
    navLinks.forEach((l) => l.classList.toggle('active', l.getAttribute('href')?.replace('#','') === currentId));
  };
  window.addEventListener('scroll', handleScroll, { passive: true });
  if (toggle && mobileMenu) {
    toggle.addEventListener('click', () => {
      const isOpen = toggle.getAttribute('aria-expanded') === 'true';
      toggle.setAttribute('aria-expanded', String(!isOpen));
      mobileMenu.setAttribute('aria-hidden', String(isOpen));
      mobileMenu.classList.toggle('open', !isOpen);
    });
    mobileLinks.forEach((l) => l.addEventListener('click', () => {
      toggle.setAttribute('aria-expanded', 'false');
      mobileMenu.setAttribute('aria-hidden', 'true');
      mobileMenu.classList.remove('open');
    }));
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && mobileMenu.classList.contains('open')) {
        toggle.setAttribute('aria-expanded', 'false');
        mobileMenu.setAttribute('aria-hidden', 'true');
        mobileMenu.classList.remove('open');
        toggle.focus();
      }
    });
  }
}

function initTypedText() {
  const el = document.getElementById('typedText');
  if (!el) return;
  const words = ['Full Stack Developer', 'UX/UI Designer', 'Process Architect'];
  let wordIndex = 0, charIndex = 0, deleting = false, isPaused = false;
  function type() {
    const current = words[wordIndex];
    el.textContent = deleting ? current.substring(0, --charIndex) : current.substring(0, ++charIndex);
    let speed = deleting ? 60 : 100;
    if (!deleting && charIndex === current.length) {
      if (isPaused) return;
      isPaused = true;
      setTimeout(() => { isPaused = false; deleting = true; type(); }, 2000);
      return;
    }
    if (deleting && charIndex === 0) { deleting = false; wordIndex = (wordIndex + 1) % words.length; speed = 300; }
    setTimeout(type, speed);
  }
  type();
}

function initParticles() {
  const canvas = document.getElementById('heroCanvas');
  if (!canvas || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const ctx = canvas.getContext('2d');
  const particles = [];
  const COUNT = window.innerWidth < 768 ? 40 : 80;
  function resize() { canvas.width = canvas.offsetWidth; canvas.height = canvas.offsetHeight; }
  resize();
  window.addEventListener('resize', resize, { passive: true });
  class Particle {
    constructor() { this.reset(); }
    reset() { this.x = Math.random()*canvas.width; this.y = Math.random()*canvas.height; this.vx = (Math.random()-0.5)*0.4; this.vy = (Math.random()-0.5)*0.4; this.r = Math.random()*1.5+0.5; this.alpha = Math.random()*0.5+0.1; }
    update() { this.x += this.vx; this.y += this.vy; if (this.x<0||this.x>canvas.width||this.y<0||this.y>canvas.height) this.reset(); }
    draw() { ctx.beginPath(); ctx.arc(this.x,this.y,this.r,0,Math.PI*2); ctx.fillStyle=`rgba(96,165,250,${this.alpha})`; ctx.fill(); }
  }
  for (let i=0;i<COUNT;i++) particles.push(new Particle());
  function drawConnections() {
    for (let i=0;i<particles.length;i++) for (let j=i+1;j<particles.length;j++) {
      const dx=particles[i].x-particles[j].x, dy=particles[i].y-particles[j].y, dist=Math.sqrt(dx*dx+dy*dy);
      if (dist<120) { ctx.beginPath(); ctx.strokeStyle=`rgba(96,165,250,${(1-dist/120)*0.15})`; ctx.lineWidth=0.5; ctx.moveTo(particles[i].x,particles[i].y); ctx.lineTo(particles[j].x,particles[j].y); ctx.stroke(); }
    }
  }
  function animate() { ctx.clearRect(0,0,canvas.width,canvas.height); particles.forEach(p=>{p.update();p.draw();}); drawConnections(); requestAnimationFrame(animate); }
  animate();
}

function animateCounters() {
  document.querySelectorAll('.stat-number[data-target]').forEach((stat) => {
    const target = parseInt(stat.dataset.target, 10);
    const start = performance.now();
    function update(now) {
      const progress = Math.min((now-start)/1500, 1);
      stat.textContent = Math.floor((1-Math.pow(1-progress,3))*target);
      if (progress < 1) requestAnimationFrame(update);
    }
    requestAnimationFrame(update);
  });
}

function initScrollReveal() {
  const elements = document.querySelectorAll('.reveal-up, .reveal-left, .reveal-right');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        if (entry.target.closest('#hero')) animateCounters();
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -60px 0px' });
  elements.forEach((el) => observer.observe(el));
}

function startEntryAnimations() {
  document.querySelectorAll('#hero .reveal-up').forEach((el) => el.classList.add('visible'));
  animateCounters();
}

function initPortfolioFilters() {
  const filterBtns = document.querySelectorAll('.filter-btn');
  const cards      = document.querySelectorAll('.project-card');
  filterBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      const filter = btn.dataset.filter;
      filterBtns.forEach((b) => { b.classList.remove('active'); b.setAttribute('aria-pressed','false'); });
      btn.classList.add('active'); btn.setAttribute('aria-pressed','true');
      cards.forEach((card) => {
        const match = filter==='all' || (card.dataset.category||'').split(' ').includes(filter);
        card.classList.toggle('filtered-out', !match);
        card.setAttribute('aria-hidden', String(!match));
      });
    });
  });
}

function initContactForm() {
  const form      = document.getElementById('contactForm');
  const submitBtn = document.getElementById('submitBtn');
  const feedback  = document.getElementById('formFeedback');
  const charCount = document.getElementById('charCount');
  const msgField  = document.getElementById('contactMessage');
  const hpField   = document.getElementById('hp_website');
  if (!form) return;

  if (msgField && charCount) {
    msgField.addEventListener('input', () => {
      const len = msgField.value.length;
      charCount.textContent = `${len} / 2000`;
      charCount.style.color = len > 1800 ? 'var(--warning)' : '';
    });
  }

  function validateName(val) {
    const t = val.trim();
    if (!t) return 'Il nome è obbligatorio.';
    if (t.length < 2) return 'Almeno 2 caratteri.';
    if (t.length > 60) return 'Max 60 caratteri.';
    if (!/^[\p{L}\p{M}'\- ]+$/u.test(t)) return 'Caratteri non validi.';
    return null;
  }
  function validateEmail(val) {
    const t = val.trim();
    if (!t) return "L'email è obbligatoria.";
    if (!isValidEmail(t)) return "Email non valida.";
    return null;
  }
  function validateMessage(val) {
    const t = val.trim();
    if (!t) return 'Il messaggio è obbligatorio.';
    if (t.length < 20) return 'Almeno 20 caratteri.';
    if (t.length > 2000) return 'Max 2000 caratteri.';
    return null;
  }
  function showFieldError(input, errorEl, message) {
    if (!errorEl) return;
    if (message) { input.classList.add('error'); errorEl.textContent = message; }
    else { input.classList.remove('error'); errorEl.textContent = ''; }
  }

  [['contactName','nameError',validateName],['contactEmail','emailError',validateEmail],['contactMessage','messageError',validateMessage]].forEach(([id,errId,fn]) => {
    const el = document.getElementById(id);
    if (!el) return;
    el.addEventListener('blur', () => showFieldError(el, document.getElementById(errId), fn(el.value)));
    el.addEventListener('input', () => { el.classList.remove('error'); const e=document.getElementById(errId); if(e) e.textContent=''; });
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (hpField && hpField.value.trim() !== '') return;
    const nameVal    = document.getElementById('contactName')?.value ?? '';
    const emailVal   = document.getElementById('contactEmail')?.value ?? '';
    const subjectVal = document.getElementById('contactSubject')?.value ?? '';
    const msgVal     = msgField?.value ?? '';
    let hasError = false;
    [[nameVal,'contactName','nameError',validateName],[emailVal,'contactEmail','emailError',validateEmail],[msgVal,'contactMessage','messageError',validateMessage]].forEach(([val,inId,errId,fn]) => {
      const err = fn(val);
      if (err) { showFieldError(document.getElementById(inId), document.getElementById(errId), err); hasError = true; }
    });
    if (hasError) { form.querySelector('.error')?.focus(); return; }
    const payload = { name: sanitizeString(nameVal), email: sanitizeString(emailVal), subject: sanitizeString(subjectVal), message: sanitizeString(msgVal) };
    submitBtn.classList.add('loading');
    if (feedback) { feedback.className = 'form-feedback'; feedback.textContent = ''; }
    try {
      const response = await fetch(form.action, { method: 'POST', headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' }, body: JSON.stringify(payload) });
      if (response.ok) {
        showFeedback('success', '✓ Messaggio inviato! Ti rispondo entro 24 ore.');
        form.reset(); if (charCount) charCount.textContent = '0 / 2000';
        showToast('Messaggio inviato!', 'success');
      } else {
        const data = await response.json().catch(() => ({}));
        showFeedback('error', `✗ ${data?.error || 'Errore. Prova via email.'}`);
        showToast('Errore nell\'invio.', 'error');
      }
    } catch { showFeedback('error', '✗ Errore di rete.'); showToast('Errore di rete.', 'error'); }
    finally { submitBtn.classList.remove('loading'); }
  });

  function showFeedback(type, message) {
    if (!feedback) return;
    feedback.className = `form-feedback ${type}`;
    feedback.textContent = message;
    feedback.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }
}

function showToast(message, type = 'success') {
  const container = document.getElementById('toastContainer');
  if (!container) return;
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.textContent = message;
  toast.setAttribute('role', 'status');
  container.appendChild(toast);
  requestAnimationFrame(() => requestAnimationFrame(() => toast.classList.add('show')));
  setTimeout(() => { toast.classList.remove('show'); toast.addEventListener('transitionend', () => toast.remove(), { once: true }); }, 4000);
}

function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', (e) => {
      const targetId = anchor.getAttribute('href');
      if (targetId === '#') return;
      const target = document.querySelector(targetId);
      if (!target) return;
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      target.setAttribute('tabindex', '-1');
      target.focus({ preventScroll: true });
    });
  });
}

function initCurrentYear() {
  const el = document.getElementById('currentYear');
  if (el) el.textContent = new Date().getFullYear();
}

function initDynamicAge() {
  const el = document.getElementById('dynamicAge');
  if (!el) return;
  const birth = new Date(2003, 10, 24); // 24 novembre 2003
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const passed = today.getMonth() > birth.getMonth() || (today.getMonth() === birth.getMonth() && today.getDate() >= birth.getDate());
  if (!passed) age--;
  el.textContent = `${age} anni`;
}

function initDemoLinks() {
  document.querySelectorAll('[data-coming-soon="true"]').forEach((link) => {
    link.addEventListener('click', (e) => { e.preventDefault(); showToast('Demo in arrivo prossimamente! 🚀', 'success'); });
  });
}

function initLazyLoad() {
  if (!('IntersectionObserver' in window)) return;
  const imgObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => { if (entry.isIntersecting) { const img=entry.target; if(img.dataset.src) img.src=img.dataset.src; imgObserver.unobserve(img); } });
  });
  document.querySelectorAll('img[loading="lazy"]').forEach((img) => imgObserver.observe(img));
}

function init() {
  initLoadingScreen();
  initCursor();
  initNavigation();
  initTypedText();
  initParticles();
  initScrollReveal();
  initPortfolioFilters();
  initContactForm();
  initSmoothScroll();
  initCurrentYear();
  initDemoLinks();
  initLazyLoad();
  initDynamicAge();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}