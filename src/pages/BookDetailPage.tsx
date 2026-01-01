import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Layout } from '../components/shared/Layout';
import { useBook, useBooks } from '../hooks/useBooks';
import { useReadingPlan } from '../hooks/useReadingPlan';
import { BookOpen, ArrowLeft, Edit, Trash2, Calendar, Star, MessageSquareQuote } from 'lucide-react';
import { StarRating } from '../components/shared/StarRating';
import { Link } from 'react-router-dom';
import { ReadingPlanModal } from '../components/calendar/ReadingPlanModal';
import { InteractiveReadingPlan } from '../components/calendar/InteractiveReadingPlan';
import { BookForm } from '../components/books/BookForm';
import { BookNotes } from '../components/books/BookNotes';
import { formatDate, parseISODate } from '../utils/dateUtils';
import { generateReadingDays } from '../utils/planUtils';
import type { ReadingDay } from '../utils/planUtils';
import type { BookUpdate } from '../lib/database.types';

export const BookDetailPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { book, isLoading } = useBook(id!);
    const { updateBook, deleteBook } = useBooks();
    const { plan, savePlan } = useReadingPlan(id!);
    const [showReadingPlan, setShowReadingPlan] = useState(false);
    const [showEditForm, setShowEditForm] = useState(false);

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
            <div className="max-w-7xl mx-auto space-y-6 pb-20 md:pb-8">
                {/* Back Button */}
                <Link
                    to="/library"
                    className="inline-flex items-center gap-2 text-slate-600 hover:text-indigo-600 font-bold transition-colors"
                >
                    <ArrowLeft size={20} />
                    Kütüphaneye Dön
                </Link>

                {/* Two Column Layout */}
                <div className="grid md:grid-cols-[350px_1fr] gap-6">
                    {/* LEFT COLUMN - Book Info */}
                    <div className="space-y-6">
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

                            {/* Action Buttons */}
                            <div className="flex gap-2">
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

                    {/* RIGHT COLUMN - Reading Plan */}
                    <div className="space-y-6">
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

            {showEditForm && (
                <BookForm
                    initialData={book}
                    onSubmit={handleEdit}
                    onCancel={() => setShowEditForm(false)}
                    loading={updateBook.isPending}
                />
            )}
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
