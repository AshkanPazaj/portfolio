/* ── Collection page helpers ─────────────── */
function addToCart(btn, collectionKey) {
  const card = btn.closest('.product-card');
  const id   = card?.dataset?.id;
  const coll = card?.dataset?.collection || collectionKey;
  let p = null;
  if (id) {
    p = Products.findProduct(id)?.product;
  } else {
    p = Products.getCollection(collectionKey).find(p => p.id === id)
      || Products.getCollection(collectionKey).find(p => p.name === card.querySelector('.product-name')?.textContent.trim());
  }
  if (!p || p.available === false) return;
  Cart.add({ id:p.id, name:p.name, collection:coll, collectionName:p.collectionName, material:p.material, price:p.price });
  const svg = btn.querySelector('svg') ? btn.querySelector('svg').outerHTML : '';
  btn.classList.add('added');
  btn.innerHTML = '✓ افزوده شد';
  setTimeout(() => { btn.classList.remove('added'); btn.innerHTML = 'افزودن به سبد ' + svg; }, 1600);
}

function applyAvailability(collectionKey) {
  const products = Products.getCollection(collectionKey);
  document.querySelectorAll('.product-card').forEach(card => {
    const id = card.dataset.id;
    const p  = id ? products.find(p => p.id === id) : products.find(p => p.name === card.querySelector('.product-name')?.textContent.trim());
    if (!p) return;
    if (!card.dataset.id) card.dataset.id = p.id;
    card.dataset.available = String(p.available);
    const art = card.querySelector('.product-art');
    const primary = getPrimaryImage(p);
    if (art && primary) {
      art.classList.add('has-image');
      if (!art.querySelector('img')) art.innerHTML = productImgTag(primary, p.name);
    }
    let priceEl = card.querySelector('.product-price');
    if (!priceEl) {
      priceEl = document.createElement('div');
      priceEl.className = 'product-price';
      const material = card.querySelector('.product-material');
      if (material) material.insertAdjacentElement('afterend', priceEl);
    }
    priceEl.textContent = formatPrice(p.price);
    const nameEl = card.querySelector('.product-name');
    if (nameEl) nameEl.textContent = p.name;
    const matEl = card.querySelector('.product-material');
    if (matEl) matEl.textContent = p.material;
  });
}

