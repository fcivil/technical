import { motion } from 'framer-motion';
import { Users, AlertTriangle, Award, TrendingUp, TrendingDown, Clock, CheckCircle, XCircle } from 'lucide-react';
import { UserRole, mockStudents, mockDisciplineRecords, mockGrades, mockAnnouncements } from '../data/mockData';

interface DashboardProps {
  userRole: UserRole;
}

export default function Dashboard({ userRole }: DashboardProps) {
  const totalStudents = mockStudents.length;
  const avgDiscipline = Math.round(mockStudents.reduce((acc, s) => acc + s.disciplineScore, 0) / totalStudents);
  const avgAcademic = (mockStudents.reduce((acc, s) => acc + s.academicScore, 0) / totalStudents).toFixed(1);
  const avgAttendance = Math.round(mockStudents.reduce((acc, s) => acc + s.attendanceRate, 0) / totalStudents);
  const positiveRecords = mockDisciplineRecords.filter(r => r.type === 'positive').length;
  const negativeRecords = mockDisciplineRecords.filter(r => r.type === 'negative').length;

  const stats = [
    { label: 'کل دانش‌آموزان', value: totalStudents, icon: <Users className="w-6 h-6" />, color: 'from-blue-500 to-cyan-500', change: '+۳', up: true },
    { label: 'میانگین انضباط', value: avgDiscipline, icon: <AlertTriangle className="w-6 h-6" />, color: 'from-amber-500 to-orange-500', change: '+۲', up: true },
    { label: 'میانگین نمرات', value: avgAcademic, icon: <Award className="w-6 h-6" />, color: 'from-emerald-500 to-green-500', change: '+۰.۳', up: true },
    { label: 'نرخ حضور', value: `${avgAttendance}%`, icon: <Clock className="w-6 h-6" />, color: 'from-purple-500 to-indigo-500', change: '-۱%', up: false },
  ];

  const topStudents = [...mockStudents].sort((a, b) => b.disciplineScore + b.academicScore * 5 - (a.disciplineScore + a.academicScore * 5)).slice(0, 5);
  const atRiskStudents = mockStudents.filter(s => s.disciplineScore < 70 || s.attendanceRate < 80);

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-l from-emerald-600 to-teal-600 rounded-2xl p-6 text-white relative overflow-hidden"
      >
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-40 h-40 bg-white rounded-full -translate-x-1/2 -translate-y-1/2"></div>
          <div className="absolute bottom-0 right-0 w-60 h-60 bg-white rounded-full translate-x-1/3 translate-y-1/3"></div>
        </div>
        <div className="relative">
          <h2 className="text-2xl font-bold mb-2">خوش آمدید 👋</h2>
          <p className="text-emerald-100">
            {userRole === 'admin' && 'مدیریت کامل سامانه انضباطی و ارزشیابی هنرستان'}
            {userRole === 'teacher' && 'ثبت و بررسی نمرات، انضباط و حضور و غیاب دانش‌آموزان'}
            {userRole === 'counselor' && 'پیگیری وضعیت تحصیلی و انضباطی دانش‌آموزان'}
            {userRole === 'parent' && 'مشاهده وضعیت تحصیلی و انضباطی فرزندتان'}
            {userRole === 'student' && 'مشاهده نمرات، وضعیت انضباطی و برنامه کلاسی'}
          </p>
          <div className="mt-4 flex flex-wrap gap-4 text-sm">
            <span className="bg-white/20 px-3 py-1 rounded-full">📅 امروز: ۱۴۰۴/۰۳/۱۶</span>
            <span className="bg-white/20 px-3 py-1 rounded-full">🕐 ساعت: ۱۰:۳۰</span>
            <span className="bg-white/20 px-3 py-1 rounded-full">📚 زنگ فعلی: زنگ ۳</span>
          </div>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-200 dark:border-slate-700 hover:shadow-lg transition-all"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-slate-500 dark:text-slate-400">{stat.label}</p>
                <p className="text-2xl font-bold text-slate-800 dark:text-white mt-1">{stat.value}</p>
              </div>
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center text-white`}>
                {stat.icon}
              </div>
            </div>
            <div className={`flex items-center gap-1 mt-3 text-xs ${stat.up ? 'text-emerald-600' : 'text-red-500'}`}>
              {stat.up ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
              <span>{stat.change} نسبت به ماه قبل</span>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Discipline Summary */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-200 dark:border-slate-700"
        >
          <h3 className="font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-500" />
            خلاصه انضباطی
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-emerald-600" />
                <span className="text-sm text-slate-700 dark:text-slate-300">سوابق مثبت</span>
              </div>
              <span className="font-bold text-emerald-600">{positiveRecords}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-900/20 rounded-xl">
              <div className="flex items-center gap-2">
                <XCircle className="w-5 h-5 text-red-500" />
                <span className="text-sm text-slate-700 dark:text-slate-300">سوابق منفی</span>
              </div>
              <span className="font-bold text-red-500">{negativeRecords}</span>
            </div>
            <div className="mt-4">
              <div className="flex justify-between text-xs text-slate-500 mb-1">
                <span>نسبت مثبت به منفی</span>
                <span>{Math.round(positiveRecords / (positiveRecords + negativeRecords) * 100)}%</span>
              </div>
              <div className="h-3 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-l from-emerald-400 to-emerald-600 rounded-full transition-all"
                  style={{ width: `${positiveRecords / (positiveRecords + negativeRecords) * 100}%` }}
                ></div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Top Students */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-200 dark:border-slate-700"
        >
          <h3 className="font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
            <Award className="w-5 h-5 text-emerald-500" />
            برترین دانش‌آموزان
          </h3>
          <div className="space-y-3">
            {topStudents.map((student, i) => (
              <div key={student.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-all">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                  i === 0 ? 'bg-amber-100 text-amber-700' :
                  i === 1 ? 'bg-slate-100 text-slate-700' :
                  i === 2 ? 'bg-orange-100 text-orange-700' :
                  'bg-slate-50 text-slate-500'
                }`}>
                  {i + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-800 dark:text-white truncate">{student.name}</p>
                  <p className="text-xs text-slate-500">{student.field} - {student.className}</p>
                </div>
                <div className="text-left">
                  <p className="text-sm font-bold text-emerald-600">{student.disciplineScore}</p>
                  <p className="text-xs text-slate-400">امتیاز</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* At-Risk Students */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-200 dark:border-slate-700"
        >
          <h3 className="font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
            <TrendingDown className="w-5 h-5 text-red-500" />
            دانش‌آموزان در معرض خطر
          </h3>
          <div className="space-y-3">
            {atRiskStudents.map(student => (
              <div key={student.id} className="p-3 bg-red-50 dark:bg-red-900/10 rounded-xl border border-red-100 dark:border-red-900/30">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-medium text-slate-800 dark:text-white">{student.name}</p>
                  <span className="text-xs px-2 py-0.5 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-full">
                    نیاز به پیگیری
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div className="text-center p-1 bg-white dark:bg-slate-800 rounded-lg">
                    <p className="text-red-500 font-bold">{student.disciplineScore}</p>
                    <p className="text-slate-400">انضباط</p>
                  </div>
                  <div className="text-center p-1 bg-white dark:bg-slate-800 rounded-lg">
                    <p className="text-amber-500 font-bold">{student.academicScore}</p>
                    <p className="text-slate-400">نمره</p>
                  </div>
                  <div className="text-center p-1 bg-white dark:bg-slate-800 rounded-lg">
                    <p className="text-blue-500 font-bold">{student.attendanceRate}%</p>
                    <p className="text-slate-400">حضور</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Recent Announcements */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-200 dark:border-slate-700"
      >
        <h3 className="font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
          📢 آخرین اطلاعیه‌ها
        </h3>
        <div className="space-y-3">
          {mockAnnouncements.filter(a => a.targetRoles.includes(userRole)).slice(0, 3).map(ann => (
            <div key={ann.id} className={`p-4 rounded-xl border ${
              ann.type === 'urgent' ? 'bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-800' :
              ann.type === 'warning' ? 'bg-amber-50 dark:bg-amber-900/10 border-amber-200 dark:border-amber-800' :
              ann.type === 'success' ? 'bg-emerald-50 dark:bg-emerald-900/10 border-emerald-200 dark:border-emerald-800' :
              'bg-blue-50 dark:bg-blue-900/10 border-blue-200 dark:border-blue-800'
            }`}>
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    {ann.pinned && <span className="text-xs">📌</span>}
                    <h4 className="font-medium text-slate-800 dark:text-white text-sm">{ann.title}</h4>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2">{ann.content}</p>
                </div>
                <span className="text-xs text-slate-400 whitespace-nowrap mr-3">{ann.date}</span>
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Quick Actions */}
      {(userRole === 'admin' || userRole === 'teacher') && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="grid grid-cols-2 sm:grid-cols-4 gap-3"
        >
          {[
            { label: 'ثبت انضباط', icon: '⚡', color: 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800' },
            { label: 'ثبت نمره', icon: '📝', color: 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800' },
            { label: 'حضور و غیاب', icon: '✅', color: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800' },
            { label: 'ارسال اطلاعیه', icon: '📢', color: 'bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800' },
          ].map(action => (
            <button
              key={action.label}
              className={`p-4 rounded-xl border ${action.color} hover:shadow-md transition-all text-center`}
            >
              <span className="text-2xl block mb-2">{action.icon}</span>
              <span className="text-sm font-medium text-slate-700 dark:text-slate-200">{action.label}</span>
            </button>
          ))}
        </motion.div>
      )}
    </div>
  );
}
