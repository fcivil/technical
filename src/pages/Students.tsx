import { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, UserPlus, Download, Eye, Edit, Trash2, GraduationCap } from 'lucide-react';
import { mockStudents, Student } from '../data/mockData';
import { UserRole } from '../data/mockData';

interface StudentsProps {
  userRole: UserRole;
}

export default function Students({ userRole }: StudentsProps) {
  const [students] = useState<Student[]>(mockStudents);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterField, setFilterField] = useState('all');
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);

  const fields = [...new Set(mockStudents.map(s => s.field))];

  const filteredStudents = students.filter(s => {
    if (searchTerm && !s.name.includes(searchTerm) && !s.nationalId.includes(searchTerm)) return false;
    if (filterField !== 'all' && s.field !== filterField) return false;
    return true;
  });

  const getScoreColor = (score: number) => {
    if (score >= 85) return 'text-emerald-600';
    if (score >= 70) return 'text-blue-600';
    if (score >= 55) return 'text-amber-600';
    return 'text-red-600';
  };

  const getAttendanceColor = (rate: number) => {
    if (rate >= 95) return 'bg-emerald-500';
    if (rate >= 85) return 'bg-blue-500';
    if (rate >= 75) return 'bg-amber-500';
    return 'bg-red-500';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800 dark:text-white">مدیریت دانش‌آموزان</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">{filteredStudents.length} دانش‌آموز</p>
        </div>
        {(userRole === 'admin' || userRole === 'teacher') && (
          <div className="flex gap-2">
            <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 font-medium hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-all">
              <Download className="w-4 h-4" />
              خروجی اکسل
            </button>
            <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl gradient-primary text-white font-medium hover:opacity-90 transition-all shadow-lg">
              <UserPlus className="w-4 h-4" />
              افزودن دانش‌آموز
            </button>
          </div>
        )}
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="جستجو با نام یا کد ملی..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pr-10 pl-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-slate-800 dark:text-white text-sm focus:ring-2 focus:ring-emerald-500"
            />
          </div>
          <select
            value={filterField}
            onChange={(e) => setFilterField(e.target.value)}
            className="px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-slate-800 dark:text-white text-sm"
          >
            <option value="all">همه رشته‌ها</option>
            {fields.map(f => (
              <option key={f} value={f}>{f}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Students Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filteredStudents.map((student, i) => (
          <motion.div
            key={student.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-200 dark:border-slate-700 hover:shadow-lg transition-all cursor-pointer"
            onClick={() => setSelectedStudent(student)}
          >
            <div className="flex items-start gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center text-white font-bold text-lg">
                {student.name.charAt(0)}
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-slate-800 dark:text-white">{student.name}</h3>
                <p className="text-xs text-slate-500">{student.field} - {student.className}</p>
                <p className="text-xs text-slate-400 mt-0.5" dir="ltr">{student.nationalId}</p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div className="text-center p-2 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                <p className={`text-lg font-bold ${getScoreColor(student.disciplineScore)}`}>
                  {student.disciplineScore}
                </p>
                <p className="text-xs text-slate-400">انضباط</p>
              </div>
              <div className="text-center p-2 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                <p className={`text-lg font-bold ${student.academicScore >= 17 ? 'text-emerald-600' : student.academicScore >= 14 ? 'text-blue-600' : 'text-amber-600'}`}>
                  {student.academicScore}
                </p>
                <p className="text-xs text-slate-400">معدل</p>
              </div>
              <div className="text-center p-2 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                <p className="text-lg font-bold text-blue-600">{student.attendanceRate}%</p>
                <p className="text-xs text-slate-400">حضور</p>
              </div>
            </div>

            {/* Attendance Bar */}
            <div className="mt-3">
              <div className="flex justify-between text-xs text-slate-400 mb-1">
                <span>نرخ حضور</span>
                <span>{student.attendanceRate}%</span>
              </div>
              <div className="h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full ${getAttendanceColor(student.attendanceRate)}`}
                  style={{ width: `${student.attendanceRate}%` }}
                ></div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Student Detail Modal */}
      {selectedStudent && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedStudent(null)}
        >
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white dark:bg-slate-800 rounded-2xl p-6 w-full max-w-2xl border border-slate-200 dark:border-slate-700 shadow-2xl max-h-[90vh] overflow-y-auto"
          >
            {/* Student Header */}
            <div className="flex items-center gap-4 mb-6 pb-4 border-b border-slate-200 dark:border-slate-700">
              <div className="w-16 h-16 rounded-2xl gradient-primary flex items-center justify-center text-white text-2xl font-bold">
                {selectedStudent.name.charAt(0)}
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-slate-800 dark:text-white">{selectedStudent.name}</h3>
                <p className="text-sm text-slate-500">{selectedStudent.field} - {selectedStudent.grade} - {selectedStudent.className}</p>
                <p className="text-xs text-slate-400 mt-1" dir="ltr">کد ملی: {selectedStudent.nationalId}</p>
              </div>
              <button
                onClick={() => setSelectedStudent(null)}
                className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400"
              >
                ✕
              </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="text-center p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl">
                <p className={`text-3xl font-bold ${getScoreColor(selectedStudent.disciplineScore)}`}>
                  {selectedStudent.disciplineScore}
                </p>
                <p className="text-sm text-slate-500 mt-1">امتیاز انضباطی</p>
              </div>
              <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                <p className="text-3xl font-bold text-blue-600">{selectedStudent.academicScore}</p>
                <p className="text-sm text-slate-500 mt-1">معدل</p>
              </div>
              <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-xl">
                <p className="text-3xl font-bold text-purple-600">{selectedStudent.attendanceRate}%</p>
                <p className="text-sm text-slate-500 mt-1">نرخ حضور</p>
              </div>
            </div>

            {/* Contact Info */}
            <div className="space-y-3">
              <h4 className="font-medium text-slate-800 dark:text-white">اطلاعات تماس</h4>
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                  <p className="text-xs text-slate-400">تلفن دانش‌آموز</p>
                  <p className="text-sm font-medium text-slate-700 dark:text-slate-200" dir="ltr">{selectedStudent.phone}</p>
                </div>
                <div className="p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                  <p className="text-xs text-slate-400">تلفن ولی</p>
                  <p className="text-sm font-medium text-slate-700 dark:text-slate-200" dir="ltr">{selectedStudent.parentPhone}</p>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 mt-6 pt-4 border-t border-slate-200 dark:border-slate-700">
              <button className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300 font-medium hover:bg-emerald-100 transition-all">
                <Eye className="w-4 h-4" />
                مشاهده پروفایل کامل
              </button>
              <button className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 font-medium hover:bg-blue-100 transition-all">
                <GraduationCap className="w-4 h-4" />
                کارنامه
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}
