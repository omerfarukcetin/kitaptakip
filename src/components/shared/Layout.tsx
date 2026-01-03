import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
    BookOpen, LayoutDashboard, Library, Settings, LogOut, FileText,
    Moon, Sun, BarChart3, Rocket, Sparkles, Map, Gem, Sword, ScrollText, ShoppingBag
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../contexts/ThemeContext';
import { useAppMode } from '../../contexts/KidModeContext';

interface LayoutProps {
    children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
    const { user, signOut } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const { mode, toggleMode } = useAppMode();
    const location = useLocation();

    const isKid = mode === 'kid';

    const handleSignOut = async () => {
        await signOut();
    };

    const navItems = isKid ? [
        { path: '/dashboard', icon: Map, label: 'Macera' },
        { path: '/library', icon: Gem, label: 'Hazineler' },
        { path: '/bazaar', icon: ShoppingBag, label: 'Çarşı' },
        { path: '/stats', icon: Sword, label: 'Gücüm' },
        { path: '/profile', icon: Settings, label: 'Ayarlar' },
    ] : [
        { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
        { path: '/library', icon: Library, label: 'Kütüphane' },
        { path: '/stats', icon: BarChart3, label: 'İstatistik' },
        { path: '/notes', icon: FileText, label: 'Notlar' },
        { path: '/profile', icon: Settings, label: 'Profil' },
    ];

    return (
        <div className={`min-h-screen transition-colors ${isKid ? 'bg-orange-50 dark:bg-orange-950/20' : 'bg-slate-50 dark:bg-slate-900'
            }`}>
            {/* Header */}
            <header className={`border-b sticky top-0 z-40 ${isKid
                ? 'bg-white/80 backdrop-blur-md dark:bg-orange-900/40 border-orange-200 dark:border-orange-800'
                : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700'
                }`}>
                <div className="container mx-auto px-4">
                    <div className="flex items-center justify-between h-16">
                        <Link to="/dashboard" className="flex items-center gap-3 group">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${isKid ? 'bg-orange-500 group-hover:rotate-12 group-hover:scale-110' : 'bg-indigo-600'
                                }`}>
                                {isKid ? <Rocket className="text-white" size={24} /> : <BookOpen className="text-white" size={24} />}
                            </div>
                            <span className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-100 italic">
                                {isKid ? (
                                    <>Kitap <span className="text-orange-500">Macerası</span></>
                                ) : (
                                    <>Kitap <span className="text-indigo-600">Takip</span></>
                                )}
                            </span>
                        </Link>

                        <nav className="hidden lg:flex items-center gap-1">
                            {navItems.map((item) => (
                                <Link
                                    key={item.path}
                                    to={item.path}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold transition-all ${location.pathname === item.path
                                        ? isKid
                                            ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/20'
                                            : 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400'
                                        : 'text-slate-600 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-700'
                                        }`}
                                >
                                    <item.icon size={18} />
                                    {item.label}
                                </Link>
                            ))}
                        </nav>

                        <div className="flex items-center gap-2 sm:gap-3">
                            <div className="hidden sm:flex flex-col items-end mr-2">
                                <p className={`text-[10px] font-black uppercase tracking-widest ${isKid ? 'text-orange-500' : 'text-slate-400'}`}>
                                    {isKid ? 'Maceracı' : 'Kullanıcı'}
                                </p>
                                <p className="text-sm font-bold text-slate-900 dark:text-slate-100">{user?.email?.split('@')[0]}</p>
                            </div>

                            <button
                                onClick={toggleMode}
                                className={`p-2 rounded-xl transition-all ${isKid
                                    ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg shadow-indigo-600/20'
                                    : 'bg-orange-500 text-white hover:bg-orange-600 shadow-lg shadow-orange-500/20'
                                    }`}
                                title={isKid ? 'Yetişkin Moduna Geç' : 'Çocuk Moduna Geç'}
                            >
                                {isKid ? <Sparkles size={20} /> : <Rocket size={20} />}
                            </button>

                            <button
                                onClick={toggleTheme}
                                className="p-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition-all"
                            >
                                {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
                            </button>

                            <button
                                onClick={handleSignOut}
                                className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all"
                            >
                                <LogOut size={20} />
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="container mx-auto px-4 py-8 pb-24 md:pb-8">{children}</main>

            {/* Mobile Navigation */}
            <nav className={`lg:hidden fixed bottom-0 left-0 right-0 border-t z-40 pb-safe ${isKid
                ? 'bg-white/90 backdrop-blur-md dark:bg-orange-900/40 border-orange-200 dark:border-orange-800'
                : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700'
                }`}>
                <div className="grid grid-cols-5 gap-1 p-1">
                    {navItems.map((item) => (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={`flex flex-col items-center gap-1 py-3 rounded-2xl font-bold transition-all ${location.pathname === item.path
                                ? isKid
                                    ? 'bg-orange-500 text-white shadow-lg'
                                    : 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400'
                                : 'text-slate-500 dark:text-slate-400'
                                }`}
                        >
                            <item.icon size={20} />
                            <span className="text-[10px] text-center font-black">
                                {item.label}
                            </span>
                        </Link>
                    ))}
                </div>
            </nav>
        </div>
    );
};
