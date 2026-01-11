import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Layout } from '../components/shared/Layout';
import { useBook, useBooks } from '../hooks/useBooks';
import { useReadingPlan, useReadingProgress } from '../hooks/useReadingPlan';
import { BookOpen, ArrowLeft, Edit, Trash2, Calendar, Star, MessageSquareQuote, Timer, Zap, Eye, EyeOff, Play, Pause, ChevronDown, ChevronUp, Rocket, Gem, ScrollText, Map as MapIcon } from 'lucide-react';
import { StarRating } from '../components/shared/StarRating';
import { Link } from 'react-router-dom';
import { ReadingPlanModal } from '../components/calendar/ReadingPlanModal';
import { InteractiveReadingPlan } from '../components/calendar/InteractiveReadingPlan';
import { BookForm } from '../components/books/BookForm';
import { BookNotes } from '../components/books/BookNotes';
import { useDetailedStats } from '../hooks/useDetailedStats';
import { formatDate, parseISODate } from '../utils/dateUtils';
import { generateReadingDays, getTodayTargetPage, recalculateEndDate } from '../utils/planUtils';
import { useAppMode } from '../contexts/KidModeContext';
import { EnergyTimer } from '../components/kids/EnergyTimer';
import { KidSessionModal } from '../components/kids/KidSessionModal';
import { useKidProfile } from '../hooks/useKidProfile';
import { ManualReadingModal } from '../components/books/ManualReadingModal';
import type { ReadingDay } from '../lib/types';
import type { BookUpdate } from '../lib/database.types';

export const BookDetailPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { book, isLoading } = useBook(id!);
    const { updateBook, deleteBook } = useBooks();
    const { speedMetrics } = useDetailedStats(new Date().getFullYear());
    const { plan, savePlan, deletePlan } = useReadingPlan(id!);
    const { recordSession } = useReadingProgress(id!);
    const [showReadingPlan, setShowReadingPlan] = useState(false);
    const [showEditForm, setShowEditForm] = useState(false);
    const [isFocusMode, setIsFocusMode] = useState(false);
    const [timerActive, setTimerActive] = useState(false);
    const [isTimerFullScreen, setIsTimerFullScreen] = useState(false);
    const [seconds, setSeconds] = useState(0);
    const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(window.innerWidth > 768);
    const [manualPage, setManualPage] = useState<number>(0);

    const { mode } = useAppMode();
    const { updateKidStats } = useKidProfile();
    const [showKidSessionModal, setShowKidSessionModal] = useState(false);
    const [showManualEntry, setShowManualEntry] = useState(false);
    const [kidSessionData, setKidSessionData] = useState<{ pages: number; xp: number; gold: number } | null>(null);
    const timerRef = useRef<NodeJS.Timeout | null>(null);
    const isKid = mode === 'kid';

    useEffect(() => {
        if (book) setManualPage(book.current_page);
    }, [book?.current_page]);

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

    const handleStopTimer = async (forcedDuration?: number) => {
        setTimerActive(false);
        const duration = forcedDuration !== undefined ? forcedDuration : seconds;

        if (isKid) {
            const newPageStr = prompt(`Macera bitti! Şu an kaçıncı sayfadasın? (Mevcut: ${book!.current_page})`, book!.current_page.toString());
            if (newPageStr !== null) {
                const newPage = parseInt(newPageStr);
                if (!isNaN(newPage) && newPage >= book!.current_page) {
                    const pagesRead = newPage - book!.current_page;
                    const xp = pagesRead * 10;
                    const gold = Math.floor(pagesRead / 2); // 2 sayfa = 1 altın

                    setKidSessionData({ pages: pagesRead, xp, gold });
                    setShowKidSessionModal(true);
                }
            }
        } else {
            const newPageStr = prompt(`Okuma bitti! Şu an kaçıncı sayfadasınız? (Mevcut: ${book!.current_page})`, book!.current_page.toString());

            if (newPageStr !== null) {
                const newPage = parseInt(newPageStr);
                if (!isNaN(newPage) && newPage >= book!.current_page) {
                    const pagesRead = newPage - book!.current_page;
                    const today = new Date().toISOString().split('T')[0];

                    await recordSession.mutateAsync({
                        date: today,
                        pagesRead: pagesRead,
                        durationSeconds: duration,
                        endPage: newPage
                    });

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
        }
        setSeconds(0);
        setIsTimerFullScreen(false);
    };

    const handleKidSessionSave = async (data: { mood: string; voiceUrl: string; pagesRead: number }) => {
        if (!kidSessionData) return;

        const today = new Date().toISOString().split('T')[0];
        const newPage = book!.current_page + data.pagesRead;

        await recordSession.mutateAsync({
            date: today,
            pagesRead: data.pagesRead,
            durationSeconds: seconds || 1200,
            endPage: newPage,
            emoji_mood: data.mood,
            voice_summary_url: data.voiceUrl
        } as any);

        await updateKidStats.mutateAsync({
            xpToAdd: kidSessionData.xp,
            goldToAdd: kidSessionData.gold
        });

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
    };

    const handleDeletePlan = async () => {
        if (window.confirm('Okuma planını silmek istediğinize emin misiniz?')) {
            try {
                await deletePlan.mutateAsync(id!);
            } catch (error) {
                console.error('Plan silinirken hata:', error);
                alert('Plan silinirken bir hata oluştu');
            }
        }
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
                        to={isKid ? "/dashboard" : "/library"}
                        className={`inline-flex items-center gap-2 font-bold transition-colors mb-2 block ${isKid ? 'text-orange-600 hover:text-orange-700' : 'text-slate-600 hover:text-indigo-600'
                            }`}
                    >
                        {isKid ? (
                            <><MapIcon size={20} /> Haritaya Dön</>
                        ) : (
                            <><ArrowLeft size={20} /> Kütüphaneye Dön</>
                        )}
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
                                <h1 className={`text-xl sm:text-2xl font-black mb-1 sm:mb-2 break-words ${isKid ? 'text-orange-900 dark:text-orange-100 italic' : 'text-slate-900 dark:text-slate-100'
                                    }`}>
                                    {book.title}
                                </h1>
                                {book.author && (
                                    <p className={`text-base sm:text-lg mb-2 break-words ${isKid ? 'text-orange-600 dark:text-orange-400 font-bold' : 'text-slate-600 dark:text-slate-400'
                                        }`}>{book.author}</p>
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
                                        <div className="mt-3 flex items-center gap-2">
                                            <input
                                                type="number"
                                                min="0"
                                                max={book.total_pages}
                                                className="flex-1 px-3 py-2 text-sm rounded-lg bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-slate-900 dark:text-slate-100"
                                                value={manualPage}
                                                onChange={(e) => setManualPage(parseInt(e.target.value) || 0)}
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Enter') {
                                                        const newPage = parseInt((e.target as HTMLInputElement).value);
                                                        handlePageUpdate(newPage);
                                                    }
                                                }}
                                                onBlur={() => {
                                                    if (manualPage !== book.current_page) {
                                                        handlePageUpdate(manualPage);
                                                    }
                                                }}
                                            />
                                            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">/ {book.total_pages}</span>
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
                                            : isKid
                                                ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/20 active:scale-95'
                                                : 'bg-indigo-600 text-white shadow-lg shadow-indigo-200'
                                            }`}
                                    >
                                        {isKid ? <Rocket size={20} /> : <Timer size={20} />}
                                        {timerActive
                                            ? `Duraklat (${formatTime(seconds)})`
                                            : isKid ? 'Maceraya Başla!' : 'Okumaya Başla'}
                                    </button>
                                    {!isKid && (
                                        <button
                                            onClick={() => setShowManualEntry(true)}
                                            className="px-4 py-3 bg-white dark:bg-slate-800 text-indigo-600 border-2 border-indigo-600 rounded-2xl font-black hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-all flex items-center justify-center gap-2"
                                            title="Manuel Kayıt"
                                        >
                                            <Edit size={20} />
                                            <span className="hidden sm:inline">Manuel</span>
                                        </button>
                                    )}
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

                    {/* RIGHT COLUMN */}
                    <div className={`${isFocusMode ? 'max-w-4xl mx-auto w-full' : ''} space-y-6 min-w-0 overflow-hidden md:overflow-visible`}>
                        {isFocusMode && !isKid && (
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
                                </div>
                            </div>
                        )}
                        {plan ? (
                            <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-lg p-5 sm:p-6">
                                <div className="flex items-center justify-between mb-6">
                                    <div>
                                        <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-100 mb-1">
                                            {isKid ? 'Okuma Takvimim' : 'Okuma Takvimim'}
                                        </h2>
                                        <p className="text-slate-600 dark:text-slate-400 text-[10px] sm:text-sm">
                                            Günlük {plan.daily_pages} sayfa • {formatDate(new Date(plan.start_date))} - {formatDate(new Date(plan.end_date))}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => setShowReadingPlan(true)}
                                            className="px-3 py-1.5 sm:px-4 sm:py-2 bg-indigo-50 dark:bg-indigo-900/30 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 font-bold rounded-xl transition-all text-xs sm:text-sm"
                                        >
                                            Yeni Plan
                                        </button>
                                        <button
                                            onClick={handleDeletePlan}
                                            className="p-1.5 sm:p-2 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/50 text-red-600 dark:text-red-400 font-bold rounded-xl transition-all text-xs sm:text-sm"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>

                                <InteractiveReadingPlan
                                    bookId={book.id}
                                    days={generateReadingDays(plan, book.total_pages, plan.starting_page ?? 0)}
                                    startDate={plan.start_date}
                                />
                            </div>
                        ) : (
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
                        )}
                        <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-lg p-5 sm:p-6">
                            <BookNotes
                                bookId={book.id}
                                bookTitle={book.title}
                                bookAuthor={book.author || undefined}
                            />
                        </div>
                    </div>
                </div>
            </div>

            <ReadingPlanModal
                isOpen={showReadingPlan}
                onClose={() => setShowReadingPlan(false)}
                bookTitle={book.title}
                totalPages={book.total_pages}
                currentPage={book.current_page}
                bookId={book.id}
                onPlanCreated={handlePlanCreated}
            />

            {showEditForm && (
                <BookForm
                    initialData={book}
                    onSubmit={handleEdit}
                    onCancel={() => setShowEditForm(false)}
                    loading={updateBook.isPending}
                />
            )}

            {isTimerFullScreen && (
                isKid ? (
                    <EnergyTimer
                        bookTitle={book.title}
                        onFinish={(duration) => handleStopTimer(duration)}
                        onCancel={() => {
                            setTimerActive(false);
                            setIsTimerFullScreen(false);
                            setSeconds(0);
                        }}
                    />
                ) : (
                    <div className="fixed inset-0 z-50 bg-indigo-600 flex flex-col items-center justify-center text-white p-8 animate-in fade-in duration-500">
                        <div className="max-w-xl w-full text-center space-y-12">
                            <div className="space-y-4">
                                <h2 className="text-2xl sm:text-3xl font-black opacity-80">{book.title}</h2>
                                <p className="text-lg font-bold opacity-60">Şu an odak modundasın...</p>
                                {plan && (
                                    <div className="mt-4 p-4 bg-white/10 rounded-2xl inline-block border border-white/10">
                                        <div className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider opacity-90">
                                            <Zap size={16} className="text-yellow-400" />
                                            <span>Bugünkü Hedef: {plan.daily_pages} Sayfa</span>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="text-[100px] sm:text-[150px] font-black font-mono leading-none tracking-tighter">
                                {formatTime(seconds)}
                            </div>

                            <div className="flex flex-col sm:flex-row gap-4 items-center justify-center pt-8">
                                <button
                                    onClick={() => setTimerActive(!timerActive)}
                                    className={`w-full sm:w-auto px-8 py-5 rounded-[2rem] font-black text-xl transition-all border-2 flex items-center justify-center gap-3 ${timerActive
                                        ? 'bg-white/10 hover:bg-white/20 border-white/20 text-white'
                                        : 'bg-yellow-400 border-yellow-400 text-indigo-900 shadow-xl scale-105'
                                        }`}
                                >
                                    {timerActive ? <><Pause size={24} /> Duraklat</> : <><Play size={24} /> Devam Et</>}
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
                                    Geri Dön
                                </button>
                            </div>
                        </div>
                    </div>
                )
            )}

            {isKid && (
                <KidSessionModal
                    isOpen={showKidSessionModal}
                    onClose={() => setShowKidSessionModal(false)}
                    onSave={handleKidSessionSave}
                    pagesRead={kidSessionData?.pages || 0}
                    xpEarned={kidSessionData?.xp || 0}
                    goldEarned={kidSessionData?.gold || 0}
                />
            )}

            <ManualReadingModal
                isOpen={showManualEntry}
                onClose={() => setShowManualEntry(false)}
                bookTitle={book.title}
                currentPage={book.current_page}
                totalPages={book.total_pages}
                onSave={async (data) => {
                    await recordSession.mutateAsync(data);
                }}
            />
        </Layout>
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
        <span className={`inline-block px-4 py-2 rounded-xl text-sm font-bold ${styles[status as keyof typeof styles]}`}>
            {labels[status as keyof typeof labels]}
        </span>
    );
};

const InfoItem: React.FC<{ label: string; value: string | number }> = ({ label, value }) => {
    return (
        <div>
            <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">{label}</p>
            <p className="text-sm font-black text-slate-900 dark:text-slate-100 break-all">{value}</p>
        </div>
    );
};
