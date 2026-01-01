export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[]

export type BookStatus = 'to_read' | 'reading' | 'completed';
export type NoteType = 'quote' | 'thought' | 'summary';

export type Database = {
    public: {
        Tables: {
            profiles: {
                Row: {
                    id: string;
                    email: string | null;
                    full_name: string | null;
                    avatar_url: string | null;
                    reading_goal_yearly: number;
                    created_at: string;
                    updated_at: string;
                };
                Insert: {
                    id: string;
                    email?: string | null;
                    full_name?: string | null;
                    avatar_url?: string | null;
                    reading_goal_yearly?: number;
                    created_at?: string;
                    updated_at?: string;
                };
                Update: {
                    id?: string;
                    email?: string | null;
                    full_name?: string | null;
                    avatar_url?: string | null;
                    reading_goal_yearly?: number;
                    created_at?: string;
                    updated_at?: string;
                };
                Relationships: [];
            };
            books: {
                Row: {
                    id: string;
                    user_id: string;
                    title: string;
                    author: string | null;
                    total_pages: number;
                    current_page: number;
                    status: BookStatus;
                    cover_url: string | null;
                    isbn: string | null;
                    categories: string[] | null;
                    notes: string | null;
                    description: string | null;
                    rating: number | null;
                    review: string | null;
                    started_at: string | null;
                    completed_at: string | null;
                    created_at: string;
                    updated_at: string;
                };
                Insert: {
                    id?: string;
                    user_id: string;
                    title: string;
                    author?: string | null;
                    total_pages: number;
                    current_page?: number;
                    status?: BookStatus;
                    cover_url?: string | null;
                    isbn?: string | null;
                    categories?: string[] | null;
                    notes?: string | null;
                    description?: string | null;
                    rating?: number | null;
                    review?: string | null;
                    started_at?: string | null;
                    completed_at?: string | null;
                    created_at?: string;
                    updated_at?: string;
                };
                Update: {
                    id?: string;
                    user_id?: string;
                    title?: string;
                    author?: string | null;
                    total_pages?: number;
                    current_page?: number;
                    status?: BookStatus;
                    cover_url?: string | null;
                    isbn?: string | null;
                    categories?: string[] | null;
                    notes?: string | null;
                    description?: string | null;
                    rating?: number | null;
                    review?: string | null;
                    started_at?: string | null;
                    completed_at?: string | null;
                    created_at?: string;
                    updated_at?: string;
                };
                Relationships: [];
            };
            reading_plans: {
                Row: {
                    id: string;
                    user_id: string;
                    book_id: string;
                    start_date: string;
                    end_date: string;
                    daily_pages: number;
                    starting_page: number;
                    calculation_mode: 'pages' | 'date';
                    created_at: string;
                    updated_at: string;
                };
                Insert: {
                    id?: string;
                    user_id: string;
                    book_id: string;
                    start_date: string;
                    end_date: string;
                    daily_pages: number;
                    starting_page?: number;
                    calculation_mode: 'pages' | 'date';
                    created_at?: string;
                    updated_at?: string;
                };
                Update: {
                    id?: string;
                    user_id?: string;
                    book_id?: string;
                    start_date?: string;
                    end_date?: string;
                    daily_pages?: number;
                    starting_page?: number;
                    calculation_mode?: 'pages' | 'date';
                    created_at?: string;
                    updated_at?: string;
                };
                Relationships: [];
            };
            reading_goals: {
                Row: {
                    id: string;
                    user_id: string;
                    year: number;
                    goal: number;
                    created_at: string;
                    updated_at: string;
                };
                Insert: {
                    id?: string;
                    user_id: string;
                    year: number;
                    goal?: number;
                    created_at?: string;
                    updated_at?: string;
                };
                Update: {
                    id?: string;
                    user_id?: string;
                    year?: number;
                    goal?: number;
                    created_at?: string;
                    updated_at?: string;
                };
                Relationships: [];
            };
            reading_progress: {
                Row: {
                    id: string;
                    user_id: string;
                    book_id: string;
                    date: string;
                    pages_read: number;
                    duration_seconds: number | null;
                    notes: string | null;
                    created_at: string;
                };
                Insert: {
                    id?: string;
                    user_id: string;
                    book_id: string;
                    date: string;
                    pages_read: number;
                    duration_seconds?: number | null;
                    notes?: string | null;
                    created_at?: string;
                };
                Update: {
                    id?: string;
                    user_id?: string;
                    book_id?: string;
                    date?: string;
                    pages_read?: number;
                    duration_seconds?: number | null;
                    notes?: string | null;
                    created_at?: string;
                };
                Relationships: [];
            };
            book_notes: {
                Row: {
                    id: string;
                    user_id: string;
                    book_id: string;
                    title: string | null;
                    note_type: NoteType;
                    content: string;
                    page_number: number | null;
                    categories: string[] | null;
                    tags: string[] | null;
                    created_at: string;
                    updated_at: string;
                };
                Insert: {
                    id?: string;
                    user_id: string;
                    book_id: string;
                    title?: string | null;
                    note_type: NoteType;
                    content: string;
                    page_number?: number | null;
                    categories?: string[] | null;
                    tags?: string[] | null;
                    created_at?: string;
                    updated_at?: string;
                };
                Update: {
                    id?: string;
                    user_id?: string;
                    book_id?: string;
                    title?: string | null;
                    note_type?: NoteType;
                    content?: string;
                    page_number?: number | null;
                    categories?: string[] | null;
                    tags?: string[] | null;
                    created_at?: string;
                    updated_at?: string;
                };
                Relationships: [];
            };
        };
        Views: {
            [_ in never]: never;
        };
        Functions: {
            [_ in never]: never;
        };
        Enums: {
            [_ in never]: never;
        };
        CompositeTypes: {
            [_ in never]: never;
        };
    };
}

export type Book = Database['public']['Tables']['books']['Row'];
export type BookInsert = Database['public']['Tables']['books']['Insert'];
export type BookUpdate = Database['public']['Tables']['books']['Update'];

export type Profile = Database['public']['Tables']['profiles']['Row'];
export type ProfileInsert = Database['public']['Tables']['profiles']['Insert'];
export type ProfileUpdate = Database['public']['Tables']['profiles']['Update'];

export type ReadingPlan = Database['public']['Tables']['reading_plans']['Row'];
export type ReadingPlanInsert = Database['public']['Tables']['reading_plans']['Insert'];

export type ReadingProgress = Database['public']['Tables']['reading_progress']['Row'];
export type ReadingProgressInsert = Database['public']['Tables']['reading_progress']['Insert'];

export type BookNote = Database['public']['Tables']['book_notes']['Row'];
export type BookNoteInsert = Database['public']['Tables']['book_notes']['Insert'];
export type BookNoteUpdate = Database['public']['Tables']['book_notes']['Update'];

// Google Books API types
export interface GoogleBook {
    id: string;
    volumeInfo: {
        title: string;
        authors?: string[];
        publisher?: string;
        publishedDate?: string;
        description?: string;
        pageCount?: number;
        categories?: string[];
        imageLinks?: {
            smallThumbnail?: string;
            thumbnail?: string;
        };
        industryIdentifiers?: Array<{
            type: string;
            identifier: string;
        }>;
    };
}
