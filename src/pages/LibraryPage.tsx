import React, { useState, useEffect } from 'react';
import { Layout } from '../components/shared/Layout';
import { BookForm } from '../components/books/BookForm';
import { useBooks } from '../hooks/useBooks';
import { BookOpen, Plus, Search, Filter, Clock, Target, BookMarked } from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';
import { useAllReadingPlans } from '../hooks/useReadingPlan';
import { getTodayTargetPage } from '../utils/planUtils';
import type { BookInsert, BookStatus } from '../lib/database.types';

export const LibraryPage: React.FC = () => {
    const [searchParams] = useSearchParams();
    const [showBookForm, setShowBookForm] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<BookStatus | 'all'>('all');

    const { books, addBook } = useBooks();
    const { data: readingPlans } = useAllReadingPlans();

    // Initialize filter from URL params
    useEffect(() => {
        const statusParam = searchParams.get('status') as BookStatus | null;
        if (statusParam && ['to_read', 'reading', 'completed'].includes(statusParam)) {
            setStatusFilter(statusParam);
        }
    }, [searchParams]);

    const handleAddBook = async (bookData: BookInsert) => {
        try {
            await addBook.mutateAsync(bookData);
            setShowBookForm(false);
        } catch (error) {
            console.error('Error adding book:', error);
            alert('Kitap eklenirken bir hata oluştu');
        }
    };

    // Filter and search books
    const filteredBooks = books?.filter((book) => {
        const matchesSearch =
            book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            book.author?.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = statusFilter === 'all' || book.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    return (
        <Layout>
            <div className="max-w-7xl mx-auto space-y-8 pb-20 md:pb-8">
                {/* Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h1 className="text-4xl font-black text-slate-900 dark:text-slate-100 mb-2">Kütüphanem</h1>
                        <p className="text-slate-600 dark:text-slate-400">
                            {books?.length || 0} kitap toplam
                        </p>
                    </div>
                    <button
                        onClick={() => setShowBookForm(true)}
                        className="flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all"
                    >
                        <Plus size={20} />
                        Yeni Kitap
                    </button>
                </div>

                {/* Filters */}
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1 relative">
                        <Search
                            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                            size={20}
                        />
                        <input
                            type="text"
                            placeholder="Kitap veya yazar ara..."
                            className="w-full pl-12 pr-4 py-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <div className="flex gap-2 flex-wrap sm:flex-nowrap">
                        <FilterButton
                            active={statusFilter === 'all'}
                            onClick={() => setStatusFilter('all')}
                            label="Tümü"
                        />
                        <FilterButton
                            active={statusFilter === 'reading'}
                            onClick={() => setStatusFilter('reading')}
                            label="Okunuyor"
                            color="orange"
                            icon={<Clock size={16} />}
                        />
                        <FilterButton
                            active={statusFilter === 'to_read'}
                            onClick={() => setStatusFilter('to_read')}
                            label="Okunacak"
                            color="purple"
                            icon={<Target size={16} />}
                        />
                        <FilterButton
                            active={statusFilter === 'completed'}
                            onClick={() => setStatusFilter('completed')}
                            label="Okundu"
                            color="green"
                            icon={<BookMarked size={16} />}
                        />
                    </div>
                </div>

                {/* Books Grid */}
                {filteredBooks && filteredBooks.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
                        {filteredBooks.map((book) => (
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
                                        <BookOpen size={40} className="text-indigo-300" />
                                    </div>
                                )}
                                <h3 className="font-bold text-slate-900 dark:text-slate-100 mb-1 line-clamp-2 group-hover:text-indigo-600 transition-colors text-sm">
                                    {book.title}
                                </h3>
                                <p className="text-xs text-slate-500 dark:text-slate-400 truncate mb-2">
                                    {book.author}
                                </p>
                                <StatusBadge status={book.status} />
                                {book.status === 'reading' && (
                                    <div className="mt-2">
                                        <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-1.5">
                                            <div
                                                className="bg-indigo-600 h-1.5 rounded-full transition-all"
                                                style={{
                                                    width: `${Math.round(
                                                        (book.current_page / book.total_pages) * 100
                                                    )
                                                        }% `,
                                                }}
                                            />
                                        </div>
                                        <div className="flex justify-between items-end mt-1">
                                            <p className="text-xs text-slate-500 dark:text-slate-400">
                                                {book.current_page} / {book.total_pages} sayfa
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
                    <div className="text-center py-20 bg-white dark:bg-slate-800 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-700">
                        <BookOpen size={64} className="text-slate-300 dark:text-slate-600 mx-auto mb-4" />
                        <p className="text-slate-600 dark:text-slate-300 text-lg mb-2">
                            {searchQuery || statusFilter !== 'all'
                                ? 'Aranan kriterlere uygun kitap bulunamadı'
                                : 'Henüz kitap eklemediniz'}
                        </p>
                        <p className="text-slate-500 mb-6">
                            {searchQuery || statusFilter !== 'all'
                                ? 'Farklı bir arama deneyin'
                                : 'ISBN ile hızlıca kitap ekleyebilirsiniz'}
                        </p>
                        {!searchQuery && statusFilter === 'all' && (
                            <button
                                onClick={() => setShowBookForm(true)}
                                className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-all"
                            >
                                İlk Kitabını Ekle
                            </button>
                        )}
                    </div>
                )}
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

interface FilterButtonProps {
    active: boolean;
    onClick: () => void;
    label: string;
    color?: 'orange' | 'purple' | 'green';
    icon?: React.ReactNode;
}

const FilterButton: React.FC<FilterButtonProps> = ({
    active,
    onClick,
    label,
    color,
    icon,
}) => {
    const activeColors = {
        orange: 'bg-orange-600 dark:bg-orange-500',
        purple: 'bg-purple-600 dark:bg-purple-500',
        green: 'bg-green-600 dark:bg-green-500',
    };

    return (
        <button
            onClick={onClick}
            className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all ${active
                ? color
                    ? `${activeColors[color]} text-white shadow-lg`
                    : 'bg-indigo-600 dark:bg-indigo-500 text-white shadow-lg'
                : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700'
                }`}
        >
            {icon}
            {label}
        </button>
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
            className={`inline-block px-2 py-0.5 rounded-md text-xs font-bold ${styles[status as keyof typeof styles]
                }`}
        >
            {labels[status as keyof typeof labels]}
        </span>
    );
};
