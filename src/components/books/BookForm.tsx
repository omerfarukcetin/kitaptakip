import React, { useState } from 'react';
import { X, Search, Loader2, Star } from 'lucide-react';
import { StarRating } from '../shared/StarRating';
import { searchBookByISBN, extractBookData } from '../../lib/googleBooks';
import type { BookInsert } from '../../lib/database.types';

interface BookFormProps {
    onSubmit: (book: Partial<BookInsert>) => Promise<void>;
    onCancel: () => void;
    initialData?: Partial<BookInsert>;
    loading?: boolean;
}

export const BookForm: React.FC<BookFormProps> = ({
    onSubmit,
    onCancel,
    initialData,
    loading = false,
}) => {
    const [isbn, setIsbn] = useState('');
    const [searchingISBN, setSearchingISBN] = useState(false);
    const [formData, setFormData] = useState<Partial<BookInsert>>({
        title: initialData?.title || '',
        author: initialData?.author || '',
        total_pages: initialData?.total_pages || 0,
        status: initialData?.status || 'to_read',
        cover_url: initialData?.cover_url || '',
        isbn: initialData?.isbn || '',
        categories: initialData?.categories || [],
        notes: initialData?.notes || '',
        description: initialData?.description || '',
        started_at: initialData?.started_at || null,
        completed_at: initialData?.completed_at || null,
        rating: initialData?.rating || 0,
        review: (initialData as any)?.review || '',
    });

    const handleISBNSearch = async () => {
        if (!isbn.trim()) return;

        setSearchingISBN(true);
        try {
            const book = await searchBookByISBN(isbn);
            if (book) {
                const bookData = extractBookData(book);
                setFormData({
                    ...formData,
                    ...bookData,
                });
            } else {
                alert('Bu ISBN için kitap bulunamadı. Manuel olarak girebilirsiniz.');
            }
        } catch (error) {
            console.error('ISBN arama hatası:', error);
            alert('ISBN araması sırasında bir hata oluştu.');
        } finally {
            setSearchingISBN(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.title || !formData.total_pages) {
            alert('Lütfen en az kitap adı ve sayfa sayısını girin.');
            return;
        }

        if (formData.current_page && formData.current_page > formData.total_pages) {
            alert('Mevcut sayfa, toplam sayfa sayısından büyük olamaz.');
            return;
        }

        // Clean up data for update/insert
        const cleanData = { ...formData };
        if (cleanData.status !== 'completed') {
            (cleanData as any).review = null;
        }

        await onSubmit(cleanData);
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
            <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl max-w-2xl w-full my-8 p-8 relative max-h-[90vh] overflow-y-auto border border-slate-100 dark:border-slate-800">
                <button
                    onClick={onCancel}
                    className="absolute top-6 right-6 text-slate-400 hover:text-slate-600 transition-colors"
                >
                    <X size={24} />
                </button>

                <h2 className="text-3xl font-black text-slate-900 dark:text-slate-100 mb-6">
                    {initialData ? 'Kitabı Düzenle' : 'Yeni Kitap Ekle'}
                </h2>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* ISBN Search */}
                    {!initialData && (
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                ISBN ile Ara (Opsiyonel)
                            </label>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    placeholder="ISBN 10 veya 13"
                                    className="flex-1 px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all text-slate-900 dark:text-slate-100"
                                    value={isbn}
                                    onChange={(e) => setIsbn(e.target.value)}
                                />
                                <button
                                    type="button"
                                    onClick={handleISBNSearch}
                                    disabled={searchingISBN}
                                    className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-400 text-white font-bold rounded-xl transition-all flex items-center gap-2"
                                >
                                    {searchingISBN ? (
                                        <Loader2 size={20} className="animate-spin" />
                                    ) : (
                                        <Search size={20} />
                                    )}
                                    Ara
                                </button>
                            </div>
                        </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Title */}
                        <div className="md:col-span-2 space-y-2">
                            <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                Kitap Adı *
                            </label>
                            <input
                                type="text"
                                required
                                placeholder="Örn: Suç ve Ceza"
                                className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all text-slate-900 dark:text-slate-100"
                                value={formData.title}
                                onChange={(e) =>
                                    setFormData({ ...formData, title: e.target.value })
                                }
                            />
                        </div>

                        {/* Author */}
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                Yazar
                            </label>
                            <input
                                type="text"
                                placeholder="Örn: Fyodor Dostoyevski"
                                className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all text-slate-900 dark:text-slate-100"
                                value={formData.author || ''}
                                onChange={(e) =>
                                    setFormData({ ...formData, author: e.target.value })
                                }
                            />
                        </div>

                        {/* Total Pages */}
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                Toplam Sayfa *
                            </label>
                            <input
                                type="number"
                                required
                                min="1"
                                placeholder="300"
                                className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all text-slate-900 dark:text-slate-100"
                                value={formData.total_pages || ''}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        total_pages: parseInt(e.target.value) || 0,
                                    })
                                }
                            />
                        </div>

                        {/* Status */}
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                Durum
                            </label>
                            <select
                                className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-medium text-slate-900 dark:text-slate-100"
                                value={formData.status}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        status: e.target.value as 'to_read' | 'reading' | 'completed',
                                    })
                                }
                            >
                                <option value="to_read">Okunacak</option>
                                <option value="reading">Okunuyor</option>
                                <option value="completed">Okundu</option>
                            </select>
                        </div>

                        {/* Current Page (if reading) */}
                        {formData.status === 'reading' && (
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                    Şu Anki Sayfa
                                </label>
                                <input
                                    type="number"
                                    min="0"
                                    placeholder="150"
                                    className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all text-slate-900 dark:text-slate-100"
                                    value={formData.current_page || 0}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            current_page: parseInt(e.target.value) || 0,
                                        })
                                    }
                                />
                            </div>
                        )}

                        {/* Start Date (if reading or completed) */}
                        {(formData.status === 'reading' || formData.status === 'completed') && (
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                    Başlangıç Tarihi
                                </label>
                                <input
                                    type="date"
                                    className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all text-slate-900 dark:text-slate-100"
                                    value={formData.started_at?.split('T')[0] || ''}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            started_at: e.target.value ? new Date(e.target.value).toISOString() : null,
                                        })
                                    }
                                />
                            </div>
                        )}

                        {/* End Date (if completed) */}
                        {formData.status === 'completed' && (
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                    Bitiş Tarihi
                                </label>
                                <input
                                    type="date"
                                    className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all text-slate-900 dark:text-slate-100"
                                    value={formData.completed_at?.split('T')[0] || ''}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            completed_at: e.target.value ? new Date(e.target.value).toISOString() : null,
                                        })
                                    }
                                />
                            </div>
                        )}

                        {/* Rating & Review (if completed) */}
                        {formData.status === 'completed' && (
                            <div className="md:col-span-2 space-y-4 bg-amber-50/50 dark:bg-amber-900/10 p-6 rounded-2xl border border-amber-100 dark:border-amber-900/20">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wider flex items-center gap-2">
                                        <Star size={14} className="fill-amber-500 text-amber-500" /> Kitabı Puanla
                                    </label>
                                    <StarRating
                                        rating={formData.rating || 0}
                                        onChange={(rating) => setFormData({ ...formData, rating })}
                                        size={32}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wider">
                                        Final İncelemesi
                                    </label>
                                    <textarea
                                        className="w-full px-4 py-3 rounded-xl bg-white dark:bg-slate-900 border border-amber-200 dark:border-amber-900/30 focus:outline-none focus:ring-4 focus:ring-amber-500/10 focus:border-amber-500 transition-all text-slate-900 dark:text-slate-100 min-h-[120px]"
                                        placeholder="Kitap hakkında genel düşüncelerini buraya yazabilirsin..."
                                        value={(formData as any).review || ''}
                                        onChange={(e) => setFormData({ ...formData, review: e.target.value } as any)}
                                    />
                                </div>
                            </div>
                        )}

                        {/* Cover URL */}
                        <div className="md:col-span-2 space-y-2">
                            <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                Kapak Resmi URL
                            </label>
                            <input
                                type="url"
                                placeholder="https://..."
                                className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all text-slate-900 dark:text-slate-100"
                                value={formData.cover_url || ''}
                                onChange={(e) =>
                                    setFormData({ ...formData, cover_url: e.target.value })
                                }
                            />
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                                ISBN aramasıyla otomatik gelmezse buraya resim URL'i girebilirsiniz
                            </p>
                        </div>

                        {/* Categories */}
                        <div className="md:col-span-2 space-y-2">
                            <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                Kategoriler (virgülle ayırın)
                            </label>
                            <input
                                type="text"
                                placeholder="Kurgu, Bilim Kurgu, Roman"
                                className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all text-slate-900 dark:text-slate-100"
                                value={formData.categories?.join(', ') || ''}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        categories: e.target.value.split(',').map(c => c.trim()).filter(c => c)
                                    })
                                }
                            />
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                                Örn: Roman, Klasik, Türk Edebiyatı
                            </p>
                        </div>

                        {/* Description */}
                        <div className="md:col-span-2 space-y-2">
                            <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                Kitap Tanıtımı
                            </label>
                            <textarea
                                rows={4}
                                placeholder="Kitap hakkında kısa bir açıklama..."
                                className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all resize-none text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500"
                                value={formData.description || ''}
                                onChange={(e) =>
                                    setFormData({ ...formData, description: e.target.value })
                                }
                            />
                        </div>

                        {/* Notes */}
                        <div className="md:col-span-2 space-y-2">
                            <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                Notlarınız
                            </label>
                            <textarea
                                rows={3}
                                placeholder="Kişisel notlarınız..."
                                className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all resize-none text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500"
                                value={formData.notes || ''}
                                onChange={(e) =>
                                    setFormData({ ...formData, notes: e.target.value })
                                }
                            />
                        </div>
                    </div>

                    {/* Submit Buttons */}
                    <div className="flex gap-3 pt-4">
                        <button
                            type="button"
                            onClick={onCancel}
                            className="flex-1 px-6 py-3 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 font-bold rounded-xl transition-all"
                        >
                            İptal
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-400 text-white font-bold rounded-xl transition-all"
                        >
                            {loading ? 'Kaydediliyor...' : initialData ? 'Güncelle' : 'Ekle'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
