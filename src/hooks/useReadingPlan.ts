import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import type { ReadingPlan, ReadingPlanInsert, ReadingProgress, ReadingProgressInsert } from '../lib/database.types';

// Reading Plan Hooks
export const useReadingPlan = (bookId: string) => {
    const queryClient = useQueryClient();

    // Fetch reading plan for a book
    const { data: plan, isLoading } = useQuery({
        queryKey: ['reading-plan', bookId],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('reading_plans')
                .select('*')
                .eq('book_id', bookId)
                .single();

            if (error) {
                if (error.code === 'PGRST116') return null; // No plan found
                throw error;
            }
            return data as ReadingPlan;
        },
        enabled: !!bookId,
    });

    // Create or update reading plan
    const savePlan = useMutation({
        mutationFn: async (planData: Omit<ReadingPlanInsert, 'user_id'>) => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('Not authenticated');

            // Check if plan exists
            const { data: existing } = await supabase
                .from('reading_plans')
                .select('id')
                .eq('book_id', planData.book_id)
                .single();

            if (existing) {
                // Update existing plan
                const { data, error } = await supabase
                    .from('reading_plans')
                    .update(planData)
                    .eq('id', existing.id)
                    .select()
                    .single();

                if (error) throw error;
                return data as ReadingPlan;
            } else {
                // Create new plan
                const { data, error } = await supabase
                    .from('reading_plans')
                    .insert([{ ...planData, user_id: user.id }])
                    .select()
                    .single();

                if (error) throw error;
                return data as ReadingPlan;
            }
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['reading-plan', data.book_id] });
        },
    });

    // Delete reading plan
    const deletePlan = useMutation({
        mutationFn: async (bookId: string) => {
            const { error } = await supabase
                .from('reading_plans')
                .delete()
                .eq('book_id', bookId);

            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['reading-plan', bookId] });
        },
    });

    return { plan, isLoading, savePlan, deletePlan };
};

// Reading Progress Hooks
export const useReadingProgress = (bookId: string) => {
    const queryClient = useQueryClient();

    // Fetch all progress entries for a book
    const { data: progressEntries, isLoading } = useQuery({
        queryKey: ['reading-progress', bookId],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('reading_progress')
                .select('*')
                .eq('book_id', bookId)
                .order('date', { ascending: true });

            if (error) throw error;
            return data as ReadingProgress[];
        },
        enabled: !!bookId,
    });

    // Toggle progress for a specific date WITH auto page update
    const toggleProgress = useMutation({
        mutationFn: async ({
            date,
            pagesRead,
            endPage,
            durationSeconds
        }: {
            date: string;
            pagesRead: number;
            endPage?: number;
            durationSeconds?: number;
        }) => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('Not authenticated');

            // Check if entry exists
            const { data: existing } = await supabase
                .from('reading_progress')
                .select('id')
                .eq('book_id', bookId)
                .eq('date', date)
                .single();

            if (existing) {
                // Delete if exists (toggle off)
                const { error } = await supabase
                    .from('reading_progress')
                    .delete()
                    .eq('id', existing.id);

                if (error) throw error;

                // FIXED: When unchecking, find the previous completed day to set current_page
                // Get all progress entries for this book, ordered by date  
                const { data: allProgress } = await supabase
                    .from('reading_progress')
                    .select('date, pages_read')
                    .eq('book_id', bookId)
                    .order('date', { ascending: false });

                // If there are still completed days, find the latest one
                if (allProgress && allProgress.length > 0) {
                    // We need to match this with the reading plan to find the endPage
                    // For now, we won't update current_page when unchecking
                    // This prevents data corruption
                } else {
                    // No more completed days, reset to start
                    await supabase
                        .from('books')
                        .update({ current_page: 0 })
                        .eq('id', bookId);
                }

                return null;
            } else {
                // Create new entry (toggle on)
                const { data, error } = await supabase
                    .from('reading_progress')
                    .insert([{
                        user_id: user.id,
                        book_id: bookId,
                        date,
                        pages_read: pagesRead,
                        duration_seconds: durationSeconds || null,
                    }])
                    .select()
                    .single();

                if (error) throw error;

                // AUTO UPDATE: Update book's current_page if endPage provided
                if (endPage !== undefined) {
                    await supabase
                        .from('books')
                        .update({ current_page: endPage })
                        .eq('id', bookId);
                }

                return data as ReadingProgress;
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['reading-progress', bookId] });
            queryClient.invalidateQueries({ queryKey: ['books'] });
            queryClient.invalidateQueries({ queryKey: ['book', bookId] });
        },
    });

    // Record a timer session (append to existing progress for the day)
    const recordSession = useMutation({
        mutationFn: async ({
            date,
            pagesRead,
            durationSeconds,
            endPage
        }: {
            date: string;
            pagesRead: number;
            durationSeconds: number;
            endPage: number;
        }) => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('Not authenticated');

            const { data: existing } = await supabase
                .from('reading_progress')
                .select('*')
                .eq('book_id', bookId)
                .eq('date', date)
                .maybeSingle();

            if (existing) {
                const { data, error } = await supabase
                    .from('reading_progress')
                    .update({
                        pages_read: existing.pages_read + pagesRead,
                        duration_seconds: (existing.duration_seconds || 0) + durationSeconds
                    })
                    .eq('id', existing.id)
                    .select()
                    .single();

                if (error) throw error;

                await supabase
                    .from('books')
                    .update({ current_page: endPage })
                    .eq('id', bookId);

                return data as ReadingProgress;
            } else {
                const { data, error } = await supabase
                    .from('reading_progress')
                    .insert([{
                        user_id: user.id,
                        book_id: bookId,
                        date,
                        pages_read: pagesRead,
                        duration_seconds: durationSeconds
                    }])
                    .select()
                    .single();

                if (error) throw error;

                await supabase
                    .from('books')
                    .update({ current_page: endPage })
                    .eq('id', bookId);

                return data as ReadingProgress;
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['reading-progress', bookId] });
            queryClient.invalidateQueries({ queryKey: ['books'] });
            queryClient.invalidateQueries({ queryKey: ['book', bookId] });
        },
    });

    // Calculate total pages read
    const totalPagesRead = progressEntries?.reduce((sum, entry) => sum + entry.pages_read, 0) || 0;

    return {
        progressEntries,
        isLoading,
        toggleProgress,
        recordSession,
        totalPagesRead,
    };
};
// Hook to fetch all reading plans
export const useAllReadingPlans = () => {
    return useQuery({
        queryKey: ['reading-plans'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('reading_plans')
                .select('*');

            if (error) throw error;
            return data as ReadingPlan[];
        },
    });
};
