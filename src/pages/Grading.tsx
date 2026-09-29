import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Search, Award, TrendingUp, BookOpen, Calculator } from 'lucide-react';
import { mockGrades, mockStudents, gradeTypes, Grade } from '../data/mockData';
import { UserRole } from '../data/mockData';

interface GradingProps {
  userRole: UserRole;
}

export default function Grading({ userRole }: GradingProps) {
  const [grades, setGrades] = useState<Grade[]>(mockGrades);
  const [showForm, setShowForm] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<string>('all');
  const [selectedSubject, setSelectedSubject] = useState<string>('all');
  const [newGrade, setNewGrade] = useState({
    studentId: '',
    subject: '',
    type: 'quiz' as Grade['type'],
    score: 0,
    maxScore: 20,
    weight: 10,
    semester: 1,
  });

  const subjects = [...new Set(mockGrades.map(g => g.subject))];

  const filteredGrades = grades.filter(g => {
    if (selectedStudent !== 'all' && g.studentId !== selectedStudent) return false;
    if (selectedSubject !== 'all' && g.subject !== selectedSubject) return false;
    return true;
  });

  const calculateGPA = (studentId: string) => {
    const studentGrades = grades.filter(g => g.studentId === studentId);
    if (studentGrades.length === 0) return 0;
    let totalWeighted = 0;
    let totalWeight = 0;
    studentGrades.forEach(g => {
      totalWeighted += (g.score / g.maxScore) * 20 * (g.weight / 100);
      totalWeight += g.weight / 100;
    });
    return totalWeight > 0 ? totalWeighted / totalWeight : 0;
  };

  const handleSubmit = () => {
    if (!newGrade.studentId || !newGrade.subject || !newGrade.score) return;
    const student = mockStudents.find(s => s.id === newGrade.studentId);
    const grade: Grade = {
      id: String(grades.length + 1),
      studentId: newGrade.studentId,
      studentName: student?.name || '',
      subject: newGrade.subject,
      type: newGrade.type,
      score: newGrade.score,
      maxScore: newGrade.maxScore,
      weight: newGrade.weight,
      date: '۱۴۰۴/۰۳/۱۶',
      semester: newGrade.semester,
    };
    setGrades([grade, ...grades]);
    setShowForm(false);
    setNewGrade({ studentId: '', subject: '', type: 'quiz', score: 0, maxScore: 20, weight: 10, semester: 1 });
  };

  const getGradeColor = (score: number, max: number) => {
    const pct = (score / max) * 100;
    if (pct >= 85) return 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20';
    if (pct >= 70) return 'text-blue-600 bg-blue-50 dark:bg-blue-900/20';
    if (pct >= 50) return 'text-amber-600 bg-amber-50 dark:bg-amber-900/20';
    return 'text-red-600 bg-red-50 dark:bg-red-900/20';
  };

  const canAddGrade = userRole === 'admin' || userRole === 'teacher';

  // Student Report Card view for student/parent
  if (userRole === 'student' || userRole === 'parent') {
    const studentId = userRole === 'student' ? '1' : '1'; // Demo
    const studentGrades = grades.filter(g => g.studentId === studentId);
    const student = mockStudents.find(s => s.id === studentId);
    const gpa = calculateGPA(studentId);

    return (
      <div className="space-y-6">
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 rounded-2xl gradient-primary flex items-center justify-center text-white text-2xl font-bold">
              {student?.name.charAt(0)}
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-800 dark:text-white">{student?.name}</h2>
              <p className="text-sm text-slate-500">{student?.field} - {student?.className}</p>
            </div>
            <div className="mr-auto text-center">
              <p className="text-3xl font-bold text-emerald-600">{gpa.toFixed(1)}</p>
              <p className="text-xs text-slate-500">معدل وزنی</p>
            </div>
          </div>

          {/* Subject-wise GPA */}
          <h3 className="font-bold text-slate-800 dark:text-white mb-3">عملکرد به تفکیک درس</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {subjects.map(subject => {
              const subjectGrades = studentGrades.filter(g => g.subject === subject);
              if (subjectGrades.length === 0) return null;
              const avg = subjectGrades.reduce((acc, g) => acc + (g.score / g.maxScore) * 20, 0) / subjectGrades.length;
              return (
                <div key={subject} className="p-4 rounded-xl bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-200">{subject}</span>
                    <span className={`text-lg font-bold ${avg >= 17 ? 'text-emerald-600' : avg >= 14 ? 'text-blue-600' : avg >= 10 ? 'text-amber-600' : 'text-red-600'}`}>
                      {avg.toFixed(1)}
                    </span>
                  </div>
                  <div className="h-2 bg-slate-200 dark:bg-slate-600 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${avg >= 17 ? 'bg-emerald-500' : avg >= 14 ? 'bg-blue-500' : avg >= 10 ? 'bg-amber-500' : 'bg-red-500'}`}
                      style={{ width: `${(avg / 20) * 100}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Detailed Grades */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700">
          <h3 className="font-bold text-slate-800 dark:text-white mb-4">جزئیات نمرات</h3>
          <div className="space-y-2">
            {studentGrades.map(grade => (
              <div key={grade.id} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-700/30">
                <div className="flex items-center gap-3">
                  <span className={`w-14 h-14 rounded-xl flex items-center justify-center text-lg font-bold ${getGradeColor(grade.score, grade.maxScore)}`}>
                    {grade.score}
                  </span>
                  <div>
                    <p className="text-sm font-medium text-slate-800 dark:text-white">{grade.subject}</p>
                    <p className="text-xs text-slate-500">
                      {gradeTypes.find(t => t.value === grade.type)?.label} | وزن: {grade.weight}% | {grade.date}
                    </p>
                  </div>
                </div>
                <span className="text-sm text-slate-500">از {grade.maxScore}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800 dark:text-white">ارزشیابی و نمرات</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">ثبت و مدیریت نمرات دانش‌آموزان با سیستم وزن‌دهی</p>
        </div>
        {canAddGrade && (
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl gradient-primary text-white font-medium hover:opacity-90 transition-all shadow-lg"
          >
            <Plus className="w-4 h-4" />
            ثبت نمره
          </button>
        )}
      </div>

      {/* GPA Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {mockStudents.slice(0, 4).map(student => {
          const gpa = calculateGPA(student.id);
          return (
            <motion.div
              key={student.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 font-bold">
                  {student.name.charAt(0)}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-slate-800 dark:text-white">{student.name}</p>
                  <p className="text-xs text-slate-500">{student.className}</p>
                </div>
                <div className="text-left">
                  <p className={`text-lg font-bold ${gpa >= 17 ? 'text-emerald-600' : gpa >= 14 ? 'text-blue-600' : 'text-amber-600'}`}>
                    {gpa.toFixed(1)}
                  </p>
                  <p className="text-xs text-slate-400">معدل</p>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
        <div className="flex flex-col sm:flex-row gap-3">
          <select
            value={selectedStudent}
            onChange={(e) => setSelectedStudent(e.target.value)}
            className="px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-slate-800 dark:text-white text-sm"
          >
            <option value="all">همه دانش‌آموزان</option>
            {mockStudents.map(s => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
          <select
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            className="px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-slate-800 dark:text-white text-sm"
          >
            <option value="all">همه دروس</option>
            {subjects.map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Grades Table */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 dark:bg-slate-700/50">
              <tr>
                <th className="text-right px-4 py-3 text-xs font-medium text-slate-500 dark:text-slate-400">دانش‌آموز</th>
                <th className="text-right px-4 py-3 text-xs font-medium text-slate-500 dark:text-slate-400">درس</th>
                <th className="text-right px-4 py-3 text-xs font-medium text-slate-500 dark:text-slate-400">نوع</th>
                <th className="text-right px-4 py-3 text-xs font-medium text-slate-500 dark:text-slate-400">نمره</th>
                <th className="text-right px-4 py-3 text-xs font-medium text-slate-500 dark:text-slate-400">وزن</th>
                <th className="text-right px-4 py-3 text-xs font-medium text-slate-500 dark:text-slate-400">تاریخ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
              {filteredGrades.map((grade, i) => (
                <motion.tr
                  key={grade.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.03 }}
                  className="hover:bg-slate-50 dark:hover:bg-slate-700/30"
                >
                  <td className="px-4 py-3 text-sm font-medium text-slate-800 dark:text-white">{grade.studentName}</td>
                  <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-400">{grade.subject}</td>
                  <td className="px-4 py-3">
                    <span className="text-xs px-2 py-1 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                      {gradeTypes.find(t => t.value === grade.type)?.label}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center justify-center w-12 h-8 rounded-lg text-sm font-bold ${getGradeColor(grade.score, grade.maxScore)}`}>
                      {grade.score}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-500">{grade.weight}%</td>
                  <td className="px-4 py-3 text-sm text-slate-500">{grade.date}</td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Grade Modal */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={() => setShowForm(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-slate-800 rounded-2xl p-6 w-full max-w-lg border border-slate-200 dark:border-slate-700 shadow-2xl"
            >
              <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
                <Award className="w-5 h-5 text-emerald-500" />
                ثبت نمره جدید
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">دانش‌آموز</label>
                  <select
                    value={newGrade.studentId}
                    onChange={(e) => setNewGrade({ ...newGrade, studentId: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-slate-800 dark:text-white text-sm"
                  >
                    <option value="">انتخاب...</option>
                    {mockStudents.map(s => (
                      <option key={s.id} value={s.id}>{s.name} - {s.className}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">درس</label>
                  <input
                    type="text"
                    value={newGrade.subject}
                    onChange={(e) => setNewGrade({ ...newGrade, subject: e.target.value })}
                    placeholder="مثلاً: ریاضی"
                    className="w-full px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-slate-800 dark:text-white text-sm"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">نوع ارزیابی</label>
                    <select
                      value={newGrade.type}
                      onChange={(e) => {
                        const gt = gradeTypes.find(t => t.value === e.target.value);
                        setNewGrade({ ...newGrade, type: e.target.value as Grade['type'], weight: gt?.weight || 10 });
                      }}
                      className="w-full px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-slate-800 dark:text-white text-sm"
                    >
                      {gradeTypes.map(t => (
                        <option key={t.value} value={t.value}>{t.label} (وزن: {t.weight}%)</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">نمره (از {newGrade.maxScore})</label>
                    <input
                      type="number"
                      value={newGrade.score || ''}
                      onChange={(e) => setNewGrade({ ...newGrade, score: Number(e.target.value) })}
                      placeholder="نمره"
                      max={newGrade.maxScore}
                      className="w-full px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-slate-800 dark:text-white text-sm"
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={handleSubmit}
                  className="flex-1 py-2.5 rounded-xl gradient-primary text-white font-medium hover:opacity-90 transition-all"
                >
                  ثبت نمره
                </button>
                <button
                  onClick={() => setShowForm(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 font-medium hover:bg-slate-100 dark:hover:bg-slate-700 transition-all"
                >
                  انصراف
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
