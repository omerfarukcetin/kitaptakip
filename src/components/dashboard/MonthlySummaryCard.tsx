import React from 'react';
import { Trophy, BookOpen, MessageSquare, Flame, X } from 'lucide-react';
import { useMonthlySummary } from '../../hooks/useStats';

interface MonthlySummaryCardProps {
    year: number;
    month: number; // 0-indexed
    onClose: () => void;
}

export const MonthlySummaryCard: React.FC<MonthlySummaryCardProps> = ({ year, month, onClose }) => {
    const { stats, isLoading } = useMonthlySummary(year, month);

    if (stats.booksCount === 0 && stats.pagesCount === 0) return null;

    const monthNames = [
        'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
        'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'
    ];

    return (
        <div className="relative overflow-hidden bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 rounded-3xl p-8 text-white shadow-2xl border border-white/10 mb-8 animate-in fade-in slide-in-from-top-4 duration-700">
            {/* Background Decoration */}
            <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-64 h-64 bg-pink-500/20 rounded-full blur-3xl" />

            <button
                onClick={onClose}
                className="absolute top-4 right-4 p-2 hover:bg-white/10 rounded-full transition-colors"
            >
                <X size={20} />
            </button>

            <div className="relative flex flex-col md:flex-row items-center gap-8">
                <div className="flex-shrink-0">
                    <div className="w-20 h-20 bg-white/20 backdrop-blur-xl rounded-2xl flex items-center justify-center border border-white/30 shadow-inner">
                        <Trophy size={40} className="text-yellow-300 drop-shadow-lg" />
                    </div>
                </div>

                <div className="flex-grow text-center md:text-left">
                    <h3 className="text-sm font-bold uppercase tracking-widest text-indigo-100 mb-1 opacity-80">
                        {monthNames[month]} {year} Özeti
                    </h3>
                    <h2 className="text-3xl font-black mb-4">
                        Harika bir aydı! 🚀
                    </h2>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10 flex flex-col items-center md:items-start">
                            <BookOpen size={20} className="text-blue-300 mb-2" />
                            <span className="text-2xl font-black">{stats.booksCount}</span>
                            <span className="text-xs font-bold text-indigo-100/70">Kitap Bitirildi</span>
                        </div>
                        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10 flex flex-col items-center md:items-start">
                            <Flame size={20} className="text-orange-300 mb-2" />
                            <span className="text-2xl font-black">{stats.pagesCount}</span>
                            <span className="text-xs font-bold text-indigo-100/70">Sayfa Okundu</span>
                        </div>
                        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10 flex flex-col items-center md:items-start group">
                            <MessageSquare size={20} className="text-green-300 mb-2" />
                            <span className="text-2xl font-black">{stats.notesCount}</span>
                            <span className="text-xs font-bold text-indigo-100/70">Not Alındı</span>
                        </div>
                    </div>
                </div>

                <div className="hidden lg:block">
                    <div className="bg-white/10 backdrop-blur-lg px-6 py-4 rounded-2xl border border-white/20 text-center">
                        <p className="text-xs font-bold opacity-80 text-indigo-100 uppercase tracking-tighter mb-1">Motivasyon</p>
                        <p className="font-bold leading-tight">Bilgi hazineni<br />büyütmeye devam et!</p>
                    </div>
                </div>
            </div>
        </div>
    );
};
