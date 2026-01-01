import React, { useState } from 'react';
import { Layout } from '../components/shared/Layout';
import { BookForm } from '../components/books/BookForm';
import { useBooks } from '../hooks/useBooks';
import { useProfile } from '../hooks/useProfile';
import {
    BookOpen,
    Plus,
    TrendingUp,
    Target,
    Clock,
    BookMarked,
    ChevronLeft,
    ChevronRight,
    Edit2,
    Check,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useReadingGoals } from '../hooks/useReadingGoals';
import { useStats } from '../hooks/useStats';
import { MonthlySummaryCard } from '../components/dashboard/MonthlySummaryCard';
import { useAllReadingPlans } from '../hooks/useReadingPlan';
import { getTodayTargetPage } from '../utils/planUtils';
import { RandomNoteWidget } from '../components/dashboard/RandomNoteWidget';
import type { BookInsert } from '../lib/database.types';

export const DashboardPage: React.FC = () => {
    const [showBookForm, setShowBookForm] = useState(false);
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const [showSummary, setShowSummary] = useState(() => {
        const saved = localStorage.getItem('show_monthly_summary');
        return saved === null ? true : saved === 'true';
    });

    const toggleSummary = () => {
        const newValue = !showSummary;
        setShowSummary(newValue);
        localStorage.setItem('show_monthly_summary', String(newValue));
    };
    const [isEditingGoal, setIsEditingGoal] = useState(false);
    const [editGoalValue, setEditGoalValue] = useState<number>(12);

    const { books, addBook } = useBooks();
    const { data: readingPlans } = useAllReadingPlans();
    const { goal, saveGoal } = useReadingGoals(selectedYear);
    const { yearlyStats, isLoading: statsLoading } = useStats(selectedYear);

    React.useEffect(() => {
        if (goal) setEditGoalValue(goal.goal);
    }, [goal]);

    const handleSaveGoal = async () => {
        try {
            await saveGoal.mutateAsync({ year: selectedYear, goal: editGoalValue });
            setIsEditingGoal(false);
        } catch (err) {
            alert('Hedef güncellenirken hata oluştu');
        }
    };

    const handleAddBook = async (bookData: BookInsert) => {
        try {
            await addBook.mutateAsync(bookData);
            setShowBookForm(false);
        } catch (error) {
            console.error('Error adding book:', error);
            alert('Kitap eklenirken bir hata oluştu');
        }
    };

    // Calculate statistics for selected year
    const yearlyGoal = goal?.goal || 12;
    const completedBooksInYear = yearlyStats.completedBooks;
    const progressTotal = Math.min(Math.round((completedBooksInYear / yearlyGoal) * 100), 100);

    // Filter cards for global overview
    const totalBooks = books?.length || 0;
    const completedBooksTotal = books?.filter((b) => b.status === 'completed').length || 0;
    const readingBooks = books?.filter((b) => b.status === 'reading').length || 0;
    const toReadBooks = books?.filter((b) => b.status === 'to_read').length || 0;

    // Monthly summary logic (if within first 7 days of month)
    const today = new Date();
    const showMonthlySummary = today.getDate() <= 7;
    const summaryMonth = today.getMonth() === 0 ? 11 : today.getMonth() - 1;
    const summaryYear = today.getMonth() === 0 ? today.getFullYear() - 1 : today.getFullYear();

    // Get recent books, prioritized by reading status
    const recentBooks = [...(books || [])]
        .sort((a, b) => {
            if (a.status === 'reading' && b.status !== 'reading') return -1;
            if (a.status !== 'reading' && b.status === 'reading') return 1;
            return 0;
        })
        .slice(0, 5);

    return (
        <Layout>
            <div className="max-w-7xl mx-auto space-y-8 pb-20 md:pb-8">
                {/* Welcome Section */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h1 className="text-2xl sm:text-4xl font-black text-slate-900 dark:text-slate-100 mb-1 sm:mb-2">
                            Dashboard
                        </h1>
                        <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400">Okuma yolculuğuna genel bakış</p>
                    </div>
                    <div className="flex items-center gap-3">
                        {showMonthlySummary && (
                            <button
                                onClick={toggleSummary}
                                className={`px-4 py-3 rounded-xl font-bold text-sm transition-all border ${showSummary
                                    ? 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700'
                                    : 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800'
                                    }`}
                            >
                                {showSummary ? 'Özeti Gizle' : 'Özeti Göster'}
                            </button>
                        )}
                        <button
                            onClick={() => setShowBookForm(true)}
                            className="flex items-center gap-2 px-4 py-2.5 sm:px-6 sm:py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all text-sm sm:text-base"
                        >
                            <Plus size={18} />
                            Kitap Ekle
                        </button>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
                    <Link to="/library">
                        <StatCard
                            icon={<BookOpen className="text-indigo-600" size={28} />}
                            label="Toplam Kitap"
                            value={totalBooks}
                            bgColor="bg-indigo-50"
                        />
                    </Link>
                    <Link to="/library?status=completed">
                        <StatCard
                            icon={<BookMarked className="text-green-600" size={28} />}
                            label="Okunan"
                            value={completedBooksTotal}
                            bgColor="bg-green-50"
                        />
                    </Link>
                    <Link to="/library?status=reading">
                        <StatCard
                            icon={<Clock className="text-orange-600" size={28} />}
                            label="Okunuyor"
                            value={readingBooks}
                            bgColor="bg-orange-50"
                        />
                    </Link>
                    <Link to="/library?status=to_read">
                        <StatCard
                            icon={<TrendingUp className="text-purple-600" size={28} />}
                            label="Okunacak"
                            value={toReadBooks}
                            bgColor="bg-purple-50"
                        />
                    </Link>
                </div>

                {showMonthlySummary && showSummary && (
                    <MonthlySummaryCard
                        year={summaryYear}
                        month={summaryMonth}
                        onClose={() => {
                            setShowSummary(false);
                            localStorage.setItem('show_monthly_summary', 'false');
                        }}
                    />
                )}

                <RandomNoteWidget />

                {/* Yearly Goal Section */}
                <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-3xl p-6 text-white shadow-lg overflow-hidden relative">
                    {/* Decorative background element */}
                    <div className="absolute top-0 right-0 -mr-8 -mt-8 w-40 h-40 bg-white/10 rounded-full blur-2xl" />

                    <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
                        {/* Year and Goal Setting */}
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-sm shrink-0">
                                <Target size={32} />
                            </div>
                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    <button
                                        onClick={() => setSelectedYear(selectedYear - 1)}
                                        className="p-1 hover:bg-white/10 rounded-lg transition-colors"
                                    >
                                        <ChevronLeft size={16} />
                                    </button>
                                    <h3 className="text-xl font-black">{selectedYear} Yılı Hedefi</h3>
                                    <button
                                        onClick={() => setSelectedYear(selectedYear + 1)}
                                        className="p-1 hover:bg-white/10 rounded-lg transition-colors"
                                    >
                                        <ChevronRight size={16} />
                                    </button>
                                </div>

                                {isEditingGoal ? (
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="number"
                                            className="w-16 px-2 py-1 bg-white/20 border border-white/30 rounded-lg text-sm font-bold focus:outline-none focus:ring-2 focus:ring-white/50 text-white placeholder:text-white/50"
                                            value={editGoalValue}
                                            onChange={(e) => setEditGoalValue(Number(e.target.value))}
                                            autoFocus
                                            onKeyDown={(e) => e.key === 'Enter' && handleSaveGoal()}
                                        />
                                        <button
                                            onClick={handleSaveGoal}
                                            className="p-1.5 bg-white text-indigo-600 rounded-lg hover:bg-indigo-50 transition-colors shadow-sm"
                                        >
                                            <Check size={14} />
                                        </button>
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-2">
                                        <span className="text-4xl font-black tracking-tight">{yearlyGoal}</span>
                                        <span className="text-indigo-100 font-bold text-sm">Kitap</span>
                                        <button
                                            onClick={() => setIsEditingGoal(true)}
                                            className="p-1.5 text-white/50 hover:text-white transition-all ml-1"
                                        >
                                            <Edit2 size={14} />
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Progress Display */}
                        <div className="flex-1 md:max-w-md">
                            <div className="flex justify-between items-end mb-3">
                                <div>
                                    <p className="text-sm font-bold text-indigo-100">Tamamlanan</p>
                                    <p className="text-2xl font-black">{completedBooksInYear} Kitap</p>
                                </div>
                                <div className="text-right">
                                    <span className="text-4xl font-black tabular-nums">{progressTotal}%</span>
                                </div>
                            </div>
                            <div className="relative w-full bg-white/20 rounded-full h-4 overflow-hidden border border-white/10 p-0.5">
                                <div
                                    className="bg-white h-full rounded-full transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(255,255,255,0.5)]"
                                    style={{ width: `${progressTotal}%` }}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Recent Books */}
                <div>
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-black text-slate-900 dark:text-slate-100">Kitaplarım</h2>
                        <Link
                            to="/library"
                            className="text-indigo-600 hover:text-indigo-700 font-bold text-sm"
                        >
                            Tümünü Gör →
                        </Link>
                    </div>

                    {recentBooks.length > 0 ? (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
                            {recentBooks.map((book) => (
                                <Link
                                    key={book.id}
                                    to={`/book/${book.id}`}
                                    className="bg-white dark:bg-slate-800 rounded-2xl p-4 shadow-sm hover:shadow-xl transition-all border border-slate-100 dark:border-slate-700 group"
                                >
                                    {book.cover_url ? (
                                        <img
                                            src={book.cover_url}
                                            alt={book.title}
                                            className="w-full aspect-[2/3] object-cover rounded-xl mb-3"
                                        />
                                    ) : (
                                        <div className="w-full aspect-[2/3] bg-gradient-to-br from-indigo-100 to-purple-100 rounded-xl mb-3 flex items-center justify-center">
                                            <BookOpen size={48} className="text-indigo-300" />
                                        </div>
                                    )}
                                    <h3 className="font-bold text-slate-900 dark:text-slate-100 mb-1 line-clamp-2 group-hover:text-indigo-600 transition-colors text-sm">
                                        {book.title}
                                    </h3>
                                    {book.author && (
                                        <p className="text-xs text-slate-500 dark:text-slate-400 truncate mb-2">{book.author}</p>
                                    )}
                                    <StatusBadge status={book.status} />
                                    {book.status === 'reading' && (
                                        <div className="mt-4">
                                            <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-1.5 mb-2">
                                                <div
                                                    className="bg-indigo-600 h-1.5 rounded-full transition-all duration-500"
                                                    style={{ width: `${Math.min(Math.round((book.current_page / book.total_pages) * 100), 100)}%` }}
                                                />
                                            </div>
                                            <div className="flex justify-between items-end">
                                                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-tight">
                                                    {book.current_page} / {book.total_pages}
                                                </p>
                                                {(() => {
                                                    const plan = readingPlans?.find(p => p.book_id === book.id);
                                                    const targetPage = plan ? getTodayTargetPage(plan, book.total_pages) : null;
                                                    if (targetPage !== null) {
                                                        const isAhead = book.current_page >= targetPage;
                                                        return (
                                                            <p className={`text-[10px] font-black px-1.5 py-0.5 rounded ${isAhead
                                                                ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                                                : 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400'
                                                                }`}>
                                                                Hedef: {targetPage}
                                                            </p>
                                                        );
                                                    }
                                                    return null;
                                                })()}
                                            </div>
                                        </div>
                                    )}
                                </Link>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12 bg-white dark:bg-slate-800 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-700">
                            <BookOpen size={48} className="text-slate-300 dark:text-slate-600 mx-auto mb-4" />
                            <p className="text-slate-600 dark:text-slate-300 mb-4">Henüz kitap eklemediniz</p>
                            <button
                                onClick={() => setShowBookForm(true)}
                                className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-all"
                            >
                                İlk Kitabını Ekle
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Book Form Modal */}
            {showBookForm && (
                <BookForm
                    onSubmit={handleAddBook}
                    onCancel={() => setShowBookForm(false)}
                    loading={addBook.isPending}
                />
            )}
        </Layout>
    );
};

interface StatCardProps {
    icon: React.ReactNode;
    label: string;
    value: number;
    bgColor: string;
}

const StatCard: React.FC<StatCardProps> = ({ icon, label, value, bgColor }) => {
    return (
        <div className={`${bgColor} rounded-2xl p-4 sm:p-6 border border-slate-100 dark:border-slate-700 hover:shadow-lg transition-all cursor-pointer`}>
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-[10px] sm:text-sm font-bold text-slate-600 dark:text-slate-400 mb-0.5 sm:mb-1">{label}</p>
                    <p className="text-xl sm:text-3xl font-black text-slate-900 dark:text-slate-100">{value}</p>
                </div>
                <div className="hidden sm:block">{icon}</div>
            </div>
        </div>
    );
};

const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
    const styles = {
        to_read: 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400',
        reading: 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400',
        completed: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400',
    };

    const labels = {
        to_read: 'Okunacak',
        reading: 'Okunuyor',
        completed: 'Okundu',
    };

    return (
        <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ${styles[status as keyof typeof styles]}`}>
            {labels[status as keyof typeof labels]}
        </span>
    );
};
