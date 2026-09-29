export type UserRole = 'admin' | 'teacher' | 'counselor' | 'parent' | 'student';

export interface User {
  id: string;
  name: string;
  role: UserRole;
  nationalId: string;
  avatar?: string;
  field?: string;
}

export interface Student {
  id: string;
  name: string;
  nationalId: string;
  field: string;
  grade: string;
  className: string;
  phone: string;
  parentPhone: string;
  disciplineScore: number;
  academicScore: number;
  attendanceRate: number;
  avatar?: string;
}

export interface DisciplineRecord {
  id: string;
  studentId: string;
  studentName: string;
  type: 'positive' | 'negative';
  category: string;
  description: string;
  points: number;
  date: string;
  recordedBy: string;
  status: 'active' | 'appealed' | 'resolved';
}

export interface Grade {
  id: string;
  studentId: string;
  studentName: string;
  subject: string;
  type: 'quiz' | 'homework' | 'midterm' | 'final' | 'project' | 'practical';
  score: number;
  maxScore: number;
  weight: number;
  date: string;
  semester: number;
}

export interface AttendanceRecord {
  id: string;
  studentId: string;
  studentName: string;
  date: string;
  status: 'present' | 'absent' | 'late' | 'excused';
  period?: number;
  note?: string;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  type: 'info' | 'warning' | 'success' | 'urgent';
  date: string;
  pinned: boolean;
  targetRoles: UserRole[];
}

export const roleLabels: Record<UserRole, string> = {
  admin: 'مدیر',
  teacher: 'دبیر',
  counselor: 'مشاور',
  parent: 'ولی',
  student: 'دانش‌آموز',
};

export const roleColors: Record<UserRole, string> = {
  admin: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
  teacher: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
  counselor: 'bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-300',
  parent: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300',
  student: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300',
};

export const mockStudents: Student[] = [
  { id: '1', name: 'علی احمدی', nationalId: '0012345678', field: 'کامپیوتر', grade: 'یازدهم', className: 'کامپیوتر ۱', phone: '09121234567', parentPhone: '09131234567', disciplineScore: 85, academicScore: 17.5, attendanceRate: 95 },
  { id: '2', name: 'محمد رضایی', nationalId: '0023456789', field: 'برق', grade: 'دهم', className: 'برق ۱', phone: '09122345678', parentPhone: '09132345678', disciplineScore: 72, academicScore: 15.2, attendanceRate: 88 },
  { id: '3', name: 'حسین کریمی', nationalId: '0034567890', field: 'مکانیک', grade: 'یازدهم', className: 'مکانیک ۱', phone: '09123456789', parentPhone: '09133456789', disciplineScore: 90, academicScore: 18.8, attendanceRate: 97 },
  { id: '4', name: 'رضا محمدی', nationalId: '0045678901', field: 'کامپیوتر', grade: 'دوازدهم', className: 'کامپیوتر ۲', phone: '09124567890', parentPhone: '09134567890', disciplineScore: 65, academicScore: 14.1, attendanceRate: 82 },
  { id: '5', name: 'امیر حسینی', nationalId: '0056789012', field: 'برق', grade: 'دهم', className: 'برق ۲', phone: '09125678901', parentPhone: '09135678901', disciplineScore: 95, academicScore: 19.2, attendanceRate: 99 },
  { id: '6', name: 'سعید نوری', nationalId: '0067890123', field: 'مکانیک', grade: 'یازدهم', className: 'مکانیک ۲', phone: '09126789012', parentPhone: '09136789012', disciplineScore: 78, academicScore: 16.3, attendanceRate: 91 },
  { id: '7', name: 'مهدی صادقی', nationalId: '0078901234', field: 'کامپیوتر', grade: 'دوازدهم', className: 'کامپیوتر ۱', phone: '09127890123', parentPhone: '09137890123', disciplineScore: 88, academicScore: 17.9, attendanceRate: 94 },
  { id: '8', name: 'جواد عباسی', nationalId: '0089012345', field: 'برق', grade: 'یازدهم', className: 'برق ۱', phone: '09128901234', parentPhone: '09138901234', disciplineScore: 55, academicScore: 12.8, attendanceRate: 75 },
];

export const mockDisciplineRecords: DisciplineRecord[] = [
  { id: '1', studentId: '1', studentName: 'علی احمدی', type: 'positive', category: 'نظم و انضباط', description: 'حضور به‌موقع مستمر در کلاس', points: 5, date: '۱۴۰۴/۰۳/۱۵', recordedBy: 'آقای محمدی', status: 'active' },
  { id: '2', studentId: '2', studentName: 'محمد رضایی', type: 'negative', category: 'غیبت', description: 'غیبت غیرموجه در درس ریاضی', points: -3, date: '۱۴۰۴/۰۳/۱۴', recordedBy: 'آقای کریمی', status: 'active' },
  { id: '3', studentId: '3', studentName: 'حسین کریمی', type: 'positive', category: 'فعالیت کلاسی', description: 'مشارکت فعال در پروژه عملی', points: 8, date: '۱۴۰۴/۰۳/۱۳', recordedBy: 'آقای رضایی', status: 'active' },
  { id: '4', studentId: '4', studentName: 'رضا محمدی', type: 'negative', category: 'رفتار نامناسب', description: 'استفاده از تلفن همراه در کلاس', points: -5, date: '۱۴۰۴/۰۳/۱۲', recordedBy: 'آقای محمدی', status: 'appealed' },
  { id: '5', studentId: '5', studentName: 'امیر حسینی', type: 'positive', category: 'مسابقه', description: 'کسب مقام اول مسابقه فنی', points: 15, date: '۱۴۰۴/۰۳/۱۱', recordedBy: 'مدیر', status: 'active' },
  { id: '6', studentId: '8', studentName: 'جواد عباسی', type: 'negative', category: 'تأخیر', description: 'تأخیر مکرر (۳ بار در هفته)', points: -4, date: '۱۴۰۴/۰۳/۱۰', recordedBy: 'ناظم', status: 'active' },
  { id: '7', studentId: '6', studentName: 'سعید نوری', type: 'positive', category: 'کمک به دیگران', description: 'کمک به هم‌کلاسی در آزمایشگاه', points: 3, date: '۱۴۰۴/۰۳/۰۹', recordedBy: 'آقای حسینی', status: 'active' },
  { id: '8', studentId: '1', studentName: 'علی احمدی', type: 'positive', category: 'نمره', description: 'کسب نمره کامل در آزمون عملی', points: 10, date: '۱۴۰۴/۰۳/۰۸', recordedBy: 'آقای کریمی', status: 'active' },
];

export const mockGrades: Grade[] = [
  { id: '1', studentId: '1', studentName: 'علی احمدی', subject: 'ریاضی', type: 'quiz', score: 18, maxScore: 20, weight: 10, date: '۱۴۰۴/۰۳/۱۰', semester: 1 },
  { id: '2', studentId: '1', studentName: 'علی احمدی', subject: 'ریاضی', type: 'midterm', score: 17, maxScore: 20, weight: 30, date: '۱۴۰۴/۰۲/۲۰', semester: 1 },
  { id: '3', studentId: '1', studentName: 'علی احمدی', subject: 'فیزیک', type: 'quiz', score: 19, maxScore: 20, weight: 10, date: '۱۴۰۴/۰۳/۱۲', semester: 1 },
  { id: '4', studentId: '1', studentName: 'علی احمدی', subject: 'فیزیک', type: 'homework', score: 20, maxScore: 20, weight: 10, date: '۱۴۰۴/۰۳/۰۸', semester: 1 },
  { id: '5', studentId: '2', studentName: 'محمد رضایی', subject: 'ریاضی', type: 'quiz', score: 14, maxScore: 20, weight: 10, date: '۱۴۰۴/۰۳/۱۰', semester: 1 },
  { id: '6', studentId: '2', studentName: 'محمد رضایی', subject: 'ریاضی', type: 'midterm', score: 12, maxScore: 20, weight: 30, date: '۱۴۰۴/۰۲/۲۰', semester: 1 },
  { id: '7', studentId: '3', studentName: 'حسین کریمی', subject: 'کارگاه مکانیک', type: 'practical', score: 19.5, maxScore: 20, weight: 40, date: '۱۴۰۴/۰۳/۱۱', semester: 1 },
  { id: '8', studentId: '3', studentName: 'حسین کریمی', subject: 'ریاضی', type: 'quiz', score: 18.5, maxScore: 20, weight: 10, date: '۱۴۰۴/۰۳/۱۰', semester: 1 },
  { id: '9', studentId: '5', studentName: 'امیر حسینی', subject: 'مدار الکتریکی', type: 'practical', score: 20, maxScore: 20, weight: 40, date: '۱۴۰۴/۰۳/۱۳', semester: 1 },
  { id: '10', studentId: '8', studentName: 'جواد عباسی', subject: 'ریاضی', type: 'quiz', score: 10, maxScore: 20, weight: 10, date: '۱۴۰۴/۰۳/۱۰', semester: 1 },
];

export const mockAnnouncements: Announcement[] = [
  { id: '1', title: 'اطلاعیه امتحانات پایان ترم', content: 'امتحانات پایان ترم از تاریخ ۱۴۰۴/۰۴/۰۱ آغاز می‌شود. برنامه امتحانات در سایت قابل مشاهده است.', type: 'urgent', date: '۱۴۰۴/۰۳/۱۵', pinned: true, targetRoles: ['admin', 'teacher', 'student', 'parent'] },
  { id: '2', title: 'جلسه اولیا و مربیان', content: 'جلسه اولیا و مربیان روز پنجشنبه ساعت ۱۶ در سالن اجتماعات برگزار می‌گردد.', type: 'info', date: '۱۴۰۴/۰۳/۱۴', pinned: false, targetRoles: ['admin', 'teacher', 'parent'] },
  { id: '3', title: 'مسابقه فنی هنرستان‌ها', content: 'ثبت‌نام مسابقه فنی بین هنرستان‌ها آغاز شد. علاقه‌مندان به معاونت آموزشی مراجعه کنند.', type: 'success', date: '۱۴۰۴/۰۳/۱۲', pinned: false, targetRoles: ['admin', 'teacher', 'student'] },
  { id: '4', title: 'تذکر انضباطی', content: 'استفاده از تلفن همراه در ساعات آموزشی ممنوع است. در صورت تکرار، طبق آیین‌نامه انضباطی برخورد خواهد شد.', type: 'warning', date: '۱۴۰۴/۰۳/۱۰', pinned: true, targetRoles: ['admin', 'teacher', 'student', 'parent'] },
];

export const disciplineCategories = {
  positive: ['نظم و انضباط', 'فعالیت کلاسی', 'مسابقه', 'کمک به دیگران', 'نمره', 'حضور مستمر', 'پروژه برتر', 'خلاقیت'],
  negative: ['غیبت', 'تأخیر', 'رفتار نامناسب', 'عدم انجام تکلیف', 'استفاده غیرمجاز', 'تخریب اموال', 'بی‌احترامی', 'تقلب'],
};

export const gradeTypes = [
  { value: 'quiz', label: 'کوییز', weight: 10 },
  { value: 'homework', label: 'تکلیف', weight: 10 },
  { value: 'midterm', label: 'میان‌ترم', weight: 25 },
  { value: 'final', label: 'پایان‌ترم', weight: 30 },
  { value: 'project', label: 'پروژه', weight: 15 },
  { value: 'practical', label: 'عملی', weight: 10 },
];

export const mockUsers: User[] = [
  { id: '1', name: 'آقای رحیمی', role: 'admin', nationalId: '0001112222' },
  { id: '2', name: 'آقای محمدی', role: 'teacher', nationalId: '0003334444', field: 'ریاضی' },
  { id: '3', name: 'خانم احمدی', role: 'counselor', nationalId: '0005556666' },
  { id: '4', name: 'ولی علی احمدی', role: 'parent', nationalId: '0007778888' },
  { id: '5', name: 'علی احمدی', role: 'student', nationalId: '0012345678' },
];
