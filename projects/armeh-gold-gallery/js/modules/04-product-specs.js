/* ── Product spec helpers ─────────────────── */
const MATERIAL_FROM_KARAT = { 18: 'طلای ۱۸ عیار', 21: 'طلای ۲۱ عیار', 24: 'طلای ۲۴ عیار' };

function materialFromKarat(k) {
  return MATERIAL_FROM_KARAT[Number(k)] || MATERIAL_FROM_KARAT[18];
}

function formatWeightGrams(value) {
  if (value == null || value === '') return '—';
  const n = Number(value);
  if (!Number.isFinite(n)) return '—';
  return n.toLocaleString('fa-IR', { maximumFractionDigits: 3 }) + ' گرم';
}

function formatPercent(value) {
  if (value == null || value === '') return '—';
  const n = Number(value);
  if (!Number.isFinite(n)) return '—';
  return n.toLocaleString('fa-IR', { maximumFractionDigits: 2 }) + '٪';
}

function productSpecRows(p) {
  return [
    { label: 'کد محصول', value: p.barcode || '—', ltr: true },
    { label: 'مجموعه', value: p.collectionName || '—' },
    { label: 'عیار', value: KARAT_LABELS[p.karat] || materialFromKarat(p.karat) },
    { label: 'جنسیت', value: genderLabel(p.gender) },
    { label: 'وزن کل', value: formatWeightGrams(p.gross_weight ?? p.grossWeight) },
    { label: 'وزن سنگ', value: formatWeightGrams(p.stone_weight ?? p.stoneWeight) },
    { label: 'وزن خالص طلا', value: formatWeightGrams(p.net_weight ?? p.netWeight) },
    { label: 'درصد اجرت ساخت', value: formatPercent(p.laborPercent ?? p.labor_percent ?? p.laborFee) },
    { label: 'درصد سود', value: formatPercent(p.profit_percent ?? p.profitPercent) },
    { label: 'قیمت نگین', value: formatPrice(p.stone_price ?? p.stonePrice) },
  ];
}

function renderProductSpecsHtml(p) {
  return productSpecRows(p).map(row =>
    `<div class="pd-spec"><dt>${escHtml(row.label)}</dt><dd${row.ltr ? ' style="font-family:monospace"' : ''}>${escHtml(row.value)}</dd></div>`
  ).join('');
}

