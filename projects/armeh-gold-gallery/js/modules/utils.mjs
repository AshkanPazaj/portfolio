export function escHtml(value) {
  if (value == null) return '';
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export function safeImageUrl(url) {
  if (!url) return '';
  const value = String(url).trim();
  if (/^data:image\/(jpeg|jpg|png|webp);base64,/i.test(value)) return value;
  if (/^\/[a-zA-Z0-9/_.-]+$/.test(value)) return value;
  return '';
}

export function formatPrice(amount) {
  if (amount == null) return '-';
  return Number(amount).toLocaleString('fa-IR') + ' تومان';
}
