import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Pin, Plus, AlertTriangle, Info, CheckCircle, X } from 'lucide-react';
import { mockAnnouncements, Announcement, UserRole } from '../data/mockData';

interface AnnouncementsProps {
  userRole: UserRole;
}

export default function Announcements({ userRole }: AnnouncementsProps) {
  const [announcements, setAnnouncements] = useState<Announcement[]>(mockAnnouncements);
  const [showForm, setShowForm] = useState(false);
  const [newAnn, setNewAnn] = useState({
    title: '',
    content: '',
    type: 'info' as Announcement['type'],
    pinned: false,
  });

  const filteredAnnouncements = announcements.filter(a => a.targetRoles.includes(userRole));

  const handleSubmit = () => {
    if (!newAnn.title || !newAnn.content) return;
    const ann: Announcement = {
      id: String(announcements.length + 1),
      title: newAnn.title,
      content: newAnn.content,
      type: newAnn.type,
      date: '۱۴۰۴/۰۳/۱۶',
      pinned: newAnn.pinned,
      targetRoles: ['admin', 'teacher', 'counselor', 'parent', 'student'],
    };
    setAnnouncements([ann, ...announcements]);
    setShowForm(false);
    setNewAnn({ title: '', content: '', type: 'info', pinned: false });
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'urgent': return <AlertTriangle className="w-5 h-5 text-red-500" />;
      case 'warning': return <AlertTriangle className="w-5 h-5 text-amber-500" />;
      case 'success': return <CheckCircle className="w-5 h-5 text-emerald-500" />;
      default: return <Info className="w-5 h-5 text-blue-500" />;
    }
  };

  const getTypeStyle = (type: string) => {
    switch (type) {
      case 'urgent': return 'border-r-red-500 bg-red-50 dark:bg-red-900/10';
      case 'warning': return 'border-r-amber-500 bg-amber-50 dark:bg-amber-900/10';
      case 'success': return 'border-r-emerald-500 bg-emerald-50 dark:bg-emerald-900/10';
      default: return 'border-r-blue-500 bg-blue-50 dark:bg-blue-900/10';
    }
  };

  const canCreate = userRole === 'admin' || userRole === 'teacher';

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800 dark:text-white">اطلاعیه‌ها</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">اطلاع‌رسانی به کاربران سامانه</p>
        </div>
        {canCreate && (
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl gradient-primary text-white font-medium hover:opacity-90 transition-all shadow-lg"
          >
            <Plus className="w-4 h-4" />
            اطلاعیه جدید
          </button>
        )}
      </div>

      {/* Announcements List */}
      <div className="space-y-3">
        {filteredAnnouncements
          .sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0))
          .map((ann, i) => (
          <motion.div
            key={ann.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className={`border-r-4 ${getTypeStyle(ann.type)} rounded-xl p-5 border border-slate-200 dark:border-slate-700`}
          >
            <div className="flex items-start gap-3">
              {getTypeIcon(ann.type)}
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-bold text-slate-800 dark:text-white">{ann.title}</h3>
                  {ann.pinned && <Pin className="w-3 h-3 text-amber-500" />}
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">{ann.content}</p>
                <div className="flex items-center gap-3 text-xs text-slate-400">
                  <span>{ann.date}</span>
                  <span>•</span>
                  <span>{ann.targetRoles.length} گروه هدف</span>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Create Modal */}
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
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-slate-800 rounded-2xl p-6 w-full max-w-lg border border-slate-200 dark:border-slate-700 shadow-2xl"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-slate-800 dark:text-white">اطلاعیه جدید</h3>
                <button onClick={() => setShowForm(false)} className="text-slate-400 hover:text-slate-600">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">عنوان</label>
                  <input
                    type="text"
                    value={newAnn.title}
                    onChange={(e) => setNewAnn({ ...newAnn, title: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-slate-800 dark:text-white text-sm"
                    placeholder="عنوان اطلاعیه"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">متن</label>
                  <textarea
                    value={newAnn.content}
                    onChange={(e) => setNewAnn({ ...newAnn, content: e.target.value })}
                    rows={4}
                    className="w-full px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-slate-800 dark:text-white text-sm resize-none"
                    placeholder="متن اطلاعیه..."
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">نوع</label>
                    <select
                      value={newAnn.type}
                      onChange={(e) => setNewAnn({ ...newAnn, type: e.target.value as Announcement['type'] })}
                      className="w-full px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-slate-800 dark:text-white text-sm"
                    >
                      <option value="info">اطلاعات</option>
                      <option value="warning">هشدار</option>
                      <option value="success">موفقیت</option>
                      <option value="urgent">فوری</option>
                    </select>
                  </div>
                  <div className="flex items-end">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={newAnn.pinned}
                        onChange={(e) => setNewAnn({ ...newAnn, pinned: e.target.checked })}
                        className="w-4 h-4 rounded border-slate-300 text-emerald-500 focus:ring-emerald-500"
                      />
                      <span className="text-sm text-slate-700 dark:text-slate-300">سنجاق شود</span>
                    </label>
                  </div>
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button onClick={handleSubmit} className="flex-1 py-2.5 rounded-xl gradient-primary text-white font-medium hover:opacity-90">
                  انتشار
                </button>
                <button onClick={() => setShowForm(false)} className="flex-1 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 font-medium hover:bg-slate-100 dark:hover:bg-slate-700">
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
