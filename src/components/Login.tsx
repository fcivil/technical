import { useState } from 'react';
import { motion } from 'framer-motion';
import { Shield, Users, GraduationCap, UserCheck, BookOpen, Eye, EyeOff } from 'lucide-react';
import { UserRole, roleLabels, mockUsers } from '../data/mockData';

interface LoginProps {
  onLogin: (role: UserRole, userName: string) => void;
}

const roleIcons: Record<UserRole, React.ReactNode> = {
  admin: <Shield className="w-8 h-8" />,
  teacher: <BookOpen className="w-8 h-8" />,
  counselor: <UserCheck className="w-8 h-8" />,
  parent: <Users className="w-8 h-8" />,
  student: <GraduationCap className="w-8 h-8" />,
};

const roleDescriptions: Record<UserRole, string> = {
  admin: 'دسترسی کامل به تمام بخش‌های سامانه',
  teacher: 'ثبت نمرات، انضباط و حضور و غیاب',
  counselor: 'مشاوره، پیگیری و گزارش‌های تحلیلی',
  parent: 'مشاهده وضعیت فرزند و ارتباط با مدرسه',
  student: 'مشاهده نمرات، انضباط و برنامه کلاسی',
};

const roleGradients: Record<UserRole, string> = {
  admin: 'from-purple-500 to-indigo-600',
  teacher: 'from-blue-500 to-cyan-600',
  counselor: 'from-teal-500 to-emerald-600',
  parent: 'from-amber-500 to-orange-600',
  student: 'from-emerald-500 to-green-600',
};

export default function Login({ onLogin }: LoginProps) {
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const [nationalId, setNationalId] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = () => {
    if (!nationalId) {
      setError('لطفاً کد ملی را وارد کنید');
      return;
    }
    const user = mockUsers.find(u => u.nationalId === nationalId && u.role === selectedRole);
    if (user) {
      onLogin(user.role, user.name);
    } else if (selectedRole) {
      // Demo mode - allow any login
      const demoUser = mockUsers.find(u => u.role === selectedRole);
      onLogin(selectedRole, demoUser?.name || 'کاربر');
    }
  };

  const quickLogin = (role: UserRole) => {
    const user = mockUsers.find(u => u.role === role);
    if (user) {
      onLogin(user.role, user.name);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50 dark:from-slate-900 dark:via-slate-800 dark:to-emerald-900/20 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-4xl"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', delay: 0.2 }}
            className="w-20 h-20 mx-auto mb-4 rounded-2xl gradient-primary flex items-center justify-center shadow-lg"
          >
            <Shield className="w-10 h-10 text-white" />
          </motion.div>
          <h1 className="text-3xl font-bold text-slate-800 dark:text-white mb-2">
            سامانه جامع انضباطی و ارزشیابی
          </h1>
          <p className="text-slate-500 dark:text-slate-400">
            هنرستان فنی و حرفه‌ای
          </p>
        </div>

        {/* Role Selection */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-6">
          {(Object.keys(roleLabels) as UserRole[]).map((role, i) => (
            <motion.button
              key={role}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * i }}
              onClick={() => { setSelectedRole(role); setError(''); }}
              className={`p-4 rounded-xl border-2 transition-all duration-300 ${
                selectedRole === role
                  ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 shadow-lg scale-105'
                  : 'border-slate-200 dark:border-slate-700 hover:border-emerald-300 bg-white dark:bg-slate-800'
              }`}
            >
              <div className={`w-12 h-12 mx-auto mb-2 rounded-xl bg-gradient-to-br ${roleGradients[role]} flex items-center justify-center text-white`}>
                {roleIcons[role]}
              </div>
              <p className="font-medium text-sm text-slate-700 dark:text-slate-200">{roleLabels[role]}</p>
            </motion.button>
          ))}
        </div>

        {/* Login Form */}
        {selectedRole && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-6 border border-slate-200 dark:border-slate-700"
          >
            <div className="text-center mb-4">
              <p className="text-sm text-slate-500 dark:text-slate-400">{roleDescriptions[selectedRole]}</p>
            </div>

            <div className="space-y-4 max-w-md mx-auto">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  کد ملی
                </label>
                <input
                  type="text"
                  value={nationalId}
                  onChange={(e) => { setNationalId(e.target.value); setError(''); }}
                  placeholder="کد ملی ۱۰ رقمی"
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-slate-800 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                  dir="ltr"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  رمز عبور
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => { setPassword(e.target.value); setError(''); }}
                    placeholder="رمز عبور"
                    className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-slate-800 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all pl-12"
                  />
                  <button
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {error && (
                <p className="text-red-500 text-sm text-center">{error}</p>
              )}

              <button
                onClick={handleLogin}
                className="w-full py-3 rounded-xl gradient-primary text-white font-medium hover:opacity-90 transition-all shadow-lg hover:shadow-xl"
              >
                ورود به سامانه
              </button>

              <div className="text-center">
                <p className="text-xs text-slate-400 dark:text-slate-500 mb-2">ورود سریع (نسخه نمایشی):</p>
                <div className="flex flex-wrap gap-2 justify-center">
                  {(Object.keys(roleLabels) as UserRole[]).map(role => (
                    <button
                      key={role}
                      onClick={() => quickLogin(role)}
                      className="px-3 py-1 text-xs rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/30 hover:text-emerald-700 dark:hover:text-emerald-300 transition-all"
                    >
                      {roleLabels[role]}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
