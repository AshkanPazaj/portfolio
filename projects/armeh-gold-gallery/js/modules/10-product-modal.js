/* ── Product detail modal ─────────────────── */
let pdState = { index: 0, images: [], product: null, collectionKey: '' };

function initProductDetail() {
  if (document.getElementById('product-detail-overlay')) return;
  const cartSvg = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></svg>`;
  const overlay = document.createElement('div');
  overlay.id = 'product-detail-overlay';
  overlay.className = 'pd-overlay hidden';
  overlay.setAttribute('role', 'dialog');
  overlay.setAttribute('aria-modal', 'true');
  overlay.innerHTML = `
    <div class="pd-modal">
      <button type="button" class="pd-close" aria-label="بستن">×</button>
      <div class="pd-gallery">
        <button type="button" class="pd-nav pd-prev" aria-label="تصویر قبلی">‹</button>
        <div class="pd-slide-wrap"></div>
        <button type="button" class="pd-nav pd-next" aria-label="تصویر بعدی">›</button>
        <div class="pd-dots"></div>
      </div>
      <div class="pd-info">
        <span class="pd-collection"></span>
        <h2 class="pd-name"></h2>
        <p class="pd-material"></p>
        <p class="pd-price"></p>
        <dl class="pd-specs" aria-label="مشخصات محصول"></dl>
        <p class="pd-desc"></p>
        <p class="pd-status"></p>
        <button type="button" class="btn-add-cart pd-add-cart">افزودن به سبد ${cartSvg}</button>
      </div>
    </div>`;
  document.body.appendChild(overlay);
  overlay.querySelector('.pd-close').addEventListener('click', closeProductDetail);
  overlay.addEventListener('click', e => { if (e.target === overlay) closeProductDetail(); });
  overlay.querySelector('.pd-prev').addEventListener('click', () => pdGo(-1));
  overlay.querySelector('.pd-next').addEventListener('click', () => pdGo(1));
  document.addEventListener('keydown', pdKeydown);
  let touchX = 0;
  const gallery = overlay.querySelector('.pd-gallery');
  gallery.addEventListener('touchstart', e => { touchX = e.changedTouches[0].screenX; }, { passive: true });
  gallery.addEventListener('touchend', e => {
    const dx = e.changedTouches[0].screenX - touchX;
    if (dx < -45) pdGo(1);
    else if (dx > 45) pdGo(-1);
  }, { passive: true });
}

function pdKeydown(e) {
  const ov = document.getElementById('product-detail-overlay');
  if (!ov || ov.classList.contains('hidden')) return;
  if (e.key === 'Escape') closeProductDetail();
  if (e.key === 'ArrowRight') pdGo(-1);
  if (e.key === 'ArrowLeft') pdGo(1);
}

async function openProductDetail(id, collectionKey) {
  let p = Products.getCollection(collectionKey).find(x => x.id === id);
  if (!p && ArmehAPI.enabled()) {
    try {
      const data = await ArmehAPI.get('/api/products/' + encodeURIComponent(id));
      if (data?.product) {
        Products.mergeProduct(data.product, data.collection || collectionKey);
        p = data.product;
        collectionKey = data.collection || collectionKey;
      }
    } catch {
      return;
    }
  }
  if (!p) return;

  let images = getProductImages(p);
  const imageCount = getProductImageCount(p);
  if (imageCount > images.length && ArmehAPI.enabled()) {
    try {
      const data = await ArmehAPI.get('/api/products/' + encodeURIComponent(id));
      if (data?.product) {
        Products.mergeProduct(data.product, data.collection || collectionKey);
        p = data.product;
        images = getProductImages(p);
      }
    } catch { /* use thumbnail only */ }
  }

  initProductDetail();
  pdState = { id, collectionKey, images, index: 0, product: p };
  const ov = document.getElementById('product-detail-overlay');
  ov.classList.remove('hidden');
  document.body.style.overflow = 'hidden';
  renderProductDetail();
}

function closeProductDetail() {
  const ov = document.getElementById('product-detail-overlay');
  if (ov) ov.classList.add('hidden');
  document.body.style.overflow = '';
}

function pdGo(delta) {
  if (pdState.images.length < 2) return;
  pdState.index = (pdState.index + delta + pdState.images.length) % pdState.images.length;
  renderProductDetailSlide();
}

function pdGoTo(i) {
  if (!pdState.images.length) return;
  pdState.index = i;
  renderProductDetailSlide();
}

function renderProductDetailSlide() {
  const ov = document.getElementById('product-detail-overlay');
  if (!ov) return;
  const wrap = ov.querySelector('.pd-slide-wrap');
  const imgs = pdState.images;
  const multi = imgs.length > 1;
  const prev = ov.querySelector('.pd-prev');
  const next = ov.querySelector('.pd-next');
  prev.style.display = multi ? 'flex' : 'none';
  next.style.display = multi ? 'flex' : 'none';
  if (!imgs.length) {
    wrap.innerHTML = PRODUCT_PLACEHOLDER_SVG.replace('class="product-art-placeholder"', 'class="pd-placeholder"');
  } else {
    wrap.innerHTML = `<img class="pd-slide" src="${escHtml(imgs[pdState.index])}" alt="${escHtml(pdState.product.name)}" />`;
  }
  const dots = ov.querySelector('.pd-dots');
  if (!multi) { dots.innerHTML = ''; dots.style.display = 'none'; return; }
  dots.style.display = 'flex';
  dots.innerHTML = imgs.map((_, i) =>
    `<button type="button" class="pd-dot${i === pdState.index ? ' active' : ''}" aria-label="تصویر ${(i + 1).toLocaleString('fa-IR')}" onclick="pdGoTo(${i})"></button>`
  ).join('');
}

function renderProductDetail() {
  const ov = document.getElementById('product-detail-overlay');
  const p = pdState.product;
  if (!ov || !p) return;
  ov.querySelector('.pd-collection').textContent = p.collectionName || '';
  ov.querySelector('.pd-name').textContent = p.name;
  ov.querySelector('.pd-material').textContent = p.material;
  ov.querySelector('.pd-price').textContent = formatPrice(p.price);
  const specsEl = ov.querySelector('.pd-specs');
  if (specsEl) specsEl.innerHTML = renderProductSpecsHtml(p);
  const descEl = ov.querySelector('.pd-desc');
  if (p.description) { descEl.textContent = p.description; descEl.style.display = 'block'; }
  else { descEl.textContent = ''; descEl.style.display = 'none'; }
  const status = ov.querySelector('.pd-status');
  const avail = p.available !== false;
  status.textContent = avail ? 'موجود در فروشگاه' : 'ناموجود';
  status.className = 'pd-status ' + (avail ? 'available' : 'unavailable');
  const btn = ov.querySelector('.pd-add-cart');
  btn.classList.remove('added');
  btn.disabled = !avail;
  btn.style.opacity = avail ? '' : '0.4';
  btn.style.pointerEvents = avail ? '' : 'none';
  btn.onclick = () => { if (avail) addToCart(btn, pdState.collectionKey); };
  renderProductDetailSlide();
}

