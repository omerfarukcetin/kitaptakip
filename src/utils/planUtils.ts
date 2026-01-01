import { addDays, formatDate } from './dateUtils';
import { parseISODate } from './dateUtils';

export interface ReadingDay {
    dayNumber: number;
    date: string;
    startPage: number;
    endPage: number;
    dailyPages: number;
}

export function generateReadingDays(
    plan: { start_date: string; daily_pages: number; starting_page?: number },
    totalPages: number,
    startingPage?: number
): ReadingDay[] {
    const days: ReadingDay[] = [];
    const startDate = parseISODate(plan.start_date);
    const startPage = startingPage ?? plan.starting_page ?? 0;
    const remainingPages = totalPages - startPage;
    const totalDays = Math.ceil(remainingPages / plan.daily_pages);

    let pageNum = startPage + 1;

    for (let i = 0; i < totalDays; i++) {
        const remaining = totalPages - pageNum + 1;
        if (remaining <= 0) break;

        const dailyTarget = Math.min(plan.daily_pages, remaining);
        const endPage = pageNum + dailyTarget - 1;

        days.push({
            dayNumber: i + 1,
            date: formatDate(addDays(startDate, i)),
            startPage: pageNum,
            endPage: endPage,
            dailyPages: dailyTarget,
        });

        pageNum = endPage + 1;
    }

    return days;
}

export function getTodayTargetPage(
    plan: { start_date: string; daily_pages: number; starting_page?: number },
    totalPages: number
): number | null {
    const readingDays = generateReadingDays(plan, totalPages);
    const todayStr = formatDate(new Date());

    const todayPlan = readingDays.find(day => day.date === todayStr);
    return todayPlan ? todayPlan.endPage : null;
}

export function recalculateEndDate(
    current_page: number,
    total_pages: number,
    daily_pages: number
): string {
    const remainingPages = total_pages - current_page;
    if (remainingPages <= 0) return formatDate(new Date());

    const remainingDays = Math.ceil(remainingPages / daily_pages);
    // Start from tomorrow since today's reading is already accounted for in current_page
    return formatDate(addDays(new Date(), remainingDays));
}
