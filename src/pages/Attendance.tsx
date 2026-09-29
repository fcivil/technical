import { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, X, Clock, AlertCircle, Users } from 'lucide-react';
import { mockStudents, UserRole } from '../data/mockData';

interface AttendanceProps {
  userRole: UserRole;
}

type AttendanceStatus = 'present' | 'absent' | 'late' | 'excused' | null;

export default function Attendance({ userRole }: AttendanceProps) {
  const [selectedClass, setSelectedClass] = useState('all');
  const [attendanceData, setAttendanceData] = useState<Record<string, AttendanceStatus>>({});
  const [saved, setSaved] = useState(false);

  const classes = [...new Set(mockStudents.map(s => s.className))];
  const filteredStudents = selectedClass === 'all' ? mockStudents : mockStudents.filter(s => s.className === selectedClass);

  const setStatus = (studentId: string, status: AttendanceStatus) => {
    setAttendanceData(prev => ({ ...prev, [studentId]: status }));
    setSaved(false);
  };

  const markAllPresent = () => {
    const newData: Record<string, AttendanceStatus> = {};
    filteredStudents.forEach(s => { newData[s.id] = 'present'; });
    setAttendanceData({ ...attendanceData, ...newData });
    setSaved(false);
  };

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const stats = {
    present: Object.values(attendanceData).filter(v => v === 'present').length,
    absent: Object.values(attendanceData).filter(v => v === 'absent').length,
    late: Object.values(attendanceData).filter(v => v === 'late').length,
    excused: Object.values(attendanceData).filter(v => v === 'excused').length,
    unmarked: filteredStudents.length - Object.values(attendanceData).filter(v => v !== null && v !== undefined).length,
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800 dark:text-white">حضور و غیاب</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">ثبت حضور روزانه دانش‌آموزان</p>
        </div>
        <div className="flex gap-2">
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-slate-800 dark:text-white text-sm"
          >
            <option value="all">همه کلاس‌ها</option>
            {classes.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {[
          { label: 'حاضر', count: stats.present, color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300', icon: <Check className="w-4 h-4" /> },
          { label: 'غایب', count: stats.absent, color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300', icon: <X className="w-4 h-4" /> },
          { label: 'تأخیر', count: stats.late, color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300', icon: <Clock className="w-4 h-4" /> },
          { label: 'موجه', count: stats.excused, color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300', icon: <AlertCircle className="w-4 h-4" /> },
          { label: 'ثبت نشده', count: stats.unmarked, color: 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300', icon: <Users className="w-4 h-4" /> },
        ].map(stat => (
          <div key={stat.label} className={`p-3 rounded-xl ${stat.color} flex items-center gap-2`}>
            {stat.icon}
            <div>
              <p className="text-lg font-bold">{stat.count}</p>
              <p className="text-xs">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <button
          onClick={markAllPresent}
          className="px-4 py-2 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 text-sm font-medium hover:bg-emerald-200 transition-all"
        >
          ✅ همه حاضر
        </button>
        <button
          onClick={handleSave}
          className="px-4 py-2 rounded-lg gradient-primary text-white text-sm font-medium hover:opacity-90 transition-all shadow-lg"
        >
          💾 ذخیره حضور و غیاب
        </button>
        {saved && (
          <motion.span
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-sm text-emerald-600 flex items-center gap-1"
          >
            ✓ ذخیره شد
          </motion.span>
        )}
      </div>

      {/* Student List */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 dark:bg-slate-700/50">
              <tr>
                <th className="text-right px-4 py-3 text-xs font-medium text-slate-500 dark:text-slate-400">ردیف</th>
                <th className="text-right px-4 py-3 text-xs font-medium text-slate-500 dark:text-slate-400">دانش‌آموز</th>
                <th className="text-right px-4 py-3 text-xs font-medium text-slate-500 dark:text-slate-400">کلاس</th>
                <th className="text-center px-4 py-3 text-xs font-medium text-slate-500 dark:text-slate-400">وضعیت</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
              {filteredStudents.map((student, i) => {
                const status = attendanceData[student.id];
                return (
                  <tr key={student.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30">
                    <td className="px-4 py-3 text-sm text-slate-500">{i + 1}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 text-xs font-bold">
                          {student.name.charAt(0)}
                        </div>
                        <span className="text-sm font-medium text-slate-800 dark:text-white">{student.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-400">{student.className}</td>
                    <td className="px-4 py-3">
                      <div className="flex justify-center gap-1">
                        {[
                          { value: 'present', label: 'حاضر', color: 'bg-emerald-500 hover:bg-emerald-600', activeColor: 'ring-2 ring-emerald-300' },
                          { value: 'absent', label: 'غایب', color: 'bg-red-500 hover:bg-red-600', activeColor: 'ring-2 ring-red-300' },
                          { value: 'late', label: 'تأخیر', color: 'bg-amber-500 hover:bg-amber-600', activeColor: 'ring-2 ring-amber-300' },
                          { value: 'excused', label: 'موجه', color: 'bg-blue-500 hover:bg-blue-600', activeColor: 'ring-2 ring-blue-300' },
                        ].map(btn => (
                          <button
                            key={btn.value}
                            onClick={() => setStatus(student.id, btn.value as AttendanceStatus)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium text-white transition-all ${btn.color} ${
                              status === btn.value ? btn.activeColor + ' scale-110' : 'opacity-40'
                            }`}
                          >
                            {btn.label}
                          </button>
                        ))}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
