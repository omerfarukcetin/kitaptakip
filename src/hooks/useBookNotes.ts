import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import type { BookNote, BookNoteInsert } from '../lib/database.types';

export const useBookNotes = (bookId: string) => {
    const queryClient = useQueryClient();

    // Fetch all notes for a book
    const { data: notes, isLoading } = useQuery({
        queryKey: ['book-notes', bookId],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('book_notes')
                .select('*')
                .eq('book_id', bookId)
                .order('created_at', { ascending: false });

            if (error) throw error;
            return data as BookNote[];
        },
        enabled: !!bookId,
    });

    // Add note
    const addNote = useMutation({
        mutationFn: async (noteData: Omit<BookNoteInsert, 'user_id'>) => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('Not authenticated');

            const { data, error } = await supabase
                .from('book_notes')
                .insert([{ ...noteData, user_id: user.id }])
                .select()
                .single();

            if (error) throw error;
            return data as BookNote;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['book-notes', bookId] });
        },
    });

    // Delete note
    const deleteNote = useMutation({
        mutationFn: async (noteId: string) => {
            const { error } = await supabase
                .from('book_notes')
                .delete()
                .eq('id', noteId);

            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['book-notes', bookId] });
            queryClient.invalidateQueries({ queryKey: ['all-notes'] });
        },
    });

    // Update note
    const updateNote = useMutation({
        mutationFn: async ({ noteId, updates }: { noteId: string; updates: Partial<Omit<BookNote, 'id' | 'user_id' | 'created_at'>> }) => {
            const { data, error } = await supabase
                .from('book_notes')
                .update(updates)
                .eq('id', noteId)
                .select()
                .single();

            if (error) throw error;
            return data as BookNote;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['book-notes', bookId] });
            queryClient.invalidateQueries({ queryKey: ['all-notes'] });
        },
    });

    return {
        notes: notes || [],
        isLoading,
        addNote,
        deleteNote,
        updateNote,
    };
};
