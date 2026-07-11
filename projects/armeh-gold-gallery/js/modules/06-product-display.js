/* ── Price helpers ────────────────────────── */
function escHtml(s) {
  if (s == null) return '';
  return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

function safeImageUrl(url) {
  if (!url) return '';
  const s = String(url).trim();
  if (/^data:image\/(jpeg|jpg|png|webp);base64,/i.test(s)) return s;
  if (/^\/[a-zA-Z0-9/_.-]+$/.test(s)) return s;
  return '';
}

function formatPrice(amount) {
  if (amount == null) return '—';
  return Number(amount).toLocaleString('fa-IR') + ' تومان';
}
function resolveItemPrice(item) {
  if (item.price != null) return item.price;
  const p = Products.getAllFlat().find(p => p.id === item.id);
  return p?.price || 0;
}

/* ── Image helper ─────────────────────────── */
function compressImage(file, maxW, quality) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = e => {
      const img = new Image();
      img.onload = () => {
        const scale = Math.min(1, maxW / img.width);
        const w = Math.round(img.width * scale);
        const h = Math.round(img.height * scale);
        const canvas = document.createElement('canvas');
        canvas.width = w; canvas.height = h;
        canvas.getContext('2d').drawImage(img, 0, 0, w, h);
        resolve(canvas.toDataURL('image/jpeg', quality));
      };
      img.onerror = reject;
      img.src = e.target.result;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

const PRODUCT_PLACEHOLDER_SVG = `<svg class="product-art-placeholder" width="90" height="90" viewBox="0 0 140 140" fill="none"><circle cx="70" cy="70" r="44" stroke="#114411" stroke-width="2.5"/><circle cx="70" cy="70" r="28" stroke="rgba(201,168,64,.4)" stroke-width="1.5" stroke-dasharray="4 3"/></svg>`;

function getProductImages(p) {
  if (!p) return [];
  let list = [];
  if (Array.isArray(p.images) && p.images.length) list = p.images.filter(Boolean);
  else if (p.thumbnail) list = [p.thumbnail];
  else if (p.image) list = [p.image];
  return list.map(safeImageUrl).filter(Boolean);
}

function getProductImageCount(p) {
  if (!p) return 0;
  if (p.imageCount != null) return Number(p.imageCount) || 0;
  return getProductImages(p).length;
}

function productImgTag(src, alt, lazy) {
  const attrs = lazy !== false
    ? ' loading="lazy" decoding="async" fetchpriority="low"'
    : ' fetchpriority="high" decoding="async"';
  return `<img src="${escHtml(src)}" alt="${escHtml(alt)}"${attrs} />`;
}

function getPrimaryImage(p) {
  return getProductImages(p)[0] || null;
}

function productArtHtml(p) {
  const img = getPrimaryImage(p);
  if (img) return productImgTag(img, p.name);
  return PRODUCT_PLACEHOLDER_SVG;
}

function buildProductCard(p, collectionKey) {
  const cartSvg = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></svg>`;
  const primary = getPrimaryImage(p);
  const art = primary
    ? productImgTag(primary, p.name)
    : PRODUCT_PLACEHOLDER_SVG;
  const imgCount = getProductImageCount(p);
  const badge = imgCount > 1 ? `<span class="product-img-count">${imgCount} تصویر</span>` : '';
  return `
    <div class="product-card reveal" data-id="${escHtml(p.id)}" data-collection="${escHtml(collectionKey)}" data-available="${p.available}">
      <div class="product-art product-art-clickable${primary ? ' has-image' : ''}" onclick="openProductDetail('${escHtml(p.id)}','${escHtml(collectionKey)}')" role="button" tabindex="0" aria-label="مشاهده جزئیات ${escHtml(p.name)}">${art}${badge}</div>
      <div class="product-body">
        <div class="product-name product-name-clickable" onclick="openProductDetail('${escHtml(p.id)}','${escHtml(collectionKey)}')" role="button" tabindex="0">${escHtml(p.name)}</div>
        <div class="product-material">${escHtml(p.material)} · ${escHtml(genderLabel(p.gender))}</div>
        <div class="product-price">${formatPrice(p.price)}</div>
        <button class="btn-add-cart" onclick="event.stopPropagation();addToCart(this,'${collectionKey}')">افزودن به سبد ${cartSvg}</button>
      </div>
    </div>`;
}

function getCollectionPagePath(collectionKey) {
  const inCollections = window.location.pathname.includes('/collections/');
  return inCollections ? `${collectionKey}.html` : `collections/${collectionKey}.html`;
}

function isOnCollectionPage(collectionKey) {
  return new RegExp(`/collections/${collectionKey}\\.html$`, 'i').test(window.location.pathname);
}

let productHighlightHandler = null;

function isProductHighlightDismissClick(e) {
  if (e.target.closest('.product-card.product-highlight')) return false;
  if (e.target.closest('#product-detail-overlay')) return false;
  if (e.target.closest('#search-panel')) return false;
  if (e.target.closest('#nav-search-btn')) return false;
  return true;
}

function setProductHighlight(card) {
  clearProductHighlight();
  if (!card) return;
  card.classList.add('visible', 'product-highlight');
  const dismiss = e => {
    if (!isProductHighlightDismissClick(e)) return;
    clearProductHighlight();
  };
  productHighlightHandler = dismiss;
  setTimeout(() => {
    document.addEventListener('click', dismiss);
    document.addEventListener('touchend', dismiss);
  }, 0);
}

function clearProductHighlight() {
  document.querySelectorAll('.product-card.product-highlight').forEach(c => c.classList.remove('product-highlight'));
  if (productHighlightHandler) {
    document.removeEventListener('click', productHighlightHandler);
    document.removeEventListener('touchend', productHighlightHandler);
    productHighlightHandler = null;
  }
}

function focusProductOnPage(productId, collectionKey) {
  const card = document.querySelector(`.product-card[data-id="${productId}"]`);
  if (card) {
    card.scrollIntoView({ behavior: 'smooth', block: 'center' });
    setProductHighlight(card);
  }
  openProductDetail(productId, collectionKey);
}

function navigateToProduct(productId, collectionKey) {
  const found = Products.findProduct(productId);
  if (!found) return;
  const coll = found.collection;
  const path = window.location.pathname;
  if (isOnCollectionPage(coll)) {
    focusProductOnPage(productId, coll);
    return;
  }
  if (/\/women\.html$/i.test(path) && matchesGenderFilter(found.product, 'women')) {
    focusProductOnPage(productId, coll);
    return;
  }
  if (/\/men\.html$/i.test(path) && matchesGenderFilter(found.product, 'men')) {
    focusProductOnPage(productId, coll);
    return;
  }
  window.location.href = `${getCollectionPagePath(coll)}?product=${encodeURIComponent(productId)}`;
}

function handleProductDeepLink(collectionKey) {
  const productId = new URLSearchParams(window.location.search).get('product');
  if (!productId) return;
  const found = Products.findProduct(productId);
  if (!found || found.collection !== collectionKey) return;
  setTimeout(() => {
    focusProductOnPage(productId, collectionKey);
    history.replaceState(null, '', window.location.pathname);
  }, 120);
}

const KARAT_OPTIONS = [18, 21, 24];
const KARAT_LABELS = { 18: '۱۸ عیار', 21: '۲۱ عیار', 24: '۲۴ عیار' };
const collFilterState = { karat: 'all', gender: 'all', nameSort: 'none', priceSort: 'none' };

function getProductsForPage(collectionKey) {
  if (genderPageMode) {
    return Products.getAllFlat().filter(p => matchesGenderFilter(p, genderPageMode));
  }
  return Products.getCollection(collectionKey);
}

function extractKarat(material) {
  const m = String(material || '');
  if (/۲۴|24/.test(m)) return 24;
  if (/۲۱|21/.test(m)) return 21;
  if (/۱۸|18/.test(m)) return 18;
  return null;
}

function filterAndSortProducts(products) {
  let list = [...products];
  if (collFilterState.karat !== 'all') {
    const k = Number(collFilterState.karat);
    list = list.filter(p => extractKarat(p.material) === k);
  }
  if (collFilterState.gender !== 'all') {
    list = list.filter(p => matchesGenderFilter(p, collFilterState.gender));
  }
  const { nameSort, priceSort } = collFilterState;
  if (nameSort !== 'none' || priceSort !== 'none') {
    list.sort((a, b) => {
      if (priceSort === 'low') {
        const byPrice = (Number(a.price) || 0) - (Number(b.price) || 0);
        if (byPrice !== 0) return byPrice;
      } else if (priceSort === 'high') {
        const byPrice = (Number(b.price) || 0) - (Number(a.price) || 0);
        if (byPrice !== 0) return byPrice;
      }
      if (nameSort === 'asc') return (a.name || '').localeCompare(b.name || '', 'fa');
      if (nameSort === 'desc') return (b.name || '').localeCompare(a.name || '', 'fa');
      return 0;
    });
  }
  return list;
}

function observeRevealElements(root) {
  const obs = new IntersectionObserver((entries) => {
    entries.forEach((e, i) => {
      if (e.isIntersecting) {
        setTimeout(() => e.target.classList.add('visible'), i * 60);
        obs.unobserve(e.target);
      }
    });
  }, { threshold: 0.08 });
  (root || document).querySelectorAll('.reveal:not(.visible)').forEach(el => obs.observe(el));
}

function renderCollectionGrid(collectionKey, products, emptyAll) {
  const grid = document.getElementById('products-grid');
  if (!grid) return;
  if (!products.length) {
    grid.innerHTML = emptyAll
      ? '<p class="coll-filter-empty">محصولی در این مجموعه ثبت نشده است.</p>'
      : '<p class="coll-filter-empty">محصولی با این فیلتر یافت نشد.</p>';
    return;
  }
  grid.innerHTML = products.map(p => buildProductCard(p, p.collection || collectionKey)).join('');
  observeRevealElements(grid);
}

function applyCollectionFilters(collectionKey) {
  const all = getProductsForPage(collectionKey);
  const filtered = filterAndSortProducts(all);
  const emptyAll = genderPageMode
    ? !Products.getAllFlat().some(p => matchesGenderFilter(p, genderPageMode))
    : !Products.getCollection(collectionKey).length;
  renderCollectionGrid(collectionKey, filtered, emptyAll);
  updateCollectionFilterBadge();
}

function updateCollectionFilterBadge() {
  const badge = document.querySelector('.coll-filter-badge');
  if (!badge) return;
  const active = collFilterState.karat !== 'all' || collFilterState.gender !== 'all'
    || collFilterState.nameSort !== 'none' || collFilterState.priceSort !== 'none';
  badge.hidden = !active;
}

function closeCollectionFilterMenu() {
  const wrap = document.getElementById('collection-filters');
  const toggle = document.querySelector('.coll-filter-toggle');
  const menu = document.getElementById('coll-filter-menu');
  if (!toggle || !menu) return;
  toggle.classList.remove('open');
  toggle.setAttribute('aria-expanded', 'false');
  menu.classList.remove('open');
  if (wrap) wrap.classList.remove('is-open');
}

function resetCollectionFilters(collectionKey) {
  collFilterState.karat = 'all';
  collFilterState.gender = 'all';
  collFilterState.nameSort = 'none';
  collFilterState.priceSort = 'none';
  const karatSel = document.getElementById('filter-karat');
  const genderSel = document.getElementById('filter-gender');
  const nameSel = document.getElementById('filter-name');
  const priceSel = document.getElementById('filter-price');
  if (karatSel) karatSel.value = 'all';
  if (genderSel) genderSel.value = 'all';
  if (nameSel) nameSel.value = 'none';
  if (priceSel) priceSel.value = 'none';
  applyCollectionFilters(collectionKey);
}

const FILTER_ICON_SVG = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>';
const CHEVRON_SVG = '<svg class="coll-filter-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="6 9 12 15 18 9"/></svg>';

function ensureCollectionFilters(collectionKey) {
  const grid = document.getElementById('products-grid');
  if (!grid || document.getElementById('collection-filters')) return;

  const karatOptions = ['<option value="all">همه عیارها</option>']
    .concat(KARAT_OPTIONS.map(k => `<option value="${k}">${KARAT_LABELS[k]}</option>`))
    .join('');
  const genderOptions = ['<option value="all">همه جنسیت‌ها</option>']
    .concat(GENDER_OPTIONS.map(g => `<option value="${g}">${GENDER_LABELS[g]}</option>`))
    .join('');

  const wrap = document.createElement('div');
  wrap.id = 'collection-filters';
  wrap.className = 'coll-filter-dropdown reveal';
  wrap.innerHTML = `
    <button type="button" class="coll-filter-toggle" aria-expanded="false" aria-controls="coll-filter-menu">
      ${FILTER_ICON_SVG}
      <span>فیلتر و مرتب‌سازی</span>
      <span class="coll-filter-badge" hidden aria-hidden="true"></span>
      ${CHEVRON_SVG}
    </button>
    <div class="coll-filter-menu" id="coll-filter-menu" role="region" aria-label="فیلتر محصولات">
      <div class="coll-filter-group">
        <label for="filter-karat">عیار</label>
        <select id="filter-karat" class="coll-filter-select" aria-label="فیلتر عیار">${karatOptions}</select>
      </div>
      <div class="coll-filter-group">
        <label for="filter-gender">جنسیت</label>
        <select id="filter-gender" class="coll-filter-select" aria-label="فیلتر جنسیت">${genderOptions}</select>
      </div>
      <div class="coll-filter-group">
        <label for="filter-name">مرتب‌سازی نام</label>
        <select id="filter-name" class="coll-filter-select" aria-label="مرتب‌سازی بر اساس نام">
          <option value="none">پیش‌فرض</option>
          <option value="asc">الف – ی</option>
          <option value="desc">ی – الف</option>
        </select>
      </div>
      <div class="coll-filter-group">
        <label for="filter-price">مرتب‌سازی قیمت</label>
        <select id="filter-price" class="coll-filter-select" aria-label="مرتب‌سازی بر اساس قیمت">
          <option value="none">پیش‌فرض</option>
          <option value="low">کم به زیاد</option>
          <option value="high">زیاد به کم</option>
        </select>
      </div>
      <button type="button" class="coll-filter-reset">بازنشانی فیلترها</button>
    </div>`;
  grid.parentNode.insertBefore(wrap, grid);
  observeRevealElements(wrap.parentNode);

  const toggle = wrap.querySelector('.coll-filter-toggle');
  const menu = wrap.querySelector('#coll-filter-menu');

  toggle.addEventListener('click', e => {
    e.stopPropagation();
    const open = menu.classList.contains('open');
    if (open) closeCollectionFilterMenu();
    else {
      toggle.classList.add('open');
      toggle.setAttribute('aria-expanded', 'true');
      menu.classList.add('open');
      wrap.classList.add('is-open');
    }
  });

  wrap.querySelector('#filter-karat').addEventListener('change', e => {
    collFilterState.karat = e.target.value;
    applyCollectionFilters(collectionKey);
  });
  wrap.querySelector('#filter-gender').addEventListener('change', e => {
    collFilterState.gender = e.target.value;
    applyCollectionFilters(collectionKey);
  });
  wrap.querySelector('#filter-name').addEventListener('change', e => {
    collFilterState.nameSort = e.target.value;
    applyCollectionFilters(collectionKey);
  });
  wrap.querySelector('#filter-price').addEventListener('change', e => {
    collFilterState.priceSort = e.target.value;
    applyCollectionFilters(collectionKey);
  });
  wrap.querySelector('.coll-filter-reset').addEventListener('click', () => {
    resetCollectionFilters(collectionKey);
  });

  if (!wrap.dataset.outsideBound) {
    wrap.dataset.outsideBound = '1';
    document.addEventListener('click', e => {
      if (!menu.classList.contains('open')) return;
      if (e.target.closest('#collection-filters')) return;
      closeCollectionFilterMenu();
    });
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape') closeCollectionFilterMenu();
    });
  }
}

function renderCollectionPage(collectionKey) {
  genderPageMode = null;
  const grid = document.getElementById('products-grid');
  if (!grid) return applyAvailability(collectionKey);
  collFilterState.karat = 'all';
  collFilterState.gender = 'all';
  collFilterState.nameSort = 'none';
  collFilterState.priceSort = 'none';
  ensureCollectionFilters(collectionKey);
  const karatSel = document.getElementById('filter-karat');
  const genderSel = document.getElementById('filter-gender');
  const nameSel = document.getElementById('filter-name');
  const priceSel = document.getElementById('filter-price');
  if (karatSel) karatSel.value = 'all';
  if (genderSel) genderSel.value = 'all';
  if (nameSel) nameSel.value = 'none';
  if (priceSel) priceSel.value = 'none';
  closeCollectionFilterMenu();
  applyCollectionFilters(collectionKey);
  handleProductDeepLink(collectionKey);
}

function renderGenderPage(genderKey) {
  genderPageMode = genderKey;
  const grid = document.getElementById('products-grid');
  if (!grid) return;
  collFilterState.karat = 'all';
  collFilterState.gender = 'all';
  collFilterState.nameSort = 'none';
  collFilterState.priceSort = 'none';
  ensureCollectionFilters('__gender__');
  const karatSel = document.getElementById('filter-karat');
  const genderSel = document.getElementById('filter-gender');
  const nameSel = document.getElementById('filter-name');
  const priceSel = document.getElementById('filter-price');
  if (karatSel) karatSel.value = 'all';
  if (genderSel) genderSel.value = 'all';
  if (nameSel) nameSel.value = 'none';
  if (priceSel) priceSel.value = 'none';
  closeCollectionFilterMenu();
  applyCollectionFilters('__gender__');
  const productId = new URLSearchParams(window.location.search).get('product');
  if (productId) {
    const found = Products.findProduct(productId);
    if (found && matchesGenderFilter(found.product, genderKey)) {
      setTimeout(() => {
        focusProductOnPage(productId, found.collection);
        history.replaceState(null, '', window.location.pathname);
      }, 120);
    }
  }
}

