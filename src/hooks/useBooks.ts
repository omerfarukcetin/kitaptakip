import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import type { Book, BookInsert, BookUpdate, BookStatus } from '../lib/database.types';

export const useBooks = (status?: BookStatus) => {
    const queryClient = useQueryClient();

    // Fetch all books or filter by status
    const { data: books, isLoading, error } = useQuery({
        queryKey: ['books', status],
        queryFn: async () => {
            let query = supabase
                .from('books')
                .select('*')
                .order('created_at', { ascending: false });

            if (status) {
                query = query.eq('status', status);
            }

            const { data, error } = await query;

            if (error) throw error;
            return data as Book[];
        },
    });

    // Add a new book
    const addBook = useMutation({
        mutationFn: async (newBook: BookInsert) => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('User not authenticated');

            const { data, error } = await supabase
                .from('books')
                .insert([{ ...newBook, user_id: user.id }])
                .select()
                .single();

            if (error) throw error;
            return data as Book;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['books'] });
        },
    });

    // Update a book
    const updateBook = useMutation({
        mutationFn: async ({ id, updates }: { id: string; updates: BookUpdate }) => {
            const { data, error } = await supabase
                .from('books')
                .update(updates)
                .eq('id', id)
                .select()
                .single();

            if (error) throw error;
            return data as Book;
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['books'] });
            queryClient.invalidateQueries({ queryKey: ['book', variables.id] });
        },
    });

    // Delete a book
    const deleteBook = useMutation({
        mutationFn: async (id: string) => {
            const { error } = await supabase.from('books').delete().eq('id', id);
            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['books'] });
        },
    });

    // Update book status
    const updateBookStatus = useMutation({
        mutationFn: async ({ id, status }: { id: string; status: BookStatus }) => {
            const updates: BookUpdate = { status };

            // Set timestamps based on status
            if (status === 'reading' && !books?.find(b => b.id === id)?.started_at) {
                updates.started_at = new Date().toISOString();
            } else if (status === 'completed') {
                updates.completed_at = new Date().toISOString();
            }

            const { data, error } = await supabase
                .from('books')
                .update(updates)
                .eq('id', id)
                .select()
                .single();

            if (error) throw error;
            return data as Book;
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['books'] });
            queryClient.invalidateQueries({ queryKey: ['book', variables.id] });
        },
    });

    return {
        books,
        isLoading,
        error,
        addBook,
        updateBook,
        deleteBook,
        updateBookStatus,
    };
};

// Hook for a single book
export const useBook = (id: string) => {
    const { data: book, isLoading } = useQuery({
        queryKey: ['book', id],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('books')
                .select('*')
                .eq('id', id)
                .single();

            if (error) throw error;
            return data as Book;
        },
        enabled: !!id,
    });

    return { book, isLoading };
};
