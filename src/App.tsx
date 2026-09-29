import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Shield, Download, Copy, Check, Terminal, Server, Cloud,
  ChevronDown, ChevronUp, Code, Users, ClipboardCheck,
  Award, AlertTriangle, BarChart3, Bell, FileText, Settings,
  Zap, Database, Globe, Lock, Smartphone, Moon, Sun
} from 'lucide-react';

const features = [
  { icon: <Users className="w-5 h-5" />, title: 'مدیریت دانش‌آموزان', desc: 'CRUD کامل + فیلتر + جستجو + کارت شناسنامه' },
  { icon: <ClipboardCheck className="w-5 h-5" />, title: 'حضور و غیاب', desc: 'ثبت گروهی + ۴ وضعیت + آمار لحظه‌ای' },
  { icon: <AlertTriangle className="w-5 h-5" />, title: 'سیستم انضباطی', desc: 'سوابق مثبت/منفی + دسته‌بندی + امتیازدهی' },
  { icon: <Award className="w-5 h-5" />, title: 'ارزشیابی نمرات', desc: 'وزن‌دهی + GPA + کارنامه + رتبه‌بندی' },
  { icon: <BarChart3 className="w-5 h-5" />, title: 'گزارش‌ها و آمار', desc: 'تحلیل ریسک + مقایسه رشته‌ها + نمودار' },
  { icon: <Bell className="w-5 h-5" />, title: 'اطلاعیه‌ها', desc: '۴ نوع + سنجاق + ارسال گروهی' },
  { icon: <FileText className="w-5 h-5" />, title: 'اسناد و کارنامه', desc: 'صدور کارنامه + گواهی + چاپ/PDF' },
  { icon: <Settings className="w-5 h-5" />, title: 'تنظیمات', desc: 'پشتیبان‌گیری + پیکربندی + ظاهر' },
];

const userRoles = [
  { role: 'مدیر', icon: '🛡️', access: 'دسترسی کامل به تمام بخش‌ها' },
  { role: 'دبیر', icon: '📖', access: 'ثبت نمرات، انضباط و حضور و غیاب' },
  { role: 'مشاور', icon: '🧭', access: 'پیگیری و گزارش‌های تحلیلی' },
  { role: 'ولی', icon: '👨‍👩‍👦', access: 'مشاهده وضعیت فرزند' },
  { role: 'دانش‌آموز', icon: '🎓', access: 'مشاهده نمرات و انضباط خود' },
];

const deployOptions = [
  {
    name: 'اجرای محلی',
    icon: <Terminal className="w-5 h-5" />,
    color: 'from-emerald-500 to-green-600',
    steps: [
      'pip install flask',
      'python app.py',
      'مرورگر: http://localhost:5000',
    ],
  },
  {
    name: 'Railway / Render',
    icon: <Server className="w-5 h-5" />,
    color: 'from-blue-500 to-indigo-600',
    steps: [
      'فایل app.py را در GitHub قرار دهید',
      'یک فایل requirements.txt با محتوای "flask" بسازید',
      'ریپازیتوری را به Railway/Render متصل کنید',
      'Port را از متغیر محیطی PORT بخوانید',
    ],
  },
  {
    name: 'Cloudflare (با Tunnel)',
    icon: <Cloud className="w-5 h-5" />,
    color: 'from-orange-500 to-amber-600',
    steps: [
      'برنامه را روی سرور محلی اجرا کنید',
      'cloudflared tunnel ایجاد کنید',
      'Tunnel را به دامنه Cloudflare متصل کنید',
      'ترافیک از Cloudflare به سرور شما هدایت می‌شود',
    ],
  },
];

function App() {
  const [darkMode, setDarkMode] = useState(false);
  const [copied, setCopied] = useState(false);
  const [expandedDeploy, setExpandedDeploy] = useState<number | null>(0);
  const [activeSection, setActiveSection] = useState('hero');

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const handleCopy = async () => {
    try {
      const response = await fetch('/app.py');
      const text = await response.text();
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50 dark:from-slate-900 dark:via-slate-800 dark:to-emerald-900/20 transition-colors">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-lg border-b border-slate-200 dark:border-slate-700">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-slate-800 dark:text-white text-sm">سامانه انضباطی هنرستان</h1>
              <p className="text-xs text-slate-500">نسخه Flask - فایل واحد</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300"
            >
              {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            <a
              href="/app.py"
              download
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white text-sm font-medium hover:opacity-90 transition-all shadow-lg"
            >
              <Download className="w-4 h-4" />
              دانلود فایل
            </a>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-6xl mx-auto px-4 py-16 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 text-sm font-medium mb-6">
            <Zap className="w-4 h-4" />
            فایل واحد پایتون — بدون نیاز به فرانت‌اند جداگانه
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-slate-800 dark:text-white mb-4 leading-tight">
            سامانه جامع انضباطی
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-l from-emerald-500 to-teal-600">
              و ارزشیابی هنرستان
            </span>
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-400 mb-8 max-w-2xl mx-auto">
            یک فایل پایتون Flask با رابط کاربری کامل فارسی، دیتابیس SQLite،
            سیستم احراز هویت ۵ سطحی و تمام امکانات مورد نیاز مدیریت هنرستان
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <a
              href="/app.py"
              download
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-medium hover:opacity-90 transition-all shadow-xl hover:shadow-2xl"
            >
              <Download className="w-5 h-5" />
              دانلود app.py
            </a>
            <button
              onClick={handleCopy}
              className="flex items-center gap-2 px-6 py-3 rounded-xl border-2 border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200 font-medium hover:bg-slate-100 dark:hover:bg-slate-700 transition-all"
            >
              {copied ? <Check className="w-5 h-5 text-emerald-500" /> : <Copy className="w-5 h-5" />}
              {copied ? 'کپی شد!' : 'کپی کد'}
            </button>
          </div>
        </motion.div>

        {/* Quick Start */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-12 bg-slate-900 dark:bg-slate-950 rounded-2xl p-6 text-left max-w-xl mx-auto shadow-2xl border border-slate-700"
        >
          <div className="flex items-center gap-2 mb-4">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <div className="w-3 h-3 rounded-full bg-amber-500"></div>
            <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
            <span className="text-xs text-slate-400 mr-3">Terminal</span>
          </div>
          <div className="font-mono text-sm space-y-2" dir="ltr">
            <p className="text-emerald-400"># نصب و اجرا</p>
            <p><span className="text-slate-400">$</span> <span className="text-white">pip install flask</span></p>
            <p><span className="text-slate-400">$</span> <span className="text-white">python app.py</span></p>
            <p className="text-slate-400 mt-3"># ✅ سرور آماده است</p>
            <p className="text-slate-400"># 🌐 آدرس: <span className="text-emerald-400">http://localhost:5000</span></p>
          </div>
        </motion.div>
      </section>

      {/* Features */}
      <section className="max-w-6xl mx-auto px-4 py-16">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl font-bold text-slate-800 dark:text-white mb-3">امکانات سامانه</h2>
          <p className="text-slate-600 dark:text-slate-400">تمام ابزارهای مورد نیاز مدیریت هنرستان در یک فایل</p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-200 dark:border-slate-700 hover:shadow-lg hover:border-emerald-300 dark:hover:border-emerald-700 transition-all"
            >
              <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 mb-3">
                {f.icon}
              </div>
              <h3 className="font-bold text-slate-800 dark:text-white mb-1">{f.title}</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* User Roles */}
      <section className="max-w-6xl mx-auto px-4 py-16">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl font-bold text-slate-800 dark:text-white mb-3">سطوح دسترسی کاربران</h2>
          <p className="text-slate-600 dark:text-slate-400">۵ نقش کاربری با دسترسی‌های متفاوت</p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {userRoles.map((r, i) => (
            <motion.div
              key={r.role}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-200 dark:border-slate-700 text-center"
            >
              <div className="text-3xl mb-3">{r.icon}</div>
              <h3 className="font-bold text-slate-800 dark:text-white mb-2">{r.role}</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">{r.access}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Tech Stack */}
      <section className="max-w-6xl mx-auto px-4 py-16">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="bg-white dark:bg-slate-800 rounded-2xl p-8 border border-slate-200 dark:border-slate-700"
        >
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-6 text-center">مشخصات فنی</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { icon: <Code className="w-6 h-6" />, label: 'زبان', value: 'Python 3' },
              { icon: <Zap className="w-6 h-6" />, label: 'فریم‌ورک', value: 'Flask' },
              { icon: <Database className="w-6 h-6" />, label: 'دیتابیس', value: 'SQLite' },
              { icon: <Globe className="w-6 h-6" />, label: 'رابط کاربری', value: 'HTML/CSS/JS' },
              { icon: <Lock className="w-6 h-6" />, label: 'احراز هویت', value: 'Session-based' },
              { icon: <Smartphone className="w-6 h-6" />, label: 'واکنش‌گرا', value: 'بله' },
              { icon: <Moon className="w-6 h-6" />, label: 'حالت تاریک', value: 'بله' },
              { icon: <Shield className="w-6 h-6" />, label: 'نقش‌ها', value: '۵ سطح' },
            ].map((item, i) => (
              <div key={i} className="text-center">
                <div className="w-12 h-12 mx-auto rounded-xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 mb-2">
                  {item.icon}
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">{item.label}</p>
                <p className="font-bold text-slate-800 dark:text-white text-sm">{item.value}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* Deployment */}
      <section className="max-w-6xl mx-auto px-4 py-16">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl font-bold text-slate-800 dark:text-white mb-3">نحوه استقرار</h2>
          <p className="text-slate-600 dark:text-slate-400">سه روش برای راه‌اندازی سامانه</p>
        </motion.div>

        <div className="space-y-4">
          {deployOptions.map((opt, i) => (
            <motion.div
              key={opt.name}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden"
            >
              <button
                onClick={() => setExpandedDeploy(expandedDeploy === i ? null : i)}
                className="w-full flex items-center justify-between p-5 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-all"
              >
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${opt.color} flex items-center justify-center text-white`}>
                    {opt.icon}
                  </div>
                  <div className="text-right">
                    <h3 className="font-bold text-slate-800 dark:text-white">{opt.name}</h3>
                    <p className="text-xs text-slate-500">{opt.steps.length} مرحله</p>
                  </div>
                </div>
                {expandedDeploy === i ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
              </button>
              <AnimatePresence>
                {expandedDeploy === i && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="px-5 pb-5 space-y-3">
                      {opt.steps.map((step, j) => (
                        <div key={j} className="flex items-start gap-3">
                          <div className="w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 text-xs font-bold flex-shrink-0 mt-0.5">
                            {j + 1}
                          </div>
                          <code className="text-sm text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-700 px-3 py-1.5 rounded-lg font-mono" dir="ltr">
                            {step}
                          </code>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Login Credentials */}
      <section className="max-w-6xl mx-auto px-4 py-16">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="bg-gradient-to-l from-emerald-600 to-teal-600 rounded-2xl p-8 text-white"
        >
          <h2 className="text-2xl font-bold mb-4">🔑 اطلاعات ورود پیش‌فرض</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-white/10 rounded-xl p-4 backdrop-blur">
              <p className="text-sm opacity-80 mb-1">کد ملی مدیر:</p>
              <p className="text-xl font-bold font-mono" dir="ltr">0000000001</p>
            </div>
            <div className="bg-white/10 rounded-xl p-4 backdrop-blur">
              <p className="text-sm opacity-80 mb-1">رمز عبور مدیر:</p>
              <p className="text-xl font-bold font-mono" dir="ltr">admin</p>
            </div>
          </div>
          <p className="text-sm opacity-80 mt-4">
            💡 نکته: در نسخه نمایشی، با هر کد ملی و رمزی می‌توانید وارد شوید.
            همچنین دکمه‌های «ورود سریع» در صفحه ورود قرار دارند.
          </p>
        </motion.div>
      </section>

      {/* File Structure */}
      <section className="max-w-6xl mx-auto px-4 py-16">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="bg-white dark:bg-slate-800 rounded-2xl p-8 border border-slate-200 dark:border-slate-700"
        >
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-6 text-center">ساختار فایل app.py</h2>
          <div className="bg-slate-900 dark:bg-slate-950 rounded-xl p-6 font-mono text-sm" dir="ltr">
            <div className="space-y-1">
              <p className="text-emerald-400"># app.py — Single File Flask Application</p>
              <p className="text-slate-400">│</p>
              <p className="text-blue-400">├── Imports & Config</p>
              <p className="text-slate-500">│   ├── Flask, sqlite3, hashlib, secrets</p>
              <p className="text-slate-500">│   └── Database path, Secret key, Port</p>
              <p className="text-slate-400">│</p>
              <p className="text-blue-400">├── Database Layer</p>
              <p className="text-slate-500">│   ├── get_db() — اتصال به SQLite</p>
              <p className="text-slate-500">│   ├── init_db() — ساخت جداول</p>
              <p className="text-slate-500">│   └── seed_data() — داده‌های نمونه</p>
              <p className="text-slate-400">│</p>
              <p className="text-blue-400">├── Auth System</p>
              <p className="text-slate-500">│   ├── login_required — دکوریتور احراز هویت</p>
              <p className="text-slate-500">│   └── role_required — دکوریتور بررسی نقش</p>
              <p className="text-slate-400">│</p>
              <p className="text-blue-400">├── HTML Template (SPA)</p>
              <p className="text-slate-500">│   ├── CSS — تم کامل + حالت تاریک + واکنش‌گرا</p>
              <p className="text-slate-500">│   ├── HTML — ساختار صفحات</p>
              <p className="text-slate-500">│   └── JavaScript — SPA Router + API Client</p>
              <p className="text-slate-400">│</p>
              <p className="text-blue-400">├── API Routes</p>
              <p className="text-slate-500">│   ├── /api/login, /api/logout, /api/me</p>
              <p className="text-slate-500">│   ├── /api/dashboard — آمار داشبورد</p>
              <p className="text-slate-500">│   ├── /api/students — CRUD دانش‌آموزان</p>
              <p className="text-slate-500">│   ├── /api/attendance — ثبت حضور</p>
              <p className="text-slate-500">│   ├── /api/discipline — سوابق انضباطی</p>
              <p className="text-slate-500">│   ├── /api/grades — نمرات</p>
              <p className="text-slate-500">│   ├── /api/announcements — اطلاعیه‌ها</p>
              <p className="text-slate-500">│   └── /api/reports — گزارش‌ها</p>
              <p className="text-slate-400">│</p>
              <p className="text-emerald-400">└── __main__ — اجرای سرور</p>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-700 py-8 mt-16">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-3">
            <Shield className="w-5 h-5 text-emerald-500" />
            <span className="font-bold text-slate-800 dark:text-white">سامانه جامع انضباطی و ارزشیابی هنرستان</span>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            نسخه ۱.۰ — فایل واحد Flask — Python 3
          </p>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-2">
            ساخته شده با ❤️ برای مدیریت هوشمند هنرستان‌های فنی و حرفه‌ای
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;
