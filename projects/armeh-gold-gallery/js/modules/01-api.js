/* ── API client ───────────────────────────── */
function resolveApiBase() {
  const { protocol, hostname, port } = window.location;
  if (protocol === 'file:') return 'http://localhost:3000';
  const local = hostname === 'localhost' || hostname === '127.0.0.1';
  if (local && port && port !== '3000') return `http://${hostname}:3000`;
  return '';
}

function apiCredentials() {
  return resolveApiBase() ? 'include' : 'same-origin';
}

const ArmehAPI = (function () {
  let useBackend = false;
  let csrfToken = null;

  async function ensureCsrf() {
    if (!useBackend) return null;
    if (csrfToken) return csrfToken;
    const res = await fetch(resolveApiBase() + '/api/auth/csrf', {
      credentials: apiCredentials(),
      cache: 'no-store',
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok || !data.token) throw new Error(data.error || 'خطا در دریافت توکن امنیتی.');
    csrfToken = data.token;
    return csrfToken;
  }

  async function request(path, options = {}) {
    const method = (options.method || 'GET').toUpperCase();
    const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
    if (useBackend && method !== 'GET' && method !== 'HEAD')
      headers['X-CSRF-Token'] = await ensureCsrf();

    const res = await fetch(resolveApiBase() + path, {
      credentials: apiCredentials(),
      headers,
      ...options,
      body: options.body != null ? JSON.stringify(options.body) : undefined,
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      if (res.status === 403 && useBackend && method !== 'GET' && method !== 'HEAD' && csrfToken) {
        csrfToken = null;
        headers['X-CSRF-Token'] = await ensureCsrf();
        const retry = await fetch(resolveApiBase() + path, {
          credentials: apiCredentials(),
          headers,
          ...options,
          body: options.body != null ? JSON.stringify(options.body) : undefined,
        });
        const retryData = await retry.json().catch(() => ({}));
        if (retry.ok) return retryData;
        const retryErr = new Error(retryData.error || 'خطای سرور');
        retryErr.status = retry.status;
        retryErr.data = retryData;
        throw retryErr;
      }
      const err = new Error(data.error || 'خطای سرور');
      err.status = res.status;
      err.data = data;
      throw err;
    }
    return data;
  }

  async function probe() {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 5000);
      const res = await fetch(resolveApiBase() + '/api/health', {
        credentials: apiCredentials(),
        signal: controller.signal,
      });
      clearTimeout(timeout);
      const data = await res.json().catch(() => ({}));
      useBackend = res.ok && !!data.ok;
    } catch {
      useBackend = false;
    }
    return useBackend;
  }

  return {
    enabled: () => useBackend,
    ensureCsrf,
    clearCsrf: () => { csrfToken = null; },
    get: path => request(path),
    post: (path, body) => request(path, { method: 'POST', body }),
    put: (path, body) => request(path, { method: 'PUT', body }),
    patch: (path, body) => request(path, { method: 'PATCH', body }),
    delete: path => request(path, { method: 'DELETE' }),
    probe,
  };
})();

let _session = null;
let _productsCache = null;
let _usersCache = [];

function normalizeSession(session) {
  if (!session || typeof session !== 'object') return null;
  const role = session.role ?? session.Role ?? null;
  return {
    ...session,
    role: typeof role === 'string' ? role.toLowerCase() : role,
  };
}

async function refreshSessionFromServer() {
  if (!ArmehAPI.enabled()) return null;
  try {
    const { session } = await ArmehAPI.get('/api/auth/session');
    _session = normalizeSession(session);
    return _session;
  } catch {
    _session = null;
    return null;
  }
}

window.refreshSessionFromServer = refreshSessionFromServer;

function detectProductsLoadMode() {
  const path = window.location.pathname.toLowerCase();
  const coll = path.match(/\/collections\/(\w+)\.html$/);
  if (coll) return { kind: 'collection', key: coll[1] };
  if (path.includes('admin.html')) return { kind: 'full' };
  return { kind: 'summary' };
}

async function loadProductsCatalog() {
  const mode = detectProductsLoadMode();
  try {
    if (mode.kind === 'collection') {
      const { products } = await ArmehAPI.get('/api/products/collection/' + encodeURIComponent(mode.key));
      _productsCache = _productsCache && typeof _productsCache === 'object' ? _productsCache : {};
      _productsCache[mode.key] = products;
      return;
    }
    const q = mode.kind === 'full' ? '?full=true' : '';
    const { products } = await ArmehAPI.get('/api/products' + q);
    _productsCache = products;
  } catch {
    _productsCache = null;
  }
}

async function initBackend() {
  await ArmehAPI.probe();
  if (!ArmehAPI.enabled()) return;

  try {
    await ArmehAPI.ensureCsrf();
  } catch { /* retry on first mutating request */ }

  try {
    const { session } = await ArmehAPI.get('/api/auth/session');
    _session = normalizeSession(session);
  } catch {
    _session = null;
  }

  await loadProductsCatalog();

  if (_session?.role === 'user') {
    try {
      const { items } = await ArmehAPI.get('/api/cart');
      Cart._loadFromServer(items);
    } catch { /* guest cart fallback */ }
  }
}
