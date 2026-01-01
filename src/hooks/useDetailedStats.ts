import { useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import type { Book, ReadingProgress } from '../lib/database.types';

export const useDetailedStats = (year: number) => {
    // 1. Fetch all completed books for the year
    const { data: completedBooks, isLoading: booksLoading } = useQuery({
        queryKey: ['detailed-stats-books', year],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('books')
                .select('*')
                .eq('status', 'completed');

            if (error) throw error;

            return (data as Book[]).filter(book => {
                if (!book.completed_at) return false;
                return new Date(book.completed_at).getFullYear() === year;
            });
        },
    });

    // 2. Fetch all reading progress for the year
    const { data: progress, isLoading: progressLoading } = useQuery({
        queryKey: ['detailed-stats-progress', year],
        queryFn: async () => {
            const startYear = `${year}-01-01`;
            const endYear = `${year}-12-31`;

            const { data, error } = await supabase
                .from('reading_progress')
                .select('*')
                .gte('date', startYear)
                .lte('date', endYear);

            if (error) throw error;
            return data as ReadingProgress[];
        },
    });

    // Aggregations
    const categoryData = (() => {
        if (!completedBooks) return [];
        const counts: Record<string, number> = {};
        completedBooks.forEach(book => {
            const cats = book.categories || ['Kategorisiz'];
            cats.forEach(cat => {
                counts[cat] = (counts[cat] || 0) + 1;
            });
        });
        return Object.entries(counts)
            .map(([name, value]) => ({ name, value }))
            .sort((a, b) => b.value - a.value);
    })();

    const monthlyData = (() => {
        const months = [
            'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
            'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'
        ];

        const data = months.map(m => ({ month: m, pages: 0, books: 0 }));

        if (progress) {
            progress.forEach(p => {
                const monthIdx = new Date(p.date).getMonth();
                data[monthIdx].pages += p.pages_read;
            });
        }

        if (completedBooks) {
            completedBooks.forEach(b => {
                const monthIdx = new Date(b.completed_at!).getMonth();
                data[monthIdx].books += 1;
            });
        }

        return data;
    })();

    const speedMetrics = (() => {
        if (!completedBooks || completedBooks.length === 0) return null;

        let totalDays = 0;
        let booksWithDates = 0;
        let fastestBook = { title: '', days: Infinity };
        let slowestBook = { title: '', days: -Infinity };

        completedBooks.forEach(book => {
            if (book.started_at && book.completed_at) {
                const start = new Date(book.started_at);
                const end = new Date(book.completed_at);
                const diffTime = Math.abs(end.getTime() - start.getTime());
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) || 1; // At least 1 day

                totalDays += diffDays;
                booksWithDates++;

                if (diffDays < fastestBook.days) {
                    fastestBook = { title: book.title, days: diffDays };
                }
                if (diffDays > slowestBook.days) {
                    slowestBook = { title: book.title, days: diffDays };
                }
            }
        });

        const totalPagesInYear = progress?.reduce((sum, p) => sum + p.pages_read, 0) || 0;
        const totalDurationSeconds = progress?.reduce((sum, p) => sum + (p.duration_seconds || 0), 0) || 0;
        const uniqueDaysWithProgress = new Set(progress?.map(p => p.date)).size || 1;

        // Calculate PPM (Pages Per Minute)
        const totalMinutes = totalDurationSeconds / 60;
        const avgSpeedPPM = totalMinutes > 0 ? (totalPagesInYear / totalMinutes).toFixed(2) : '0';

        return {
            avgDaysToFinish: booksWithDates > 0 ? Math.round(totalDays / booksWithDates) : 0,
            avgPagesPerDay: Math.round(totalPagesInYear / uniqueDaysWithProgress),
            avgSpeedPPM,
            fastestBook: fastestBook.days === Infinity ? null : fastestBook,
            slowestBook: slowestBook.days === -Infinity ? null : slowestBook,
            totalBooks: completedBooks.length,
            totalPages: totalPagesInYear
        };
    })();

    return {
        categoryData,
        monthlyData,
        speedMetrics,
        progressData: progress || [],
        isLoading: booksLoading || progressLoading
    };
};
