/* ============================================
   Ashkan Pazaj — Portfolio Scripts
   ============================================ */

(() => {
  'use strict';

  // ----- Current year in footer -----
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // ----- Nav scroll effect -----
  const nav = document.querySelector('.nav');
  const onScroll = () => {
    if (window.scrollY > 20) nav.classList.add('scrolled');
    else nav.classList.remove('scrolled');
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // ----- Mobile nav toggle -----
  const toggle = document.querySelector('.nav-toggle');
  const navLinks = document.querySelector('.nav-links');
  if (toggle && navLinks) {
    toggle.addEventListener('click', () => {
      const isOpen = navLinks.classList.toggle('open');
      toggle.setAttribute('aria-expanded', isOpen);
      if (isOpen) {
        navLinks.style.display = 'flex';
        navLinks.style.position = 'absolute';
        navLinks.style.top = '100%';
        navLinks.style.left = '0';
        navLinks.style.right = '0';
        navLinks.style.flexDirection = 'column';
        navLinks.style.padding = '20px';
        navLinks.style.background = 'rgba(10, 10, 15, 0.95)';
        navLinks.style.backdropFilter = 'blur(20px)';
        navLinks.style.borderBottom = '1px solid rgba(255, 255, 255, 0.08)';
      } else {
        navLinks.style.display = '';
      }
    });
    // Close on link click
    navLinks.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', () => {
        navLinks.classList.remove('open');
        navLinks.style.display = '';
      });
    });
  }

  // ----- Reveal-on-scroll (fades in/out at both top and bottom edges) -----
  const revealEls = document.querySelectorAll('.reveal');
  const REVEAL_INSET = 0.24;

  function updateReveal(el) {
    const vh = window.innerHeight || document.documentElement.clientHeight;
    const inset = vh * REVEAL_INSET;
    const rect = el.getBoundingClientRect();
    const inZone = rect.bottom > inset && rect.top < vh - inset;

    if (inZone) {
      el.classList.add('visible');
      el.classList.remove('reveal-hide-up', 'reveal-hide-down');
      return;
    }

    el.classList.remove('visible');
    const center = rect.top + rect.height * 0.5;

    if (center < vh * 0.5) {
      el.classList.add('reveal-hide-up');
      el.classList.remove('reveal-hide-down');
    } else {
      el.classList.add('reveal-hide-down');
      el.classList.remove('reveal-hide-up');
    }
  }

  let revealTicking = false;
  function updateAllReveals() {
    revealEls.forEach(updateReveal);
    revealTicking = false;
  }

  function queueRevealUpdate() {
    if (revealTicking) return;
    revealTicking = true;
    requestAnimationFrame(updateAllReveals);
  }

  window.addEventListener('scroll', queueRevealUpdate, { passive: true });
  window.addEventListener('resize', queueRevealUpdate, { passive: true });
  queueRevealUpdate();

  // ----- Animated stat counters -----
  const stats = document.querySelectorAll('.stat-num');
  const statIo = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateCount(entry.target);
        statIo.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });
  stats.forEach(s => statIo.observe(s));

  function animateCount(el) {
    const target = parseInt(el.dataset.target, 10) || 0;
    const suffix = el.dataset.suffix || '+';
    const duration = 1600;
    const start = performance.now();

    const step = (now) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const value = Math.round(target * eased);
      el.textContent = value + (progress === 1 ? suffix : '');
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }

  // ----- Smooth-scroll offset for fixed nav -----
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', function (e) {
      const targetId = this.getAttribute('href');
      if (targetId.length <= 1) return;
      const target = document.querySelector(targetId);
      if (!target) return;
      e.preventDefault();
      const navHeight = nav ? nav.offsetHeight : 0;
      const top = target.getBoundingClientRect().top + window.scrollY - navHeight - 10;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });

  // ----- Rotating headline (hospitality <-> programming) -----
  const rotator = document.querySelector('.rotator');
  if (rotator) {
    const phrases = [
      { text: 'I lead floors',   tone: 'warm' },
      { text: 'I write code',    tone: 'cool' },
      { text: 'I run the rush',  tone: 'warm' },
      { text: 'I ship features', tone: 'cool' },
      { text: 'I coach teams',   tone: 'warm' },
      { text: 'I squash bugs',   tone: 'cool' },
      { text: 'I open doors',    tone: 'warm' },
      { text: 'I learn fast',    tone: 'cool' },
    ];

    let i = 0;
    const swap = () => {
      const current = rotator.querySelector('.rotator-text');
      current.classList.add('rot-out');
      setTimeout(() => {
        i = (i + 1) % phrases.length;
        const next = phrases[i];
        rotator.innerHTML =
          `<span class="rotator-sizer" aria-hidden="true">I ship features</span>` +
          `<span class="rotator-text rot-${next.tone}">${next.text}</span>`;
      }, 320);
    };
    setInterval(swap, 2600);
  }

  // ----- Subtle parallax for hero photo -----
  const photoFrame = document.querySelector('.photo-frame');
  if (photoFrame && window.matchMedia('(pointer: fine)').matches) {
    const heroPhoto = document.querySelector('.hero-photo');
    heroPhoto.addEventListener('mousemove', (e) => {
      const rect = heroPhoto.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      photoFrame.style.transform = `perspective(1000px) rotateY(${x * 6}deg) rotateX(${-y * 6}deg)`;
    });
    heroPhoto.addEventListener('mouseleave', () => {
      photoFrame.style.transform = '';
    });
  }
})();
