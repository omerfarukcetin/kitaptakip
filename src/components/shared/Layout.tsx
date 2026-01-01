import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { BookOpen, LayoutDashboard, Library, Settings, LogOut, FileText, Moon, Sun, BarChart3 } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../contexts/ThemeContext';

interface LayoutProps {
    children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
    const { user, signOut } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const location = useLocation();

    const handleSignOut = async () => {
        await signOut();
    };

    const navItems = [
        { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
        { path: '/library', icon: Library, label: 'Kütüphane' },
        { path: '/stats', icon: BarChart3, label: 'İstatistikler' },
        { path: '/notes', icon: FileText, label: 'Tüm Notlar' },
        { path: '/profile', icon: Settings, label: 'Profil' },
    ];

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 transition-colors">
            {/* Header */}
            <header className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 sticky top-0 z-40">
                <div className="container mx-auto px-4">
                    <div className="flex items-center justify-between h-16">
                        <Link to="/dashboard" className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center">
                                <BookOpen className="text-white" size={24} />
                            </div>
                            <span className="text-2xl font-black text-slate-900 dark:text-slate-100">
                                Kitap <span className="text-indigo-600">Takip</span>
                            </span>
                        </Link>

                        <nav className="hidden md:flex items-center gap-1">
                            {navItems.map((item) => (
                                <Link
                                    key={item.path}
                                    to={item.path}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold transition-all ${location.pathname === item.path
                                        ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400'
                                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700'
                                        }`}
                                >
                                    <item.icon size={18} />
                                    {item.label}
                                </Link>
                            ))}
                        </nav>

                        <div className="flex items-center gap-3">
                            <div className="hidden sm:block text-right">
                                <p className="text-sm font-bold text-slate-900 dark:text-slate-100">{user?.email}</p>
                            </div>
                            <button
                                onClick={toggleTheme}
                                className="p-2 text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-slate-700 rounded-lg transition-all"
                                title={theme === 'dark' ? 'Açık moda geç' : 'Koyu moda geç'}
                            >
                                {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
                            </button>
                            <button
                                onClick={handleSignOut}
                                className="flex items-center gap-2 px-4 py-2 text-slate-600 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl font-bold transition-all"
                            >
                                <LogOut size={18} />
                                <span className="hidden sm:inline">Çıkış</span>
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="container mx-auto px-4 py-8">{children}</main>

            {/* Mobile Navigation */}
            <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 z-40">
                <div className="grid grid-cols-4 gap-1 p-2">
                    {navItems.map((item) => (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={`flex flex-col items-center gap-1 py-3 rounded-xl font-bold transition-all ${location.pathname === item.path
                                ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400'
                                : 'text-slate-600 dark:text-slate-400'
                                }`}
                        >
                            <item.icon size={22} />
                            <span className="text-xs">{item.label}</span>
                        </Link>
                    ))}
                </div>
            </nav>
        </div>
    );
};
