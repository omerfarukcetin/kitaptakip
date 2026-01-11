import React, { useState } from 'react';
import { X, Calendar, BookOpen, Clock, Save, Loader2 } from 'lucide-react';
import { formatISODate } from '../../utils/dateUtils';

interface ManualReadingModalProps {
    isOpen: boolean;
    onClose: () => void;
    bookTitle: string;
    currentPage: number;
    totalPages: number;
    onSave: (data: { date: string; pagesRead: number; durationSeconds: number; endPage: number }) => Promise<void>;
}

export const ManualReadingModal: React.FC<ManualReadingModalProps> = ({
    isOpen,
    onClose,
    bookTitle,
    currentPage,
    totalPages,
    onSave,
}) => {
    const [date, setDate] = useState(formatISODate(new Date()));
    const [pagesRead, setPagesRead] = useState<number | ''>('');
    const [durationMinutes, setDurationMinutes] = useState<number | ''>('');
    const [isSaving, setIsSaving] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!date || pagesRead === '' || pagesRead <= 0 || durationMinutes === '') return;

        const endPage = currentPage + Number(pagesRead);
        if (endPage > totalPages) {
            alert(`Girilen sayfa sayısı kitap toplamını (${totalPages}) aşıyor.`);
            return;
        }

        setIsSaving(true);
        try {
            await onSave({
                date,
                pagesRead: Number(pagesRead),
                durationSeconds: Number(durationMinutes) * 60,
                endPage,
            });
            onClose();
            // Reset form
            setPagesRead('');
            setDurationMinutes('');
        } catch (error) {
            console.error('Kayıt sırasında hata:', error);
            alert('Kayıt sırasında bir hata oluştu.');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
            <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl max-w-md w-full p-8 relative border border-slate-100 dark:border-slate-800 animate-in zoom-in-95 duration-200">
                <button
                    onClick={onClose}
                    className="absolute top-6 right-6 text-slate-400 hover:text-slate-600 transition-colors"
                >
                    <X size={24} />
                </button>

                <div className="flex items-center gap-3 mb-6">
                    <div className="p-2.5 bg-indigo-600 rounded-xl text-white">
                        <BookOpen size={24} />
                    </div>
                    <div>
                        <h2 className="text-2xl font-black text-slate-900 dark:text-slate-100">Manuel Kayıt</h2>
                        <p className="text-sm font-bold text-slate-500 dark:text-slate-400 truncate max-w-[250px]">{bookTitle}</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest flex items-center gap-2">
                            <Calendar size={14} className="text-indigo-500" /> Okuma Tarihi
                        </label>
                        <input
                            type="date"
                            required
                            className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all text-slate-900 dark:text-slate-100 font-bold"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest flex items-center gap-2">
                            <BookOpen size={14} className="text-emerald-500" /> Kaç Sayfa Okudun?
                        </label>
                        <div className="relative">
                            <input
                                type="number"
                                required
                                min="1"
                                placeholder="Örn: 25"
                                className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all text-slate-900 dark:text-slate-100 font-bold pr-16"
                                value={pagesRead}
                                onChange={(e) => setPagesRead(e.target.value ? Number(e.target.value) : '')}
                            />
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-black text-slate-400 uppercase">Sayfa</div>
                        </div>
                        <p className="text-[10px] font-bold text-slate-400 pl-1">
                            Mevcut: {currentPage} / Yeni: {pagesRead !== '' ? currentPage + Number(pagesRead) : currentPage}
                        </p>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest flex items-center gap-2">
                            <Clock size={14} className="text-amber-500" /> Kaç Dakika Sürdü?
                        </label>
                        <div className="relative">
                            <input
                                type="number"
                                required
                                min="1"
                                placeholder="Örn: 45"
                                className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all text-slate-900 dark:text-slate-100 font-bold pr-16"
                                value={durationMinutes}
                                onChange={(e) => setDurationMinutes(e.target.value ? Number(e.target.value) : '')}
                            />
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-black text-slate-400 uppercase">Dakika</div>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={isSaving}
                        className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-black py-4 rounded-2xl shadow-lg hover:shadow-indigo-500/30 transition-all flex items-center justify-center gap-2 mt-4"
                    >
                        {isSaving ? (
                            <Loader2 size={24} className="animate-spin" />
                        ) : (
                            <>
                                <Save size={20} />
                                Kaydet
                            </>
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
};
