/* ── Nav gold price (server cache + TGJU fallback) ─ */
const TGJU_GOLD18_WIDGET = 'https://api.tgju.org/v1/widget/tmp?keys=137121';
const TGJU_GOLD18_AJAX = [
  'https://call2.tgju.org/ajax.json',
  'https://call5.tgju.org/ajax.json',
];
const TGJU_GOLD18_URL = 'https://www.tgju.org/profile/geram18';
const GOLD_PRICE_REFRESH_MS = 5 * 60 * 1000;

function formatGoldTickerToman(toman) {
  const value = Number(toman);
  if (!Number.isFinite(value) || value <= 0) return null;
  return value.toLocaleString('fa-IR') + ' تومان';
}

function parseTgjuWidgetPrice(data) {
  const indicator = data?.response?.indicators?.[0];
  if (!indicator?.p) return null;
  const rial = Number(String(indicator.p).replace(/,/g, ''));
  if (!Number.isFinite(rial) || rial <= 0) return null;
  return formatGoldTickerToman(Math.round(rial / 10));
}

function parseTgjuAjaxPrice(data) {
  const p = data?.current?.geram18?.p;
  if (p == null) return null;
  const rial = Number(String(p).replace(/,/g, ''));
  if (!Number.isFinite(rial) || rial <= 0) return null;
  return formatGoldTickerToman(Math.round(rial / 10));
}

function parseApiGoldPrice(data) {
  const g = data?.prices?.geram18;
  if (!g) return null;
  if (g.toman != null) return formatGoldTickerToman(g.toman);
  if (g.rial != null) return formatGoldTickerToman(Math.round(Number(g.rial) / 10));
  return null;
}

const GOLD_PRICE_FETCH_MS = 8000;

async function fetchWithTimeout(url, options = {}, ms = GOLD_PRICE_FETCH_MS) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), ms);
  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

async function fetchGoldPriceFromApi() {
  const base = typeof resolveApiBase === 'function' ? resolveApiBase() : '';
  const res = await fetchWithTimeout(base + '/api/gold-price', {
    credentials: typeof apiCredentials === 'function' ? apiCredentials() : 'same-origin',
    cache: 'no-store',
  });
  if (!res.ok) throw new Error('HTTP ' + res.status);
  const data = await res.json();
  const formatted = parseApiGoldPrice(data);
  if (!formatted) throw new Error('missing price');
  return formatted;
}

async function fetchGoldPriceFromTgjuWidget() {
  const res = await fetchWithTimeout(TGJU_GOLD18_WIDGET, { cache: 'no-store' });
  if (!res.ok) throw new Error('HTTP ' + res.status);
  const data = await res.json();
  const formatted = parseTgjuWidgetPrice(data);
  if (!formatted) throw new Error('missing price');
  return formatted;
}

async function fetchGoldPriceFromTgjuAjax() {
  let lastError;
  for (const url of TGJU_GOLD18_AJAX) {
    try {
      const res = await fetchWithTimeout(url, { cache: 'no-store' });
      if (!res.ok) throw new Error('HTTP ' + res.status);
      const data = await res.json();
      const formatted = parseTgjuAjaxPrice(data);
      if (!formatted) throw new Error('missing price');
      return formatted;
    } catch (err) {
      lastError = err;
    }
  }
  throw lastError || new Error('TGJU ajax unavailable');
}

async function fetchNavGoldPriceText() {
  const sources = [
    fetchGoldPriceFromApi,
    fetchGoldPriceFromTgjuWidget,
    fetchGoldPriceFromTgjuAjax,
  ];
  let lastError;
  for (const load of sources) {
    try {
      const text = await load();
      if (text) return text;
    } catch (err) {
      lastError = err;
    }
  }
  throw lastError || new Error('gold price unavailable');
}

function getOrCreateNavCenter(nav) {
  let center = document.getElementById('nav-center');
  if (!center) {
    center = document.createElement('div');
    center.id = 'nav-center';
    center.className = 'nav-center';
    const toggle = nav.querySelector('.nav-toggle');
    if (toggle) nav.insertBefore(center, toggle);
    else nav.appendChild(center);
  }
  return center;
}

function initNavGoldPrice() {
  const nav = document.getElementById('nav');
  if (!nav) return;

  const center = getOrCreateNavCenter(nav);
  let ticker = document.getElementById('nav-gold-ticker');
  if (!ticker) {
    ticker = document.createElement('a');
    ticker.id = 'nav-gold-ticker';
    ticker.className = 'nav-gold-ticker is-loading';
    ticker.href = TGJU_GOLD18_URL;
    ticker.target = '_blank';
    ticker.rel = 'noopener noreferrer';
    ticker.title = 'قیمت لحظه‌ای طلای ۱۸ عیار — منبع: tgju.org';
    ticker.setAttribute('aria-label', 'قیمت لحظه‌ای طلای ۱۸ عیار از tgju.org');
    ticker.innerHTML = `
      <span class="nav-gold-label">طلای ۱۸</span>
      <span class="nav-gold-value" aria-live="polite">در حال بارگذاری…</span>`;
    center.appendChild(ticker);
  } else if (ticker.parentElement !== center) {
    center.appendChild(ticker);
  }

  const valueEl = ticker.querySelector('.nav-gold-value');
  if (!valueEl) return;

  if (ticker._goldRefreshTimer) {
    refreshGoldPrice();
    return;
  }

  let refreshing = false;

  async function refreshGoldPrice() {
    if (refreshing) return;
    refreshing = true;
    ticker.classList.add('is-loading');
    ticker.classList.remove('is-error');
    try {
      valueEl.textContent = await fetchNavGoldPriceText();
      ticker.classList.remove('is-error');
    } catch {
      valueEl.textContent = window.innerWidth <= 480 ? '—' : 'قیمت در دسترس نیست';
      ticker.classList.add('is-error');
    } finally {
      ticker.classList.remove('is-loading');
      refreshing = false;
    }
  }

  ticker._goldRefreshFn = refreshGoldPrice;
  refreshGoldPrice();
  ticker._goldRefreshTimer = setInterval(refreshGoldPrice, GOLD_PRICE_REFRESH_MS);
}

function refreshNavGoldPrice() {
  const ticker = document.getElementById('nav-gold-ticker');
  if (ticker?._goldRefreshFn) ticker._goldRefreshFn();
  else initNavGoldPrice();
}

function bootNavGoldPrice() {
  if (!document.getElementById('nav')) return;
  initNavGoldPrice();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', bootNavGoldPrice);
} else {
  bootNavGoldPrice();
}

window.addEventListener('load', function () {
  refreshNavGoldPrice();
});
