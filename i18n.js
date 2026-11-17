/*
 * Attendance · language support (English / Arabic)
 * ------------------------------------------------
 * Loaded in <head> by every page, before core.js. English is the default and is
 * never modified: when English is active this file only adds the EN | عربي switch.
 *
 * When Arabic is active it sets <html lang="ar" dir="rtl"> and translates the UI
 * after it renders: text nodes and placeholder / title / aria-label attributes are
 * replaced only when they EXACTLY match a known UI string (AR), a whole-element
 * phrase with inline markup (HT) or a pattern for dynamic text (P: times, counts,
 * dates, distances). Anything else (names, IDs, emails, program / department names
 * from Settings) is left untouched. Elements marked translate="no", contenteditable
 * text and [data-lang] blocks are skipped.
 *
 * Choice: localStorage "mr.lang" ("en" | "ar"), or ?lang=ar|en in the URL.
 * With no saved choice, a page whose script tag has data-auto-ar (the attendee page)
 * follows navigator.language; every other page starts in English.
 */
(function () {
  'use strict';
  var KEY = 'mr.lang';
  var root = document.documentElement;
  var me = document.currentScript;
  var autoAr = !!(me && me.hasAttribute('data-auto-ar'));

  function load() { try { return localStorage.getItem(KEY); } catch (e) { return null; } }
  function save(v) { try { localStorage.setItem(KEY, v); } catch (e) { /* storage blocked */ } }

  var lang = null;
  try {
    var q = new URLSearchParams(location.search).get('lang');
    if (q === 'ar' || q === 'en') { lang = q; save(q); }
  } catch (e) { /* ignore */ }
  if (!lang) lang = load();
  if (lang !== 'ar' && lang !== 'en') lang = autoAr && /^ar\b/i.test(navigator.language || '') ? 'ar' : 'en';
  var AR_ON = lang === 'ar';

  /* ---------------- Styles (switch, Arabic font, language blocks) ---------------- */
  var css =
    '.lang-switch{display:inline-flex;align-items:center;gap:2px;padding:2px;border-radius:999px;background:rgba(255,255,255,.92);border:1px solid rgba(15,42,55,.14);' +
    'font:600 12.5px/1 system-ui,-apple-system,"Segoe UI",Tahoma,sans-serif;direction:ltr;letter-spacing:0;box-shadow:0 1px 2px rgba(15,42,55,.06);vertical-align:middle;white-space:nowrap}' +
    '.lang-switch button{border:0;background:none;margin:0;padding:6px 9px;border-radius:999px;cursor:pointer;color:#3B5563;font:inherit;line-height:1;min-height:0}' +
    '.lang-switch button[aria-pressed="true"]{background:#0E5F68;color:#fff;cursor:default}' +
    '.lang-switch button:focus-visible{outline:2px solid #1F9AA3;outline-offset:1px}' +
    '.lang-switch .ar{font-family:Tahoma,"Segoe UI","Noto Sans Arabic","Noto Naskh Arabic","Geeza Pro",sans-serif}' +
    '.lang-fixed{position:fixed;top:10px;right:10px;z-index:150}' +
    '[dir="rtl"] .lang-fixed{right:auto;left:10px}' +
    'html:not([lang="ar"]) [data-lang="ar"],html[lang="ar"] [data-lang="en"]{display:none!important}' +
    'html[lang="ar"] body,html[lang="ar"] body *:not(.lang-switch):not(svg):not(path){font-family:system-ui,-apple-system,"Segoe UI",Tahoma,"Noto Sans Arabic","Noto Naskh Arabic","Geeza Pro",sans-serif!important;letter-spacing:0!important}' +
    '@media print{.lang-switch{display:none!important}}';
  var st = document.createElement('style');
  st.id = 'i18n-css';
  st.textContent = css;
  (document.head || root).appendChild(st);

  if (AR_ON) { root.setAttribute('lang', 'ar'); root.setAttribute('dir', 'rtl'); }

  /* ---------------- Dictionary: exact UI strings ---------------- */
  var AR = {
    // Shared / core.js
    'DEMO': 'تجريبي',
    'Close': 'إغلاق',
    'Continue with Google': 'المتابعة باستخدام Google',
    '(demo)': '(تجريبي)',
    'Loading…': 'جارٍ التحميل…',
    'Cancel': 'إلغاء',
    'Continue': 'متابعة',
    'Saving…': 'جارٍ الحفظ…',
    'Sending…': 'جارٍ الإرسال…',
    'Google Sign-In is not configured yet. Please tell the administrator.': 'لم يتم إعداد تسجيل الدخول عبر Google بعد. يرجى إبلاغ المسؤول.',
    'Google Sign-In could not load. Check your connection, disable content blockers for this page, then reload.': 'تعذّر تحميل تسجيل الدخول عبر Google. تحقّق من اتصالك، وعطّل أدوات حظر المحتوى لهذه الصفحة، ثم أعد تحميلها.',
    'The server sent an unexpected response. Please try again.': 'أرسل الخادم استجابة غير متوقعة. يرجى المحاولة مرة أخرى.',
    'The server took too long to respond. Check your connection and try again.': 'استغرق الخادم وقتًا طويلًا للرد. تحقّق من اتصالك وحاول مرة أخرى.',
    'Could not reach the server. Check your internet connection and try again.': 'تعذّر الوصول إلى الخادم. تحقّق من اتصالك بالإنترنت وحاول مرة أخرى.',
    'Patient Flow Management System · powered by Ruqelo': 'نظام إدارة تدفق المرضى · مدعوم من Ruqelo',
    'Patient Flow Management System, powered by Ruqelo': 'نظام إدارة تدفق المرضى، مدعوم من Ruqelo',
    'Patient Flow Management System, powered by Ruqelo · patientflowms.com · ruqelo.com': 'نظام إدارة تدفق المرضى، مدعوم من Ruqelo\u200F · patientflowms.com\u200F · ruqelo.com',
    'Morning Report Attendance System': 'نظام حضور التقرير الصباحي',
    'Weekly Academic Activity Attendance System': 'نظام حضور النشاط الأكاديمي الأسبوعي',
    'Riyadh time': 'بتوقيت الرياض',
    'Staff / Badge ID': 'الرقم الوظيفي / رقم البطاقة',
    'Staff ID': 'الرقم الوظيفي',
    'Staff/Badge ID': 'الرقم الوظيفي / رقم البطاقة',
    'Badge ID': 'رقم البطاقة',
    'Employee ID': 'الرقم الوظيفي',

    // Attendee page
    'Current time': 'الوقت الحالي',
    'TEST MODE: no Google sign-in. Not for live use.': 'وضع الاختبار: بدون تسجيل دخول عبر Google. ليس للاستخدام الفعلي.',
    'Verify your identity': 'تأكيد هويتك',
    'Sign in with any Google account': 'سجّل الدخول بأي حساب Google',
    'We only receive your name and email address to confirm it\'s you. Nothing is posted and no other Google data is accessed.': 'نستلم اسمك وبريدك الإلكتروني فقط للتأكد من هويتك. لا يُنشر أي شيء، ولا نصل إلى أي بيانات أخرى في حسابك على Google.',
    'Your details': 'بياناتك',
    'Saved on this phone for next time': 'تُحفظ على هذا الجوال للمرة القادمة',
    'Full name': 'الاسم الكامل',
    'Your full name': 'اسمك الكامل',
    'Your Staff ID': 'رقمك الوظيفي',
    'Training level': 'المستوى التدريبي',
    'Remember my details on this phone': 'تذكّر بياناتي على هذا الجوال',
    'Location check': 'التحقق من الموقع',
    'Confirms you are in the classroom': 'للتأكد من وجودك في القاعة',
    'Register attendance': 'تسجيل الحضور',
    'One registration per person per session.': 'تسجيل واحد لكل شخص في كل جلسة.',
    'Open this page in Safari or Chrome': 'افتح هذه الصفحة في Safari أو Chrome',
    'Copy link': 'نسخ الرابط',
    'Link copied. Paste it in Safari or Chrome': 'تم نسخ الرابط. الصقه في Safari أو Chrome',
    'Copy this link:': 'انسخ هذا الرابط:',
    'Could not load the attendance system.': 'تعذّر تحميل نظام الحضور.',
    'Unable to load': 'تعذّر التحميل',
    'Registration open': 'التسجيل مفتوح',
    'Registration closed': 'التسجيل مغلق',
    'Registration is closed': 'التسجيل مغلق',
    'See you at the next session': 'نراك في الجلسة القادمة',
    'Session cancelled': 'الجلسة ملغاة',
    'No session today': 'لا توجد جلسة اليوم',
    'Cancelled': 'ملغاة',
    'No session': 'لا توجد جلسة',
    'Sign in to register': 'سجّل الدخول للتسجيل',
    'Email (test mode)': 'البريد الإلكتروني (وضع الاختبار)',
    'Enter a valid email': 'أدخل بريدًا إلكترونيًا صحيحًا',
    'Signed in': 'تم تسجيل الدخول',
    'Switch': 'تبديل',
    'Please enter your first and last name.': 'يرجى إدخال اسمك الأول واسم العائلة.',
    'Please choose your training level.': 'يرجى اختيار مستواك التدريبي.',
    'Location access is blocked': 'الوصول إلى الموقع محظور',
    'Secure connection required': 'يلزم اتصال آمن',
    'Location not supported': 'تحديد الموقع غير مدعوم',
    'Could not get your location': 'تعذّر تحديد موقعك',
    'Check again': 'تحقّق مرة أخرى',
    'You are in the classroom area': 'أنت داخل نطاق القاعة',
    'Location signal is weak': 'إشارة الموقع ضعيفة',
    'You seem to be outside the classroom': 'يبدو أنك خارج القاعة',
    'Finding your location…': 'جارٍ تحديد موقعك…',
    'Allow location access if your phone asks.': 'اسمح بالوصول إلى الموقع إذا طلب جوالك ذلك.',
    'Location will be checked': 'سيتم التحقق من الموقع',
    'After you sign in, allow location access when asked.': 'بعد تسجيل الدخول، اسمح بالوصول إلى الموقع عند الطلب.',
    'Open this page using its https:// address (scan the QR code again).': 'افتح هذه الصفحة عبر عنوانها الذي يبدأ بـ https:// (امسح رمز QR مرة أخرى).',
    'Your browser cannot share location. Open this page in Chrome or Safari.': 'متصفحك لا يستطيع مشاركة الموقع. افتح هذه الصفحة في Chrome أو Safari.',
    'Make sure Location (GPS) is on and Wi-Fi is enabled, then try again. Indoors, moving near a window helps.': 'تأكّد من تفعيل الموقع (GPS) وWi-Fi، ثم حاول مرة أخرى. داخل المبنى، يساعد الاقتراب من نافذة.',
    'Getting your location…': 'جارٍ تحديد موقعك…',
    'Registering…': 'جارٍ التسجيل…',
    'Location is needed to register. See the instructions above.': 'يلزم تحديد الموقع للتسجيل. راجع التعليمات أعلاه.',
    'You’re registered': 'تم تسجيل حضورك',
    'You\'re registered': 'تم تسجيل حضورك',
    'Already registered': 'مسجّل مسبقًا',
    'Your attendance for today is already recorded.': 'حضورك لهذا اليوم مسجّل بالفعل.',
    'Name': 'الاسم',
    'Registered at': 'وقت التسجيل',
    'Location': 'الموقع',
    'Verified': 'تم التحقق',
    'Disabled': 'غير مفعّل',
    'Attendee today': 'ترتيبك اليوم',
    'Reference': 'الرقم المرجعي',
    'Take a screenshot if you need proof of attendance.': 'التقط لقطة شاشة إذا احتجت إلى إثبات الحضور.',
    'Registration not accepted': 'لم يُقبل التسجيل',
    'Try again': 'حاول مرة أخرى',
    'Back': 'رجوع',
    'Not open yet': 'لم يُفتح بعد',
    'Outside the classroom area': 'خارج نطاق القاعة',
    'Location signal too weak': 'إشارة الموقع ضعيفة جدًا',
    'Location needed': 'يلزم تحديد الموقع',
    'QR code expired': 'انتهت صلاحية رمز QR',
    'Scan the classroom QR code': 'امسح رمز QR الخاص بالقاعة',
    'ID already registered today': 'الرقم مسجّل اليوم مسبقًا',
    'ID linked to another account': 'الرقم مرتبط بحساب آخر',
    'Account linked to another ID': 'الحساب مرتبط برقم آخر',
    'Not on the roster': 'غير مدرج في القائمة',
    'Too many attempts': 'محاولات كثيرة جدًا',
    'System busy': 'النظام مشغول',
    'Connection problem': 'مشكلة في الاتصال',
    'Something went wrong': 'حدث خطأ ما',
    'Not configured yet': 'لم يتم الإعداد بعد',
    'Scan the live QR code on the classroom screen to register.': 'امسح رمز QR المباشر المعروض على شاشة القاعة للتسجيل.',
    'Attendance registered.': 'تم تسجيل الحضور.',
    // Academic activity (Zoom code)
    'Code on the Zoom screen': 'الرمز الظاهر على شاشة Zoom',
    '6-digit code': 'رمز من 6 أرقام',
    'The moderator shows it on the shared screen. It changes every minute.': 'يعرضه المنسّق على الشاشة المشتركة، ويتغيّر كل دقيقة.',
    'Type the 6-digit code shown on the Zoom screen. One registration per person per session.': 'اكتب الرمز المكوّن من 6 أرقام الظاهر على شاشة Zoom. تسجيل واحد لكل شخص في كل جلسة.',
    'Please type the 6-digit code shown on the Zoom screen.': 'يرجى كتابة الرمز المكوّن من 6 أرقام الظاهر على شاشة Zoom.',
    'Code from the Zoom screen needed': 'يلزم الرمز الظاهر على شاشة Zoom',
    'Code not correct': 'الرمز غير صحيح',

    // Admin dashboard
    'Attendance Admin': 'إدارة الحضور',
    'Admin dashboard': 'لوحة الإدارة',
    'Sign in with the Google account listed in the Recipients tab.': 'سجّل الدخول بحساب Google المُدرج في تبويب المستلمين.',
    'Admin email (test mode)': 'بريد المسؤول (وضع الاختبار)',
    'Use another account': 'استخدم حسابًا آخر',
    'Could not load data': 'تعذّر تحميل البيانات',
    'Today': 'اليوم',
    'Previous day': 'اليوم السابق',
    'Next day': 'اليوم التالي',
    'Session date': 'تاريخ الجلسة',
    'Refresh': 'تحديث',
    'Session register': 'سجل الجلسة',
    'Trainee attendance': 'حضور المتدربين',
    'System & links': 'النظام والروابط',
    'Search name, ID, level…': 'ابحث بالاسم أو الرقم أو المستوى…',
    '+ Manual entry': '+ إدخال يدوي',
    'Email report ▾': 'إرسال التقرير بالبريد ▾',
    'Send a copy to me': 'أرسل نسخة إليّ',
    'Send to all recipients': 'أرسل إلى جميع المستلمين',
    'Export CSV ▾': 'تصدير CSV ▾',
    'This session': 'هذه الجلسة',
    'Last 30 days': 'آخر 30 يومًا',
    'Last 60 days': 'آخر 60 يومًا',
    'Last 90 days': 'آخر 90 يومًا',
    'Last 6 months': 'آخر 6 أشهر',
    'Last 12 months': 'آخر 12 شهرًا',
    'Everything': 'كل البيانات',
    'Register': 'السجل',
    'By training level': 'حسب المستوى التدريبي',
    'Attendance · last 30 sessions': 'الحضور · آخر 30 جلسة',
    'Rejected attempts': 'المحاولات المرفوضة',
    'Change history': 'سجل التغييرات',
    'Search trainee…': 'ابحث عن متدرب…',
    'All levels': 'كل المستويات',
    'Current configuration': 'الإعدادات الحالية',
    'Edit in the Google Sheet → Settings': 'تُعدَّل في Google Sheet ← الإعدادات',
    'Daily report recipients': 'مستلمو التقرير اليومي',
    'Manager': 'مدير',
    'Viewer': 'مشاهد',
    'Sign out': 'تسجيل الخروج',
    'No session scheduled': 'لا توجد جلسة مجدولة',
    'Present': 'الحاضرون',
    'Average': 'المتوسط',
    'Trainees': 'المتدربون',
    'Sessions': 'الجلسات',
    'Daily report': 'التقرير اليومي',
    'registered today': 'سجّلوا اليوم',
    'per session · 30 days': 'لكل جلسة · 30 يومًا',
    'attended in 30 days': 'حضروا خلال 30 يومًا',
    'held in 30 days': 'عُقدت خلال 30 يومًا',
    'Skipped': 'لم يُرسل (تخطٍّ)',
    'Not sent': 'لم يُرسل',
    'automatic, after the window closes': 'تلقائيًا بعد إغلاق فترة التسجيل',
    'Auto (scheduled)': 'تلقائي (مجدول)',
    'Manual (dashboard)': 'يدوي (لوحة الإدارة)',
    'Manual': 'يدوي',
    'Time': 'الوقت',
    'Level': 'المستوى',
    'Verification': 'التحقق',
    'edited': 'معدّل',
    'No registrations yet for this session.': 'لا توجد تسجيلات لهذه الجلسة بعد.',
    'No session on this date.': 'لا توجد جلسة في هذا التاريخ.',
    'Correct this entry': 'تصحيح هذا الإدخال',
    'Correct entry': 'تصحيح الإدخال',
    'Remove this entry': 'حذف هذا الإدخال',
    'Remove entry': 'حذف الإدخال',
    'Reason for the correction': 'سبب التصحيح',
    'e.g. trainee typed wrong ID': 'مثال: أدخل المتدرب رقمًا خاطئًا',
    'Save correction': 'حفظ التصحيح',
    'Entry corrected': 'تم تصحيح الإدخال',
    'Entry removed': 'تم حذف الإدخال',
    'Reason for removal': 'سبب الحذف',
    'e.g. registered by mistake / not present': 'مثال: سُجّل بالخطأ / لم يحضر',
    'Removing…': 'جارٍ الحذف…',
    'Remove': 'حذف',
    'Edit': 'تعديل',
    'Manual add': 'إضافة يدوية',
    'Restore': 'استعادة',
    'Before:': 'قبل:',
    'After:': 'بعد:',
    'Reason:': 'السبب:',
    '(removed)': '(محذوف)',
    'No corrections on this date.': 'لا توجد تصحيحات في هذا التاريخ.',
    'No data for this session.': 'لا توجد بيانات لهذه الجلسة.',
    'No sessions recorded yet.': 'لم تُسجَّل أي جلسات بعد.',
    'Table view': 'عرض كجدول',
    'Unknown': 'غير معروف',
    'None. All attempts on this date were accepted.': 'لا يوجد. قُبلت جميع المحاولات في هذا التاريخ.',
    'Late': 'متأخر',
    'Outside area': 'خارج النطاق',
    'Weak GPS': 'إشارة GPS ضعيفة',
    'Old QR': 'رمز QR قديم',
    'No live QR': 'بدون رمز QR مباشر',
    'No screen code': 'بدون رمز الشاشة',
    'Wrong code': 'رمز خاطئ',
    'ID reused': 'رقم مكرر',
    'ID linked': 'رقم مرتبط بحساب آخر',
    'Account linked': 'حساب مرتبط برقم آخر',
    'Not on roster': 'غير مدرج في القائمة',
    'Master register': 'السجل الرئيسي',
    'Google Sheet · all sessions': 'Google Sheet · جميع الجلسات',
    'Attendee page': 'صفحة الحضور',
    'What the QR code opens': 'الصفحة التي يفتحها رمز QR',
    'Classroom poster': 'ملصق القاعة',
    'Print-ready A4 with QR': 'ملصق A4 جاهز للطباعة مع رمز QR',
    'Classroom display': 'شاشة القاعة',
    'Live screen for the projector': 'شاشة مباشرة لجهاز العرض',
    'Moderator screen': 'شاشة المنسّق',
    'Live screen to share on Zoom': 'شاشة مباشرة للمشاركة عبر Zoom',
    'PDF archive': 'أرشيف PDF',
    'Every daily report in Drive': 'جميع التقارير اليومية في Drive',
    'Poster PDF (reprint)': 'ملصق PDF (لإعادة الطباعة)',
    'Download & print the official QR poster': 'نزّل واطبع ملصق QR الرسمي',
    'How-to guide (PDF)': 'دليل الاستخدام (PDF)',
    'For recipients & managers': 'للمستلمين والمديرين',
    'Set classroom location': 'تحديد موقع القاعة',
    'Stand in the room and tap': 'قف داخل القاعة واضغط',
    'QR card': 'بطاقة QR',
    'PDF/A4 to post in the Zoom chat': 'PDF/A4 لنشرها في محادثة Zoom',
    'E-poster': 'الملصق الإلكتروني',
    'Image for the WhatsApp group': 'صورة لمجموعة WhatsApp',
    'Registration window': 'فترة التسجيل',
    'Session days': 'أيام الجلسات',
    'Live rotating QR': 'رمز QR متجدّد',
    'Required': 'مطلوب',
    'Off': 'متوقف',
    'On · location NOT set': 'مفعّل · لم يُحدَّد الموقع',
    'Sign-in': 'تسجيل الدخول',
    'TEST MODE (no Google sign-in)': 'وضع الاختبار (بدون تسجيل دخول عبر Google)',
    'Google account (verified)': 'حساب Google (موثّق)',
    'No recipients yet. Add them in the Recipients tab.': 'لا يوجد مستلمون بعد. أضفهم في تبويب المستلمين.',
    'Trainee': 'المتدرب',
    'Attended': 'مرات الحضور',
    'Attendance rate': 'نسبة الحضور',
    'Last seen': 'آخر حضور',
    'Below 75%': 'أقل من 75%',
    'Below 50%': 'أقل من 50%',
    'No trainees match.': 'لا يوجد متدربون مطابقون.',
    'Add manual entry': 'إضافة إدخال يدوي',
    'Date': 'التاريخ',
    'Choose…': 'اختر…',
    'Note (optional)': 'ملاحظة (اختياري)',
    'e.g. phone battery dead, confirmed by chief resident': 'مثال: نفدت بطارية الجوال، وأكّد ذلك رئيس الأطباء المقيمين',
    'Add entry': 'إضافة الإدخال',
    'Waiting for location…': 'بانتظار تحديد الموقع…',
    'Allowed radius (metres)': 'النطاق المسموح (بالأمتار)',
    'Indoors, GPS is often ±20–60 m. 50 m covers the classroom; the phone\'s reported uncertainty (up to 50 m) is added automatically.': 'داخل المباني تكون دقة GPS غالبًا ±20–60 م. نطاق 50 م يغطي القاعة، ويُضاف هامش عدم الدقة الذي يُبلغ عنه الجوال (حتى 50 م) تلقائيًا.',
    'Stand in the middle of the Morning Report classroom with this phone. Wait until accuracy is under ~30 m, then save.': 'قف في منتصف قاعة التقرير الصباحي بهذا الجوال. انتظر حتى تصبح الدقة أقل من 30 م تقريبًا، ثم احفظ.',
    'Stand in the middle of the classroom with this phone. Wait until accuracy is under ~30 m, then save.': 'قف في منتصف القاعة بهذا الجوال. انتظر حتى تصبح الدقة أقل من 30 م تقريبًا، ثم احفظ.',
    'Save this location': 'حفظ هذا الموقع',
    'No location yet': 'لم يُحدَّد الموقع بعد',
    'Good': 'جيدة',
    'Fair, wait a little': 'مقبولة، انتظر قليلًا',
    'Poor': 'ضعيفة',
    'Demo mode: data is simulated. Set API_URL in config.js to connect the real Google Sheet.': 'الوضع التجريبي: البيانات محاكاة. اضبط API_URL في config.js لربط Google Sheet الفعلي.',
    'That entry no longer exists.': 'هذا الإدخال لم يعد موجودًا.',
    'Please give a short reason for the change.': 'يرجى كتابة سبب مختصر للتغيير.',
    'Unknown action.': 'إجراء غير معروف.',
    'QR code': 'رمز QR',

    // Room display
    'Attendance': 'الحضور',
    'registered so far': 'سجّلوا حتى الآن',
    'Scan to register': 'امسح الرمز للتسجيل',
    'Sign in with Google · be in the classroom': 'سجّل الدخول عبر Google · كن داخل القاعة',
    'Sign in with Google': 'سجّل الدخول عبر Google',
    'Live code · refreshes automatically': 'رمز مباشر · يتجدّد تلقائيًا',
    'Scan the QR code': 'امسح رمز QR',
    'Confirm name, ID & level': 'أكّد الاسم والرقم والمستوى',
    'Keep your location on': 'أبقِ خدمة الموقع مفعّلة',
    'Full screen': 'ملء الشاشة',
    'This screen needs its display key.': 'تحتاج هذه الشاشة إلى مفتاح العرض الخاص بها.',
    'Open it from the Admin dashboard → System & links → Classroom display.': 'افتحها من لوحة الإدارة ← النظام والروابط ← شاشة القاعة.',
    'Open it from the Admin dashboard → System & links → Moderator screen.': 'افتحها من لوحة الإدارة ← النظام والروابط ← شاشة المنسّق.',
    'until registration opens': 'حتى يُفتح التسجيل',
    'Closed': 'مغلق',
    'Scan, or open the link in the chat': 'امسح الرمز أو افتح الرابط في المحادثة',
    'and type this code': 'واكتب هذا الرمز',
    'Live QR and code · change every minute': 'رمز QR والرمز الرقمي مباشران · يتغيّران كل دقيقة',
    'Scan the QR or tap the chat link': 'امسح رمز QR أو اضغط رابط المحادثة',
    'Type the code shown here': 'اكتب الرمز الظاهر هنا',

    // Poster / QR card
    'Poster': 'الملصق',
    'Attendee page URL (QR target)': 'رابط صفحة الحضور (وجهة رمز QR)',
    'QR target URL': 'رابط وجهة رمز QR',
    'Edit text': 'تعديل النص',
    'Reset text': 'استعادة النص الأصلي',
    'Print / Save as PDF': 'طباعة / حفظ PDF',
    'Click any text on the poster to change it (saved in this browser). Print at 100% scale on A4, or choose A3 in the print dialog and "Fit to page".': 'انقر على أي نص في الملصق لتغييره (يُحفظ في هذا المتصفح). اطبع بمقياس 100% على ورق A4، أو اختر A3 في نافذة الطباعة مع «ملاءمة للصفحة».',
    'Reset all poster text to the defaults?': 'هل تريد إعادة جميع نصوص الملصق إلى الوضع الافتراضي؟',
    'Use your phone camera · takes about 15 seconds': 'استخدم كاميرا جوالك · يستغرق نحو 15 ثانية',
    'Scan the QR': 'امسح رمز QR',
    'Open the camera and tap the link': 'افتح الكاميرا واضغط الرابط',
    'Any personal Google account': 'أي حساب Google شخصي',
    'Confirm your details': 'أكّد بياناتك',
    'Name, ID and training level': 'الاسم والرقم الوظيفي والمستوى التدريبي',
    'Riyadh time only': 'بتوقيت الرياض فقط',
    'In the classroom': 'داخل القاعة',
    'Location verified by GPS': 'يُتحقَّق من الموقع عبر GPS',
    'Please register in person': 'يرجى التسجيل حضوريًا',
    'Once per session': 'مرة واحدة لكل جلسة',
    'One registration per person': 'تسجيل واحد لكل شخص',
    'Thank you for your participation': 'شكرًا لمشاركتكم',
    'Join from anywhere': 'انضم من أي مكان',
    'Zoom · home or hospital': 'Zoom · من المنزل أو المستشفى',

    // E-poster / QR slide (academic activity)
    'Register your attendance on Zoom': 'سجّل حضورك عبر Zoom',
    'Every Monday · 12:55 – 2:00 PM': 'كل يوم اثنين · 12:55 – 2:00 م',
    'Tap the link or scan the QR': 'اضغط الرابط أو امسح رمز QR',
    'During the session': 'أثناء الجلسة',
    'Open the link': 'افتح الرابط',
    'The moderator posts it in the Zoom chat at 12:55': 'ينشره المنسّق في محادثة Zoom الساعة 12:55',
    'Any Gmail account': 'أي حساب Gmail',
    'Enter name, Staff ID & level': 'أدخل الاسم والرقم الوظيفي والمستوى',
    'Only the first time, then it is remembered': 'في المرة الأولى فقط، ثم تُحفظ',
    'Tap “Register attendance”': 'اضغط «تسجيل الحضور»',
    'Done in about 15 seconds': 'ينتهي في نحو 15 ثانية',
    'From anywhere': 'من أي مكان',
    'Home or hospital': 'المنزل أو المستشفى',
    'Once per person': 'مرة واحدة لكل شخص',
    'Your own Google account': 'بحساب Google الخاص بك',
    '12:55 – 2:00 only': 'من 12:55 إلى 2:00 فقط',
    'Late entries closed': 'لا يُقبل التسجيل المتأخر',
    'Thank you for attending': 'شكرًا لحضوركم',
    'Scan to register attendance': 'امسح الرمز لتسجيل الحضور',
    'Weekly Academic Activity · Mondays 12:55 – 2:00 PM': 'النشاط الأكاديمي الأسبوعي · أيام الاثنين 12:55 – 2:00 م',

    // Guide / privacy chrome
    'Guide': 'الدليل',
    'Morning Report Attendance · for recipients and managers': 'حضور التقرير الصباحي · للمستلمين والمديرين',
    'Weekly Academic Activity Attendance · one page for everyone': 'حضور النشاط الأكاديمي الأسبوعي · صفحة واحدة للجميع',

    // Static page titles
    'Attendance Admin · Morning Report': 'إدارة الحضور · التقرير الصباحي',
    'Attendance Admin · Weekly Academic Activity': 'إدارة الحضور · النشاط الأكاديمي الأسبوعي',
    'Classroom Display · Morning Report': 'شاشة القاعة · التقرير الصباحي',
    'Moderator Screen · Weekly Academic Activity': 'شاشة المنسّق · النشاط الأكاديمي الأسبوعي',
    'Classroom Poster · Morning Report': 'ملصق القاعة · التقرير الصباحي',
    'QR Card · Weekly Academic Activity': 'بطاقة QR · النشاط الأكاديمي الأسبوعي',
    'Guide · Morning Report Attendance': 'الدليل · حضور التقرير الصباحي',
    'Guide · Weekly Academic Activity Attendance': 'الدليل · حضور النشاط الأكاديمي الأسبوعي',
    'Privacy · Morning Report Attendance': 'الخصوصية · حضور التقرير الصباحي',
    'Privacy · Weekly Academic Activity Attendance': 'الخصوصية · حضور النشاط الأكاديمي الأسبوعي',
    'E-Poster · Weekly Academic Activity': 'الملصق الإلكتروني · النشاط الأكاديمي الأسبوعي',
    'QR for slides · Weekly Academic Activity': 'رمز QR للشرائح · النشاط الأكاديمي الأسبوعي'
  };

  /* ---------------- Whole phrases with inline markup (matched on their text) ---------------- */
  var HT = {
    'Google sign-in does not work inside this app. Tap the ⋯ or Share menu and choose Open in Safari / Open in Chrome, or copy the link and paste it in your browser.':
      'تسجيل الدخول عبر Google لا يعمل داخل هذا التطبيق. اضغط قائمة <b>⋯</b> أو <b>مشاركة</b> واختر <b>الفتح في Safari / الفتح في Chrome</b>، أو انسخ الرابط والصقه في متصفحك.',
    'To allow it on iPhone: Open Settings → Privacy & Security → Location Services and make sure it is On. Scroll to your browser (Safari Websites or Chrome) → While Using the App, and turn on Precise Location. Come back and tap Check again (reload if needed).':
      'للسماح بذلك على iPhone:<ol><li>افتح <b>الإعدادات ← الخصوصية والأمن ← خدمات الموقع</b> وتأكّد أنها <b>مفعّلة</b>.</li><li>انتقل إلى متصفحك (<b>مواقع Safari</b> أو <b>Chrome</b>) ← <b>أثناء استخدام التطبيق</b>، وفعّل <b>الموقع الدقيق</b>.</li><li>ارجع واضغط <b>تحقّق مرة أخرى</b> (أعد تحميل الصفحة إذا لزم الأمر).</li></ol>',
    'To allow it on Android / Chrome: Tap the lock / settings icon next to the address bar → Permissions → Location → Allow. Make sure phone Location is switched on (pull down quick settings). Tap Check again.':
      'للسماح بذلك على Android / Chrome:<ol><li>اضغط <b>أيقونة القفل / الإعدادات</b> بجوار شريط العنوان ← <b>الأذونات ← الموقع ← السماح</b>.</li><li>تأكّد من تفعيل <b>الموقع</b> في الجوال (اسحب الإعدادات السريعة للأسفل).</li><li>اضغط <b>تحقّق مرة أخرى</b>.</li></ol>',
    'For someone who attended but could not register (e.g. phone problem). It is marked Manual in the register and report.':
      'لمن حضر ولم يتمكن من التسجيل (مثل مشكلة في الجوال). يظهر بعلامة <b>يدوي</b> في السجل والتقرير.',
    'Scan to register your attendance': 'امسح الرمز<br>لتسجيل حضورك',
    'Weekly Academic Activity': 'النشاط الأكاديمي<br>الأسبوعي',
    'Adult Emergency Unit Emergency Department': 'وحدة طوارئ البالغين<br>قسم الطوارئ',
    'Weekly Academic Activity Attendance Patient Flow Management System, powered by Ruqelo': 'حضور النشاط الأكاديمي الأسبوعي<br>نظام إدارة تدفق المرضى، مدعوم من Ruqelo'
  };

  /* ---------------- Server error codes: generic Arabic messages ---------------- */
  var CODES = {
    WINDOW_CLOSED: 'انتهت فترة التسجيل لهذا اليوم. لا يُقبل التسجيل المتأخر.',
    WINDOW_NOT_OPEN: 'لم يُفتح التسجيل بعد. يرجى المحاولة عند بدء فترة التسجيل.',
    NO_SESSION: 'لا توجد جلسة مجدولة اليوم.',
    GEO_OUTSIDE: 'يبدو أنك خارج نطاق القاعة. لا يمكن تسجيل الحضور إلا من داخل القاعة.',
    GEO_WEAK: 'دقة تحديد موقعك أضعف من أن تؤكد وجودك في القاعة. فعّل Wi-Fi والموقع الدقيق، واقترب من نافذة، ثم اضغط «حاول مرة أخرى».',
    GEO_REQUIRED: 'يلزم تحديد الموقع للتسجيل. اسمح بالوصول إلى الموقع ثم حاول مرة أخرى.',
    CODE_EXPIRED: 'انتهت صلاحية الرمز. امسح الرمز المباشر المعروض على الشاشة مرة أخرى.',
    CODE_REQUIRED: 'يلزم الرمز المباشر المعروض على الشاشة لإتمام التسجيل.',
    CODE_INVALID: 'الرمز غير صحيح. تحقّق من الرمز الظاهر على الشاشة وحاول مرة أخرى.',
    ID_ALREADY_USED: 'هذا الرقم سُجّل به حضور اليوم بالفعل.',
    ID_LINKED_ELSEWHERE: 'هذا الرقم مرتبط بحساب Google آخر. استخدم الحساب الذي سجّلت به سابقًا أو تواصل مع المسؤول.',
    ACCOUNT_LINKED_ELSEWHERE: 'حساب Google هذا مرتبط برقم آخر. تواصل مع المسؤول إذا كان ذلك خطأ.',
    NOT_ON_ROSTER: 'رقمك غير مدرج في قائمة المشاركين. تواصل مع المسؤول.',
    RATE_LIMIT: 'محاولات كثيرة جدًا. انتظر قليلًا ثم حاول مرة أخرى.',
    BUSY: 'النظام مشغول حاليًا. حاول مرة أخرى بعد لحظات.',
    NETWORK: 'تعذّر الاتصال بالخادم. تحقّق من اتصالك بالإنترنت وحاول مرة أخرى.',
    BAD_RESPONSE: 'أرسل الخادم استجابة غير متوقعة. يرجى المحاولة مرة أخرى.',
    SERVER_ERROR: 'حدث خطأ ما. يرجى المحاولة مرة أخرى.',
    NOT_CONFIGURED: 'لم يتم إعداد النظام بعد. يرجى إبلاغ المسؤول.'
  };

  /* ---------------- Dates, units ---------------- */
  var WD = { Sun: 'الأحد', Mon: 'الاثنين', Tue: 'الثلاثاء', Wed: 'الأربعاء', Thu: 'الخميس', Fri: 'الجمعة', Sat: 'السبت' };
  var MO = { Jan: 'يناير', Feb: 'فبراير', Mar: 'مارس', Apr: 'أبريل', May: 'مايو', Jun: 'يونيو', Jul: 'يوليو', Aug: 'أغسطس', Sep: 'سبتمبر', Oct: 'أكتوبر', Nov: 'نوفمبر', Dec: 'ديسمبر' };
  var MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  var W = '(Sun|Mon|Tue|Wed|Thu|Fri|Sat)(?:day|sday|nesday|rsday|urday)?\\.?', M = '(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)(?:uary|ruary|ch|il|e|y|ust|t|tember|ober|ember)?\\.?';
  var DATE_GB = new RegExp('^(?:' + W + ',? )?(\\d{1,2}) ' + M + '(?:,? (\\d{4}))?$');
  var DATE_US = new RegExp('^(?:' + W + ',? )?' + M + ' (\\d{1,2})(?:,? (\\d{4}))?$');
  function date(s) {
    var m = DATE_GB.exec(s);
    if (m) return (m[1] ? WD[m[1]] + ' ' : '') + m[2] + ' ' + MO[m[3]] + (m[4] ? ' ' + m[4] : '');
    m = DATE_US.exec(s);
    if (m) return (m[1] ? WD[m[1]] + ' ' : '') + m[3] + ' ' + MO[m[2]] + (m[4] ? ' ' + m[4] : '');
    return null;
  }
  function days(s) { // "Sun, Mon, Tue"
    if (!/^(?:(?:Sun|Mon|Tue|Wed|Thu|Fri|Sat)[a-z]*(?:, |$))+$/.test(s)) return null;
    return s.split(', ').map(function (d) { return WD[d.slice(0, 3)]; }).join('، ');
  }
  function units(s) { return String(s).replace(/(\d+(?:\.\d+)?) ?km\b/g, '$1 كم').replace(/(\d+(?:\.\d+)?) ?m\b/g, '$1 م').replace(/(\d+) ?min\b/g, '$1 دقيقة'); }

  /* ---------------- Patterns for dynamic text ----------------
   * [regex, template, optional selector the text must be inside]
   * Template: $1 = captured text as-is (user / server data), $T1 = translated if known,
   * $U1 = with distance units in Arabic. Captured program, department and classroom
   * names are always passed through unchanged.
   */
  var TM = '(\\d{1,2}:\\d{2}(?::\\d{2})?)';
  var P = [
    // page titles built from the program name (server data)
    [/^(.+) Attendance$/, 'حضور $1', 'title,#inst,[data-k="inst"]'],
    // attendee status & buttons
    [new RegExp('^Opens at ' + TM + '$'), 'يُفتح الساعة $1'],
    [new RegExp('^Closed at ' + TM + '$'), 'أُغلق الساعة $1'],
    [new RegExp('^left · closes at ' + TM + ' \\((.+)\\)$'), 'متبقٍّ · يُغلق الساعة $1 ($T2)'],
    [new RegExp('^remaining · closes at ' + TM + '$'), 'متبقٍّ · يُغلق الساعة $1'],
    [new RegExp('^until registration opens · window ' + TM + '–' + TM + '$'), 'حتى يُفتح التسجيل · الفترة $1–$2'],
    [/^Next session: (.+) · (\d{1,2}:\d{2})$/, 'الجلسة القادمة: $T1 · $2'],
    [/^Next session: (.+) at (\d{1,2}:\d{2})$/, 'الجلسة القادمة: $T1 الساعة $2'],
    [new RegExp('^Closed at ' + TM + ' · next: (.+) (\\d{1,2}:\\d{2})$'), 'أُغلق الساعة $1 · القادمة: $T2 $3'],
    [/^(.+) · (Next session: .+)$/, '$1 · $T2'],
    [/^(\d+)h (\d{2})m$/, '$1 س $2 د'],
    [/^Attendance · (.+)$/, 'الحضور · $T1'],
    [/^You must be within (\d+) m of the (.+)$/, 'يجب أن تكون على بُعد $1 م أو أقل من $2'],
    [/^Please enter a valid (.+)\.$/, 'يرجى إدخال $T1 صحيح.'],
    [/^Thank you for attending (.+)\.$/, 'شكرًا لحضورك $1.'],
    [/^Verified · (.+)$/, 'تم التحقق · $U1'],
    [new RegExp('^' + TM + ' · Riyadh time$'), '$1 · بتوقيت الرياض'],
    [/^≈ (\S+ k?m) from the (.+) \(±(\S+ k?m)\)( · improving…)?$/, function (m) { return '≈ ' + units(m[1]) + ' من ' + m[2] + ' (±' + units(m[3]) + ')' + (m[4] ? ' · جارٍ تحسين الدقة…' : ''); }],
    [/^Accuracy ±(\S+ k?m)\. Turn on Wi-Fi and Precise Location, or move near a window\.$/, 'الدقة ±$U1. فعّل Wi-Fi والموقع الدقيق، أو اقترب من نافذة.'],
    // server messages (attendee)
    [new RegExp('^Registration opens at ' + TM + ' \\(Riyadh time\\)\\. Please try again then\\.$'), 'يُفتح التسجيل الساعة $1 (بتوقيت الرياض). يرجى المحاولة حينها.'],
    [new RegExp('^Registration for today closed at ' + TM + '\\. It is now ' + TM + '\\. Late registrations are not accepted\\.$'), 'أُغلق التسجيل لهذا اليوم الساعة $1، والساعة الآن $2. لا يُقبل التسجيل المتأخر.'],
    [/^There is no (.+) scheduled today\.$/, 'لا توجد جلسة $1 مجدولة اليوم.'],
    [/^You appear to be about (\S+ k?m) from the (.+) \(allowed: (\S+ k?m)\)\.( Attendance can only be registered from the classroom\.)?$/, function (m) { return 'يبدو أنك على بُعد نحو ' + units(m[1]) + ' من ' + m[2] + ' (المسموح: ' + units(m[3]) + ').' + (m[4] ? ' لا يمكن تسجيل الحضور إلا من داخل القاعة.' : ''); }],
    [/^Your phone could only locate you to within ±(\S+ k?m), which is too imprecise to confirm you are in the classroom\. Turn on Wi-Fi and Precise Location, move near a window, then tap Try again\.$/, 'لم يتمكن جوالك من تحديد موقعك إلا بدقة ±$U1، وهي غير كافية لتأكيد وجودك في القاعة. فعّل Wi-Fi والموقع الدقيق، واقترب من نافذة، ثم اضغط «حاول مرة أخرى».'],
    // admin
    [/^Registration open until (\d{1,2}:\d{2})$/, 'التسجيل مفتوح حتى $1'],
    [/^Register · (.+)$/, 'السجل · $T1'],
    [/^(\d+) present$/, 'الحاضرون: $1'],
    [/^on (.+)$/, 'في $T1', '.kpi'],
    [/^Sent (\d{1,2}:\d{2})$/, 'أُرسل $1'],
    [/^Due (\d{1,2}:\d{2})$/, 'موعده $1'],
    [/^GPS · (.+)$/, 'GPS · $U1'],
    [/^(.+) ([↑↓])$/, '$T1 $2', 'th'],
    [/^(.+) · ref (\S+)\. The change and your reason are recorded in the audit log\.$/, '$T1 · المرجع $2. يُسجَّل التغيير وسببه في سجل التدقيق.'],
    [new RegExp('^\\((.*)\\) from (.+) at ' + TM + '\\? The full entry is kept in the audit log\\.$'), '($1) من سجل $T2 الساعة $3؟ يُحتفظ بالإدخال كاملًا في سجل التدقيق.'],
    [/^(Entry corrected|Entry removed)\. The report for this date was already sent; use Email report to resend\.$/, '$T1. سبق إرسال تقرير هذا التاريخ؛ استخدم «إرسال التقرير بالبريد» لإعادة إرساله.'],
    [/^present · (.+)$/, 'حاضرون · $T1'],
    [/^Attendance per session, last (\d+) sessions$/, 'الحضور في كل جلسة، آخر $1 جلسة'],
    [/^On · (\d+) m around (.+)$/, 'مفعّل · نطاق $1 م حول $2'],
    [/^(\d+) min after the window closes$/, 'بعد $1 دقيقة من إغلاق فترة التسجيل'],
    [/^(\d+) sessions · (.+) – (.+)$/, 'عدد الجلسات: $1 · $T2 – $T3'],
    [/^Added (.+)$/, 'تمت إضافة $1', '.toast'],
    [/^Email the report for (.+) to all daily-report recipients now\?$/, 'هل تريد إرسال تقرير $1 الآن إلى جميع مستلمي التقرير اليومي؟'],
    [/^Report sent to (.+)$/, 'تم إرسال التقرير إلى $1'],
    [/^Exported (\d+) rows$/, 'تم التصدير: $1 صف'],
    [/^Accuracy is only ±(\d+) m\. Save anyway\?$/, 'الدقة ±$1 م فقط. هل تريد الحفظ على أي حال؟'],
    [/^Classroom location saved \(±(\d+) m, radius (\d+) m\)$/, 'تم حفظ موقع القاعة (±$1 م، النطاق $2 م)'],
    [/^Accuracy ±(\d+) m$/, 'الدقة ±$1 م'],
    [/^Location unavailable \((.+)\)\. Allow location access for this site and retry\.$/, 'الموقع غير متاح ($1). اسمح لهذا الموقع بالوصول إلى موقعك ثم أعد المحاولة.'],
    // display
    [/^Sign in with Google · be within (\d+) m of the classroom$/, 'سجّل الدخول عبر Google · كن على بُعد $1 م أو أقل من القاعة'],
    [/^Connection problem, retrying… \((\d+)\)$/, 'مشكلة في الاتصال، جارٍ إعادة المحاولة… ($1)']
  ];

  /* ---------------- Engine ---------------- */
  function norm(s) { return String(s).replace(/\s+/g, ' ').trim(); }
  function fill(tpl, m) {
    if (typeof tpl === 'function') return tpl(m);
    return tpl.replace(/\$([TU]?)(\d)/g, function (_, f, i) {
      var v = m[+i] === undefined ? '' : m[+i];
      return f === 'T' ? T(v) : f === 'U' ? units(v) : v;
    });
  }
  /** Arabic for a normalised English string, or null when it is not a known UI string. */
  function tr(s, el) {
    if (!s) return null;
    if (Object.prototype.hasOwnProperty.call(AR, s)) return AR[s];
    // Chart axis: short numeric dates so long Arabic month names do not overlap.
    if (el && el.closest && el.closest('.axis')) { var a = DATE_GB.exec(s); if (a) return a[2] + '/' + (MON.indexOf(a[3]) + 1); }
    var d = date(s); if (d) return d;
    d = days(s); if (d) return d;
    for (var i = 0; i < P.length; i++) {
      var p = P[i];
      if (p[2] && !(el && el.closest && el.closest(p[2]))) continue;
      var m = p[0].exec(s);
      if (m) return fill(p[1], m);
    }
    return null;
  }
  function T(s) { var r = tr(norm(s)); return r === null ? s : r; }

  var mine = new WeakMap();   // text node -> value we wrote
  var mineAttr = new WeakMap(); // element -> {attr: value we wrote}
  var missing = {};
  var ATTRS = ['placeholder', 'title', 'aria-label'];
  var SKIP_TAG = { SCRIPT: 1, STYLE: 1, NOSCRIPT: 1, TEXTAREA: 1, CODE: 1, PRE: 1 };

  function skipSelf(el) {
    return SKIP_TAG[el.tagName] === 1 || el.getAttribute('translate') === 'no' || el.hasAttribute('data-lang') ||
      el.hasAttribute('contenteditable') || (el.classList && el.classList.contains('lang-switch'));
  }
  function skipped(el) {
    for (; el && el.nodeType === 1; el = el.parentNode) if (skipSelf(el)) return true;
    return false;
  }
  function miss(s, where) { if (/[A-Za-z]{2,}/.test(s)) missing[s] = where || 'text'; }

  function doText(n) {
    var v = n.nodeValue;
    if (!v || !/[A-Za-z]/.test(v) || mine.get(n) === v) return;
    var k = norm(v), el = n.parentNode;
    var r = tr(k, el);
    if (r === null) {
      var host = el && el.closest && el.closest('[data-i18n-code]');
      var code = host && host.getAttribute('data-i18n-code');
      if (code && CODES[code]) r = CODES[code];
    }
    if (r === null) { miss(k, el && el.tagName === 'TITLE' ? 'title' : 'text'); return; }
    var out = (/^\s/.test(v) ? ' ' : '') + r + (/\s$/.test(v) ? ' ' : '');
    mine.set(n, out);
    n.nodeValue = out;
  }
  function doAttrs(el) {
    for (var i = 0; i < ATTRS.length; i++) {
      var a = ATTRS[i], v = el.getAttribute(a);
      if (!v || !/[A-Za-z]/.test(v)) continue;
      var done = mineAttr.get(el);
      if (done && done[a] === v) continue;
      var r = tr(norm(v), el);
      if (r === null) { miss(norm(v), a); continue; }
      if (!done) { done = {}; mineAttr.set(el, done); }
      done[a] = r;
      el.setAttribute(a, r);
    }
  }
  // Text of an element with line and block breaks as spaces, for whole-phrase (HT) lookups.
  var INLINE = { B: 1, I: 1, EM: 1, STRONG: 1, SPAN: 1, A: 1, SMALL: 1, BDI: 1, SUP: 1, SUB: 1, U: 1 };
  function phrase(el) {
    var s = '';
    (function walk(n) {
      for (var c = n.firstChild; c; c = c.nextSibling) {
        if (c.nodeType === 3) s += c.nodeValue;
        else if (c.nodeType === 1) {
          if (INLINE[c.tagName]) walk(c);
          else { s += ' '; walk(c); s += ' '; } // <br>, <li>, <p>… separate words
        }
      }
    })(el);
    return norm(s);
  }
  function tryPhrase(el) {
    if (!el.firstElementChild) return false;
    var mixed = false;
    for (var c = el.firstChild; c; c = c.nextSibling) if (c.nodeType === 3 && /\S/.test(c.nodeValue)) { mixed = true; break; }
    if (!mixed) return false;
    var k = phrase(el);
    if (!k || k.length > 800 || !Object.prototype.hasOwnProperty.call(HT, k)) return false;
    el.innerHTML = HT[k];
    markMine(el);
    return true;
  }
  function markMine(el) {
    var w = document.createTreeWalker(el, NodeFilter.SHOW_TEXT, null);
    for (var n = w.nextNode(); n; n = w.nextNode()) mine.set(n, n.nodeValue);
  }
  function walk(el, force) {
    if (!force && skipSelf(el)) return;
    if (tryPhrase(el)) return;
    doAttrs(el);
    for (var c = el.firstChild; c; c = c.nextSibling) {
      if (c.nodeType === 3) doText(c);
      else if (c.nodeType === 1) walk(c);
    }
  }
  function process(node) {
    if (node.nodeType === 3) {
      if (mine.get(node) === node.nodeValue) return;
      var p = node.parentNode;
      if (!p || skipped(p)) return;
      if (p.nodeType === 1 && tryPhrase(p)) return;
      doText(node);
    } else if (node.nodeType === 1) {
      if (node.parentNode && skipped(node.parentNode)) return;
      walk(node);
    }
  }

  var obs = null;
  function start() {
    if (obs) return;
    obs = new MutationObserver(function (list) {
      for (var i = 0; i < list.length; i++) {
        var r = list[i];
        if (r.type === 'childList') { for (var j = 0; j < r.addedNodes.length; j++) process(r.addedNodes[j]); }
        else if (r.type === 'characterData') process(r.target);
        else if (r.type === 'attributes') { if (!skipped(r.target)) doAttrs(r.target); }
      }
    });
    obs.observe(root, { childList: true, subtree: true, characterData: true, attributes: true, attributeFilter: ATTRS });
  }

  if (AR_ON) {
    start();
    // Native dialogs are not part of the DOM: translate their text too.
    ['alert', 'confirm', 'prompt'].forEach(function (fn) {
      var orig = window[fn];
      if (typeof orig !== 'function') return;
      window[fn] = function (msg) {
        var args = Array.prototype.slice.call(arguments);
        if (msg !== undefined) args[0] = T(String(msg));
        return orig.apply(window, args);
      };
    });
  }

  /* ---------------- Switch ---------------- */
  function setLang(l) {
    if (l === lang) return;
    save(l);
    var u = new URL(location.href);
    if (u.searchParams.has('lang')) { u.searchParams.delete('lang'); location.replace(u.href); }
    else location.reload();
  }
  function makeSwitch() {
    var w = document.createElement('div');
    w.className = 'lang-switch';
    w.setAttribute('role', 'group');
    w.setAttribute('aria-label', AR_ON ? 'اللغة' : 'Language');
    w.setAttribute('translate', 'no');
    w.innerHTML = '<button type="button" lang="en" data-l="en">EN</button><button type="button" class="ar" lang="ar" data-l="ar">عربي</button>';
    Array.prototype.forEach.call(w.querySelectorAll('button'), function (b) {
      b.setAttribute('aria-pressed', String(b.getAttribute('data-l') === lang));
      b.onclick = function () { setLang(b.getAttribute('data-l')); };
    });
    return w;
  }
  function mountSwitch() {
    if (document.querySelector('.lang-switch')) return;
    var slot = document.querySelector('[data-lang-switch]');
    var sw = makeSwitch();
    if (slot) slot.appendChild(sw);
    else { sw.classList.add('lang-fixed'); document.body.appendChild(sw); }
  }

  function ready() {
    mountSwitch();
    if (AR_ON) walk(document.documentElement);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', ready);
  else ready();

  window.MRI18N = {
    lang: lang,
    ar: AR_ON,
    set: setLang,
    /** Translate a UI string (identity in English). */
    t: function (s) { return AR_ON ? T(s) : s; },
    /** Translate an element subtree now, including contenteditable content (identity in English). */
    apply: function (el) { if (AR_ON && el) walk(el, true); },
    missing: missing,
    _dict: AR, _phrases: HT, _codes: CODES
  };
})();
