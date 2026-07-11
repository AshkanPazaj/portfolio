/* ═══════════════════════════════════════════
   ARMEH GOLD — script loader
   Prefers armeh.bundle.js (1 request); falls back to modules/.
   Append ?dev=1 to armeh.js to force per-module loading.
   ═══════════════════════════════════════════ */
(function () {
  const script = document.currentScript;
  const base = script && script.src
    ? script.src.replace(/\/[^/?]+(\?.*)?$/, '')
    : 'js';
  const devMode = script && /[?&]dev=1(?:&|$)/.test(script.src);

  let resolveReady;
  window.armehReady = new Promise(function (resolve) {
    resolveReady = resolve;
  });

  function finishAppLoad() {
    if (typeof initBackend !== 'function') {
      resolveReady();
      return;
    }
    initBackend().then(
      (value) => resolveReady(value),
      (err) => {
        console.error('Armeh: backend init failed', err);
        resolveReady();
      }
    );
  }

  const modules = [
    'modules/01-api.js',
    'modules/02-auth.js',
    'modules/03-cart.js',
    'modules/05-products.js',
    'modules/06-product-display.js',
    'modules/04-product-specs.js',
    'modules/08-collection-actions.js',
    'modules/07-nav.js',
    'modules/09-nav-init.js',
    'modules/10-product-modal.js',
    'modules/11-gold-price.js',
    'modules/12-search.js',
    'modules/13-footer.js',
    'modules/14-intro.js',
    'modules/15-bootstrap.js',
  ];

  function inject(src, onload, onerror) {
    const el = document.createElement('script');
    el.src = src;
    el.async = false;
    el.onload = onload;
    el.onerror = onerror;
    (document.body || document.head).appendChild(el);
  }

  function loadSequential(index) {
    if (index >= modules.length) {
      finishAppLoad();
      return;
    }
    inject(
      base + '/' + modules[index],
      () => loadSequential(index + 1),
      () => console.error('Armeh: failed to load', base + '/' + modules[index])
    );
  }

  if (devMode) {
    loadSequential(0);
    return;
  }

  inject(
    base + '/armeh.bundle.js?v=23',
    finishAppLoad,
    () => {
      console.warn('Armeh: bundle missing, loading modules individually');
      loadSequential(0);
    }
  );
})();
