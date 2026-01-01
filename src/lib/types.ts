
export interface ReadingDay {
  dayNumber: number;
  date: string; // ISO format
  displayDate: string; // Localized format
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
