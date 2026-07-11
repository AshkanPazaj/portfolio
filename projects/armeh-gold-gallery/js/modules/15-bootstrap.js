/* ── Bootstrap ───────────────────────────── */
function armehBoot() {
  if (window.__armehBootDone) return;
  window.__armehBootDone = true;

  if (!document.getElementById('introSplash') || sessionStorage.getItem('armeh_intro_seen')) {
    document.documentElement.style.overflow = '';
  }
  initIntroSplash();
  initRevealAnimations();
  initNavSearch();
  initMobileNav();
  initProductDetail();
  initFooterInstagram();

  const nav = document.getElementById('nav');
  if (nav) window.addEventListener('scroll', () => nav.classList.toggle('scrolled', scrollY > 10), { passive: true });

  document.querySelectorAll('#year, .footer-year').forEach(el => el.textContent = new Date().getFullYear());

  function bootNavAndGold() {
    initNav();
    refreshNavGoldPrice();
  }

  bootNavAndGold();

  if (window.armehReady) {
    window.armehReady.then(function () {
      bootNavAndGold();
      Cart.updateBadge();
      const collMatch = window.location.pathname.match(/\/collections\/(\w+)\.html$/i);
      if (collMatch) renderCollectionPage(collMatch[1]);
      else if (/\/women\.html$/i.test(window.location.pathname)) renderGenderPage('women');
      else if (/\/men\.html$/i.test(window.location.pathname)) renderGenderPage('men');
    });
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', armehBoot);
} else {
  armehBoot();
}
