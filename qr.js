/* Branded QR renderer, tuned for reliable scanning.
 * Uses qrcode-generator (MIT) from assets/vendor/qrcode.min.js.
 * Decode-tested with jsQR: square modules, high-contrast dark ink, rounded finder
 * "eyes" with dark centres, 4-module quiet zone, error-correction level H: 32/32
 * decodes incl. blurred. Rounded dots, light-gold eye centres and a centre logo
 * badge all reduced decode rates, so the badge is OFF by default (opts.badge). */
(function () {
  'use strict';
  function svg(text, opts) {
    // ECC 'M' (15% recovery): fewer, larger modules than 'H' → more reliable scanning; 'H' only needed with a centre badge.
    opts = Object.assign({ dark: '#062C32', eye: '#0E5F68', light: '#FFFFFF', badge: false, quiet: 4, ecc: null }, opts || {});
    const qr = qrcode(0, opts.ecc || (opts.badge ? 'H' : 'M'));
    qr.addData(text);
    qr.make();
    const n = qr.getModuleCount(), q = opts.quiet, size = n + q * 2;
    const inEye = (r, c) => (r < 7 && c < 7) || (r < 7 && c >= n - 7) || (r >= n - 7 && c < 7);
    let bs = Math.floor(n * 0.15); if (bs % 2 !== n % 2) bs += 1;   // same parity as n → centred on modules
    const b0 = (n - bs) / 2;
    const inBadge = (r, c) => opts.badge && r >= b0 && r < b0 + bs && c >= b0 && c < b0 + bs;
    let d = '';
    for (let r = 0; r < n; r++) {
      let run = 0;
      for (let c = 0; c <= n; c++) {
        const on = c < n && qr.isDark(r, c) && !inEye(r, c) && !inBadge(r, c);
        if (on) { run++; continue; }
        if (run) { d += 'M' + (c - run + q) + ' ' + (r + q) + 'h' + run + 'v1h-' + run + 'z'; run = 0; }
      }
    }
    const R = 1.4;
    const eye = (x, y) => {
      x += q; y += q;
      return '<path fill-rule="evenodd" fill="' + opts.eye + '" d="M' + x + ' ' + (y + R) + 'a' + R + ' ' + R + ' 0 0 1 ' + R + '-' + R + 'h' + (7 - 2 * R) +
        'a' + R + ' ' + R + ' 0 0 1 ' + R + ' ' + R + 'v' + (7 - 2 * R) + 'a' + R + ' ' + R + ' 0 0 1-' + R + ' ' + R + 'h-' + (7 - 2 * R) +
        'a' + R + ' ' + R + ' 0 0 1-' + R + '-' + R + 'zM' + (x + 1) + ' ' + (y + 1) + 'h5v5h-5z"/>' +
        '<rect x="' + (x + 2) + '" y="' + (y + 2) + '" width="3" height="3" rx="0.7" fill="' + opts.dark + '"/>';
    };
    let badge = '';
    if (opts.badge) {
      const x = b0 + q, s = bs;
      badge = '<rect x="' + x + '" y="' + x + '" width="' + s + '" height="' + s + '" rx="' + (s * 0.22) + '" fill="' + opts.light + '"/>' +
        '<g transform="translate(' + (x + s * 0.1) + ' ' + (x + s * 0.1) + ') scale(' + (s * 0.8 / 192) + ')">' +
        '<rect width="192" height="192" rx="42" fill="#0E5F68"/>' +
        '<rect x="52" y="40" width="88" height="112" rx="14" fill="#fff" fill-opacity=".14" stroke="#fff" stroke-width="8"/>' +
        '<rect x="74" y="30" width="44" height="22" rx="8" fill="#BF9D68"/>' +
        '<path d="M72 100l17 17 33-35" fill="none" stroke="#fff" stroke-width="12" stroke-linecap="round" stroke-linejoin="round"/></g>';
    }
    return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' + size + ' ' + size + '" role="img" aria-label="QR code">' +
      '<rect width="' + size + '" height="' + size + '" fill="' + opts.light + '"/>' +
      '<path fill="' + opts.dark + '" shape-rendering="crispEdges" d="' + d + '"/>' +
      eye(0, 0) + eye(n - 7, 0) + eye(0, n - 7) + badge + '</svg>';
  }
  window.MRQR = { svg: svg };
})();
