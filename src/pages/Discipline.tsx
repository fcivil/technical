import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Search, Filter, AlertTriangle, CheckCircle, XCircle, Clock, ChevronDown } from 'lucide-react';
import { mockDisciplineRecords, mockStudents, disciplineCategories, DisciplineRecord } from '../data/mockData';
import { UserRole } from '../data/mockData';

interface DisciplineProps {
  userRole: UserRole;
}

export default function Discipline({ userRole }: DisciplineProps) {
  const [records, setRecords] = useState<DisciplineRecord[]>(mockDisciplineRecords);
  const [showForm, setShowForm] = useState(false);
  const [filterType, setFilterType] = useState<'all' | 'positive' | 'negative'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStudent, setSelectedStudent] = useState('');
  const [newRecord, setNewRecord] = useState({
    studentId: '',
    type: 'positive' as 'positive' | 'negative',
    category: '',
    description: '',
    points: 0,
  });

  const filteredRecords = records.filter(r => {
    if (filterType !== 'all' && r.type !== filterType) return false;
    if (searchTerm && !r.studentName.includes(searchTerm) && !r.description.includes(searchTerm)) return false;
    return true;
  });

  const handleSubmit = () => {
    if (!newRecord.studentId || !newRecord.category || !newRecord.description) return;
    const student = mockStudents.find(s => s.id === newRecord.studentId);
    const record: DisciplineRecord = {
      id: String(records.length + 1),
      studentId: newRecord.studentId,
      studentName: student?.name || '',
      type: newRecord.type,
      category: newRecord.category,
      description: newRecord.description,
      points: newRecord.type === 'positive' ? Math.abs(newRecord.points || 5) : -Math.abs(newRecord.points || 3),
      date: '۱۴۰۴/۰۳/۱۶',
      recordedBy: 'کاربر فعلی',
      status: 'active',
    };
    setRecords([record, ...records]);
    setShowForm(false);
    setNewRecord({ studentId: '', type: 'positive', category: '', description: '', points: 0 });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active': return <span className="px-2 py-0.5 text-xs rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300">فعال</span>;
      case 'appealed': return <span className="px-2 py-0.5 text-xs rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300">تجدیدنظر</span>;
      case 'resolved': return <span className="px-2 py-0.5 text-xs rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300">حل‌شده</span>;
      default: return null;
    }
  };

  const canAddRecord = userRole === 'admin' || userRole === 'teacher';
  const canViewAll = userRole === 'admin' || userRole === 'teacher' || userRole === 'counselor';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800 dark:text-white">مدیریت انضباطی</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">ثبت و پیگیری سوابق انضباطی دانش‌آموزان</p>
        </div>
        {canAddRecord && (
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl gradient-primary text-white font-medium hover:opacity-90 transition-all shadow-lg"
          >
            <Plus className="w-4 h-4" />
            ثبت مورد جدید
          </button>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-emerald-600">{records.filter(r => r.type === 'positive').length}</p>
              <p className="text-xs text-slate-500">سوابق مثبت</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
              <XCircle className="w-5 h-5 text-red-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-red-500">{records.filter(r => r.type === 'negative').length}</p>
              <p className="text-xs text-slate-500">سوابق منفی</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
              <Clock className="w-5 h-5 text-amber-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-amber-500">{records.filter(r => r.status === 'appealed').length}</p>
              <p className="text-xs text-slate-500">در انتظار بررسی</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="جستجوی نام دانش‌آموز یا توضیحات..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pr-10 pl-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-slate-800 dark:text-white text-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            />
          </div>
          <div className="flex gap-2">
            {[
              { value: 'all', label: 'همه' },
              { value: 'positive', label: 'مثبت' },
              { value: 'negative', label: 'منفی' },
            ].map(f => (
              <button
                key={f.value}
                onClick={() => setFilterType(f.value as any)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  filterType === f.value
                    ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300'
                    : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-600'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Records Table */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 dark:bg-slate-700/50">
              <tr>
                <th className="text-right px-4 py-3 text-xs font-medium text-slate-500 dark:text-slate-400">دانش‌آموز</th>
                <th className="text-right px-4 py-3 text-xs font-medium text-slate-500 dark:text-slate-400">نوع</th>
                <th className="text-right px-4 py-3 text-xs font-medium text-slate-500 dark:text-slate-400">دسته‌بندی</th>
                <th className="text-right px-4 py-3 text-xs font-medium text-slate-500 dark:text-slate-400">توضیحات</th>
                <th className="text-right px-4 py-3 text-xs font-medium text-slate-500 dark:text-slate-400">امتیاز</th>
                <th className="text-right px-4 py-3 text-xs font-medium text-slate-500 dark:text-slate-400">تاریخ</th>
                <th className="text-right px-4 py-3 text-xs font-medium text-slate-500 dark:text-slate-400">وضعیت</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
              {filteredRecords.map((record, i) => (
                <motion.tr
                  key={record.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.05 }}
                  className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors"
                >
                  <td className="px-4 py-3">
                    <span className="text-sm font-medium text-slate-800 dark:text-white">{record.studentName}</span>
                  </td>
                  <td className="px-4 py-3">
                    {record.type === 'positive' ? (
                      <span className="inline-flex items-center gap-1 text-xs text-emerald-700 dark:text-emerald-300">
                        <CheckCircle className="w-3 h-3" /> مثبت
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs text-red-600 dark:text-red-400">
                        <XCircle className="w-3 h-3" /> منفی
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-400">{record.category}</td>
                  <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-400 max-w-[200px] truncate">{record.description}</td>
                  <td className="px-4 py-3">
                    <span className={`text-sm font-bold ${record.points > 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                      {record.points > 0 ? '+' : ''}{record.points}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-500 dark:text-slate-400">{record.date}</td>
                  <td className="px-4 py-3">{getStatusBadge(record.status)}</td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
        {filteredRecords.length === 0 && (
          <div className="text-center py-12 text-slate-500">
            <AlertTriangle className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>موردی یافت نشد</p>
          </div>
        )}
      </div>

      {/* Add Record Modal */}
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
              <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4">ثبت مورد انضباطی جدید</h3>
              
              <div className="space-y-4">
                {/* Type Selection */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">نوع</label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => setNewRecord({ ...newRecord, type: 'positive', category: '', points: 0 })}
                      className={`p-3 rounded-xl border-2 text-sm font-medium transition-all ${
                        newRecord.type === 'positive'
                          ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300'
                          : 'border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      ✅ مثبت (تشویقی)
                    </button>
                    <button
                      onClick={() => setNewRecord({ ...newRecord, type: 'negative', category: '', points: 0 })}
                      className={`p-3 rounded-xl border-2 text-sm font-medium transition-all ${
                        newRecord.type === 'negative'
                          ? 'border-red-500 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300'
                          : 'border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      ❌ منفی (تنبیهی)
                    </button>
                  </div>
                </div>

                {/* Student Selection */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">دانش‌آموز</label>
                  <select
                    value={newRecord.studentId}
                    onChange={(e) => { setSelectedStudent(e.target.value); setNewRecord({ ...newRecord, studentId: e.target.value }); }}
                    className="w-full px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-slate-800 dark:text-white text-sm"
                  >
                    <option value="">انتخاب دانش‌آموز...</option>
                    {mockStudents.map(s => (
                      <option key={s.id} value={s.id}>{s.name} - {s.className}</option>
                    ))}
                  </select>
                </div>

                {/* Category */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">دسته‌بندی</label>
                  <select
                    value={newRecord.category}
                    onChange={(e) => setNewRecord({ ...newRecord, category: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-slate-800 dark:text-white text-sm"
                  >
                    <option value="">انتخاب دسته‌بندی...</option>
                    {disciplineCategories[newRecord.type].map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">توضیحات</label>
                  <textarea
                    value={newRecord.description}
                    onChange={(e) => setNewRecord({ ...newRecord, description: e.target.value })}
                    placeholder="توضیح مورد انضباطی..."
                    rows={3}
                    className="w-full px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-slate-800 dark:text-white text-sm resize-none"
                  />
                </div>

                {/* Points */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">امتیاز</label>
                  <input
                    type="number"
                    value={newRecord.points || ''}
                    onChange={(e) => setNewRecord({ ...newRecord, points: Number(e.target.value) })}
                    placeholder={newRecord.type === 'positive' ? 'مثلاً ۵' : 'مثلاً ۳'}
                    className="w-full px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-slate-800 dark:text-white text-sm"
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={handleSubmit}
                  className="flex-1 py-2.5 rounded-xl gradient-primary text-white font-medium hover:opacity-90 transition-all"
                >
                  ثبت
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
