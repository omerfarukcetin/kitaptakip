import React, { useState } from 'react';
import { Check, Eye, EyeOff } from 'lucide-react';
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
    const [hideCompleted, setHideCompleted] = useState(false);

    const isDateCompleted = (dateStr: string) => {
        return progressEntries?.some(entry => entry.date === dateStr);
    };

    const handleToggle = async (day: ReadingDay) => {
        await toggleProgress.mutateAsync({
            date: day.date,
            pagesRead: day.dailyPages,
            endPage: day.endPage, // AUTO UPDATE: Pass endPage to update current_page
        });
    };

    const filteredDays = hideCompleted ? days.filter(day => !isDateCompleted(day.date)) : days;

    return (
        <div className="space-y-4">
            <div className="flex justify-end">
                <button
                    onClick={() => setHideCompleted(!hideCompleted)}
                    className="flex items-center gap-2 px-4 py-2 text-xs font-black uppercase tracking-wider bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-all border border-slate-200 dark:border-slate-700"
                >
                    {hideCompleted ? (
                        <>
                            <Eye size={14} />
                            <span>Tamamlananları Göster</span>
                        </>
                    ) : (
                        <>
                            <EyeOff size={14} />
                            <span>Tamamlananları Gizle</span>
                        </>
                    )}
                </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                {filteredDays.map((day) => {
                    const completed = isDateCompleted(day.date);

                    return (
                        <button
                            key={day.dayNumber}
                            onClick={() => handleToggle(day)}
                            className={`relative p-3 sm:p-4 rounded-xl border-2 transition-all text-left ${completed
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
                                {day.displayDate
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
        </div>
    );
};


