import { useState, useEffect } from 'react';
import Login from './components/Login';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Students from './pages/Students';
import Attendance from './pages/Attendance';
import Discipline from './pages/Discipline';
import Grading from './pages/Grading';
import Reports from './pages/Reports';
import Announcements from './pages/Announcements';
import Documents from './pages/Documents';
import Settings from './pages/Settings';
import { UserRole } from './data/mockData';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState<UserRole>('admin');
  const [userName, setUserName] = useState('');
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const handleLogin = (role: UserRole, name: string) => {
    setUserRole(role);
    setUserName(name);
    setIsLoggedIn(true);
    setCurrentPage('dashboard');
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUserRole('admin');
    setUserName('');
    setCurrentPage('dashboard');
  };

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  if (!isLoggedIn) {
    return <Login onLogin={handleLogin} />;
  }

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard userRole={userRole} />;
      case 'students':
        return <Students userRole={userRole} />;
      case 'attendance':
        return <Attendance userRole={userRole} />;
      case 'discipline':
        return <Discipline userRole={userRole} />;
      case 'grading':
        return <Grading userRole={userRole} />;
      case 'reports':
        return <Reports />;
      case 'announcements':
        return <Announcements userRole={userRole} />;
      case 'documents':
        return <Documents userRole={userRole} />;
      case 'settings':
        return <Settings />;
      default:
        return <Dashboard userRole={userRole} />;
    }
  };

  return (
    <Layout
      currentPage={currentPage}
      onNavigate={setCurrentPage}
      userRole={userRole}
      userName={userName}
      onLogout={handleLogout}
      darkMode={darkMode}
      toggleDarkMode={toggleDarkMode}
    >
      {renderPage()}
    </Layout>
  );
}

export default App;
