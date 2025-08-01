
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { View, UserProfile } from './types';
import { HomeIcon, TimerIcon, BookOpenIcon, FileTextIcon, GlobeIcon, SparklesIcon, MoonIcon, SunIcon, XIcon, MenuIcon, LogoutIcon, SettingsIcon, UserIcon, ChevronDownIcon } from './components/Icons';
import PomodoroTimer from './components/PomodoroTimer';
import NotesManager from './components/NotesManager';
import PdfViewer from './components/PdfViewer';
import WebviewLoader from './components/WebviewLoader';
import AiChat from './components/AiChat';
import Login from './components/Login';
import Settings from './components/Settings';

type Theme = 'light' | 'dark';

const navItems = [
  { id: View.Home, label: 'Home', icon: HomeIcon },
  { id: View.Pomodoro, label: 'Pomodoro', icon: TimerIcon },
  { id: View.Notes, label: 'Notes', icon: FileTextIcon },
  { id: View.PdfViewer, label: 'PDF Viewer', icon: BookOpenIcon },
  { id: View.Webview, label: 'ERP / LMS', icon: GlobeIcon },
  { id: View.AiChat, label: 'AI Chat', icon: SparklesIcon },
  { id: View.Settings, label: 'Settings', icon: SettingsIcon },
];

const viewTitles: Record<View, string> = {
  [View.Home]: 'Welcome to AcadMate',
  [View.Pomodoro]: 'Pomodoro Timer',
  [View.Notes]: 'Notes Manager',
  [View.PdfViewer]: 'PDF Viewer',
  [View.Webview]: 'ERP / LMS Launcher',
  [View.AiChat]: 'AI Chat Assistant',
  [View.Settings]: 'User Settings',
};

const Sidebar: React.FC<{ currentView: View; setView: (view: View) => void; isSidebarOpen: boolean; setSidebarOpen: (isOpen: boolean) => void; }> = ({ currentView, setView, isSidebarOpen, setSidebarOpen }) => {
    return (
        <>
            <aside className={`fixed lg:relative inset-y-0 left-0 z-40 w-64 bg-light-sidebar dark:bg-dark-sidebar text-white flex-shrink-0 flex flex-col transition-transform duration-300 ease-in-out ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}>
                <div className="flex items-center justify-center h-20 px-6 border-b border-white/10">
                    <span className="text-2xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-300">AcadMate</span>
                </div>
                <nav className="flex-1 px-4 py-6 space-y-2">
                    {navItems.map(item => (
                        <button
                            key={item.id}
                            onClick={() => {
                                setView(item.id);
                                if (window.innerWidth < 1024) {
                                  setSidebarOpen(false);
                                }
                            }}
                            className={`w-full flex items-center gap-4 px-4 py-3 rounded-lg text-left text-base font-medium transition-all duration-200 ${
                                currentView === item.id
                                ? 'bg-gradient-to-r from-primary to-primary-light text-white shadow-md'
                                : 'text-white/70 hover:bg-white/10 hover:text-white'
                            }`}
                        >
                            <item.icon className="w-6 h-6 flex-shrink-0" />
                            <span>{item.label}</span>
                        </button>
                    ))}
                </nav>
            </aside>
            {isSidebarOpen && <div onClick={() => setSidebarOpen(false)} className="fixed inset-0 bg-black/60 z-30 lg:hidden"></div>}
        </>
    );
};

const Header: React.FC<{ title: string; theme: Theme; toggleTheme: () => void; onMenuClick: () => void; onLogout: () => void; userProfile: UserProfile | null; setView: (view: View) => void; }> = ({ title, theme, toggleTheme, onMenuClick, onLogout, userProfile, setView }) => {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const getInitials = (name: string) => {
        const names = name.split(' ');
        if (names.length > 1) {
            return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
        }
        return name.substring(0, 2).toUpperCase();
    }

    return (
        <header className="flex items-center justify-between h-20 px-4 sm:px-6 bg-light-bg-secondary dark:bg-dark-bg-secondary sticky top-0 z-20 shadow-sm">
            <div className="flex items-center gap-4">
                 <button onClick={onMenuClick} className="lg:hidden text-gray-600 dark:text-gray-300">
                    <MenuIcon className="w-6 h-6" />
                </button>
                <h1 className="text-2xl font-bold text-light-text dark:text-dark-text truncate">{title}</h1>
            </div>
            <div className="flex items-center gap-2 sm:gap-4">
              <button
                  onClick={toggleTheme}
                  className="flex items-center justify-center w-10 h-10 rounded-full bg-light-bg-tertiary dark:bg-dark-bg-tertiary text-light-text-secondary dark:text-dark-text-secondary transition-colors"
                  aria-label="Toggle theme"
              >
                  {theme === 'light' ? <MoonIcon className="w-5 h-5" /> : <SunIcon className="w-5 h-5" />}
              </button>
              <div className="relative" ref={dropdownRef}>
                <button onClick={() => setIsDropdownOpen(!isDropdownOpen)} className="flex items-center gap-2">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-primary to-primary-light flex items-center justify-center text-white font-bold shadow-md overflow-hidden">
                       {userProfile?.profilePic ? <img src={userProfile.profilePic} alt="Profile" className="w-full h-full object-cover" /> : <UserIcon className="w-6 h-6" />}
                    </div>
                    <span className="font-semibold hidden sm:block">{userProfile?.name}</span>
                    <ChevronDownIcon className="w-5 h-5 hidden sm:block"/>
                </button>
                {isDropdownOpen && (
                     <div className="absolute right-0 mt-2 w-48 bg-light-bg-secondary dark:bg-dark-bg-secondary rounded-lg shadow-xl z-50 overflow-hidden border border-light-bg-tertiary dark:border-dark-bg-tertiary">
                         <button onClick={() => { setView(View.Settings); setIsDropdownOpen(false); }} className="w-full text-left px-4 py-2 text-sm text-light-text dark:text-dark-text hover:bg-light-bg-tertiary dark:hover:bg-dark-bg-tertiary flex items-center gap-2"><SettingsIcon className="w-4 h-4" /> My Profile</button>
                         <button onClick={() => { onLogout(); setIsDropdownOpen(false); }} className="w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-light-bg-tertiary dark:hover:bg-dark-bg-tertiary flex items-center gap-2"><LogoutIcon className="w-4 h-4"/> Logout</button>
                     </div>
                )}
              </div>
            </div>
        </header>
    );
};


const Welcome: React.FC<{setView: (view: View) => void, userProfile: UserProfile | null}> = ({setView, userProfile}) => (
    <div className="text-center p-8 bg-light-bg-secondary dark:bg-dark-bg-secondary rounded-2xl shadow-sm">
        <h2 className="text-5xl font-extrabold text-light-text dark:text-dark-text mb-4">
            Welcome, <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary-light">{userProfile?.name}!</span>
        </h2>
        <p className="text-lg text-light-text-secondary dark:text-dark-text-secondary max-w-2xl mx-auto mb-8">
            Your all-in-one academic sidekick. Boost your productivity and organize your study life.
            Select a module from the sidebar to get started!
        </p>
         <div className="flex flex-col sm:flex-row justify-center gap-4">
            <button
                onClick={() => setView(View.Pomodoro)}
                className="px-6 py-3 font-semibold text-white bg-gradient-to-r from-primary to-primary-light rounded-lg shadow-lg shadow-primary/20 transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-primary/40"
            >
                Start Focusing
            </button>
             <button
                onClick={() => setView(View.AiChat)}
                className="px-6 py-3 font-semibold text-light-text dark:text-dark-text bg-light-bg-tertiary dark:bg-dark-bg-tertiary rounded-lg shadow-sm transition-all duration-300 hover:scale-105 hover:bg-gray-300 dark:hover:bg-gray-600"
            >
                Chat with AI
            </button>
        </div>
    </div>
);


export default function App() {
  const [theme, setTheme] = useState<Theme>('light');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentView, setCurrentView] = useState<View>(View.Home);
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    const savedTheme = localStorage.getItem('acadmate-theme') as Theme | null;
    const userPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const initialTheme = savedTheme || (userPrefersDark ? 'dark' : 'light');
    setTheme(initialTheme);

    const loggedInUserEmail = localStorage.getItem('acadmate-user');
    if (loggedInUserEmail) {
        setIsAuthenticated(true);
        const profiles = JSON.parse(localStorage.getItem('acadmate-profiles') || '{}');
        if (profiles[loggedInUserEmail]) {
            setUserProfile(profiles[loggedInUserEmail]);
        } else {
             const defaultProfile = { name: loggedInUserEmail.split('@')[0], email: loggedInUserEmail };
             setUserProfile(defaultProfile);
             profiles[loggedInUserEmail] = defaultProfile;
             localStorage.setItem('acadmate-profiles', JSON.stringify(profiles));
        }
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('acadmate-theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
  };
  
  const handleLoginSuccess = useCallback((email: string) => {
      setIsAuthenticated(true);
      const profiles = JSON.parse(localStorage.getItem('acadmate-profiles') || '{}');
      setUserProfile(profiles[email]);
  }, []);
  
  const handleLogout = useCallback(() => {
      localStorage.removeItem('acadmate-user');
      setIsAuthenticated(false);
      setUserProfile(null);
      setCurrentView(View.Home);
  }, []);
  
  const handleProfileUpdate = useCallback((updatedProfile: UserProfile) => {
      setUserProfile(updatedProfile);
      const profiles = JSON.parse(localStorage.getItem('acadmate-profiles') || '{}');
      profiles[updatedProfile.email] = updatedProfile;
      localStorage.setItem('acadmate-profiles', JSON.stringify(profiles));
      alert("Profile updated successfully!");
  }, []);

  const renderView = () => {
    switch (currentView) {
      case View.Home: return <Welcome setView={setCurrentView} userProfile={userProfile} />;
      case View.Pomodoro: return <PomodoroTimer />;
      case View.Notes: return <NotesManager />;
      case View.PdfViewer: return <PdfViewer />;
      case View.Webview: return <WebviewLoader />;
      case View.AiChat: return <AiChat userProfile={userProfile} />;
      case View.Settings: return <Settings userProfile={userProfile} onProfileUpdate={handleProfileUpdate} />;
      default: return <Welcome setView={setCurrentView} userProfile={userProfile} />;
    }
  };
  
  if (isLoading) {
      return <div className="fixed inset-0 bg-light-bg dark:bg-dark-bg"></div>; // Or a proper loading spinner
  }
  
  if (!isAuthenticated) {
      return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="flex h-screen bg-light-bg dark:bg-dark-bg text-light-text dark:text-dark-text overflow-hidden">
      <Sidebar currentView={currentView} setView={setCurrentView} isSidebarOpen={isSidebarOpen} setSidebarOpen={setSidebarOpen} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header title={viewTitles[currentView]} theme={theme} toggleTheme={toggleTheme} onMenuClick={() => setSidebarOpen(true)} onLogout={handleLogout} userProfile={userProfile} setView={setCurrentView}/>
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
            <div key={currentView} className="animate-fadeInMain">
                 {renderView()}
            </div>
        </main>
      </div>
    </div>
  );
}
