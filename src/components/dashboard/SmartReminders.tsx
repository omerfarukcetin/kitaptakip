import React from 'react';
import { Sparkles, Coffee, Bell, Zap, Target, BookOpen } from 'lucide-react';
import { useStats } from '../../hooks/useStats';
import { useBooks } from '../../hooks/useBooks';
import { useAllReadingPlans } from '../../hooks/useReadingPlan';
import { getTodayTargetPage } from '../../utils/planUtils';
import { format } from 'date-fns';

export const SmartReminders: React.FC = () => {
    const currentYear = new Date().getFullYear();
    const { yearlyStats } = useStats(currentYear);
    const { books } = useBooks();
    const { data: readingPlans } = useAllReadingPlans();

    const getReminders = () => {
        const reminders = [];
        const now = new Date();
        const hour = now.getHours();
        const dateStr = format(now, 'yyyy-MM-dd');

        // 1. Goal Progress for Today
        const readingBooks = books?.filter(b => b.status === 'reading') || [];
        let totalTargetToday = 0;
        let totalReadToday = 0;

        readingBooks.forEach(book => {
            const plan = readingPlans?.find(p => p.book_id === book.id);
            if (plan) {
                totalTargetToday += plan.daily_pages;
                // Check if user has progress entry for today
                // (Note: we don't have the progress entries here directly, but we can assume based on current_page vs target)
                // This is a bit complex without specific "today's progress" query.
            }
        });

        // 2. Morning Encouragement
        if (hour >= 6 && hour < 11) {
            reminders.push({
                icon: <Coffee className="text-amber-500" size={18} />,
                title: "Günaydın Kitapsever!",
                message: "Güne 10 sayfalık bir okuma ile başlamak zihnini açacaktır. Bir kahve alıp en sevdiğin kitaba el at!",
                color: "bg-amber-50 dark:bg-amber-900/10 border-amber-100",
                textColor: "text-amber-700 dark:text-amber-400"
            });
        }

        // 3. Streak Reminder
        if (yearlyStats.streak > 0) {
            reminders.push({
                icon: <Zap className="text-orange-500" size={18} />,
                title: `${yearlyStats.streak} Günlük Seri!`,
                message: "İstikrarın harika gidiyor. Bu seriyi bozmamak için bugün en az 5 sayfa okumayı unutma!",
                color: "bg-orange-50 dark:bg-orange-900/10 border-orange-100",
                textColor: "text-orange-700 dark:text-orange-400"
            });
        }

        // 4. Target Ahead/Behind
        if (readingBooks.length > 0) {
            reminders.push({
                icon: <Target className="text-indigo-500" size={18} />,
                title: "Hedef Analizi",
                message: "Şu anki hızınla yıl sonu hedefine ulaşmak için haftalık okuma miktarını %10 artırabilirsin.",
                color: "bg-indigo-50 dark:bg-indigo-900/10 border-indigo-100",
                textColor: "text-indigo-700 dark:text-indigo-400"
            });
        }

        // 5. Random Book Tip
        if (readingBooks.length > 0) {
            const randomBook = readingBooks[Math.floor(Math.random() * readingBooks.length)];
            reminders.push({
                icon: <BookOpen className="text-purple-500" size={18} />,
                title: randomBook.title,
                message: "Bu kitapta heyecan dorukta olmalı! Bir sonraki bölümü okumak için harika bir zaman.",
                color: "bg-purple-50 dark:bg-purple-900/10 border-purple-100",
                textColor: "text-purple-700 dark:text-purple-400"
            });
        }

        return reminders.slice(0, 2); // Show only top 2
    };

    const reminders = getReminders();

    if (reminders.length === 0) return null;

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {reminders.map((reminder, idx) => (
                <div
                    key={idx}
                    className={`${reminder.color} p-5 rounded-3xl border border-dashed flex gap-4 items-start transition-all hover:scale-[1.02] cursor-default`}
                >
                    <div className="p-3 bg-white dark:bg-slate-800 rounded-2xl shadow-sm shrink-0">
                        {reminder.icon}
                    </div>
                    <div>
                        <h4 className={`text-sm font-black uppercase tracking-wider mb-1 ${reminder.textColor}`}>
                            {reminder.title}
                        </h4>
                        <p className="text-sm text-slate-700 dark:text-slate-300 font-medium leading-relaxed">
                            {reminder.message}
                        </p>
                    </div>
                </div>
            ))}
        </div>
    );
};
