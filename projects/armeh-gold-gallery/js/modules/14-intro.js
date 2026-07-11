/* ── Intro splash (homepage) ──────────────── */
function dismissIntroSplash() {
  const splash = document.getElementById('introSplash');
  if (!splash || splash.classList.contains('gone')) return;
  splash.classList.add('gone');
  document.documentElement.style.overflow = '';
  document.querySelectorAll('.reveal:not(.visible)').forEach(el => el.classList.add('visible'));
}

function initIntroSplash() {
  if (window.__armehSplashInit) return;
  window.__armehSplashInit = true;

  const splash = document.getElementById('introSplash');
  if (!splash) return;

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || sessionStorage.getItem('armeh_intro_seen')) {
    dismissIntroSplash();
    sessionStorage.setItem('armeh_intro_seen', '1');
    return;
  }

  document.documentElement.style.overflow = 'hidden';
  const failSafe = setTimeout(() => {
    dismissIntroSplash();
    sessionStorage.setItem('armeh_intro_seen', '1');
  }, 5000);

  setTimeout(() => {
    splash.style.transition = 'opacity 0.8s ease';
    splash.style.opacity = '0';
    setTimeout(() => {
      clearTimeout(failSafe);
      dismissIntroSplash();
      sessionStorage.setItem('armeh_intro_seen', '1');
    }, 850);
  }, 2600);
}

function initRevealAnimations() {
  if (window.__armehRevealInit) return;
  window.__armehRevealInit = true;

  const obs = new IntersectionObserver((entries) => {
    entries.forEach((e, i) => {
      if (!e.isIntersecting) return;
      setTimeout(() => e.target.classList.add('visible'), i * 60);
      obs.unobserve(e.target);
    });
  }, { threshold: 0.08 });

  document.querySelectorAll('.reveal').forEach(el => obs.observe(el));

  setTimeout(() => {
    document.querySelectorAll('.reveal:not(.visible)').forEach(el => el.classList.add('visible'));
  }, 2500);
}

