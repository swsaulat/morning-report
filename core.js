/* Morning Report Attendance · shared client core (API, Google sign-in, GPS, helpers) */
(function () {
  'use strict';
  const CFG = window.MR_CONFIG || {};
  const qs = new URLSearchParams(location.search);
  const DEMO = qs.has('demo') || !CFG.API_URL || /PASTE|YOUR_/i.test(CFG.API_URL);

  // Demo mode (no API_URL yet, or ?demo): load the in-browser mock back-end.
  const ready = DEMO ? new Promise(res => {
    const s = document.createElement('script');
    s.src = 'mock.js'; s.onload = res; s.onerror = res;
    document.head.appendChild(s);
  }) : Promise.resolve();

  /* ---------------- API ---------------- */
  let clockOffset = 0; // serverTime - local time (ms)

  async function call(action, payload, opts) {
    payload = payload || {};
    const timeout = (opts && opts.timeout) || 30000;
    let res;
    if (DEMO) {
      await ready;
      res = await window.MRMock.handle(action, JSON.parse(JSON.stringify(payload)));
    } else {
      const ctrl = new AbortController();
      const t = setTimeout(() => ctrl.abort(), timeout);
      try {
        const r = await fetch(CFG.API_URL, {
          method: 'POST', redirect: 'follow', signal: ctrl.signal,
          headers: { 'Content-Type': 'text/plain;charset=utf-8' },
          body: JSON.stringify(Object.assign({ action: action }, payload))
        });
        const txt = await r.text();
        try { res = JSON.parse(txt); }
        catch (e) { res = { ok: false, code: 'BAD_RESPONSE', message: 'The server sent an unexpected response. Please try again.' }; }
      } catch (e) {
        res = {
          ok: false, code: 'NETWORK',
          message: e.name === 'AbortError'
            ? 'The server took too long to respond. Check your connection and try again.'
            : 'Could not reach the server. Check your internet connection and try again.'
        };
      } finally { clearTimeout(t); }
    }
    if (res && res.serverTime) clockOffset = new Date(res.serverTime).getTime() - Date.now();
    return res;
  }
  const now = () => new Date(Date.now() + clockOffset);

  /* ---------------- Google Sign-In ---------------- */
  const TOKEN_KEY = 'mr.idt';
  function decodeJwt(t) {
    try {
      const b = t.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
      const json = decodeURIComponent(atob(b).split('').map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join(''));
      return JSON.parse(json);
    } catch (e) { return null; }
  }
  const Auth = {
    token: null, user: null,
    restore() {
      try {
        const t = sessionStorage.getItem(TOKEN_KEY);
        const p = t && decodeJwt(t);
        if (p && p.exp * 1000 > Date.now() + 120000) { this.token = t; this.user = { email: p.email, name: p.name, picture: p.picture }; return true; }
      } catch (e) { /* storage blocked */ }
      return false;
    },
    set(token) {
      const p = decodeJwt(token);
      this.token = token;
      this.user = p ? { email: p.email, name: p.name, picture: p.picture } : null;
      try { sessionStorage.setItem(TOKEN_KEY, token); } catch (e) { /* ignore */ }
    },
    clear() {
      this.token = null; this.user = null;
      try { sessionStorage.removeItem(TOKEN_KEY); } catch (e) { /* ignore */ }
      try { window.google && google.accounts.id.disableAutoSelect(); } catch (e) { /* ignore */ }
    },
    payload() { return this.token ? { idToken: this.token } : (this.testEmail ? { testEmail: this.testEmail } : {}); },
    /** Renders the Google button in `el`; calls onSignIn(user) after a successful sign-in. */
    async mount(el, clientId, onSignIn, opts) {
      opts = opts || {};
      el.innerHTML = '';
      if (DEMO) {
        const b = document.createElement('button');
        b.type = 'button'; b.className = 'gbtn-demo';
        b.innerHTML = GOOGLE_G + '<span>Continue with Google <small>(demo)</small></span>';
        b.onclick = () => {
          const fake = 'demo.' + btoa(JSON.stringify({ email: 'trainee02@example.com', name: 'Trainee 02', picture: '', exp: Math.floor(Date.now() / 1000) + 3600 })).replace(/=+$/, '') + '.sig';
          this.set(fake); onSignIn(this.user);
        };
        el.appendChild(b);
        return;
      }
      if (!clientId) { el.innerHTML = '<div class="notice notice-bad">Google Sign-In is not configured yet. Please tell the administrator.</div>'; return; }
      const ok = await waitFor(() => window.google && google.accounts && google.accounts.id, 12000);
      if (!ok) { el.innerHTML = '<div class="notice notice-bad">Google Sign-In could not load. Check your connection, disable content blockers for this page, then reload.</div>'; return; }
      google.accounts.id.initialize({
        client_id: clientId,
        callback: r => { this.set(r.credential); onSignIn(this.user); },
        auto_select: opts.autoSelect !== false,
        cancel_on_tap_outside: false,
        itp_support: true,
        use_fedcm_for_prompt: true,
        context: 'signin'
      });
      const w = Math.min(Math.max(el.clientWidth || 300, 220), 400);
      google.accounts.id.renderButton(el, { type: 'standard', theme: 'outline', size: 'large', shape: 'pill', text: 'continue_with', logo_alignment: 'center', width: w });
      if (opts.oneTap !== false) { try { google.accounts.id.prompt(); } catch (e) { /* ignore */ } }
    }
  };
  const GOOGLE_G = '<svg width="20" height="20" viewBox="0 0 48 48" aria-hidden="true"><path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9.1 3.6l6.8-6.8C35.8 2.4 30.3 0 24 0 14.6 0 6.6 5.4 2.7 13.3l7.9 6.1C12.5 13.6 17.8 9.5 24 9.5z"/><path fill="#4285F4" d="M46.1 24.5c0-1.6-.1-3.1-.4-4.5H24v9h12.4c-.5 2.9-2.2 5.3-4.6 6.9l7.4 5.7c4.3-4 6.9-9.9 6.9-17.1z"/><path fill="#FBBC05" d="M10.6 28.6c-.5-1.4-.8-2.9-.8-4.6s.3-3.2.8-4.6l-7.9-6.1C1 16.6 0 20.2 0 24s1 7.4 2.7 10.7l7.9-6.1z"/><path fill="#34A853" d="M24 48c6.5 0 11.9-2.1 15.9-5.8l-7.4-5.7c-2.1 1.4-4.8 2.3-8.5 2.3-6.2 0-11.5-4.1-13.4-9.9l-7.9 6.1C6.6 42.6 14.6 48 24 48z"/></svg>';

  function waitFor(fn, ms) {
    return new Promise(res => {
      const t0 = Date.now();
      (function tick() { if (fn()) return res(true); if (Date.now() - t0 > ms) return res(false); setTimeout(tick, 100); })();
    });
  }

  /* ---------------- Geolocation ---------------- */
  /**
   * Watches position for up to maxWait ms and resolves with the most accurate fix.
   * Resolves early once accuracy ≤ goodEnough. onProgress(best) is called on each fix.
   */
  function locate(opts) {
    opts = Object.assign({ maxWait: 12000, goodEnough: 25, onProgress: null }, opts || {});
    return new Promise((resolve, reject) => {
      if (!('geolocation' in navigator)) return reject({ code: 'UNSUPPORTED' });
      if (!window.isSecureContext) return reject({ code: 'INSECURE' });
      let best = null, done = false, id = null;
      const finish = (ok, val) => {
        if (done) return; done = true;
        if (id !== null) navigator.geolocation.clearWatch(id);
        clearTimeout(timer);
        ok ? resolve(val) : reject(val);
      };
      const timer = setTimeout(() => best ? finish(true, best) : finish(false, { code: 'TIMEOUT' }), opts.maxWait);
      id = navigator.geolocation.watchPosition(p => {
        const fix = { lat: p.coords.latitude, lng: p.coords.longitude, accuracy: Math.round(p.coords.accuracy), at: Date.now() };
        if (!best || fix.accuracy <= best.accuracy) best = fix;
        if (opts.onProgress) opts.onProgress(best);
        if (best.accuracy <= opts.goodEnough) finish(true, best);
      }, err => {
        if (best) return finish(true, best);
        finish(false, { code: err.code === 1 ? 'DENIED' : err.code === 2 ? 'UNAVAILABLE' : 'TIMEOUT', message: err.message });
      }, { enableHighAccuracy: true, maximumAge: 0, timeout: opts.maxWait });
    });
  }

  function distanceM(lat1, lng1, lat2, lng2) {
    const R = 6371008.8, r = Math.PI / 180;
    const a = Math.sin((lat2 - lat1) * r / 2) ** 2 + Math.cos(lat1 * r) * Math.cos(lat2 * r) * Math.sin((lng2 - lng1) * r / 2) ** 2;
    return 2 * R * Math.asin(Math.min(1, Math.sqrt(a)));
  }
  const fmtDist = m => m >= 1000 ? (m / 1000).toFixed(m >= 10000 ? 0 : 1) + ' km' : Math.round(m) + ' m';

  /* ---------------- Helpers ---------------- */
  function esc(s) { return String(s === null || s === undefined ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])); }
  const $ = (sel, root) => (root || document).querySelector(sel);
  const $$ = (sel, root) => Array.from((root || document).querySelectorAll(sel));

  function toast(msg, kind, ms) {
    let wrap = $('.toast-wrap');
    if (!wrap) { wrap = document.createElement('div'); wrap.className = 'toast-wrap'; document.body.appendChild(wrap); }
    const t = document.createElement('div');
    t.className = 'toast ' + (kind || '');
    t.textContent = msg;
    wrap.innerHTML = ''; wrap.appendChild(t);
    setTimeout(() => t.remove(), ms || 3800);
  }

  function countdown(ms) {
    if (ms < 0) ms = 0;
    const s = Math.floor(ms / 1000), h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), sec = s % 60;
    if (h > 0) return h + 'h ' + String(m).padStart(2, '0') + 'm';
    return String(m).padStart(2, '0') + ':' + String(sec).padStart(2, '0');
  }

  /** "HH:mm" in the configured zone */
  function clock(d, tz, withSec) {
    try {
      return new Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit', second: withSec ? '2-digit' : undefined, hour12: false, timeZone: tz || 'Asia/Riyadh' }).format(d);
    } catch (e) { return d.toTimeString().slice(0, withSec ? 8 : 5); }
  }

  function deviceLabel() {
    const ua = navigator.userAgent;
    const os = /iPhone/.test(ua) ? 'iPhone' : /iPad/.test(ua) ? 'iPad' : /Android/.test(ua) ? 'Android' : /Windows/.test(ua) ? 'Windows' : /Mac OS X/.test(ua) ? 'Mac' : /Linux/.test(ua) ? 'Linux' : 'Other';
    const br = /EdgA?\//.test(ua) ? 'Edge' : /SamsungBrowser/.test(ua) ? 'Samsung Internet' : /CriOS|Chrome\//.test(ua) ? 'Chrome' : /FxiOS|Firefox\//.test(ua) ? 'Firefox' : /Safari\//.test(ua) ? 'Safari' : 'Browser';
    return os + ' · ' + br;
  }
  const isIOS = () => /iPhone|iPad|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);

  function attendeeUrl() {
    if (CFG.ATTENDEE_URL) return CFG.ATTENDEE_URL;
    const u = new URL('./', location.href);
    return u.href;
  }

  function store(key, val) {
    try {
      if (val === undefined) return JSON.parse(localStorage.getItem(key) || 'null');
      if (val === null) localStorage.removeItem(key); else localStorage.setItem(key, JSON.stringify(val));
    } catch (e) { return null; }
  }

  function modal(title, bodyHtml, buttons) {
    const back = document.createElement('div');
    back.className = 'modal-back';
    back.innerHTML = '<div class="modal" role="dialog" aria-modal="true" aria-label="' + esc(title) + '">' +
      '<div class="modal-h"><h3>' + esc(title) + '</h3><button class="x" aria-label="Close">×</button></div>' +
      '<div class="modal-b">' + bodyHtml + '</div>' +
      (buttons ? '<div class="modal-f"></div>' : '') + '</div>';
    const close = () => back.remove();
    back.querySelector('.x').onclick = close;
    back.addEventListener('click', e => { if (e.target === back) close(); });
    document.addEventListener('keydown', function k(e) { if (e.key === 'Escape') { close(); document.removeEventListener('keydown', k); } });
    if (buttons) {
      const f = back.querySelector('.modal-f');
      buttons.forEach(b => {
        const el = document.createElement('button');
        el.className = 'btn ' + (b.cls || 'btn-ghost'); el.textContent = b.label;
        el.onclick = () => b.onClick ? b.onClick(close, el, back) : close();
        f.appendChild(el);
      });
    }
    document.body.appendChild(back);
    const first = back.querySelector('input,select,textarea');
    if (first) setTimeout(() => first.focus(), 50);
    return { el: back, close: close };
  }

  function busy(btn, on, label) {
    if (on) { btn.dataset.label = btn.innerHTML; btn.disabled = true; btn.innerHTML = '<span class="spin"></span>' + (label ? '<span>' + esc(label) + '</span>' : ''); }
    else { btn.disabled = false; if (btn.dataset.label) btn.innerHTML = btn.dataset.label; }
  }

  if (DEMO) {
    document.addEventListener('DOMContentLoaded', () => {
      const r = document.createElement('div'); r.className = 'demo-ribbon'; r.textContent = 'DEMO'; document.body.appendChild(r);
    });
  }

  window.MR = { CFG, DEMO, qs, call, now, Auth, locate, distanceM, fmtDist, esc, $, $$, toast, countdown, clock, deviceLabel, isIOS, attendeeUrl, store, modal, busy, decodeJwt, GOOGLE_G };
})();
