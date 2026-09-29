import { useState } from 'react';
import { motion } from 'framer-motion';
import { Settings as SettingsIcon, School, Bell, Shield, Database, Palette, Save } from 'lucide-react';

export default function Settings() {
  const [activeTab, setActiveTab] = useState('general');
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const tabs = [
    { id: 'general', label: 'عمومی', icon: <School className="w-4 h-4" /> },
    { id: 'discipline', label: 'انضباطی', icon: <Shield className="w-4 h-4" /> },
    { id: 'notifications', label: 'اطلاع‌رسانی', icon: <Bell className="w-4 h-4" /> },
    { id: 'backup', label: 'پشتیبان‌گیری', icon: <Database className="w-4 h-4" /> },
    { id: 'appearance', label: 'ظاهر', icon: <Palette className="w-4 h-4" /> },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-800 dark:text-white">تنظیمات سامانه</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">مدیریت و پیکربندی سامانه</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
              activeTab === tab.id
                ? 'gradient-primary text-white shadow-lg'
                : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700'
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700"
      >
        {activeTab === 'general' && (
          <div className="space-y-6">
            <h3 className="font-bold text-slate-800 dark:text-white">اطلاعات هنرستان</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">نام هنرستان</label>
                <input type="text" defaultValue="هنرستان فنی شهید رجایی" className="w-full px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-slate-800 dark:text-white text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">کد مدرسه</label>
                <input type="text" defaultValue="۴۴۷۱" className="w-full px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-slate-800 dark:text-white text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">آدرس</label>
                <input type="text" defaultValue="تهران، خیابان آزادی، پلاک ۱۲۳" className="w-full px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-slate-800 dark:text-white text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">تلفن</label>
                <input type="text" defaultValue="۰۲۱-۶۶۱۲۳۴۵۶" className="w-full px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-slate-800 dark:text-white text-sm" dir="ltr" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">سال تحصیلی</label>
                <select className="w-full px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-slate-800 dark:text-white text-sm">
                  <option>۱۴۰۴-۱۴۰۳</option>
                  <option>۱۴۰۳-۱۴۰۲</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">مدیر</label>
                <input type="text" defaultValue="آقای رحیمی" className="w-full px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-slate-800 dark:text-white text-sm" />
              </div>
            </div>
          </div>
        )}

        {activeTab === 'discipline' && (
          <div className="space-y-6">
            <h3 className="font-bold text-slate-800 dark:text-white">تنظیمات انضباطی</h3>
            <div className="space-y-4">
              <div className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">حداقل امتیاز انضباطی قابل قبول</label>
                <input type="number" defaultValue="50" className="w-32 px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-white text-sm" />
                <p className="text-xs text-slate-400 mt-1">دانش‌آموزان با امتیاز کمتر از این مقدار در لیست پرخطر قرار می‌گیرند</p>
              </div>
              <div className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">حداکثر غیبت مجاز (روز)</label>
                <input type="number" defaultValue="6" className="w-32 px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-white text-sm" />
                <p className="text-xs text-slate-400 mt-1">بیشتر از این تعداد غیبت غیرموجه منجر به اخطار می‌شود</p>
              </div>
              <div className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" defaultChecked className="w-4 h-4 rounded border-slate-300 text-emerald-500 focus:ring-emerald-500" />
                  <div>
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300">ارسال خودکار پیامک به ولی</span>
                    <p className="text-xs text-slate-400">در صورت غیبت دانش‌آموز، پیامک به ولی ارسال شود</p>
                  </div>
                </label>
              </div>
              <div className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" defaultChecked className="w-4 h-4 rounded border-slate-300 text-emerald-500 focus:ring-emerald-500" />
                  <div>
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300">هشدار برای دانش‌آموزان در معرض خطر</span>
                    <p className="text-xs text-slate-400">نمایش هشدار در داشبورد برای دانش‌آموزان با ریسک بالا</p>
                  </div>
                </label>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'notifications' && (
          <div className="space-y-6">
            <h3 className="font-bold text-slate-800 dark:text-white">تنظیمات اطلاع‌رسانی</h3>
            <div className="space-y-4">
              {[
                { label: 'اطلاع‌رسانی پیامکی', desc: 'ارسال پیامک برای رویدادهای مهم', checked: true },
                { label: 'اطلاعیه داخلی', desc: 'نمایش اطلاعیه در پنل کاربران', checked: true },
                { label: 'ایمیل اطلاع‌رسانی', desc: 'ارسال ایمیل برای گزارشات هفتگی', checked: false },
                { label: 'هشدار غیبت', desc: 'ارسال هشدار فوری در صورت غیبت', checked: true },
              ].map((item, i) => (
                <div key={i} className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input type="checkbox" defaultChecked={item.checked} className="w-4 h-4 rounded border-slate-300 text-emerald-500 focus:ring-emerald-500" />
                    <div>
                      <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{item.label}</span>
                      <p className="text-xs text-slate-400">{item.desc}</p>
                    </div>
                  </label>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'backup' && (
          <div className="space-y-6">
            <h3 className="font-bold text-slate-800 dark:text-white">پشتیبان‌گیری و بازیابی</h3>
            <div className="space-y-4">
              <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl border border-emerald-200 dark:border-emerald-800">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-emerald-800 dark:text-emerald-300">آخرین پشتیبان</p>
                    <p className="text-sm text-emerald-600 dark:text-emerald-400">۱۴۰۴/۰۳/۱۵ - ساعت ۲۳:۰۰</p>
                  </div>
                  <button className="px-4 py-2 rounded-lg bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700">
                    بازیابی
                  </button>
                </div>
              </div>
              <div className="flex gap-3">
                <button className="flex-1 py-3 rounded-xl border-2 border-dashed border-emerald-300 dark:border-emerald-700 text-emerald-600 dark:text-emerald-400 font-medium hover:bg-emerald-50 dark:hover:bg-emerald-900/10 transition-all">
                  📦 ایجاد پشتیبان جدید
                </button>
                <button className="flex-1 py-3 rounded-xl border-2 border-dashed border-blue-300 dark:border-blue-700 text-blue-600 dark:text-blue-400 font-medium hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-all">
                  📥 بازیابی از فایل
                </button>
              </div>
              <div className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" defaultChecked className="w-4 h-4 rounded border-slate-300 text-emerald-500 focus:ring-emerald-500" />
                  <div>
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300">پشتیبان‌گیری خودکار روزانه</span>
                    <p className="text-xs text-slate-400">هر شب ساعت ۲۳:۰۰ به‌صورت خودکار</p>
                  </div>
                </label>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'appearance' && (
          <div className="space-y-6">
            <h3 className="font-bold text-slate-800 dark:text-white">تنظیمات ظاهری</h3>
            <div className="space-y-4">
              <div className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">زبان سامانه</label>
                <select className="px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-white text-sm">
                  <option>فارسی</option>
                  <option>English</option>
                </select>
              </div>
              <div className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">تقویم</label>
                <select className="px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-white text-sm">
                  <option>شمسی (جلالی)</option>
                  <option>میلادی</option>
                  <option>قمری</option>
                </select>
              </div>
              <div className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">تم رنگی</label>
                <div className="flex gap-3">
                  {['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444'].map(color => (
                    <button
                      key={color}
                      className="w-10 h-10 rounded-full border-2 border-white dark:border-slate-600 shadow-md hover:scale-110 transition-transform"
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Save Button */}
        <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between">
          {saved && (
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-sm text-emerald-600"
            >
              ✓ تنظیمات ذخیره شد
            </motion.span>
          )}
          <button
            onClick={handleSave}
            className="mr-auto flex items-center gap-2 px-6 py-2.5 rounded-xl gradient-primary text-white font-medium hover:opacity-90 transition-all shadow-lg"
          >
            <Save className="w-4 h-4" />
            ذخیره تنظیمات
          </button>
        </div>
      </motion.div>
    </div>
  );
}
