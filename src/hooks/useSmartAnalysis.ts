import { useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import type { ReadingProgress, ReadingPlan, Book } from '../lib/database.types';
import { addDays, format, differenceInDays } from 'date-fns';

export interface SmartAnalysis {
    actualPPM: number;
    avgPagesPerDay: number;
    avgDurationPerSession: number;
    predictedFinishDate: Date | null;
    daysAheadOrBehind: number | null;
    efficiencyScore: number;
    consistencyScore: number;
    hourlyEfficiency: { hour: number; speed: number }[];
    totalSessions: number;
}

export const useSmartAnalysis = (bookId: string, totalPages: number, currentPage: number) => {
    // 1. Fetch book-specific progress
    const { data: progressEntries } = useQuery({
        queryKey: ['reading-progress-analysis', bookId],
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

    // 2. Fetch plan for comparison
    const { data: plan } = useQuery({
        queryKey: ['reading-plan-analysis', bookId],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('reading_plans')
                .select('*')
                .eq('book_id', bookId)
                .maybeSingle();

            if (error) throw error;
            return data as ReadingPlan;
        },
        enabled: !!bookId,
    });

    const analysis: SmartAnalysis = (() => {
        if (!progressEntries || progressEntries.length === 0) {
            return {
                actualPPM: 0,
                avgPagesPerDay: 0,
                avgDurationPerSession: 0,
                predictedFinishDate: null,
                daysAheadOrBehind: null,
                efficiencyScore: 0,
                consistencyScore: 0,
                hourlyEfficiency: [],
                totalSessions: 0
            };
        }

        const totalPagesRead = progressEntries.reduce((sum, p) => sum + p.pages_read, 0);
        const totalDurationSeconds = progressEntries.reduce((sum, p) => sum + (p.duration_seconds || 0), 0);
        const totalMinutes = totalDurationSeconds / 60;

        // PPM
        const actualPPM = totalMinutes > 0 ? totalPagesRead / totalMinutes : 0;

        // Pages Per Day
        const firstDay = new Date(progressEntries[0].date);
        const lastDay = new Date(progressEntries[progressEntries.length - 1].date);
        const daysSpan = Math.max(differenceInDays(lastDay, firstDay) + 1, 1);
        const avgPagesPerDay = totalPagesRead / daysSpan;

        // Avg Duration
        const avgDurationPerSession = progressEntries.length > 0 ? totalMinutes / progressEntries.length : 0;

        // Prediction
        const remainingPages = totalPages - currentPage;
        let predictedFinishDate = null;
        let daysAheadOrBehind = null;

        if (avgPagesPerDay > 0 && remainingPages > 0) {
            const daysRemaining = Math.ceil(remainingPages / avgPagesPerDay);
            predictedFinishDate = addDays(new Date(), daysRemaining);

            if (plan) {
                const planEndDate = new Date(plan.end_date);
                daysAheadOrBehind = differenceInDays(planEndDate, predictedFinishDate);
            }
        }

        // Consistency Score (percentage of days read since start)
        const consistencyScore = Math.min((progressEntries.length / daysSpan) * 100, 100);

        // Efficiency Score (PPM compared to a base of 1.0)
        const efficiencyScore = Math.min((actualPPM / 1.0) * 100, 150);

        return {
            actualPPM,
            avgPagesPerDay,
            avgDurationPerSession,
            predictedFinishDate,
            daysAheadOrBehind,
            efficiencyScore,
            consistencyScore,
            hourlyEfficiency: [], // Placeholder for now
            totalSessions: progressEntries.length
        };
    })();

    return { analysis, isLoading: !progressEntries };
};
