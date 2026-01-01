import React from 'react';
import { Check } from 'lucide-react';
import { useReadingProgress } from '../../hooks/useReadingPlan';
import type { ReadingDay } from '../../lib/types';

interface InteractiveReadingPlanProps {
    bookId: string;
    days: ReadingDay[];
    startDate: string;
}

export const InteractiveReadingPlan: React.FC<InteractiveReadingPlanProps> = ({
    bookId,
    days,
    startDate,
}) => {
    const { progressEntries, toggleProgress } = useReadingProgress(bookId);

    const isDateCompleted = (dateStr: string) => {
        const date = parseDateString(dateStr, startDate);
        return progressEntries?.some(entry => entry.date === date);
    };

    const handleToggle = async (day: ReadingDay) => {
        const date = parseDateString(day.date, startDate);
        await toggleProgress.mutateAsync({
            date,
            pagesRead: day.dailyPages,
            endPage: day.endPage, // AUTO UPDATE: Pass endPage to update current_page
        });
    };

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
            {days.map((day) => {
                const completed = isDateCompleted(day.date);

                return (
                    <button
                        key={day.dayNumber}
                        onClick={() => handleToggle(day)}
                        className={`relative p-4 rounded-xl border-2 transition-all text-left ${completed
                            ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800/50 hover:bg-green-100 dark:hover:bg-green-900/30'
                            : 'bg-white dark:bg-slate-900/50 border-slate-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/20'
                            }`}
                    >
                        {/* Checkbox - Top Right */}
                        <div className="absolute top-3 right-3">
                            <div
                                className={`w-5 h-5 rounded flex items-center justify-center border-2 transition-all ${completed
                                    ? 'bg-green-500 border-green-500'
                                    : 'border-slate-300 dark:border-slate-600'
                                    }`}
                            >
                                {completed && <Check size={14} className="text-white font-bold" />}
                            </div>
                        </div>

                        {/* Day Number */}
                        <div className="mb-2">
                            <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-400 text-xs font-bold">
                                {day.dayNumber}
                            </span>
                        </div>

                        {/* Date */}
                        <p className={`text-sm font-bold mb-2 ${completed ? 'text-green-700 dark:text-green-400 line-through' : 'text-slate-900 dark:text-slate-100'}`}>
                            {day.date
                                .replace(' Pazartesi', ' Pzt')
                                .replace(' Salı', ' Sal')
                                .replace(' Çarşamba', ' Çar')
                                .replace(' Perşembe', ' Per')
                                .replace(' Cuma', ' Cum')
                                .replace(' Cumartesi', ' Cmt')
                                .replace(' Pazar', ' Paz')}
                        </p>

                        {/* Page Info */}
                        <div className="space-y-1">
                            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                                Sayfa {day.startPage}—{day.endPage}
                            </p>
                            <p className="text-xs font-bold text-indigo-600">
                                {day.dailyPages} sayfa
                            </p>
                        </div>
                    </button>
                );
            })}
        </div>
    );
};

// Helper function to parse display date and convert to YYYY-MM-DD
function parseDateString(displayDate: string, startDateStr: string): string {
    const monthMap: { [key: string]: number } = {
        'Ocak': 0, 'Şubat': 1, 'Mart': 2, 'Nisan': 3,
        'Mayıs': 4, 'Haziran': 5, 'Temmuz': 6, 'Ağustos': 7,
        'Eylül': 8, 'Ekim': 9, 'Kasım': 10, 'Aralık': 11
    };

    const parts = displayDate.split(' ');
    const day = parseInt(parts[0]);
    const month = monthMap[parts[1]];

    const startYear = new Date(startDateStr).getFullYear();
    const date = new Date(startYear, month, day);

    return date.toISOString().split('T')[0];
}
