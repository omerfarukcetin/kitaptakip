import React from 'react';
import { TrendingUp, Calendar, Zap, Clock, Brain, AlertCircle } from 'lucide-react';
import { useSmartAnalysis } from '../../hooks/useSmartAnalysis';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';

interface SmartAnalysisCardProps {
    bookId: string;
    totalPages: number;
    currentPage: number;
    fallbackPPM?: number;
}

export const SmartAnalysisCard: React.FC<SmartAnalysisCardProps> = ({
    bookId,
    totalPages,
    currentPage,
    fallbackPPM,
}) => {
    const { analysis, isLoading } = useSmartAnalysis(bookId, totalPages, currentPage, fallbackPPM);

    if (isLoading) return null;

    const isUsingFallback = analysis.totalSessions === 0 && (fallbackPPM || 0) > 0;

    return (
        <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-lg p-6 border border-indigo-100 dark:border-indigo-900/20 overflow-hidden relative">
            <div className="absolute top-0 right-0 p-4 opacity-5">
                <Brain size={120} />
            </div>

            <div className="flex items-center justify-between mb-6 relative">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-indigo-600 rounded-xl text-white">
                        <Brain size={20} />
                    </div>
                    <h2 className="text-xl font-black text-slate-900 dark:text-slate-100 uppercase tracking-tighter">Akıllı Analiz</h2>
                </div>
                {isUsingFallback && (
                    <div className="bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider flex items-center gap-1 border border-amber-200 dark:border-amber-800">
                        <Zap size={10} /> Genel Ortalama
                    </div>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Prediction Card */}
                <div className="space-y-4">
                    <div className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-100 dark:border-slate-700">
                        <div className="flex items-center gap-2 mb-2 text-slate-500 dark:text-slate-400">
                            <Calendar size={16} />
                            <span className="text-xs font-black uppercase tracking-widest">Hızına Göre Tahmin</span>
                        </div>
                        <div className="space-y-2">
                            {analysis.predictedFinishDate ? (
                                <>
                                    <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
                                        {isUsingFallback ? 'Genel okuma hızınızla' : 'Mevcut hızınızla'} kitabı <span className="text-indigo-600 dark:text-indigo-400 font-black">
                                            {format(analysis.predictedFinishDate, 'd MMMM yyyy', { locale: tr })}
                                        </span> tarihinde bitireceksiniz.
                                    </p>
                                    {analysis.remainingReadingTimeSeconds && (
                                        <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
                                            Kitabı bitirmek için toplam <span className="text-indigo-600 dark:text-indigo-400 font-black">
                                                {(() => {
                                                    const totalMinutes = Math.floor(analysis.remainingReadingTimeSeconds / 60);
                                                    const hours = Math.floor(totalMinutes / 60);
                                                    const minutes = totalMinutes % 60;
                                                    return `${hours > 0 ? hours + ' saat ' : ''}${minutes} dakika`;
                                                })()}
                                            </span> daha okuma yapmanız gerekiyor.
                                        </p>
                                    )}
                                </>
                            ) : (
                                <p className="text-sm font-bold text-slate-500 italic">Okuma verisi toplandığında tahminler burada görünecek.</p>
                            )}
                        </div>
                        {analysis.daysAheadOrBehind !== null && (
                            <p className={`text-[10px] font-black uppercase tracking-wider mt-3 ${analysis.daysAheadOrBehind >= 0 ? 'text-green-600' : 'text-orange-600'}`}>
                                {analysis.daysAheadOrBehind >= 0
                                    ? `Plana göre ${analysis.daysAheadOrBehind} gün erken`
                                    : `Plana göre ${Math.abs(analysis.daysAheadOrBehind)} gün gecikmeli`}
                            </p>
                        )}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 bg-indigo-50/50 dark:bg-indigo-900/10 rounded-2xl">
                            <div className="flex items-center gap-2 mb-1 text-indigo-600/60">
                                <Zap size={14} />
                                <span className="text-[10px] font-black uppercase tracking-tighter">Hız (PPM)</span>
                            </div>
                            <p className="text-lg font-black text-indigo-600">{analysis.actualPPM.toFixed(2)}</p>
                        </div>
                        <div className="p-4 bg-amber-50/50 dark:bg-amber-900/10 rounded-2xl">
                            <div className="flex items-center gap-2 mb-1 text-amber-600/60">
                                <Clock size={14} />
                                <span className="text-[10px] font-black uppercase tracking-tighter">Seans Ort.</span>
                            </div>
                            <p className="text-lg font-black text-amber-600">{Math.round(analysis.avgDurationPerSession)} dk</p>
                        </div>
                    </div>
                </div>

                {/* Performance Metrics */}
                <div className="space-y-4">
                    <div>
                        <div className="flex justify-between items-end mb-2">
                            <label className="text-xs font-black text-slate-500 uppercase tracking-widest">Süreklilik</label>
                            <span className="text-sm font-black text-slate-900 dark:text-slate-100">%{Math.round(analysis.consistencyScore)}</span>
                        </div>
                        <div className="w-full bg-slate-100 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                            <div
                                className="bg-indigo-600 h-full rounded-full transition-all duration-1000"
                                style={{ width: `${analysis.consistencyScore}%` }}
                            />
                        </div>
                    </div>

                    <div>
                        <div className="flex justify-between items-end mb-2">
                            <label className="text-xs font-black text-slate-500 uppercase tracking-widest">Okuma Verimliliği</label>
                            <span className="text-sm font-black text-slate-900 dark:text-slate-100">%{Math.round(analysis.efficiencyScore)}</span>
                        </div>
                        <div className="w-full bg-slate-100 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                            <div
                                className="bg-green-500 h-full rounded-full transition-all duration-1000"
                                style={{ width: `${Math.min(analysis.efficiencyScore, 100)}%` }}
                            />
                        </div>
                    </div>

                    <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/30 border border-slate-100 dark:border-slate-800 flex items-start gap-3">
                        <AlertCircle className="text-indigo-600 shrink-0" size={18} />
                        <p className="text-xs text-slate-600 dark:text-slate-400 font-medium leading-relaxed">
                            {analysis.efficiencyScore > 100
                                ? "Ortalamanın üzerinde bir odaklanma ile okuyorsun. Bu performansı korumak için seans aralarında mola vermeyi unutma."
                                : isUsingFallback
                                    ? "Bu kitap için henüz yeterli veri yok, genel okuma hızınız üzerinden hesaplama yaptık."
                                    : "Bu kitapta biraz daha yavaş ilerliyorsun. Belki de sindirerek okuman gereken bir eserdir, hızlanmak için kendini zorlama."}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};
