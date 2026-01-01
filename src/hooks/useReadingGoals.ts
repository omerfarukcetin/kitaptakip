import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import type { ReadingGoal, ReadingGoalInsert, ReadingGoalUpdate } from '../lib/database.types';

export const useReadingGoals = (year: number) => {
    const queryClient = useQueryClient();

    // Fetch goal for a specific year
    const { data: goal, isLoading } = useQuery({
        queryKey: ['reading-goal', year],
        queryFn: async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return null;

            const { data, error } = await supabase
                .from('reading_goals')
                .select('*')
                .eq('user_id', user.id)
                .eq('year', year)
                .single();

            if (error) {
                if (error.code === 'PGRST116') return null; // No goal found
                throw error;
            }
            return data as ReadingGoal;
        },
        enabled: !!year,
    });

    // Save or update goal
    const saveGoal = useMutation({
        mutationFn: async (goalData: { year: number; goal: number }) => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('Not authenticated');

            const { data: existing } = await supabase
                .from('reading_goals')
                .select('id')
                .eq('user_id', user.id)
                .eq('year', goalData.year)
                .single();

            if (existing) {
                const { data, error } = await supabase
                    .from('reading_goals')
                    .update({ goal: goalData.goal })
                    .eq('id', existing.id)
                    .select()
                    .single();

                if (error) throw error;
                return data as ReadingGoal;
            } else {
                const { data, error } = await supabase
                    .from('reading_goals')
                    .insert([{ ...goalData, user_id: user.id }])
                    .select()
                    .single();

                if (error) throw error;
                return data as ReadingGoal;
            }
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['reading-goal', data.year] });
            queryClient.invalidateQueries({ queryKey: ['reading-goals'] });
        },
    });

    return { goal, isLoading, saveGoal };
};

// Hook to fetch all goals for stats
export const useAllReadingGoals = () => {
    return useQuery({
        queryKey: ['reading-goals'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('reading_goals')
                .select('*')
                .order('year', { ascending: false });

            if (error) throw error;
            return data as ReadingGoal[];
        },
    });
};
