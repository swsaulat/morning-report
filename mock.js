/*
 * Demo back-end used when config.js has no API_URL yet (or the URL has ?demo).
 * Lets you click through every screen without deploying anything.
 * Scenarios: ?demo&scenario=open|upcoming|closed|none|already|outside|weak|nogeo
 */
(function () {
  'use strict';
  const qs = new URLSearchParams(location.search);
  const scenario = qs.get('scenario') || 'open';
  const TZ = 'Asia/Riyadh';
  const LEVELS = ['Intern', 'R1 (PGY-1)', 'R2 (PGY-2)', 'R3 (PGY-3)', 'R4 (PGY-4)', 'Fellow', 'Specialist', 'Consultant', 'Medical Student', 'Visiting / Rotator', 'Other'];
  const ROOM = { lat: 24.7136, lng: 46.6753 };
  const dayKey = d => new Intl.DateTimeFormat('en-CA', { timeZone: TZ }).format(d);
  const label = d => new Intl.DateTimeFormat('en-GB', { timeZone: TZ, weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).format(d);
  const hm = d => new Intl.DateTimeFormat('en-GB', { timeZone: TZ, hour: '2-digit', minute: '2-digit', hour12: false }).format(d);
  const hms = d => new Intl.DateTimeFormat('en-GB', { timeZone: TZ, hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }).format(d);
  const sleep = ms => new Promise(r => setTimeout(r, ms));

  // Session window shifted around "now" so each scenario is live.
  const now0 = Date.now();
  const offs = { open: [-12, 23], upcoming: [47, 97], closed: [-80, -30], none: [-12, 23], already: [-12, 23], outside: [-12, 23], weak: [-12, 23], nogeo: [-12, 23] }[scenario] || [-12, 23];
  const startAt = new Date(now0 + offs[0] * 60000), closeAt = new Date(now0 + offs[1] * 60000);
  const session = () => {
    const n = new Date();
    const isDay = scenario !== 'none';
    const state = !isDay ? 'none' : n < startAt ? 'upcoming' : n <= closeAt ? 'open' : 'closed';
    return { date: dayKey(n), label: label(n), dow: 'Sun', state, isSessionDay: isDay, note: '', start: hm(startAt), end: hm(closeAt),
      startAt: startAt.toISOString(), closeAt: closeAt.toISOString(), reportAt: new Date(closeAt.getTime() + 1800000).toISOString() };
  };
  const tomorrow = () => { const t = new Date(Date.now() + 86400000); return { date: dayKey(t), label: label(t), start: '06:00', end: '06:45', state: 'upcoming', isSessionDay: true }; };

  // Demo history
  const NAMES = [['Trainee 01', 'R1 (PGY-1)', '123456'], ['Trainee 02', 'R1 (PGY-1)', '234567'], ['Trainee 03', 'R2 (PGY-2)', '345678'], ['Trainee 04', 'R2 (PGY-2)', '456789'],
    ['Trainee 05', 'R3 (PGY-3)', '567890'], ['Trainee 06', 'R3 (PGY-3)', '678901'], ['Trainee 07', 'R1 (PGY-1)', '789012'], ['Trainee 08', 'R4 (PGY-4)', '890123'],
    ['Trainee 09', 'Intern', '901234'], ['Trainee 10', 'R4 (PGY-4)', '112233'], ['Trainee 11', 'Fellow', '223344'], ['Trainee 12', 'Intern', '334455']];
  let seed = 7; const rnd = () => (seed = (seed * 9301 + 49297) % 233280) / 233280;
  const rows = [];
  for (let i = 40; i >= 1; i--) {
    const d = new Date(Date.now() - i * 86400000);
    const dow = new Intl.DateTimeFormat('en-US', { timeZone: TZ, weekday: 'short' }).format(d);
    if (dow === 'Fri' || dow === 'Sat') continue;
    NAMES.forEach((n, j) => {
      if (rnd() < 0.2 + j * 0.02) return;
      const m = 2 + Math.floor(rnd() * 47), s = Math.floor(rnd() * 60);
      rows.push({ date: dayKey(d), time: '06:' + String(m).padStart(2, '0') + ':' + String(s).padStart(2, '0'), fullName: n[0], staffId: n[2], level: n[1],
        email: n[0].toLowerCase().replace(/[^a-z]/g, '.') + '@gmail.com', method: 'QR · Google · GPS', location: 'Passed', distance: 8 + Math.floor(rnd() * 80),
        accuracy: 6 + Math.floor(rnd() * 25), device: rnd() > .5 ? 'iPhone · Safari' : 'Android · Chrome', recordId: 'MR-' + dayKey(d).replace(/-/g, '') + '-' + Math.random().toString(36).slice(2, 7).toUpperCase(), notes: '' });
    });
  }
  rows.sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time));
  // A few already in today's session
  if (scenario !== 'none' && scenario !== 'upcoming') {
    NAMES.slice(2, 8).forEach((n, j) => rows.push({ date: dayKey(new Date()), time: hms(new Date(startAt.getTime() + (j + 1) * 90000)), fullName: n[0], staffId: n[2], level: n[1],
      email: 'demo' + j + '@gmail.com', method: 'QR · Google · GPS', location: 'Passed', distance: 12 + j * 9, accuracy: 10 + j, device: 'iPhone · Safari', recordId: 'MR-DEMO-' + j, notes: '' }));
  }
  const audit = [];
  const rejections = [{ at: hms(new Date(closeAt.getTime() - 600000)), email: 'late.person@gmail.com', fullName: 'Late Person', staffId: '999111', reason: 'GEO_OUTSIDE', message: 'You appear to be about 2.4 km from the Morning Report Classroom (allowed: 50 m).', distance: 2400, accuracy: 18 }];

  const cfg = () => ({
    ok: true, app: { name: 'Morning Report Attendance', version: '1.0.0 (demo)' },
    institution: '', department: 'Adult Emergency Unit – Emergency Department', program: 'Morning Report',
    classroomName: 'Morning Report Classroom', timezone: TZ, session: session(), nextSession: session().state === 'open' || session().state === 'upcoming' ? null : tomorrow(),
    geofence: scenario === 'nogeo' ? { enabled: false } : { enabled: true, lat: ROOM.lat, lng: ROOM.lng, radius: 50, buffer: 50, maxAccuracy: 300 },
    requireLiveCode: false, staffIdLabel: 'Staff / Badge ID', staffIdPattern: '^[A-Za-z0-9-]{3,20}$', levels: LEVELS, authMode: 'GOOGLE', googleClientId: 'demo',
    serverTime: new Date().toISOString()
  });

  // In demo, pretend the phone is in the classroom (or outside / weak, per scenario).
  if (navigator.geolocation && scenario !== 'nogeo') {
    const fake = scenario === 'outside' ? { lat: ROOM.lat + 0.02, lng: ROOM.lng, acc: 15 } : scenario === 'weak' ? { lat: ROOM.lat, lng: ROOM.lng, acc: 850 } : { lat: ROOM.lat + 0.0002, lng: ROOM.lng + 0.0001, acc: 14 };
    const pos = () => ({ coords: { latitude: fake.lat, longitude: fake.lng, accuracy: fake.acc }, timestamp: Date.now() });
    navigator.geolocation.watchPosition = (ok) => { const id = setTimeout(() => ok(pos()), 1200); return id; };
    navigator.geolocation.clearWatch = id => clearTimeout(id);
    navigator.geolocation.getCurrentPosition = ok => setTimeout(() => ok(pos()), 900);
  }

  const err = (code, message, details) => ({ ok: false, code, message, details: details || null, serverTime: new Date().toISOString() });
  const stamp = o => Object.assign({ ok: true, serverTime: new Date().toISOString() }, o);

  async function handle(action, p) {
    await sleep(action === 'register' ? 900 : 350);
    const s = session();
    const user = { email: 'trainee02@example.com', name: 'Trainee 02', picture: '' };
    switch (action) {
      case 'config': return cfg();
      case 'me': {
        const rec = scenario === 'already' ? { date: s.date, dateLabel: s.label, time: hms(new Date(startAt.getTime() + 240000)), fullName: 'Trainee 02', staffId: '234567', level: 'R1 (PGY-1)', location: 'Passed', distance: 21, recordId: 'MR-DEMO-02', position: 3 } : null;
        return stamp({ user, profile: { fullName: 'Trainee 02', staffId: '234567', level: 'R1 (PGY-1)' }, record: rec, role: 'manage', session: s });
      }
      case 'register': {
        if (s.state === 'upcoming') return err('WINDOW_NOT_OPEN', 'Registration opens at ' + s.start + ' (Riyadh time). Please try again then.');
        if (s.state === 'closed') return err('WINDOW_CLOSED', 'Registration for today closed at ' + s.end + '. It is now ' + hm(new Date()) + '. Late registrations are not accepted.');
        if (s.state === 'none') return err('NO_SESSION', 'There is no Morning Report scheduled today.');
        if (scenario === 'outside') return err('GEO_OUTSIDE', 'You appear to be about 2.2 km from the Morning Report Classroom (allowed: 50 m). Attendance can only be registered from the classroom.');
        if (scenario === 'weak') return err('GEO_WEAK', 'Your phone could only locate you to within ±850 m, which is too imprecise to confirm you are in the classroom. Turn on Wi-Fi and Precise Location, move near a window, then tap Try again.');
        const today = rows.filter(r => r.date === s.date);
        const rec = { date: s.date, dateLabel: s.label, time: hms(new Date()), fullName: p.fullName, staffId: p.staffId, level: p.level, email: user.email,
          location: scenario === 'nogeo' ? 'Disabled' : 'Passed', distance: scenario === 'nogeo' ? null : 24, recordId: 'MR-' + s.date.replace(/-/g, '') + '-' + Math.random().toString(36).slice(2, 7).toUpperCase(), position: today.length + 1 };
        rows.push(Object.assign({ method: 'QR · Google · GPS', accuracy: 14, device: 'Demo', notes: '' }, rec));
        return stamp({ record: rec, message: 'Attendance registered.' });
      }
      case 'display': {
        const today = rows.filter(r => r.date === s.date);
        return stamp({ institution: '', department: 'Adult Emergency Unit – Emergency Department', program: 'Morning Report', classroomName: 'Morning Report Classroom',
          session: s, nextSession: s.state === 'closed' || s.state === 'none' ? tomorrow() : null, count: today.length, liveCode: qs.has('live') ? 'demo' + Math.floor(Date.now() / 30000).toString(36) : null,
          codeRefreshSec: 30, attendeeUrl: '', geofence: true, radius: 50,
          recent: today.slice(-8).reverse().map(r => ({ name: r.fullName.split(' ')[0] + ' ' + r.fullName.split(' ').slice(-1)[0][0] + '.', level: r.level, time: r.time.slice(0, 5) })) });
      }
      case 'admin.overview': {
        const date = p.date || s.date;
        const day = rows.filter(r => r.date === date);
        const byLevel = {}; day.forEach(r => byLevel[r.level] = (byLevel[r.level] || 0) + 1);
        const counts = {}; rows.forEach(r => counts[r.date] = (counts[r.date] || 0) + 1);
        const dates = Object.keys(counts).sort();
        const last30 = dates.slice(-30);
        const n30 = last30.reduce((a, d) => a + counts[d], 0);
        return stamp({
          me: { email: user.email, name: user.name, role: 'manage', owner: true }, date, session: Object.assign({}, s, { date, label: label(new Date(date + 'T09:00:00Z')) }), today: s,
          records: day, byLevel, trend: last30.map(d => ({ date: d, count: counts[d] })),
          kpis: { present: day.length, sessions30: last30.length, avg30: Math.round(n30 / last30.length * 10) / 10, trainees30: NAMES.length, totalRecords: rows.length, totalSessions: dates.length },
          rejections: date === s.date ? rejections : [], audit: audit.filter(a => a.date === date), report: date < s.date ? { sentAt: date + 'T07:20:12+03:00', count: day.length, trigger: 'Auto (scheduled)' } : null,
          levels: LEVELS, warnings: [{ level: 'info', text: 'Demo mode: data is simulated. Set API_URL in config.js to connect the real Google Sheet.' }],
          links: { sheet: '#', archive: '#', attendee: './' }, displayKey: 'DEMOKEY',
          settings: { windowStart: '06:00', windowEnd: '06:45', timezone: TZ, sessionDays: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu'], geofence: true, radius: 50, lat: ROOM.lat, lng: ROOM.lng, liveCode: false, reportDelay: 30, authMode: 'GOOGLE',
            recipients: [{ name: 'Dr. —', role: 'Head of Adult Emergency', email: 'head@example.com' }, { name: '—', role: 'ED & SBEM Secretary', email: 'secretary@example.com' }, { name: 'Dr. —', role: 'SBEM Training Program Director', email: 'director@example.com' }] }
        });
      }
      case 'admin.trainees': {
        const days = p.days || 30;
        const from = dayKey(new Date(Date.now() - (days - 1) * 86400000));
        const inR = rows.filter(r => r.date >= from);
        const sessions = new Set(inR.map(r => r.date)).size;
        const m = {};
        inR.forEach(r => { const t = m[r.staffId] || (m[r.staffId] = { staffId: r.staffId, fullName: r.fullName, level: r.level, email: r.email, count: 0, last: '' }); t.count++; if (r.date > t.last) t.last = r.date; });
        const list = Object.values(m).map(t => Object.assign(t, { pct: Math.round(t.count / sessions * 100) })).sort((a, b) => b.count - a.count);
        return stamp({ from, to: dayKey(new Date()), days, sessions, trainees: list });
      }
      case 'admin.manualAdd': {
        const rec = { date: p.date || s.date, time: (p.time || hm(new Date())) + ':00', fullName: p.fullName, staffId: p.staffId, level: p.level, email: '', method: 'Manual (by demo)', location: 'Manual entry', distance: null, accuracy: null, device: 'Admin dashboard', recordId: 'MR-MANUAL', notes: p.note || 'Added manually' };
        rows.push(rec); return stamp({ record: rec });
      }
      case 'admin.editRecord': {
        const r = rows.find(x => x.recordId === p.recordId);
        if (!r) return err('NOT_FOUND', 'That entry no longer exists.');
        if (!p.reason || p.reason.trim().length < 3) return err('VALIDATION', 'Please give a short reason for the change.');
        const before = r.time.slice(0, 5) + ' · ' + r.fullName + ' · ' + r.staffId + ' · ' + r.level;
        Object.assign(r, { fullName: p.fullName, staffId: p.staffId, level: p.level, time: (p.time || r.time.slice(0, 5)) + ':00', notes: 'Edited by demo' });
        audit.unshift({ at: hms(new Date()), action: 'Edit', recordId: r.recordId, by: user.email, before, after: r.time.slice(0, 5) + ' · ' + r.fullName + ' · ' + r.staffId + ' · ' + r.level, reason: p.reason, date: r.date });
        return stamp({ record: r, reportSent: false });
      }
      case 'admin.deleteRecord': {
        const i = rows.findIndex(x => x.recordId === p.recordId);
        if (i < 0) return err('NOT_FOUND', 'That entry no longer exists.');
        if (!p.reason || p.reason.trim().length < 3) return err('VALIDATION', 'Please give a short reason for the change.');
        const r = rows.splice(i, 1)[0];
        audit.unshift({ at: hms(new Date()), action: 'Remove', recordId: r.recordId, by: user.email, before: r.fullName + ' · ' + r.staffId, after: '(removed)', reason: p.reason, date: r.date });
        return stamp({ removed: r.recordId, date: r.date, reportSent: false });
      }
      case 'admin.setLocation': return stamp({ lat: p.lat, lng: p.lng, radius: p.radius || 50, accuracy: p.accuracy });
      case 'admin.sendReport': return stamp({ sent: { date: p.date, to: p.toMeOnly ? [user.email] : ['head@example.com', 'secretary@example.com', 'director@example.com'], count: rows.filter(r => r.date === p.date).length } });
      case 'admin.export': {
        const list = rows.filter(r => (!p.from || r.date >= p.from) && (!p.to || r.date <= p.to));
        const csv = 'Session Date,Time,Full Name,Staff ID,Training Level\r\n' + list.map(r => [r.date, r.time, r.fullName, r.staffId, r.level].join(',')).join('\r\n');
        return stamp({ filename: 'demo-export.csv', csv, rows: list.length });
      }
      default: return err('UNKNOWN_ACTION', 'Unknown action.');
    }
  }

  window.MRMock = { handle };
})();
