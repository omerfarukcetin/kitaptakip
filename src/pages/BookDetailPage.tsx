import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Layout } from '../components/shared/Layout';
import { useBook, useBooks } from '../hooks/useBooks';
import { useReadingPlan, useReadingProgress } from '../hooks/useReadingPlan';
import { BookOpen, ArrowLeft, Edit, Trash2, Calendar, Star, MessageSquareQuote, Timer, Zap, Eye, EyeOff, Play, Pause } from 'lucide-react';
import { StarRating } from '../components/shared/StarRating';
import { Link } from 'react-router-dom';
import { ReadingPlanModal } from '../components/calendar/ReadingPlanModal';
import { InteractiveReadingPlan } from '../components/calendar/InteractiveReadingPlan';
import { BookForm } from '../components/books/BookForm';
import { BookNotes } from '../components/books/BookNotes';
import { formatDate, parseISODate } from '../utils/dateUtils';
import { generateReadingDays, getTodayTargetPage, recalculateEndDate } from '../utils/planUtils';
import type { ReadingDay } from '../lib/types';
import type { BookUpdate } from '../lib/database.types';

export const BookDetailPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { book, isLoading } = useBook(id!);
    const { updateBook, deleteBook } = useBooks();
    const { plan, savePlan } = useReadingPlan(id!);
    const { recordSession } = useReadingProgress(id!);
    const [showReadingPlan, setShowReadingPlan] = useState(false);
    const [showEditForm, setShowEditForm] = useState(false);
    const [isFocusMode, setIsFocusMode] = useState(false);
    const [timerActive, setTimerActive] = useState(false);
    const [isTimerFullScreen, setIsTimerFullScreen] = useState(false);
    const [seconds, setSeconds] = useState(0);
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        if (timerActive) {
            timerRef.current = setInterval(() => {
                setSeconds(s => s + 1);
            }, 1000);
        } else {
            if (timerRef.current) clearInterval(timerRef.current);
        }
        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, [timerActive]);

    const formatTime = (totalSeconds: number) => {
        const h = Math.floor(totalSeconds / 3600);
        const m = Math.floor((totalSeconds % 3600) / 60);
        const s = totalSeconds % 60;
        return `${h > 0 ? h + ':' : ''}${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    const handlePlanCreated = async (planData: { start_date: string; end_date: string; daily_pages: number; calculation_mode: string }) => {
        try {
            await savePlan.mutateAsync({
                book_id: id!,
                start_date: planData.start_date,
                end_date: planData.end_date,
                daily_pages: planData.daily_pages,
                calculation_mode: planData.calculation_mode as 'pages' | 'date',
            });
        } catch (error) {
            console.error('Plan kaydedilirken hata:', error);
        }
    };

    const handleStopTimer = async () => {
        setTimerActive(false);
        const duration = seconds;
        const newPageStr = prompt(`Okuma bitti! Şu an kaçıncı sayfadasınız? (Mevcut: ${book!.current_page})`, book!.current_page.toString());

        if (newPageStr !== null) {
            const newPage = parseInt(newPageStr);
            if (!isNaN(newPage) && newPage >= book!.current_page) {
                const pagesRead = newPage - book!.current_page;
                const today = new Date().toISOString().split('T')[0];

                // Kaydı reading_progress tablosuna ekle
                await recordSession.mutateAsync({
                    date: today,
                    pagesRead: pagesRead,
                    durationSeconds: duration,
                    endPage: newPage
                });

                // AKILLI PLAN GÜNCELLEME: Bitiş tarihini öne çek
                if (plan) {
                    const newEndDate = recalculateEndDate(newPage, book!.total_pages, plan.daily_pages);
                    if (newEndDate !== plan.end_date) {
                        await savePlan.mutateAsync({
                            book_id: book!.id,
                            start_date: plan.start_date,
                            end_date: newEndDate,
                            daily_pages: plan.daily_pages,
                            calculation_mode: plan.calculation_mode,
                            starting_page: plan.starting_page
                        });
                    }
                }
            }
        }
        setSeconds(0);
        setIsTimerFullScreen(false);
    };

    const handleEdit = async (bookData: BookUpdate) => {
        try {
            await updateBook.mutateAsync({ id: id!, updates: bookData });
            setShowEditForm(false);
        } catch (error) {
            console.error('Kitap güncellenirken hata:', error);
            alert('Kitap güncellenirken bir hata oluştu');
        }
    };

    const handleDelete = async () => {
        if (confirm('Bu kitabı silmek istediğinizden emin misiniz?')) {
            try {
                await deleteBook.mutateAsync(id!);
                navigate('/library');
            } catch (error) {
                console.error('Kitap silinirken hata:', error);
                alert('Kitap silinirken bir hata oluştu');
            }
        }
    };

    const handlePageUpdate = async (newPage: number) => {
        if (newPage >= 0 && newPage <= book!.total_pages) {
            await updateBook.mutateAsync({
                id: id!,
                updates: { current_page: newPage }
            });
        }
    };

    if (isLoading) {
        return (
            <Layout>
                <div className="max-w-7xl mx-auto text-center py-20">
                    <p className="text-slate-600">Yükleniyor...</p>
                </div>
            </Layout>
        );
    }

    if (!book) {
        return (
            <Layout>
                <div className="max-w-7xl mx-auto text-center py-20">
                    <BookOpen size={64} className="text-slate-300 mx-auto mb-4" />
                    <p className="text-slate-600 text-lg">Kitap bulunamadı</p>
                    <Link
                        to="/library"
                        className="inline-block mt-4 text-indigo-600 hover:text-indigo-700 font-bold"
                    >
                        ← Kütüphaneye Dön
                    </Link>
                </div>
            </Layout>
        );
    }

    return (
        <Layout>
            <div className="max-w-7xl mx-auto space-y-6 pb-20 md:pb-8 overflow-x-hidden">
                {!isFocusMode && (
                    <Link
                        to="/library"
                        className="inline-flex items-center gap-2 text-slate-600 hover:text-indigo-600 font-bold transition-colors mb-6 block"
                    >
                        <ArrowLeft size={20} />
                        Kütüphaneye Dön
                    </Link>
                )}

                <div className={`grid ${isFocusMode ? 'grid-cols-1' : 'md:grid-cols-[350px_1fr]'} gap-6 min-w-0 transition-all duration-500`}>
                    {/* LEFT COLUMN - Book Info */}
                    {!isFocusMode && (
                        <div className="space-y-6 min-w-0 overflow-hidden md:overflow-visible">
                            {/* Book Card */}
                            <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-lg p-5 sm:p-6">
                                {/* Cover */}
                                {book.cover_url ? (
                                    <img
                                        src={book.cover_url}
                                        alt={book.title}
                                        className="w-48 aspect-[2/3] object-cover rounded-2xl shadow-lg mb-4 mx-auto"
                                    />
                                ) : (
                                    <div className="w-48 aspect-[2/3] bg-gradient-to-br from-indigo-100 to-purple-100 rounded-2xl flex items-center justify-center mb-4 mx-auto">
                                        <BookOpen size={64} className="text-indigo-300" />
                                    </div>
                                )}

                                {/* Status Badge */}
                                <div className="mb-3">
                                    <StatusBadge status={book.status} />
                                </div>

                                {/* Title & Author */}
                                <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-100 mb-1 sm:mb-2 break-words">
                                    {book.title}
                                </h1>
                                {book.author && (
                                    <p className="text-base sm:text-lg text-slate-600 dark:text-slate-400 mb-2 break-words">{book.author}</p>
                                )}

                                {book.rating !== null && book.rating > 0 && (
                                    <div className="mb-4">
                                        <StarRating rating={book.rating} onChange={() => { }} editable={false} size={18} />
                                    </div>
                                )}

                                {/* Info Grid */}
                                <div className="grid grid-cols-2 gap-3 mb-4 pb-4 border-b border-slate-100 dark:border-slate-700">
                                    <InfoItem label="Top. Sayfa" value={book.total_pages} />
                                    <InfoItem label="Gün. Sayfa" value={book.current_page} />
                                    {book.isbn && <InfoItem label="ISBN" value={book.isbn} />}
                                    {book.rating && <InfoItem label="Puan" value={`${book.rating}/5 ⭐`} />}
                                    {book.started_at && (
                                        <InfoItem
                                            label="Başlangıç"
                                            value={new Date(book.started_at).toLocaleDateString('tr-TR')}
                                        />
                                    )}
                                    {book.completed_at && (
                                        <InfoItem
                                            label="Bitirme"
                                            value={new Date(book.completed_at).toLocaleDateString('tr-TR')}
                                        />
                                    )}
                                </div>

                                {/* Progress Bar (if reading) */}
                                {book.status === 'reading' && (
                                    <div className="mb-4">
                                        <div className="flex justify-between mb-2">
                                            <span className="text-sm font-bold text-slate-600 dark:text-slate-400">İlerleme</span>
                                            <span className="text-sm font-bold text-indigo-600">
                                                %{Math.round((book.current_page / book.total_pages) * 100)}
                                            </span>
                                        </div>
                                        <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-3">
                                            <div
                                                className="bg-indigo-600 h-3 rounded-full transition-all"
                                                style={{
                                                    width: `${Math.round((book.current_page / book.total_pages) * 100)}%`,
                                                }}
                                            />
                                        </div>
                                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
                                            {book.total_pages - book.current_page} sayfa kaldı
                                        </p>

                                        {/* Manual Page Input */}
                                        <div className="mt-3 flex items-center gap-2">
                                            <input
                                                type="number"
                                                min="0"
                                                max={book.total_pages}
                                                placeholder="Sayfa"
                                                className="flex-1 px-3 py-2 text-sm rounded-lg bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-slate-900 dark:text-slate-100"
                                                defaultValue={book.current_page}
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Enter') {
                                                        const newPage = parseInt((e.target as HTMLInputElement).value);
                                                        handlePageUpdate(newPage);
                                                    }
                                                }}
                                            />
                                            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">/ {book.total_pages}</span>
                                        </div>
                                    </div>
                                )}

                                {/* Description */}
                                {book.description && (
                                    <div className="mb-4 pb-4 border-b border-slate-100 dark:border-slate-700">
                                        <h3 className="font-bold text-slate-900 dark:text-slate-100 mb-2 text-sm">Kitap Hakkında</h3>
                                        <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed whitespace-pre-line">
                                            {book.description}
                                        </p>
                                    </div>
                                )}

                                {(book as any).review && (
                                    <div className="mb-6 p-5 bg-amber-50/50 dark:bg-amber-900/10 rounded-2xl border border-amber-100 dark:border-amber-900/20">
                                        <div className="flex items-center gap-2 mb-3 text-amber-700 dark:text-amber-400">
                                            <MessageSquareQuote size={18} />
                                            <h3 className="font-black text-sm uppercase tracking-wider">Final İncelemesi</h3>
                                        </div>
                                        <p className="text-slate-700 dark:text-slate-300 italic leading-relaxed">
                                            "{(book as any).review}"
                                        </p>
                                    </div>
                                )}

                                {/* Categories */}
                                {book.categories && book.categories.length > 0 && (
                                    <div className="mb-4">
                                        <h3 className="font-bold text-slate-900 dark:text-slate-100 mb-2 text-sm">Kategoriler</h3>
                                        <div className="flex flex-wrap gap-2">
                                            {book.categories.map((category, index) => (
                                                <span
                                                    key={index}
                                                    className="px-3 py-1 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 rounded-lg font-bold text-xs"
                                                >
                                                    {category}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                <div className="flex gap-2 mb-4">
                                    <button
                                        onClick={() => {
                                            if (timerActive) {
                                                handleStopTimer();
                                            } else {
                                                setTimerActive(true);
                                                setIsFocusMode(true);
                                                setIsTimerFullScreen(true);
                                            }
                                        }}
                                        className={`flex-1 px-4 py-3 rounded-2xl font-black transition-all flex items-center justify-center gap-2 ${timerActive
                                            ? 'bg-red-600 text-white shadow-lg shadow-red-200 animate-pulse'
                                            : 'bg-indigo-600 text-white shadow-lg shadow-indigo-200'
                                            }`}
                                    >
                                        <Timer size={20} />
                                        {timerActive ? `Duraklat (${formatTime(seconds)})` : 'Okumaya Başla'}
                                    </button>
                                    <button
                                        onClick={() => setIsFocusMode(!isFocusMode)}
                                        className="px-4 py-3 bg-slate-900 text-white rounded-2xl font-bold flex items-center justify-center"
                                        title="Odak Modu"
                                    >
                                        {isFocusMode ? <Eye size={20} /> : <EyeOff size={20} />}
                                    </button>
                                </div>

                                {/* Action Buttons */}
                                <div className="flex gap-2 border-t border-slate-100 dark:border-slate-700 pt-4">
                                    <button
                                        onClick={() => setShowEditForm(true)}
                                        className="flex-1 px-4 py-2 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 font-bold rounded-xl transition-all flex items-center justify-center gap-2 text-sm"
                                    >
                                        <Edit size={16} />
                                        Düzenle
                                    </button>
                                    <button
                                        onClick={handleDelete}
                                        className="px-4 py-2 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/40 text-red-600 dark:text-red-400 font-bold rounded-xl transition-all flex items-center gap-2 text-sm"
                                    >
                                        <Trash2 size={16} />
                                        Sil
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* RIGHT COLUMN - Reading Plan */}
                    <div className={`${isFocusMode ? 'max-w-4xl mx-auto w-full' : ''} space-y-6 min-w-0 overflow-hidden md:overflow-visible`}>
                        {isFocusMode && (
                            <div className="flex items-center justify-between bg-indigo-600 text-white p-6 rounded-3xl shadow-xl animate-in slide-in-from-top duration-500">
                                <div>
                                    <h2 className="text-2xl font-black">Odak Modu</h2>
                                    <p className="text-indigo-100 font-bold">{book.title} okunuyor...</p>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="text-right">
                                        <p className="text-[10px] font-black uppercase opacity-60">Süre</p>
                                        <p className="text-2xl font-black font-mono">{formatTime(seconds)}</p>
                                    </div>
                                    <button
                                        onClick={() => setIsFocusMode(false)}
                                        className="p-3 bg-white/20 hover:bg-white/30 rounded-2xl transition-all"
                                    >
                                        <Eye size={24} />
                                    </button>
                                    {!isTimerFullScreen && (
                                        <button
                                            onClick={() => setIsTimerFullScreen(true)}
                                            className="p-3 bg-white/20 hover:bg-white/30 rounded-2xl transition-all"
                                            title="Zamanlayıcıyı Büyüt"
                                        >
                                            <Timer size={24} />
                                        </button>
                                    )}
                                </div>
                            </div>
                        )}
                        {plan ? (
                            <>
                                {/* Reading Plan */}
                                <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-lg p-5 sm:p-6">
                                    <div className="flex items-center justify-between mb-6">
                                        <div>
                                            <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-100 mb-1">Okuma Takvimim</h2>
                                            <p className="text-slate-600 dark:text-slate-400 text-[10px] sm:text-sm">
                                                Günlük {plan.daily_pages} sayfa • {formatDate(new Date(plan.start_date))} - {formatDate(new Date(plan.end_date))}
                                            </p>
                                        </div>
                                        <button
                                            onClick={() => setShowReadingPlan(true)}
                                            className="px-3 py-1.5 sm:px-4 sm:py-2 bg-indigo-50 dark:bg-indigo-900/30 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 font-bold rounded-xl transition-all text-xs sm:text-sm"
                                        >
                                            Yeni Plan
                                        </button>
                                    </div>

                                    <InteractiveReadingPlan
                                        bookId={book.id}
                                        days={generateReadingDays(plan, book.total_pages, plan.starting_page ?? 0)}
                                        startDate={plan.start_date}
                                    />
                                </div>

                                {/* Notes below reading plan */}
                                <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-lg p-5 sm:p-6">
                                    <BookNotes
                                        bookId={book.id}
                                        bookTitle={book.title}
                                        bookAuthor={book.author || undefined}
                                    />
                                </div>
                            </>
                        ) : (
                            <>
                                {/* Create Plan CTA */}
                                <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-3xl p-8 text-white text-center">
                                    <Calendar size={48} className="mx-auto mb-4" />
                                    <h2 className="text-2xl font-black mb-2">Okuma Takvimi</h2>
                                    <p className="text-indigo-100 mb-6">
                                        Bu kitap için özel okuma planı oluştur ve ilerlemeni takip et
                                    </p>
                                    <button
                                        onClick={() => setShowReadingPlan(true)}
                                        className="px-8 py-3 bg-white text-indigo-600 hover:bg-indigo-50 font-bold rounded-xl transition-all"
                                    >
                                        Plan Oluştur
                                    </button>
                                </div>

                                {/* Notes when no plan */}
                                <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-lg p-5 sm:p-6">
                                    <BookNotes
                                        bookId={book.id}
                                        bookTitle={book.title}
                                        bookAuthor={book.author || undefined}
                                    />
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* Modals */}
            <ReadingPlanModal
                isOpen={showReadingPlan}
                onClose={() => setShowReadingPlan(false)}
                bookTitle={book.title}
                totalPages={book.total_pages}
                currentPage={book.current_page}
                bookId={book.id}
                onPlanCreated={handlePlanCreated}
            />

            {
                showEditForm && (
                    <BookForm
                        initialData={book}
                        onSubmit={handleEdit}
                        onCancel={() => setShowEditForm(false)}
                        loading={updateBook.isPending}
                    />
                )
            }
            {isTimerFullScreen && (
                <div className="fixed inset-0 z-50 bg-indigo-600 flex flex-col items-center justify-center text-white p-8 animate-in fade-in duration-500">
                    <div className="max-w-xl w-full text-center space-y-12">
                        <div className="space-y-4">
                            <h2 className="text-2xl sm:text-3xl font-black opacity-80">{book.title}</h2>
                            <p className="text-lg font-bold opacity-60">Şu an harika bir maceradasın...</p>
                            {plan && (
                                <div className="mt-4 p-4 bg-white/10 rounded-2xl inline-block border border-white/10">
                                    <div className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider opacity-90">
                                        <Zap size={16} className="text-yellow-400" />
                                        <span>Bugünkü Hedef: {plan.daily_pages} Sayfa</span>
                                    </div>
                                    <div className="text-xs opacity-60 mt-1 font-bold">
                                        {book.current_page >= (getTodayTargetPage(plan, book.total_pages) || 0)
                                            ? "Tebrikler! Bugünkü hedefini tamamladın. 🚀"
                                            : `Hedefe ${(getTodayTargetPage(plan, book.total_pages) || 0) - book.current_page} sayfa kaldı.`
                                        }
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="relative inline-block">
                            <div className="text-[100px] sm:text-[150px] font-black font-mono leading-none tracking-tighter">
                                {formatTime(seconds)}
                            </div>
                            <div className="absolute -top-4 -right-8">
                                <Zap className="text-yellow-400 animate-bounce" size={48} />
                            </div>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-4 items-center justify-center pt-8">
                            <button
                                onClick={() => setTimerActive(!timerActive)}
                                className={`w-full sm:w-auto px-8 py-5 rounded-[2rem] font-black text-xl transition-all border-2 flex items-center justify-center gap-3 ${timerActive
                                    ? 'bg-white/10 hover:bg-white/20 border-white/20 text-white'
                                    : 'bg-yellow-400 border-yellow-400 text-indigo-900 shadow-xl scale-105'
                                    }`}
                            >
                                {timerActive ? (
                                    <>
                                        <Pause size={24} />
                                        Duraklat
                                    </>
                                ) : (
                                    <>
                                        <Play size={24} />
                                        Devam Et
                                    </>
                                )}
                            </button>
                            <button
                                onClick={() => handleStopTimer()}
                                className="w-full sm:w-auto px-12 py-5 bg-white text-indigo-600 rounded-[2rem] font-black text-xl shadow-2xl hover:scale-105 transition-all"
                            >
                                Okumayı Bitir
                            </button>
                            <button
                                onClick={() => setIsTimerFullScreen(false)}
                                className="w-full sm:w-auto px-8 py-5 bg-white/10 hover:bg-white/20 text-white rounded-[2rem] font-black text-xl transition-all border border-white/20"
                            >
                                Notlara Dön
                            </button>
                        </div>
                    </div>

                    <div className="absolute bottom-12 left-0 right-0 text-center opacity-40 font-black tracking-widest uppercase text-xs">
                        OkurNot • Odak Modu Etkin
                    </div>
                </div>
            )}
        </Layout >
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
        <span
            className={`inline-block px-4 py-2 rounded-xl text-sm font-bold ${styles[status as keyof typeof styles]}`}
        >
            {labels[status as keyof typeof labels]}
        </span>
    );
};

const InfoItem: React.FC<{ label: string; value: string | number }> = ({
    label,
    value,
}) => {
    return (
        <div>
            <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                {label}
            </p>
            <p className="text-sm font-black text-slate-900 dark:text-slate-100 break-all">{value}</p>
        </div>
    );
};
