// Lenis Smooth Scroll Initialization
const lenis = typeof Lenis !== 'undefined' ? new Lenis({
  lerp: 0.08,
  smoothWheel: true,
}) : null;

if (lenis) {
  function raf(time) {
    lenis.raf(time);
    requestAnimationFrame(raf);
  }
  requestAnimationFrame(raf);
}

const body = document.body;
const header = document.querySelector('.site-header');
const loader = document.querySelector('.loader');
const navToggle = document.querySelector('.nav__toggle');
const navLinks = document.querySelector('.nav__links');
const themeToggle = document.querySelector('.theme-toggle');
const cursorDot = document.querySelector('.cursor-dot');
const cursorRing = document.querySelector('.cursor-ring');
const parallaxTargets = document.querySelectorAll('[data-parallax]');
const timeline = document.querySelector('.timeline');
const contactForm = document.querySelector('.contact-form');
const formSuccess = document.querySelector('.form-success');

function setTheme(theme, persist = true) {
  document.documentElement.dataset.theme = theme;
  if (persist) {
    try {
      localStorage.setItem('void-theme', theme);
    } catch {
      /* Theme still changes even when storage is unavailable. */
    }
  }
  if (themeToggle) {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    themeToggle.setAttribute('aria-label', `Switch to ${nextTheme} mode`);
    themeToggle.setAttribute('aria-pressed', String(theme === 'light'));
  }
  const themeMeta = document.querySelector('meta[name="theme-color"]');
  if (themeMeta) themeMeta.setAttribute('content', theme === 'light' ? '#F5F7FB' : '#050709');
}

setTheme(document.documentElement.dataset.theme || 'dark', false);

body.classList.add('loading');

window.addEventListener('load', () => {
  window.setTimeout(() => {
    loader.classList.add('is-hidden');
    body.classList.remove('loading');
    if (window.location.hash) {
      const target = document.querySelector(window.location.hash);
      target?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, 2500);
});

const mouse = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
const ring = { x: mouse.x, y: mouse.y };

function animateCursor() {
  ring.x += (mouse.x - ring.x) * 0.16;
  ring.y += (mouse.y - ring.y) * 0.16;
  if (cursorDot && cursorRing) {
    cursorDot.style.transform = `translate(${mouse.x}px, ${mouse.y}px) translate(-50%, -50%)`;
    cursorRing.style.transform = `translate(${ring.x}px, ${ring.y}px) translate(-50%, -50%)`;
  }
  requestAnimationFrame(animateCursor);
}

if (window.matchMedia('(pointer: fine)').matches) {
  window.addEventListener('mousemove', (event) => {
    mouse.x = event.clientX;
    mouse.y = event.clientY;

    const xRatio = (event.clientX / window.innerWidth - 0.5) * 2;
    const yRatio = (event.clientY / window.innerHeight - 0.5) * 2;

    parallaxTargets.forEach((element) => {
      const depth = Number(element.dataset.parallax) || 0.03;
      const scale = element.classList.contains('hero__bg') ? 'scale(1.04) ' : '';
      element.style.transform = `${scale}translate(${xRatio * depth * 100}px, ${yRatio * depth * 100}px)`;
    });
  });
  animateCursor();

  document.querySelectorAll('a, button, .magnetic, .project-card, .service-row, .team-card, .testimonial-card, .workflow-step').forEach((element) => {
    element.addEventListener('mouseenter', () => cursorRing.classList.add('is-hovering'));
    element.addEventListener('mouseleave', () => cursorRing.classList.remove('is-hovering'));
  });

  document.querySelectorAll('.magnetic').forEach((btn) => {
    btn.addEventListener('mousemove', (e) => {
      const rect = btn.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      btn.style.transform = `translate(${x * 0.3}px, ${y * 0.3}px)`;
    });
    btn.addEventListener('mouseleave', () => {
      btn.style.transform = '';
    });
  });
}

themeToggle?.addEventListener('click', (event) => {
  const nextTheme = document.documentElement.dataset.theme === 'light' ? 'dark' : 'light';
  const rect = themeToggle.getBoundingClientRect();
  body.style.setProperty('--theme-x', `${rect.left + rect.width / 2}px`);
  body.style.setProperty('--theme-y', `${rect.top + rect.height / 2}px`);
  body.classList.add('theme-transition');
  setTheme(nextTheme);
  window.setTimeout(() => body.classList.remove('theme-transition'), 680);
  event.currentTarget.blur();
});

function updateHeader() {
  header.classList.toggle('is-scrolled', window.scrollY > 24);
}

window.addEventListener('scroll', updateHeader, { passive: true });
updateHeader();

navToggle.addEventListener('click', () => {
  const isOpen = navLinks.classList.toggle('is-open');
  navToggle.classList.toggle('is-active', isOpen);
  navToggle.setAttribute('aria-expanded', String(isOpen));
  navToggle.setAttribute('aria-label', isOpen ? 'Close menu' : 'Open menu');
  body.classList.toggle('menu-open', isOpen);
});

window.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && navLinks.classList.contains('is-open')) {
    navLinks.classList.remove('is-open');
    navToggle.classList.remove('is-active');
    navToggle.setAttribute('aria-expanded', 'false');
    navToggle.setAttribute('aria-label', 'Open menu');
    body.classList.remove('menu-open');
  }
});

document.querySelectorAll('a[href^="#"]').forEach((link) => {
  link.addEventListener('click', (event) => {
    const target = document.querySelector(link.getAttribute('href'));
    if (!target) return;
    event.preventDefault();
    navLinks.classList.remove('is-open');
    navToggle.classList.remove('is-active');
    navToggle.setAttribute('aria-expanded', 'false');
    body.classList.remove('menu-open');
    if (lenis) {
      lenis.scrollTo(target, { offset: 0 });
    } else {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('is-visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.1, rootMargin: '0px 0px -60px' });

document.querySelectorAll('.reveal, [data-reveal]').forEach((element, index) => {
  if (element.classList.contains('team-card')) {
    const teamIndex = [...element.parentElement.children].indexOf(element);
    element.style.transitionDelay = `${teamIndex * 120}ms`;
  } else {
    element.style.transitionDelay = `${Math.min(index % 4, 3) * 70}ms`;
  }
  revealObserver.observe(element);
});

function animateNumber(element) {
  const target = Number(element.dataset.count);
  const duration = 1500;
  const startTime = performance.now();

  function tick(now) {
    const progress = Math.min((now - startTime) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    element.textContent = Math.round(target * eased);
    if (progress < 1) requestAnimationFrame(tick);
  }

  requestAnimationFrame(tick);
}

const counterObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      animateNumber(entry.target);
      counterObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.55 });

document.querySelectorAll('[data-count]').forEach((counter) => counterObserver.observe(counter));

function updateTimeline() {
  if (!timeline) return;
  const rect = timeline.getBoundingClientRect();
  const viewport = window.innerHeight || document.documentElement.clientHeight;
  const progress = Math.min(Math.max((viewport - rect.top) / (viewport + rect.height), 0), 1);
  timeline.style.setProperty('--progress', `${progress * 100}%`);
}

window.addEventListener('scroll', updateTimeline, { passive: true });
window.addEventListener('resize', updateTimeline);
updateTimeline();

function setFieldState(field, message = '') {
  const row = field.closest('.form-row');
  const error = document.querySelector(`[data-error-for="${field.name}"]`);
  if (!row || !error) return;
  row.classList.toggle('is-invalid', Boolean(message));
  error.textContent = message;
}

function validateField(field) {
  const value = field.value.trim();

  if (field.name === 'fullName') {
    if (!value) return 'Nama wajib diisi.';
    if (value.length < 3) return 'Nama minimal 3 karakter.';
  }

  if (field.name === 'email') {
    if (!value) return 'Email wajib diisi.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value)) return 'Format email belum valid.';
  }

  if (field.name === 'phone') {
    if (value && !/^\d+$/.test(value)) return 'Nomor telepon hanya boleh angka.';
  }

  if (field.name === 'message') {
    if (!value) return 'Pesan wajib diisi.';
    if (value.length < 20) return 'Pesan minimal 20 karakter.';
  }

  return '';
}

if (contactForm) {
  const fields = [...contactForm.querySelectorAll('input, textarea')];

  fields.forEach((field) => {
    const eventName = field.name === 'phone' ? 'input' : 'blur';
    field.addEventListener(eventName, () => {
      if (field.name === 'phone') field.value = field.value.replace(/[^\d]/g, '');
      setFieldState(field, validateField(field));
    });

    field.addEventListener('input', () => {
      if (field.closest('.form-row')?.classList.contains('is-invalid')) {
        if (field.name === 'phone') field.value = field.value.replace(/[^\d]/g, '');
        setFieldState(field, validateField(field));
      }
    });
  });

  contactForm.addEventListener('submit', (event) => {
    event.preventDefault();
    let isValid = true;

    fields.forEach((field) => {
      const message = validateField(field);
      setFieldState(field, message);
      if (message) isValid = false;
    });

    if (!isValid) {
      const firstInvalid = contactForm.querySelector('.form-row.is-invalid input, .form-row.is-invalid textarea');
      firstInvalid?.focus();
      return;
    }

    contactForm.classList.add('is-hidden');
    window.setTimeout(() => {
      contactForm.style.display = 'none';
      formSuccess?.classList.add('is-visible');
    }, 360);
  });
}
