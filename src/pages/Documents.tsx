import { useState } from 'react';
import { motion } from 'framer-motion';
import { FileText, Download, Printer, Award, Shield, Calendar } from 'lucide-react';
import { mockStudents, mockGrades, mockDisciplineRecords, UserRole } from '../data/mockData';

interface DocumentsProps {
  userRole: UserRole;
}

export default function Documents({ userRole }: DocumentsProps) {
  const [selectedStudent, setSelectedStudent] = useState(mockStudents[0].id);
  const [docType, setDocType] = useState<'report' | 'discipline' | 'certificate'>('report');

  const student = mockStudents.find(s => s.id === selectedStudent)!;
  const studentGrades = mockGrades.filter(g => g.studentId === selectedStudent);
  const studentDiscipline = mockDisciplineRecords.filter(r => r.studentId === selectedStudent);

  const calculateGPA = () => {
    if (studentGrades.length === 0) return 0;
    let totalWeighted = 0;
    let totalWeight = 0;
    studentGrades.forEach(g => {
      totalWeighted += (g.score / g.maxScore) * 20 * (g.weight / 100);
      totalWeight += g.weight / 100;
    });
    return totalWeight > 0 ? totalWeighted / totalWeight : 0;
  };

  const gpa = calculateGPA();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-800 dark:text-white">اسناد و کارنامه</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">صدور و چاپ اسناد آموزشی و انضباطی</p>
      </div>

      {/* Document Type Selection */}
      <div className="flex gap-3 flex-wrap">
        {[
          { id: 'report', label: 'کارنامه تحصیلی', icon: <Award className="w-4 h-4" /> },
          { id: 'discipline', label: 'گزارش انضباطی', icon: <Shield className="w-4 h-4" /> },
          { id: 'certificate', label: 'گواهی', icon: <FileText className="w-4 h-4" /> },
        ].map(doc => (
          <button
            key={doc.id}
            onClick={() => setDocType(doc.id as any)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
              docType === doc.id
                ? 'gradient-primary text-white shadow-lg'
                : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700'
            }`}
          >
            {doc.icon}
            {doc.label}
          </button>
        ))}
      </div>

      {/* Student Selection */}
      {(userRole === 'admin' || userRole === 'teacher') && (
        <select
          value={selectedStudent}
          onChange={(e) => setSelectedStudent(e.target.value)}
          className="px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-800 dark:text-white text-sm"
        >
          {mockStudents.map(s => (
            <option key={s.id} value={s.id}>{s.name} - {s.className}</option>
          ))}
        </select>
      )}

      {/* Document Preview */}
      <motion.div
        key={docType + selectedStudent}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden"
      >
        {/* Document Header */}
        <div className="bg-gradient-to-l from-emerald-600 to-teal-600 p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold">
                {docType === 'report' && 'کارنامه تحصیلی'}
                {docType === 'discipline' && 'گزارش انضباطی'}
                {docType === 'certificate' && 'گواهی‌نامه'}
              </h3>
              <p className="text-emerald-100 text-sm">هنرستان فنی و حرفه‌ای</p>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="w-4 h-4" />
              <span>تاریخ صدور: ۱۴۰۴/۰۳/۱۶</span>
            </div>
          </div>
        </div>

        {/* Document Content */}
        <div className="p-6">
          {/* Student Info */}
          <div className="flex items-center gap-4 mb-6 pb-4 border-b border-slate-200 dark:border-slate-700">
            <div className="w-16 h-16 rounded-2xl gradient-primary flex items-center justify-center text-white text-2xl font-bold">
              {student.name.charAt(0)}
            </div>
            <div>
              <h4 className="text-lg font-bold text-slate-800 dark:text-white">{student.name}</h4>
              <p className="text-sm text-slate-500">{student.field} - {student.grade} - {student.className}</p>
              <p className="text-xs text-slate-400" dir="ltr">کد ملی: {student.nationalId}</p>
            </div>
          </div>

          {/* Report Card */}
          {docType === 'report' && (
            <div className="space-y-6">
              {/* GPA */}
              <div className="text-center p-6 bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl">
                <p className="text-sm text-slate-500 mb-1">معدل وزنی</p>
                <p className="text-5xl font-bold text-emerald-600">{gpa.toFixed(2)}</p>
                <p className="text-sm text-slate-400 mt-2">از ۲۰</p>
              </div>

              {/* Grades Table */}
              <div>
                <h5 className="font-medium text-slate-800 dark:text-white mb-3">جزئیات نمرات</h5>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-slate-50 dark:bg-slate-700/50">
                      <tr>
                        <th className="text-right px-3 py-2 text-slate-500">درس</th>
                        <th className="text-right px-3 py-2 text-slate-500">نوع</th>
                        <th className="text-right px-3 py-2 text-slate-500">نمره</th>
                        <th className="text-right px-3 py-2 text-slate-500">وزن</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                      {studentGrades.map(g => (
                        <tr key={g.id}>
                          <td className="px-3 py-2 text-slate-700 dark:text-slate-300">{g.subject}</td>
                          <td className="px-3 py-2 text-slate-500">{g.type === 'quiz' ? 'کوییز' : g.type === 'midterm' ? 'میان‌ترم' : g.type === 'homework' ? 'تکلیف' : g.type === 'practical' ? 'عملی' : g.type}</td>
                          <td className="px-3 py-2 font-bold text-slate-800 dark:text-white">{g.score} از {g.maxScore}</td>
                          <td className="px-3 py-2 text-slate-500">{g.weight}%</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Summary */}
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-3 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
                  <p className="text-2xl font-bold text-emerald-600">{student.disciplineScore}</p>
                  <p className="text-xs text-slate-500">امتیاز انضباطی</p>
                </div>
                <div className="text-center p-3 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
                  <p className="text-2xl font-bold text-blue-600">{student.attendanceRate}%</p>
                  <p className="text-xs text-slate-500">نرخ حضور</p>
                </div>
                <div className="text-center p-3 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
                  <p className="text-2xl font-bold text-purple-600">{studentGrades.length}</p>
                  <p className="text-xs text-slate-500">تعداد ارزیابی</p>
                </div>
              </div>
            </div>
          )}

          {/* Discipline Report */}
          {docType === 'discipline' && (
            <div className="space-y-4">
              <div className="text-center p-4 bg-amber-50 dark:bg-amber-900/20 rounded-xl">
                <p className="text-3xl font-bold text-amber-600">{student.disciplineScore}</p>
                <p className="text-sm text-slate-500">امتیاز انضباطی کل</p>
              </div>
              <div className="space-y-2">
                {studentDiscipline.map(record => (
                  <div key={record.id} className={`p-3 rounded-xl border ${
                    record.type === 'positive' ? 'bg-emerald-50 dark:bg-emerald-900/10 border-emerald-200 dark:border-emerald-800' : 'bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-800'
                  }`}>
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-sm font-medium text-slate-800 dark:text-white">{record.category}</span>
                        <p className="text-xs text-slate-500">{record.description}</p>
                      </div>
                      <span className={`font-bold ${record.points > 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                        {record.points > 0 ? '+' : ''}{record.points}
                      </span>
                    </div>
                  </div>
                ))}
                {studentDiscipline.length === 0 && (
                  <p className="text-center text-slate-400 py-8">سابقه انضباطی ثبت نشده است</p>
                )}
              </div>
            </div>
          )}

          {/* Certificate */}
          {docType === 'certificate' && (
            <div className="text-center py-8">
              <div className="max-w-md mx-auto border-2 border-dashed border-emerald-300 dark:border-emerald-700 rounded-2xl p-8">
                <Award className="w-16 h-16 mx-auto text-emerald-500 mb-4" />
                <h4 className="text-xl font-bold text-slate-800 dark:text-white mb-2">گواهی‌نامه</h4>
                <p className="text-slate-600 dark:text-slate-400 mb-4">
                  بدینوسیله گواهی می‌شود <strong>{student.name}</strong> فرزند{' '}
                  <span dir="ltr">{student.nationalId}</span> دانش‌آموز رشته {student.field}{' '}
                  این هنرستان می‌باشد.
                </p>
                <div className="text-sm text-slate-500">
                  <p>معدل: <strong className="text-emerald-600">{gpa.toFixed(2)}</strong></p>
                  <p>امتیاز انضباطی: <strong className="text-amber-600">{student.disciplineScore}</strong></p>
                </div>
                <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-700">
                  <p className="text-xs text-slate-400">تاریخ صدور: ۱۴۰۴/۰۳/۱۶</p>
                  <p className="text-xs text-slate-400">مهر و امضای مدیر هنرستان</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Document Actions */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-700 flex gap-3 justify-end">
          <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 text-sm font-medium hover:bg-slate-200 dark:hover:bg-slate-600 transition-all">
            <Printer className="w-4 h-4" />
            چاپ
          </button>
          <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 text-sm font-medium hover:bg-emerald-200 transition-all">
            <Download className="w-4 h-4" />
            دانلود PDF
          </button>
        </div>
      </motion.div>
    </div>
  );
}
