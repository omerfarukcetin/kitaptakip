
export interface ReadingDay {
  dayNumber: number;
  date: string;
  startPage: number;
  endPage: number;
  dailyPages: number;
}

export interface ReadingPlanData {
  bookTitle: string;
  totalPages: number;
  startDate: string;
  dailyPages: number;
  totalDays: number;
  endDate: string;
  days: ReadingDay[];
}

export type CalculationMode = 'pages' | 'date';
