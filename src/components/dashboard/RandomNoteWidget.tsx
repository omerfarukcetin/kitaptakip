import React, { useState, useEffect } from 'react';
import { useAllNotes, NoteWithBook } from '../../hooks/useAllNotes';
import { Quote, Sparkles, RefreshCw, BookOpen, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { NoteLink } from '../notes/NoteLink';

export const RandomNoteWidget: React.FC = () => {
    const { notes, isLoading } = useAllNotes();
    const [randomNote, setRandomNote] = useState<NoteWithBook | null>(null);
    const [isRefreshing, setIsRefreshing] = useState(false);

    const selectRandomNote = (allNotes: NoteWithBook[]) => {
        if (!allNotes || allNotes.length === 0) return;

        setIsRefreshing(true);
        // Add a small delay for animation feel
        setTimeout(() => {
            const randomIndex = Math.floor(Math.random() * allNotes.length);
            setRandomNote(allNotes[randomIndex]);
            setIsRefreshing(false);
        }, 300);
    };

    useEffect(() => {
        if (notes.length > 0 && !randomNote) {
            // Pick a deterministic note for the day based on the date
            const today = new Date().toDateString();
            let hash = 0;
            for (let i = 0; i < today.length; i++) {
                hash = ((hash << 5) - hash) + today.charCodeAt(i);
                hash |= 0;
            }
            const index = Math.abs(hash) % notes.length;
            setRandomNote(notes[index]);
        }
    }, [notes]);

    if (isLoading) return null;
    if (notes.length === 0) return null;

    return (
        <div className="relative group">
            {/* Background Glow */}
            <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-[2.5rem] blur opacity-25 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>

            <div className="relative bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-[2rem] p-6 overflow-hidden">
                {/* Decorative Elements */}
                <div className="absolute top-0 right-0 -mr-16 -mt-16 w-48 h-48 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />

                <div className="relative space-y-4">
                    {/* Header */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-indigo-50 dark:bg-indigo-900/30 rounded-lg">
                                <Sparkles className="text-indigo-600 dark:text-indigo-400" size={16} />
                            </div>
                            <div>
                                <h3 className="text-base font-black text-slate-900 dark:text-slate-100 leading-tight">Günün Hatırlatması</h3>
                            </div>
                        </div>
                        <button
                            onClick={() => selectRandomNote(notes)}
                            disabled={isRefreshing}
                            className={`p-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-all ${isRefreshing ? 'animate-spin opacity-50' : ''}`}
                            title="Başka bir not getir"
                        >
                            <RefreshCw size={16} className="text-slate-400" />
                        </button>
                    </div>

                    {/* Content */}
                    <div className={`relative min-h-[40px] transition-all duration-300 ${isRefreshing ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}`}>
                        <Quote size={32} className="absolute -left-2 -top-2 text-indigo-500/10 dark:text-indigo-500/5 pointer-events-none" />
                        {randomNote?.title && (
                            <h4 className="text-sm font-black text-slate-900 dark:text-slate-100 mb-2 px-4">
                                {randomNote.title}
                            </h4>
                        )}
                        <div className="text-base md:text-lg font-bold text-slate-700 dark:text-slate-200 leading-relaxed italic px-4">
                            <NoteLink content={randomNote?.content || ''} />
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-between gap-4 pt-4 border-t border-slate-50 dark:border-slate-700/50">
                        <div className="flex items-center gap-2">
                            <BookOpen size={14} className="text-slate-400" />
                            <span className="text-xs font-black text-slate-900 dark:text-slate-100 line-clamp-1 italic">
                                {randomNote?.book?.title}
                            </span>
                        </div>

                        {randomNote?.book && (
                            <Link
                                to={`/book/${randomNote.book.id}`}
                                className="flex items-center gap-1.5 px-4 py-1.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-full text-[10px] font-black hover:scale-105 transition-all shadow-md active:scale-95 shrink-0"
                            >
                                Okumaya Git
                                <ChevronRight size={12} />
                            </Link>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
