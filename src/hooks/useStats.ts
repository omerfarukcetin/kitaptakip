import { useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import type { Book, ReadingProgress, BookNote } from '../lib/database.types';

export const useStats = (year: number, month?: number) => {
    // Fetch all completed books for the year
    const { data: books, isLoading: booksLoading } = useQuery({
        queryKey: ['stats-books', year],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('books')
                .select('*')
                .eq('status', 'completed');

            if (error) throw error;

            // Filter by completed_at year
            return (data as Book[]).filter(book => {
                if (!book.completed_at) return false;
                return new Date(book.completed_at).getFullYear() === year;
            });
        },
    });

    // Fetch progress for pages read
    const { data: progress, isLoading: progressLoading } = useQuery({
        queryKey: ['stats-progress', year, month],
        queryFn: async () => {
            let query = supabase
                .from('reading_progress')
                .select('*');

            // Filter by year/month in the query if possible, or filter in JS
            // For YYYY-MM-DD string, we can use like or gte/lte
            const startYear = `${year}-01-01`;
            const endYear = `${year}-12-31`;

            query = query.gte('date', startYear).lte('date', endYear);

            const { data, error } = await query;
            if (error) throw error;

            let filtered = data as ReadingProgress[];
            if (month !== undefined) {
                const monthStr = String(month + 1).padStart(2, '0');
                filtered = filtered.filter(p => p.date.startsWith(`${year}-${monthStr}`));
            }

            return filtered;
        },
    });

    // Fetch notes taken
    const { data: notes, isLoading: notesLoading } = useQuery({
        queryKey: ['stats-notes', year, month],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('book_notes')
                .select('*');

            if (error) throw error;

            return (data as any[]).filter(note => {
                const date = new Date(note.created_at);
                const sameYear = date.getFullYear() === year;
                if (month !== undefined) {
                    return sameYear && date.getMonth() === month;
                }
                return sameYear;
            });
        },
    });

    const yearlyStats = {
        completedBooks: books?.length || 0,
        totalPagesRead: progress?.reduce((sum, p) => sum + p.pages_read, 0) || 0,
        totalNotes: notes?.length || 0,
        books,
    };

    return {
        yearlyStats,
        isLoading: booksLoading || progressLoading || notesLoading,
    };
};

export const useMonthlySummary = (year: number, month: number) => {
    const { data: progress } = useQuery({
        queryKey: ['monthly-summary-progress', year, month],
        queryFn: async () => {
            const startOfMonth = `${year}-${String(month + 1).padStart(2, '0')}-01`;
            // Quick and dirty end of month
            const endOfMonth = `${year}-${String(month + 1).padStart(2, '0')}-31`;

            const { data, error } = await supabase
                .from('reading_progress')
                .select('*')
                .gte('date', startOfMonth)
                .lte('date', endOfMonth);

            if (error) throw error;
            return data as ReadingProgress[];
        }
    });

    const { data: books } = useQuery({
        queryKey: ['monthly-summary-books', year, month],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('books')
                .select('*')
                .eq('status', 'completed');

            if (error) throw error;

            return (data as Book[]).filter(b => {
                if (!b.completed_at) return false;
                const d = new Date(b.completed_at);
                return d.getFullYear() === year && d.getMonth() === month;
            });
        }
    });

    const { data: notes } = useQuery({
        queryKey: ['monthly-summary-notes', year, month],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('book_notes')
                .select('created_at');

            if (error) throw error;

            return (data as any[]).filter(n => {
                const d = new Date(n.created_at);
                return d.getFullYear() === year && d.getMonth() === month;
            });
        }
    });

    return {
        stats: {
            booksCount: books?.length || 0,
            pagesCount: progress?.reduce((sum, p) => sum + p.pages_read, 0) || 0,
            notesCount: notes?.length || 0,
        },
        isLoading: false // Simplified
    };
};
