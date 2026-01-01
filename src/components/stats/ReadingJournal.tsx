import React, { useMemo } from 'react';
import { format, startOfYear, endOfYear, eachDayOfInterval, isSameDay } from 'date-fns';
import { tr } from 'date-fns/locale';
import type { ReadingProgress } from '../../lib/database.types';

interface ReadingJournalProps {
    progressData: ReadingProgress[];
    year: number;
}

export const ReadingJournal: React.FC<ReadingJournalProps> = ({ progressData, year }) => {
    const days = useMemo(() => {
        const start = startOfYear(new Date(year, 0, 1));
        const end = endOfYear(new Date(year, 0, 1));
        return eachDayOfInterval({ start, end });
    }, [year]);

    const progressMap = useMemo(() => {
        const map = new Map<string, number>();
        progressData.forEach((p) => {
            const dateStr = p.date; // YYYY-MM-DD
            map.set(dateStr, (map.get(dateStr) || 0) + p.pages_read);
        });
        return map;
    }, [progressData]);

    const getColorClass = (pages: number) => {
        if (pages === 0) return 'bg-slate-100 dark:bg-slate-800';
        if (pages < 10) return 'bg-indigo-200 dark:bg-indigo-900/40 text-indigo-700';
        if (pages < 30) return 'bg-indigo-400 dark:bg-indigo-700 text-white';
        if (pages < 60) return 'bg-indigo-600 dark:bg-indigo-500 text-white';
        return 'bg-indigo-800 dark:bg-indigo-400 text-white';
    };

    // Group days by month for a better layout
    const months = useMemo(() => {
        const result: { name: string; days: Date[] }[] = [];
        for (let i = 0; i < 12; i++) {
            const monthStart = new Date(year, i, 1);
            const monthEnd = new Date(year, i + 1, 0);
            result.push({
                name: format(monthStart, 'MMM', { locale: tr }),
                days: eachDayOfInterval({ start: monthStart, end: monthEnd }),
            });
        }
        return result;
    }, [year]);

    return (
        <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 shadow-lg">
            <h3 className="text-xl font-black text-slate-900 dark:text-slate-100 mb-6 flex items-center gap-2">
                Okuma Günlüğü
                <span className="text-sm font-bold text-slate-500">({year})</span>
            </h3>

            <div className="overflow-x-auto pb-4 custom-scrollbar">
                <div className="flex gap-4 min-w-max">
                    {months.map((month, mIdx) => (
                        <div key={mIdx} className="space-y-2">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                                {month.name}
                            </span>
                            <div className="grid grid-rows-7 grid-flow-col gap-1">
                                {month.days.map((day, dIdx) => {
                                    const dateStr = format(day, 'yyyy-MM-dd');
                                    const pages = progressMap.get(dateStr) || 0;
                                    return (
                                        <div
                                            key={dIdx}
                                            title={`${format(day, 'd MMMM yyyy', { locale: tr })}: ${pages} sayfa`}
                                            className={`w-3 h-3 rounded-[2px] cursor-pointer transition-all hover:ring-2 hover:ring-indigo-500/50 ${getColorClass(pages)}`}
                                        />
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="mt-6 flex items-center justify-between text-[10px] font-bold text-slate-500 uppercase tracking-tight">
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1.5">
                        <div className="w-3 h-3 rounded-[2px] bg-slate-100 dark:bg-slate-800" />
                        <span>Az</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <div className="w-3 h-3 rounded-[2px] bg-indigo-800 dark:bg-indigo-400" />
                        <span>Çok</span>
                    </div>
                </div>
                <p>Toplam: {progressData.reduce((sum, p) => sum + p.pages_read, 0)} Sayfa</p>
            </div>
        </div>
    );
};
