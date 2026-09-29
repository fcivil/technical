import { motion } from 'framer-motion';
import { BarChart3, TrendingUp, Users, Award, AlertTriangle, PieChart } from 'lucide-react';
import { mockStudents, mockDisciplineRecords, mockGrades } from '../data/mockData';

export default function Reports() {
  const totalStudents = mockStudents.length;
  const avgDiscipline = Math.round(mockStudents.reduce((a, s) => a + s.disciplineScore, 0) / totalStudents);
  const avgAcademic = (mockStudents.reduce((a, s) => a + s.academicScore, 0) / totalStudents).toFixed(1);
  const avgAttendance = Math.round(mockStudents.reduce((a, s) => a + s.attendanceRate, 0) / totalStudents);
  
  const positiveCount = mockDisciplineRecords.filter(r => r.type === 'positive').length;
  const negativeCount = mockDisciplineRecords.filter(r => r.type === 'negative').length;
  
  const fieldStats = [...new Set(mockStudents.map(s => s.field))].map(field => {
    const fieldStudents = mockStudents.filter(s => s.field === field);
    return {
      field,
      count: fieldStudents.length,
      avgDiscipline: Math.round(fieldStudents.reduce((a, s) => a + s.disciplineScore, 0) / fieldStudents.length),
      avgAcademic: (fieldStudents.reduce((a, s) => a + s.academicScore, 0) / fieldStudents.length).toFixed(1),
    };
  });

  const riskLevels = {
    high: mockStudents.filter(s => s.disciplineScore < 65 || s.attendanceRate < 80).length,
    medium: mockStudents.filter(s => (s.disciplineScore >= 65 && s.disciplineScore < 80) || (s.attendanceRate >= 80 && s.attendanceRate < 90)).length,
    low: mockStudents.filter(s => s.disciplineScore >= 80 && s.attendanceRate >= 90).length,
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-800 dark:text-white">گزارش‌ها و آمار</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">تحلیل جامع وضعیت انضباطی و آموزشی</p>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'میانگین انضباط', value: avgDiscipline, icon: <AlertTriangle className="w-6 h-6" />, color: 'from-amber-500 to-orange-500' },
          { label: 'میانگین نمرات', value: avgAcademic, icon: <Award className="w-6 h-6" />, color: 'from-emerald-500 to-green-500' },
          { label: 'نرخ حضور', value: `${avgAttendance}%`, icon: <Users className="w-6 h-6" />, color: 'from-blue-500 to-cyan-500' },
          { label: 'کل دانش‌آموزان', value: totalStudents, icon: <BarChart3 className="w-6 h-6" />, color: 'from-purple-500 to-indigo-500' },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-200 dark:border-slate-700"
          >
            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center text-white mb-3`}>
              {stat.icon}
            </div>
            <p className="text-2xl font-bold text-slate-800 dark:text-white">{stat.value}</p>
            <p className="text-sm text-slate-500">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Discipline Distribution */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-200 dark:border-slate-700"
        >
          <h3 className="font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
            <PieChart className="w-5 h-5 text-emerald-500" />
            توزیع سوابق انضباطی
          </h3>
          <div className="flex items-center gap-6">
            <div className="relative w-32 h-32">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="40" fill="none" stroke="#e2e8f0" strokeWidth="12" className="dark:stroke-slate-700" />
                <circle
                  cx="50" cy="50" r="40" fill="none" stroke="#10b981" strokeWidth="12"
                  strokeDasharray={`${(positiveCount / (positiveCount + negativeCount)) * 251.2} 251.2`}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-lg font-bold text-slate-800 dark:text-white">{Math.round(positiveCount / (positiveCount + negativeCount) * 100)}%</span>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                <span className="text-sm text-slate-600 dark:text-slate-400">مثبت: {positiveCount}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                <span className="text-sm text-slate-600 dark:text-slate-400">منفی: {negativeCount}</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Risk Analysis */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-200 dark:border-slate-700"
        >
          <h3 className="font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-red-500" />
            تحلیل ریسک دانش‌آموزان
          </h3>
          <div className="space-y-4">
            {[
              { label: 'پرخطر', count: riskLevels.high, color: 'bg-red-500', total: totalStudents },
              { label: 'متوسط', count: riskLevels.medium, color: 'bg-amber-500', total: totalStudents },
              { label: 'کم‌خطر', count: riskLevels.low, color: 'bg-emerald-500', total: totalStudents },
            ].map(level => (
              <div key={level.label}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-slate-600 dark:text-slate-400">{level.label}</span>
                  <span className="font-medium text-slate-800 dark:text-white">{level.count} نفر ({Math.round(level.count / level.total * 100)}%)</span>
                </div>
                <div className="h-3 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${level.color} rounded-full transition-all`}
                    style={{ width: `${(level.count / level.total) * 100}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Field Comparison */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-200 dark:border-slate-700 lg:col-span-2"
        >
          <h3 className="font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-blue-500" />
            مقایسه رشته‌ها
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {fieldStats.map(fs => (
              <div key={fs.field} className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
                <h4 className="font-medium text-slate-800 dark:text-white mb-3">{fs.field}</h4>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">تعداد:</span>
                    <span className="font-medium text-slate-700 dark:text-slate-200">{fs.count} نفر</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">انضباط:</span>
                    <span className={`font-medium ${fs.avgDiscipline >= 80 ? 'text-emerald-600' : fs.avgDiscipline >= 65 ? 'text-amber-600' : 'text-red-600'}`}>{fs.avgDiscipline}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">معدل:</span>
                    <span className={`font-medium ${Number(fs.avgAcademic) >= 17 ? 'text-emerald-600' : Number(fs.avgAcademic) >= 14 ? 'text-blue-600' : 'text-amber-600'}`}>{fs.avgAcademic}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
