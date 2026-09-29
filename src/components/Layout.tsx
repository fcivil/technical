import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, Users, ClipboardCheck, Award, AlertTriangle,
  BarChart3, Bell, Settings, LogOut, Moon, Sun, Menu, X,
  ChevronDown, Shield, BookOpen, UserCheck, GraduationCap, FileText
} from 'lucide-react';
import { UserRole, roleLabels, roleColors } from '../data/mockData';

interface LayoutProps {
  children: React.ReactNode;
  currentPage: string;
  onNavigate: (page: string) => void;
  userRole: UserRole;
  userName: string;
  onLogout: () => void;
  darkMode: boolean;
  toggleDarkMode: () => void;
}

interface NavItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  roles: UserRole[];
}

const navItems: NavItem[] = [
  { id: 'dashboard', label: 'داشبورد', icon: <LayoutDashboard className="w-5 h-5" />, roles: ['admin', 'teacher', 'counselor', 'parent', 'student'] },
  { id: 'students', label: 'دانش‌آموزان', icon: <Users className="w-5 h-5" />, roles: ['admin', 'teacher', 'counselor'] },
  { id: 'attendance', label: 'حضور و غیاب', icon: <ClipboardCheck className="w-5 h-5" />, roles: ['admin', 'teacher'] },
  { id: 'discipline', label: 'انضباط', icon: <AlertTriangle className="w-5 h-5" />, roles: ['admin', 'teacher', 'counselor', 'student', 'parent'] },
  { id: 'grading', label: 'ارزشیابی و نمرات', icon: <Award className="w-5 h-5" />, roles: ['admin', 'teacher', 'student', 'parent'] },
  { id: 'reports', label: 'گزارش‌ها', icon: <BarChart3 className="w-5 h-5" />, roles: ['admin', 'teacher', 'counselor'] },
  { id: 'announcements', label: 'اطلاعیه‌ها', icon: <Bell className="w-5 h-5" />, roles: ['admin', 'teacher', 'counselor', 'parent', 'student'] },
  { id: 'documents', label: 'اسناد و کارنامه', icon: <FileText className="w-5 h-5" />, roles: ['admin', 'teacher', 'student', 'parent'] },
  { id: 'settings', label: 'تنظیمات', icon: <Settings className="w-5 h-5" />, roles: ['admin'] },
];

const roleIcons: Record<UserRole, React.ReactNode> = {
  admin: <Shield className="w-4 h-4" />,
  teacher: <BookOpen className="w-4 h-4" />,
  counselor: <UserCheck className="w-4 h-4" />,
  parent: <Users className="w-4 h-4" />,
  student: <GraduationCap className="w-4 h-4" />,
};

export default function Layout({ children, currentPage, onNavigate, userRole, userName, onLogout, darkMode, toggleDarkMode }: LayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const filteredNav = navItems.filter(item => item.roles.includes(userRole));

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex">
      {/* Sidebar */}
      <AnimatePresence>
        {(sidebarOpen || typeof window !== 'undefined') && (
          <>
            {/* Mobile Overlay */}
            {sidebarOpen && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setSidebarOpen(false)}
                className="fixed inset-0 bg-black/50 z-40 lg:hidden"
              />
            )}

            {/* Sidebar Content */}
            <motion.aside
              initial={false}
              className={`fixed lg:static inset-y-0 right-0 z-50 w-72 bg-white dark:bg-slate-800 border-l border-slate-200 dark:border-slate-700 flex flex-col transform transition-transform duration-300 ${
                sidebarOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'
              }`}
            >
              {/* Logo */}
              <div className="p-5 border-b border-slate-200 dark:border-slate-700">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center">
                    <Shield className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="font-bold text-slate-800 dark:text-white text-sm">سامانه انضباطی</h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400">هنرستان فنی</p>
                  </div>
                  <button
                    onClick={() => setSidebarOpen(false)}
                    className="mr-auto lg:hidden text-slate-400 hover:text-slate-600"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Navigation */}
              <nav className="flex-1 overflow-y-auto p-3 space-y-1">
                {filteredNav.map(item => (
                  <button
                    key={item.id}
                    onClick={() => { onNavigate(item.id); setSidebarOpen(false); }}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                      currentPage === item.id
                        ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300 shadow-sm'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700/50 hover:text-slate-800 dark:hover:text-white'
                    }`}
                  >
                    {item.icon}
                    {item.label}
                  </button>
                ))}
              </nav>

              {/* User Info */}
              <div className="p-4 border-t border-slate-200 dark:border-slate-700">
                <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-700/50">
                  <div className="w-10 h-10 rounded-full gradient-primary flex items-center justify-center text-white font-bold">
                    {userName.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-800 dark:text-white truncate">{userName}</p>
                    <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full ${roleColors[userRole]}`}>
                      {roleIcons[userRole]}
                      {roleLabels[userRole]}
                    </span>
                  </div>
                </div>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen overflow-hidden">
        {/* Header */}
        <header className="sticky top-0 z-30 bg-white/80 dark:bg-slate-800/80 backdrop-blur-lg border-b border-slate-200 dark:border-slate-700 px-4 lg:px-6 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300"
              >
                <Menu className="w-5 h-5" />
              </button>
              <h1 className="text-lg font-bold text-slate-800 dark:text-white">
                {filteredNav.find(n => n.id === currentPage)?.label || 'داشبورد'}
              </h1>
            </div>

            <div className="flex items-center gap-2">
              {/* Dark Mode Toggle */}
              <button
                onClick={toggleDarkMode}
                className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-all"
              >
                {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>

              {/* Notifications */}
              <button className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 relative">
                <Bell className="w-5 h-5" />
                <span className="absolute top-1 left-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>

              {/* User Menu */}
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-all"
                >
                  <div className="w-8 h-8 rounded-full gradient-primary flex items-center justify-center text-white text-sm font-bold">
                    {userName.charAt(0)}
                  </div>
                  <span className="hidden sm:block text-sm font-medium text-slate-700 dark:text-slate-200">{userName}</span>
                  <ChevronDown className="w-4 h-4 text-slate-400" />
                </button>

                <AnimatePresence>
                  {userMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute left-0 mt-2 w-48 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 overflow-hidden z-50"
                    >
                      <div className="p-3 border-b border-slate-200 dark:border-slate-700">
                        <p className="text-sm font-medium text-slate-800 dark:text-white">{userName}</p>
                        <p className="text-xs text-slate-500">{roleLabels[userRole]}</p>
                      </div>
                      <button
                        onClick={onLogout}
                        className="w-full flex items-center gap-2 px-4 py-3 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"
                      >
                        <LogOut className="w-4 h-4" />
                        خروج از سامانه
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          <motion.div
            key={currentPage}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {children}
          </motion.div>
        </main>
      </div>
    </div>
  );
}
