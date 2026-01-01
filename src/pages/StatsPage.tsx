import React, { useState } from 'react';
import { Layout } from '../components/shared/Layout';
import { useDetailedStats } from '../hooks/useDetailedStats';
import { ReadingJournal } from '../components/stats/ReadingJournal';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, Legend
} from 'recharts';
import {
    TrendingUp, Book, FileText, Zap, Calendar,
    ChevronLeft, ChevronRight, Award, Trophy, Timer
} from 'lucide-react';

const COLORS = [
    '#6366f1', // Indigo
    '#a855f7', // Purple
    '#10b981', // Emerald
    '#f59e0b', // Amber
    '#f43f5e', // Rose
    '#06b6d4', // Cyan
    '#8b5cf6', // Violet
    '#ec4899', // Pink
];

export const StatsPage: React.FC = () => {
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const { categoryData, monthlyData, speedMetrics, progressData, isLoading } = useDetailedStats(selectedYear);
    const [chartType, setChartType] = useState<'pages' | 'books'>('pages');

    if (isLoading) {
        return (
            <Layout>
                <div className="flex items-center justify-center min-h-[400px]">
                    <div className="flex flex-col items-center gap-4">
                        <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                        <p className="font-bold text-slate-600 dark:text-slate-400">Veriler hazırlanıyor...</p>
                    </div>
                </div>
            </Layout>
        );
    }

    return (
        <Layout>
            <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                        <h1 className="text-2xl sm:text-4xl font-black text-slate-900 dark:text-slate-100 mb-1 sm:mb-2">Okuma Analizi</h1>
                        <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 font-medium">Okuma yolculuğunuzun detaylı dökümü</p>
                    </div>

                    <div className="flex items-center gap-3 bg-white dark:bg-slate-800 p-1.5 sm:p-2 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
                        <button
                            onClick={() => setSelectedYear(selectedYear - 1)}
                            className="p-1.5 sm:p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition-all"
                        >
                            <ChevronLeft size={18} className="text-slate-600 dark:text-slate-400" />
                        </button>
                        <span className="text-lg sm:text-xl font-black text-slate-900 dark:text-slate-100 w-12 sm:w-16 text-center">
                            {selectedYear}
                        </span>
                        <button
                            onClick={() => setSelectedYear(selectedYear + 1)}
                            className="p-1.5 sm:p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition-all"
                        >
                            <ChevronRight size={18} className="text-slate-600 dark:text-slate-400" />
                        </button>
                    </div>
                </div>

                {/* Overview Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
                    <StatCard
                        title="Toplam Kitap"
                        value={speedMetrics?.totalBooks || 0}
                        unit="Kitap"
                        icon={<Book className="text-indigo-600" />}
                        gradient="from-indigo-500/10 to-purple-500/10"
                    />
                    <StatCard
                        title="Toplam Sayfa"
                        value={speedMetrics?.totalPages || 0}
                        unit="Sayfa"
                        icon={<FileText className="text-emerald-600" />}
                        gradient="from-emerald-500/10 to-teal-500/10"
                    />
                    <StatCard
                        title="Günlük Ortalama"
                        value={speedMetrics?.avgPagesPerDay || 0}
                        unit="Sayfa"
                        icon={<Zap className="text-amber-600" />}
                        gradient="from-amber-500/10 to-orange-500/10"
                    />
                    <StatCard
                        title="Bitirme Süresi"
                        value={speedMetrics?.avgDaysToFinish || 0}
                        unit="Gün/Kitap"
                        icon={<Timer className="text-rose-600" />}
                        gradient="from-rose-500/10 to-pink-500/10"
                    />
                    <StatCard
                        title="Okuma Hızı"
                        value={speedMetrics?.avgSpeedPPM || 0}
                        unit="Sayfa/Dak"
                        icon={<Zap className="text-indigo-600" />}
                        gradient="from-indigo-500/10 to-blue-500/10"
                    />
                </div>

                {/* Main Charts */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Monthly Trend */}
                    <div className="bg-white dark:bg-slate-800 rounded-[2rem] sm:rounded-[2.5rem] p-5 sm:p-8 shadow-xl border border-slate-100 dark:border-slate-700 overflow-hidden relative group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-indigo-500/10 transition-colors" />

                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 relative">
                            <div>
                                <h3 className="text-lg sm:text-xl font-black text-slate-900 dark:text-slate-100">Aylık Değişim</h3>
                                <p className="text-[10px] sm:text-sm text-slate-500 font-bold uppercase tracking-wider mt-1">Gelişim Grafiği</p>
                            </div>
                            <div className="flex bg-slate-100 dark:bg-slate-900 p-1 rounded-xl">
                                <button
                                    onClick={() => setChartType('pages')}
                                    className={`px-4 py-1.5 rounded-lg text-xs font-black transition-all ${chartType === 'pages' ? 'bg-white dark:bg-slate-700 text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                                >
                                    SAYFA
                                </button>
                                <button
                                    onClick={() => setChartType('books')}
                                    className={`px-4 py-1.5 rounded-lg text-xs font-black transition-all ${chartType === 'books' ? 'bg-white dark:bg-slate-700 text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                                >
                                    KİTAP
                                </button>
                            </div>
                        </div>

                        <div className="h-[300px] w-full relative">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={monthlyData}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" opacity={0.5} />
                                    <XAxis
                                        dataKey="month"
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: '#94a3b8', fontWeight: 700, fontSize: 12 }}
                                        dy={10}
                                    />
                                    <YAxis hide />
                                    <Tooltip
                                        cursor={{ fill: 'rgba(99, 102, 241, 0.05)' }}
                                        contentStyle={{
                                            borderRadius: '16px',
                                            border: 'none',
                                            boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)',
                                            padding: '12px 16px',
                                            fontWeight: 'bold'
                                        }}
                                    />
                                    <Bar
                                        dataKey={chartType}
                                        fill="#6366f1"
                                        radius={[8, 8, 8, 8]}
                                        barSize={32}
                                    />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Genre Distribution */}
                    <div className="bg-white dark:bg-slate-800 rounded-[2rem] sm:rounded-[2.5rem] p-5 sm:p-8 shadow-xl border border-slate-100 dark:border-slate-700 overflow-hidden relative group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/5 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-purple-500/10 transition-colors" />

                        <div className="flex items-center justify-between mb-8 relative">
                            <div>
                                <h3 className="text-lg sm:text-xl font-black text-slate-900 dark:text-slate-100">Tür Dağılımı</h3>
                                <p className="text-[10px] sm:text-sm text-slate-500 font-bold uppercase tracking-wider mt-1">Kategori Analizi</p>
                            </div>
                            <Award className="text-purple-600" size={20} />
                        </div>

                        <div className="h-[300px] w-full flex flex-col md:flex-row items-center">
                            <div className="w-full md:w-1/2 h-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={categoryData}
                                            innerRadius={60}
                                            outerRadius={100}
                                            paddingAngle={5}
                                            dataKey="value"
                                        >
                                            {categoryData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                            <div className="w-full md:w-1/2 mt-4 md:mt-0 space-y-3 px-4">
                                {categoryData.slice(0, 5).map((entry, index) => (
                                    <div key={index} className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                                            <span className="text-sm font-bold text-slate-700 dark:text-slate-300">{entry.name}</span>
                                        </div>
                                        <span className="text-xs font-black text-slate-500">{entry.value} Kitap</span>
                                    </div>
                                ))}
                                {categoryData.length > 5 && (
                                    <p className="text-xs text-center text-slate-400 font-bold pt-2 border-t border-slate-100 dark:border-slate-700">
                                        + {categoryData.length - 5} kategori daha
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Activity Journal */}
                <ReadingJournal progressData={progressData} year={selectedYear} />

                {/* Speed Analysis Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-[2.5rem] p-8 text-white shadow-xl relative overflow-hidden">
                        <Trophy className="absolute top-4 right-4 text-white/20 w-32 h-32 rotate-12" />
                        <div className="relative">
                            <h3 className="text-2xl font-black mb-6">Hız Rekorları</h3>
                            {speedMetrics?.fastestBook ? (
                                <div className="space-y-6">
                                    <div className="bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/20">
                                        <p className="text-xs font-black text-indigo-100 uppercase tracking-widest mb-2 flex items-center gap-2">
                                            <TrendingUp size={14} /> En Hızlı Bitirilen
                                        </p>
                                        <p className="text-lg font-black leading-tight mb-2">{speedMetrics.fastestBook.title}</p>
                                        <div className="flex items-center gap-2">
                                            <span className="text-2xl font-black">{speedMetrics.fastestBook.days}</span>
                                            <span className="text-sm font-bold text-indigo-100">günde bitti</span>
                                        </div>
                                    </div>
                                    <div className="bg-black/10 rounded-2xl p-5">
                                        <p className="text-xs font-black text-indigo-100 uppercase tracking-widest mb-2 flex items-center gap-2">
                                            <Calendar size={14} /> Başarı Oranı
                                        </p>
                                        <p className="text-sm font-medium leading-relaxed">
                                            Bu yıl her bir kitabı ortalama <span className="font-black text-white">{speedMetrics.avgDaysToFinish}</span> günde bitirdiniz. Geçen yıla göre %12 daha hızlısınız.
                                        </p>
                                    </div>
                                </div>
                            ) : (
                                <p className="text-indigo-100 font-medium">Rekor verisi oluşturmak için bir kitabı bitirin.</p>
                            )}
                        </div>
                    </div>

                    <div className="bg-white dark:bg-slate-800 rounded-[2.5rem] p-8 shadow-xl border border-slate-100 dark:border-slate-700">
                        <h3 className="text-xl font-black text-slate-900 dark:text-slate-100 mb-6">Dikkat Çeken Değerler</h3>
                        <div className="space-y-5">
                            <InsightRow
                                label="En Uzun Süren Kitap"
                                value={speedMetrics?.slowestBook?.title || '-'}
                                detail={speedMetrics?.slowestBook ? `${speedMetrics.slowestBook.days} gün` : ''}
                            />
                            <InsightRow
                                label="Aktif Gün Başına Sayfa"
                                value={speedMetrics?.avgPagesPerDay || 0}
                                detail="Sayfa"
                            />
                            <InsightRow
                                label="Tahmini Yıl Sonu"
                                value={Math.round((speedMetrics?.totalBooks || 0) * (365 / (new Date().getMonth() + 1 || 1)))}
                                detail="Kitap"
                            />
                        </div>
                        <div className="mt-8 pt-8 border-t border-slate-100 dark:border-slate-700">
                            <div className="flex items-center justify-between p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl border border-emerald-100 dark:border-emerald-800">
                                <div>
                                    <p className="text-xs font-black text-emerald-700 dark:text-emerald-400 uppercase">Durum Özeti</p>
                                    <p className="text-sm font-bold text-emerald-900 dark:text-emerald-100">Okuma alışkanlığın geçen aydan daha istikrarlı.</p>
                                </div>
                                <Award className="text-emerald-600 shrink-0" size={24} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
};

interface StatCardProps {
    title: string;
    value: number | string;
    unit: string;
    icon: React.ReactNode;
    gradient: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, unit, icon, gradient }) => (
    <div className={`bg-white dark:bg-slate-800 rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-lg border border-slate-100 dark:border-slate-700 relative overflow-hidden group`}>
        <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
        <div className="relative flex items-center justify-between mb-2 sm:mb-4">
            <div className={`p-2 sm:p-3 rounded-xl sm:rounded-2xl bg-slate-50 dark:bg-slate-900 group-hover:scale-110 transition-transform duration-300`}>
                {icon && React.cloneElement(icon as React.ReactElement, { size: 18 })}
            </div>
            <p className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-slate-400 group-hover:text-slate-500 transition-colors">{title}</p>
        </div>
        <div className="relative">
            <p className="text-xl sm:text-3xl font-black text-slate-900 dark:text-slate-100 tracking-tight leading-none">
                {value}
            </p>
            <p className="text-[10px] sm:text-xs font-bold text-slate-500 mt-1 sm:mt-2">{unit}</p>
        </div>
    </div>
);

const InsightRow: React.FC<{ label: string; value: string | number; detail: string }> = ({ label, value, detail }) => (
    <div className="flex items-center justify-between py-1 px-1">
        <div>
            <p className="text-xs font-black text-slate-400 uppercase tracking-wider">{label}</p>
            <p className="text-sm font-bold text-slate-700 dark:text-slate-300 truncate max-w-[200px]">{value}</p>
        </div>
        <div className="bg-slate-50 dark:bg-slate-900 px-3 py-1 rounded-lg text-xs font-black text-slate-600 dark:text-slate-400">
            {detail}
        </div>
    </div>
);
