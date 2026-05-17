/**
 * Portfolio — main.js
 * Vanilla JS: animazioni, interazioni, sicurezza form
 */

'use strict';

/* ========================
   UTILITY: Sanitizzazione XSS
   Rimuove tag HTML e caratteri pericolosi dall'input utente
   ======================== */
function sanitizeString(str) {
  if (typeof str !== 'string') return '';
  return str
    .trim()
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
    .replace(/\//g, '&#x2F;');
}

/* Verifica email con regex robusta (RFC 5322 semplificato) */
function isValidEmail(email) {
  const re = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*\.[a-zA-Z]{2,}$/;
  return re.test(email) && email.length <= 254;
}

/* ========================
   LOADING SCREEN
   ======================== */
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
        screen.addEventListener('transitionend', () => {
          screen.remove();
        }, { once: true });
        document.body.style.overflow = '';
        startEntryAnimations();
      }, 200);
    }
    progress.style.width = `${value}%`;
  }, 150);

  document.body.style.overflow = 'hidden';
}

/* ========================
   CURSOR PERSONALIZZATO
   ======================== */
function initCursor() {
  if (window.matchMedia('(hover: none)').matches) return;

  const cursor   = document.getElementById('cursor');
  const follower = document.getElementById('cursorFollower');
  if (!cursor || !follower) return;

  let mouseX = 0, mouseY = 0;
  let followerX = 0, followerY = 0;

  document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    cursor.style.left = `${mouseX}px`;
    cursor.style.top  = `${mouseY}px`;
  });

  /* Follower con inerzia tramite rAF */
  function animateFollower() {
    followerX += (mouseX - followerX) * 0.12;
    followerY += (mouseY - followerY) * 0.12;
    follower.style.left = `${followerX}px`;
    follower.style.top  = `${followerY}px`;
    requestAnimationFrame(animateFollower);
  }
  animateFollower();

  /* Hover interattivo su elementi cliccabili */
  const hoverTargets = document.querySelectorAll('a, button, .project-card, .skill-pill');
  hoverTargets.forEach((el) => {
    el.addEventListener('mouseenter', () => document.body.classList.add('cursor-hover'));
    el.addEventListener('mouseleave', () => document.body.classList.remove('cursor-hover'));
  });
}

/* ========================
   NAVIGAZIONE: sticky + scroll-spy
   ======================== */
function initNavigation() {
  const header    = document.getElementById('navHeader');
  const toggle    = document.getElementById('navToggle');
  const mobileMenu = document.getElementById('mobileMenu');
  const mobileLinks = document.querySelectorAll('.mobile-link');
  const navLinks  = document.querySelectorAll('.nav-link');
  const sections  = document.querySelectorAll('section[id]');

  if (!header) return;

  /* Scroll → navbar con sfondo */
  const handleScroll = () => {
    header.classList.toggle('scrolled', window.scrollY > 20);
    updateScrollSpy();
  };
  window.addEventListener('scroll', handleScroll, { passive: true });

  /* Scroll spy */
  function updateScrollSpy() {
    let currentId = '';
    sections.forEach((section) => {
      const top = section.offsetTop - 100;
      if (window.scrollY >= top) currentId = section.id;
    });
    navLinks.forEach((link) => {
      const href = link.getAttribute('href')?.replace('#', '');
      link.classList.toggle('active', href === currentId);
    });
  }

  /* Mobile menu toggle */
  if (toggle && mobileMenu) {
    toggle.addEventListener('click', () => {
      const isOpen = toggle.getAttribute('aria-expanded') === 'true';
      toggle.setAttribute('aria-expanded', String(!isOpen));
      mobileMenu.setAttribute('aria-hidden', String(isOpen));
      mobileMenu.classList.toggle('open', !isOpen);
    });

    /* Chiudi al click su un link mobile */
    mobileLinks.forEach((link) => {
      link.addEventListener('click', () => {
        toggle.setAttribute('aria-expanded', 'false');
        mobileMenu.setAttribute('aria-hidden', 'true');
        mobileMenu.classList.remove('open');
      });
    });

    /* Chiudi con Escape */
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

/* ========================
   HERO: typed text effect
   ======================== */
function initTypedText() {
  const el = document.getElementById('typedText');
  if (!el) return;

  const words = ['Full Stack Developer', 'UX/UI Designer', 'Process Architect'];
  let wordIndex = 0;
  let charIndex = 0;
  let deleting  = false;
  let isPaused  = false;

  function type() {
    const current = words[wordIndex];

    if (deleting) {
      charIndex--;
      el.textContent = current.substring(0, charIndex);
    } else {
      charIndex++;
      el.textContent = current.substring(0, charIndex);
    }

    let speed = deleting ? 60 : 100;

    if (!deleting && charIndex === current.length) {
      if (isPaused) return;
      isPaused = true;
      setTimeout(() => {
        isPaused = false;
        deleting  = true;
        type();
      }, 2000);
      return;
    }

    if (deleting && charIndex === 0) {
      deleting   = false;
      wordIndex  = (wordIndex + 1) % words.length;
      speed      = 300;
    }

    setTimeout(type, speed);
  }

  type();
}

/* ========================
   HERO: canvas particelle
   ======================== */
function initParticles() {
  const canvas = document.getElementById('heroCanvas');
  if (!canvas) return;

  /* Non avviare su dispositivi a basse prestazioni */
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const ctx = canvas.getContext('2d');
  const particles = [];
  const COUNT = window.innerWidth < 768 ? 40 : 80;

  function resize() {
    canvas.width  = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
  }
  resize();
  window.addEventListener('resize', resize, { passive: true });

  class Particle {
    constructor() { this.reset(); }
    reset() {
      this.x  = Math.random() * canvas.width;
      this.y  = Math.random() * canvas.height;
      this.vx = (Math.random() - 0.5) * 0.4;
      this.vy = (Math.random() - 0.5) * 0.4;
      this.r  = Math.random() * 1.5 + 0.5;
      this.alpha = Math.random() * 0.5 + 0.1;
    }
    update() {
      this.x += this.vx;
      this.y += this.vy;
      if (this.x < 0 || this.x > canvas.width ||
          this.y < 0 || this.y > canvas.height) this.reset();
    }
    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(96, 165, 250, ${this.alpha})`;
      ctx.fill();
    }
  }

  for (let i = 0; i < COUNT; i++) particles.push(new Particle());

  /* Linee di connessione */
  function drawConnections() {
    const maxDist = 120;
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < maxDist) {
          const alpha = (1 - dist / maxDist) * 0.15;
          ctx.beginPath();
          ctx.strokeStyle = `rgba(96, 165, 250, ${alpha})`;
          ctx.lineWidth = 0.5;
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.stroke();
        }
      }
    }
  }

  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach(p => { p.update(); p.draw(); });
    drawConnections();
    requestAnimationFrame(animate);
  }
  animate();
}

/* ========================
   ANIMAZIONE STAT COUNTER
   ======================== */
function animateCounters() {
  const stats = document.querySelectorAll('.stat-number[data-target]');
  stats.forEach((stat) => {
    const target = parseInt(stat.dataset.target, 10);
    const duration = 1500;
    const start = performance.now();

    function update(now) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      stat.textContent = Math.floor(eased * target);
      if (progress < 1) requestAnimationFrame(update);
    }
    requestAnimationFrame(update);
  });
}

/* ========================
   SCROLL REVEAL (Intersection Observer)
   ======================== */
function initScrollReveal() {
  const elements = document.querySelectorAll('.reveal-up, .reveal-left, .reveal-right');

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');

          /* Anima i counter solo quando la hero è visibile */
          if (entry.target.closest('#hero')) {
            animateCounters();
          }
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: '0px 0px -60px 0px' }
  );

  elements.forEach((el) => observer.observe(el));
}

function startEntryAnimations() {
  /* Forza la visibilità degli elementi hero al caricamento */
  document.querySelectorAll('#hero .reveal-up').forEach((el) => {
    el.classList.add('visible');
  });
  animateCounters();
}

/* ========================
   PORTFOLIO: filtri
   ======================== */
function initPortfolioFilters() {
  const filterBtns = document.querySelectorAll('.filter-btn');
  const cards      = document.querySelectorAll('.project-card');

  filterBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      const filter = btn.dataset.filter;

      /* Aggiorna stato bottoni */
      filterBtns.forEach((b) => {
        b.classList.remove('active');
        b.setAttribute('aria-pressed', 'false');
      });
      btn.classList.add('active');
      btn.setAttribute('aria-pressed', 'true');

      /* Filtra card */
      cards.forEach((card) => {
        const categories = card.dataset.category || 'all';
        const match = filter === 'all' || categories.split(' ').includes(filter);
        card.classList.toggle('filtered-out', !match);
        card.setAttribute('aria-hidden', String(!match));
      });
    });
  });
}

/* ========================
   FORM CONTATTI: validazione + sanitizzazione + invio
   ======================== */
function initContactForm() {
  const form      = document.getElementById('contactForm');
  const submitBtn = document.getElementById('submitBtn');
  const feedback  = document.getElementById('formFeedback');
  const charCount = document.getElementById('charCount');
  const msgField  = document.getElementById('contactMessage');
  const hpField   = document.getElementById('hp_website');

  if (!form) return;

  /* Contatore caratteri textarea */
  if (msgField && charCount) {
    msgField.addEventListener('input', () => {
      const len = msgField.value.length;
      charCount.textContent = `${len} / 2000`;
      charCount.style.color = len > 1800 ? 'var(--warning)' : '';
    });
  }

  /* Validazione campo in tempo reale */
  const fields = {
    contactName:    { errorId: 'nameError',    validate: validateName },
    contactEmail:   { errorId: 'emailError',   validate: validateEmail },
    contactMessage: { errorId: 'messageError', validate: validateMessage },
  };

  Object.entries(fields).forEach(([id, config]) => {
    const el = document.getElementById(id);
    if (!el) return;
    el.addEventListener('blur', () => {
      const error = config.validate(el.value);
      showFieldError(el, document.getElementById(config.errorId), error);
    });
    el.addEventListener('input', () => {
      el.classList.remove('error');
      const errEl = document.getElementById(config.errorId);
      if (errEl) errEl.textContent = '';
    });
  });

  /* Validatori singoli */
  function validateName(val) {
    const trimmed = val.trim();
    if (!trimmed) return 'Il nome è obbligatorio.';
    if (trimmed.length < 2) return 'Il nome deve avere almeno 2 caratteri.';
    if (trimmed.length > 60) return 'Il nome non può superare 60 caratteri.';
    if (!/^[\p{L}\p{M}'\- ]+$/u.test(trimmed)) return 'Il nome contiene caratteri non validi.';
    return null;
  }

  function validateEmail(val) {
    const trimmed = val.trim();
    if (!trimmed) return "L'email è obbligatoria.";
    if (!isValidEmail(trimmed)) return "Inserisci un indirizzo email valido.";
    return null;
  }

  function validateMessage(val) {
    const trimmed = val.trim();
    if (!trimmed) return 'Il messaggio è obbligatorio.';
    if (trimmed.length < 20) return 'Il messaggio deve contenere almeno 20 caratteri.';
    if (trimmed.length > 2000) return 'Il messaggio non può superare 2000 caratteri.';
    return null;
  }

  function showFieldError(input, errorEl, message) {
    if (!errorEl) return;
    if (message) {
      input.classList.add('error');
      errorEl.textContent = message;
    } else {
      input.classList.remove('error');
      errorEl.textContent = '';
    }
  }

  /* Submit */
  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    /* Honeypot anti-spam: se compilato è un bot */
    if (hpField && hpField.value.trim() !== '') {
      return;
    }

    /* Raccoglie e sanitizza i valori */
    const nameVal    = document.getElementById('contactName')?.value ?? '';
    const emailVal   = document.getElementById('contactEmail')?.value ?? '';
    const subjectVal = document.getElementById('contactSubject')?.value ?? '';
    const msgVal     = msgField?.value ?? '';

    /* Valida tutti i campi */
    const errors = {
      name:    validateName(nameVal),
      email:   validateEmail(emailVal),
      message: validateMessage(msgVal),
    };

    let hasError = false;
    if (errors.name) {
      showFieldError(
        document.getElementById('contactName'),
        document.getElementById('nameError'),
        errors.name
      );
      hasError = true;
    }
    if (errors.email) {
      showFieldError(
        document.getElementById('contactEmail'),
        document.getElementById('emailError'),
        errors.email
      );
      hasError = true;
    }
    if (errors.message) {
      showFieldError(msgField, document.getElementById('messageError'), errors.message);
      hasError = true;
    }

    if (hasError) {
      form.querySelector('.error')?.focus();
      return;
    }

    /* Sanitizza prima dell'invio (XSS prevention) */
    const payload = {
      name:    sanitizeString(nameVal),
      email:   sanitizeString(emailVal),
      subject: sanitizeString(subjectVal),
      message: sanitizeString(msgVal),
    };

    /* UI: loading state */
    submitBtn.classList.add('loading');
    if (feedback) {
      feedback.className = 'form-feedback';
      feedback.textContent = '';
    }

    try {
      const response = await fetch(form.action, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        showFeedback('success', '✓ Messaggio inviato! Ti rispondo entro 24 ore.');
        form.reset();
        if (charCount) charCount.textContent = '0 / 2000';
        showToast('Messaggio inviato con successo!', 'success');
      } else {
        const data = await response.json().catch(() => ({}));
        const msg = data?.error || 'Errore nell\'invio. Prova via email direttamente.';
        showFeedback('error', `✗ ${msg}`);
        showToast('Errore nell\'invio. Riprova.', 'error');
      }
    } catch {
      showFeedback('error', '✗ Errore di rete. Controlla la connessione e riprova.');
      showToast('Errore di rete.', 'error');
    } finally {
      submitBtn.classList.remove('loading');
    }
  });

  function showFeedback(type, message) {
    if (!feedback) return;
    feedback.className = `form-feedback ${type}`;
    feedback.textContent = message;
    feedback.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }
}

/* ========================
   TOAST NOTIFICATION
   ======================== */
function showToast(message, type = 'success') {
  const container = document.getElementById('toastContainer');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.textContent = message;
  toast.setAttribute('role', 'status');
  container.appendChild(toast);

  /* Trigger animazione */
  requestAnimationFrame(() => {
    requestAnimationFrame(() => toast.classList.add('show'));
  });

  setTimeout(() => {
    toast.classList.remove('show');
    toast.addEventListener('transitionend', () => toast.remove(), { once: true });
  }, 4000);
}

/* ========================
   SMOOTH SCROLL (Link interni)
   ======================== */
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', (e) => {
      const targetId = anchor.getAttribute('href');
      if (targetId === '#') return;

      const target = document.querySelector(targetId);
      if (!target) return;

      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });

      /* Focus management per accessibilità */
      target.setAttribute('tabindex', '-1');
      target.focus({ preventScroll: true });
    });
  });
}

/* ========================
   ANNO CORRENTE NEL FOOTER + ETÀ DINAMICA
   ======================== */
function initCurrentYear() {
  const el = document.getElementById('currentYear');
  if (el) el.textContent = new Date().getFullYear();
}

function initDynamicAge() {
  const el = document.getElementById('dynamicAge');
  if (!el) return;
  const birth = new Date(2003, 10, 24); // 24 novembre 2003 (mese 0-based)
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const hasBirthdayPassed =
    today.getMonth() > birth.getMonth() ||
    (today.getMonth() === birth.getMonth() && today.getDate() >= birth.getDate());
  if (!hasBirthdayPassed) age--;
  el.textContent = `${age} anni`;
}

/* ========================
   DEMO LINK: tooltip "prossimamente"
   ======================== */
function initDemoLinks() {
  document.querySelectorAll('[data-coming-soon="true"]').forEach((link) => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      showToast('Demo in arrivo prossimamente! 🚀', 'success');
    });
  });
}

/* ========================
   PERFORMANCE: lazy load immagini
   ======================== */
function initLazyLoad() {
  if ('IntersectionObserver' in window) {
    const images = document.querySelectorAll('img[loading="lazy"]');
    const imgObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const img = entry.target;
          if (img.dataset.src) img.src = img.dataset.src;
          imgObserver.unobserve(img);
        }
      });
    });
    images.forEach((img) => imgObserver.observe(img));
  }
}

/* ========================
   INIT PRINCIPALE
   ======================== */
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

/* Avvia quando il DOM è pronto */
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
