import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import type { BookNote } from '../lib/database.types';

export interface NoteWithBook extends BookNote {
    book: {
        id: string;
        title: string;
        author: string | null;
        cover_url: string | null;
    } | null;
}

export const useAllNotes = () => {
    const queryClient = useQueryClient();

    const { data: notes = [], isLoading, error } = useQuery({
        queryKey: ['all-notes'],
        queryFn: async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('Not authenticated');

            const { data, error } = await supabase
                .from('book_notes')
                .select(`
          *,
          book:books (
            id,
            title,
            author,
            cover_url
          )
        `)
                .eq('user_id', user.id)
                .order('created_at', { ascending: false });

            if (error) throw error;
            return data as unknown as NoteWithBook[];
        },
    });

    const deleteNote = useMutation({
        mutationFn: async (noteId: string) => {
            const { error } = await supabase
                .from('book_notes')
                .delete()
                .eq('id', noteId);

            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['all-notes'] });
            queryClient.invalidateQueries({ queryKey: ['book-notes'] });
        },
    });

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
            queryClient.invalidateQueries({ queryKey: ['all-notes'] });
            queryClient.invalidateQueries({ queryKey: ['book-notes'] });
        },
    });

    return {
        notes,
        isLoading,
        error,
        deleteNote,
        updateNote,
    };
};
