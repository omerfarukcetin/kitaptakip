import React from 'react';
import { useAllNotes } from '../../hooks/useAllNotes';
import { useNavigate } from 'react-router-dom';

interface NoteLinkProps {
    content: string;
    onLinkClick?: (title: string) => void;
}

export const NoteLink: React.FC<NoteLinkProps> = ({ content, onLinkClick }) => {
    const { notes } = useAllNotes();
    const navigate = useNavigate();

    // Regex to find [[Link]]
    const parts = content.split(/(\[\[.*?\]\])/g);

    return (
        <>
            {parts.map((part, i) => {
                if (part.startsWith('[[') && part.endsWith(']]')) {
                    const title = part.slice(2, -2).trim();
                    // Find if a note with this title exists
                    const linkedNote = notes.find(n => n.title?.toLowerCase() === title.toLowerCase());

                    return (
                        <button
                            key={i}
                            onClick={(e) => {
                                e.stopPropagation();
                                if (onLinkClick) {
                                    onLinkClick(title);
                                } else if (linkedNote) {
                                    // If we are in a book page, we might want to highlight or navigate
                                    // For now, let's navigate to the global notes page with a search
                                    navigate(`/notes?search=${encodeURIComponent(title)}`);
                                }
                            }}
                            className={`inline-flex items-center px-1.5 py-0.5 rounded-lg text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 font-black hover:bg-indigo-100 dark:hover:bg-indigo-800 transition-all border border-indigo-100 dark:border-indigo-800/50 mx-0.5`}
                        >
                            {title}
                        </button>
                    );
                }
                return part;
            })}
        </>
    );
};
