/* ── Auth ─────────────────────────────────── */
const Auth = (function () {
  const S = 'armeh_session', U = 'armeh_users';
  const sessLocal  = () => JSON.parse(sessionStorage.getItem(S) || 'null');
  const usersLocal = () => JSON.parse(localStorage.getItem(U)  || '[]');
  const saveLocal  = u  => localStorage.setItem(U, JSON.stringify(u));
  const sess  = () => ArmehAPI.enabled() ? _session : sessLocal();
  const users = () => ArmehAPI.enabled() ? _usersCache : usersLocal();
  const save  = u  => { if (!ArmehAPI.enabled()) saveLocal(u); else _usersCache = u; };

  async function refreshUsers() {
    if (!ArmehAPI.enabled() || !Auth.isAdmin()) return;
    const { users: list } = await ArmehAPI.get('/api/users');
    _usersCache = list;
    return list;
  }

  async function fetchCurrentUser() {
    if (!ArmehAPI.enabled() || !_session?.id) return null;
    const { user } = await ArmehAPI.get('/api/users/me');
    return user;
  }

  async function fetchCaptcha() {
    const res = await fetch(resolveApiBase() + '/api/auth/captcha?t=' + Date.now(), {
      method: 'GET',
      credentials: apiCredentials(),
      cache: 'no-store',
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok || !data.question) {
      throw new Error(data.error || 'خطا در بارگذاری کد امنیتی.');
    }
    return data;
  }

  async function login(id, pw, captchaAnswer, honeypot) {
    if (!ArmehAPI.enabled())
      return { ok: false, error: 'ورود فقط با اتصال به سرور امکان‌پذیر است.' };
    try {
        const data = await ArmehAPI.post('/api/auth/login', {
          identifier: id,
          password: pw,
          captchaAnswer: captchaAnswer ?? '',
          honeypot: honeypot ?? '',
        });
        _session = normalizeSession(data.session);
        ArmehAPI.clearCsrf();
        if (data.role === 'user') {
          const { items } = await ArmehAPI.get('/api/cart');
          Cart._loadFromServer(items);
        }
        return { ok: true, role: data.role };
      } catch (e) {
        return { ok: false, error: e.data?.error || e.message };
      }
  }

  async function logout() {
    if (ArmehAPI.enabled()) {
      try { await ArmehAPI.post('/api/auth/logout'); } catch { /* ignore */ }
      ArmehAPI.clearCsrf();
      _session = null;
    } else {
      sessionStorage.removeItem(S);
    }
    const inCollections = window.location.pathname.includes('/collections/');
    window.location.href = inCollections ? '../index.html' : 'index.html';
  }

  async function register(data) {
    if (!ArmehAPI.enabled())
      return { ok: false, error: 'ثبت‌نام فقط با اتصال به سرور امکان‌پذیر است.' };
    try {
        const result = await ArmehAPI.post('/api/auth/register', {
          ...data,
          captchaAnswer: data.captchaAnswer ?? '',
          honeypot: data.honeypot ?? '',
        });
        if (result.session) {
          _session = normalizeSession(result.session);
          ArmehAPI.clearCsrf();
          if (result.role === 'user') {
            const { items } = await ArmehAPI.get('/api/cart');
            Cart._loadFromServer(items);
          }
        }
        return { ok: true, role: result.role };
      } catch (e) {
        return { ok: false, error: e.data?.error || e.message };
      }
  }

  async function updateUser(id, data) {
    if (!ArmehAPI.enabled())
      return false;
    const { user, session } = await ArmehAPI.put('/api/users/' + id, data);
      if (session) _session = normalizeSession(session);
      const i = _usersCache.findIndex(u => u.id === id);
      if (i >= 0) _usersCache[i] = user;
      return true;
  }

  async function deleteUser(id) {
    if (!ArmehAPI.enabled()) return;
    const data = await ArmehAPI.delete('/api/users/' + id);
      _usersCache = _usersCache.filter(u => u.id !== id);
      if (data.loggedOut) _session = null;
  }

  async function addOrder(userId, items) {
    if (!ArmehAPI.enabled()) return;
    await ArmehAPI.post('/api/orders', { items });
  }

  async function verifyPassword(password) {
    if (!ArmehAPI.enabled()) return false;
    await ArmehAPI.post('/api/auth/verify-password', { password });
    return true;
  }

  return { login, logout, register, fetchCaptcha, updateUser, deleteUser, addOrder, refreshUsers, fetchCurrentUser, verifyPassword,
           getSession: sess, getUsers: users, saveUsers: save,
           isAdmin: () => {
             const s = sess();
             const role = (s?.role ?? s?.Role ?? '').toString().toLowerCase();
             return role === 'admin';
           },
           isUser:  () => {
             const s = sess();
             const role = (s?.role ?? s?.Role ?? '').toString().toLowerCase();
             return role === 'user';
           },
           isGuest: () => !sess(),
           role:    () => {
             const s = sess();
             return (s?.role ?? s?.Role ?? 'guest').toString().toLowerCase();
           } };
})();

