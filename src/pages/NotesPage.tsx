import React, { useState, useMemo } from 'react';
import { Layout } from '../components/shared/Layout';
import { useAllNotes } from '../hooks/useAllNotes';
import { Quote, Lightbulb, FileText, Tag, Search, Trash2, BookOpen, Edit2, Check, X } from 'lucide-react';
import { NoteStoryExport } from '../components/books/NoteStoryExport';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { NoteLink } from '../components/notes/NoteLink';
import type { NoteType } from '../lib/database.types';

export const NotesPage: React.FC = () => {
    const { notes, isLoading, deleteNote, updateNote } = useAllNotes();
    const navigate = useNavigate();

    const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
    const [editContent, setEditContent] = useState('');
    const [editNoteType, setEditNoteType] = useState<NoteType>('quote');
    const [editPageNumber, setEditPageNumber] = useState<number | ''>('');
    const [editTags, setEditTags] = useState('');
    const [editCategories, setEditCategories] = useState('');
    const [editTitle, setEditTitle] = useState('');

    const [searchQuery, setSearchQuery] = useState('');
    const [filterType, setFilterType] = useState<NoteType | 'all'>('all');
    const [filterTag, setFilterTag] = useState<string | null>(null);
    const [filterCategory, setFilterCategory] = useState<string | null>(null);
    const [groupByBook, setGroupByBook] = useState(false);
    const [searchParams, setSearchParams] = useSearchParams();

    // Sync search from URL
    React.useEffect(() => {
        const query = searchParams.get('search');
        if (query) setSearchQuery(query);
    }, [searchParams]);

    // Get all unique tags and categories
    const allTags = useMemo(() => {
        const tags = new Set<string>();
        notes.forEach(note => {
            note.tags?.forEach(tag => tags.add(tag));
        });
        return Array.from(tags).sort();
    }, [notes]);

    const allCategories = useMemo(() => {
        const categories = new Set<string>();
        notes.forEach(note => {
            note.categories?.forEach(cat => categories.add(cat));
        });
        return Array.from(categories).sort();
    }, [notes]);

    // Filter notes
    const filteredNotes = useMemo(() => {
        return notes.filter(note => {
            // Search filter
            if (searchQuery && !note.content.toLowerCase().includes(searchQuery.toLowerCase())) {
                return false;
            }
            // Type filter
            if (filterType !== 'all' && note.note_type !== filterType) {
                return false;
            }
            // Tag filter
            if (filterTag && (!note.tags || !note.tags.includes(filterTag))) {
                return false;
            }
            // Category filter
            if (filterCategory && (!note.categories || !note.categories.includes(filterCategory))) {
                return false;
            }
            return true;
        });
    }, [notes, searchQuery, filterType, filterTag, filterCategory]);

    // Group notes by book
    const groupedNotes = useMemo(() => {
        if (!groupByBook) return null;

        const groups: Record<string, typeof filteredNotes> = {};
        filteredNotes.forEach(note => {
            const bookId = note.book?.id || 'unknown';
            if (!groups[bookId]) {
                groups[bookId] = [];
            }
            groups[bookId].push(note);
        });
        return groups;
    }, [filteredNotes, groupByBook]);

    const getNoteIcon = (type: NoteType) => {
        switch (type) {
            case 'quote': return <Quote size={18} className="text-indigo-600" />;
            case 'thought': return <Lightbulb size={18} className="text-amber-600" />;
            case 'summary': return <FileText size={18} className="text-green-600" />;
        }
    };

    const getNoteLabel = (type: NoteType) => {
        switch (type) {
            case 'quote': return 'Alıntı';
            case 'thought': return 'Düşünce';
            case 'summary': return 'Özet';
        }
    };

    const startEditing = (note: typeof notes[0]) => {
        setEditingNoteId(note.id);
        setEditContent(note.content);
        setEditNoteType(note.note_type);
        setEditPageNumber(note.page_number || '');
        setEditTags(note.tags?.join(', ') || '');
        setEditCategories(note.categories?.join(', ') || '');
        setEditTitle(note.title || '');
    };

    const handleSaveEdit = async () => {
        if (!editingNoteId) return;
        try {
            await updateNote.mutateAsync({
                noteId: editingNoteId,
                updates: {
                    title: editTitle.trim() || null,
                    content: editContent,
                    note_type: editNoteType,
                    page_number: editPageNumber ? Number(editPageNumber) : null,
                    tags: editTags ? editTags.split(',').map(t => t.trim()).filter(Boolean) : null,
                    categories: editCategories ? editCategories.split(',').map(c => c.trim()).filter(Boolean) : null,
                }
            });
            setEditingNoteId(null);
        } catch (error) {
            alert('Not güncellenirken hata oluştu');
        }
    };

    const renderNoteCard = (note: typeof notes[0]) => (
        <div
            key={note.id}
            className="group relative bg-white dark:bg-slate-800 rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-slate-100 dark:border-slate-700"
        >
            {/* Gradient Accent */}
            <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${note.note_type === 'quote' ? 'bg-gradient-to-b from-indigo-500 to-purple-600' :
                note.note_type === 'thought' ? 'bg-gradient-to-b from-amber-500 to-orange-600' :
                    'bg-gradient-to-b from-green-500 to-emerald-600'
                }`}></div>

            <div className="p-5 sm:p-8 pl-8 sm:pl-10">
                {/* Book Info Header */}
                {note.book && (
                    <div
                        className="flex items-center gap-4 mb-5 pb-5 border-b border-slate-100 dark:border-slate-700 cursor-pointer hover:opacity-80 transition-opacity"
                        onClick={() => navigate(`/book/${note.book?.id}`)}
                    >
                        {note.book.cover_url && (
                            <img
                                src={note.book.cover_url}
                                alt={note.book.title}
                                className="w-12 h-16 object-cover rounded-lg shadow-md"
                            />
                        )}
                        <div className="flex-1 min-w-0">
                            <h4 className="font-black text-slate-900 dark:text-slate-100 truncate">{note.book.title}</h4>
                            {note.book.author && (
                                <p className="text-sm text-slate-600 dark:text-slate-400">{note.book.author}</p>
                            )}
                        </div>
                    </div>
                )}

                {editingNoteId === note.id ? (
                    <div className="space-y-4">
                        <input
                            type="text"
                            placeholder="Başlık"
                            className="w-full px-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm font-black mb-2"
                            value={editTitle}
                            onChange={(e) => setEditTitle(e.target.value)}
                        />
                        <textarea
                            className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-slate-900 dark:text-slate-100 min-h-[120px] font-medium"
                            value={editContent}
                            onChange={(e) => setEditContent(e.target.value)}
                        />
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <input
                                type="number"
                                placeholder="Sayfa No"
                                className="px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm"
                                value={editPageNumber}
                                onChange={(e) => setEditPageNumber(e.target.value ? Number(e.target.value) : '')}
                            />
                            <input
                                type="text"
                                placeholder="Kategoriler"
                                className="px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm"
                                value={editCategories}
                                onChange={(e) => setEditCategories(e.target.value)}
                            />
                            <input
                                type="text"
                                placeholder="Etiketler"
                                className="px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm"
                                value={editTags}
                                onChange={(e) => setEditTags(e.target.value)}
                            />
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setEditingNoteId(null)}
                                className="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold rounded-xl"
                            >
                                <X size={18} /> İptal
                            </button>
                            <button
                                onClick={handleSaveEdit}
                                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white font-bold rounded-xl"
                            >
                                <Check size={18} /> Kaydet
                            </button>
                        </div>
                    </div>
                ) : (
                    <>
                        {/* Note Header */}
                        <div className="flex items-start justify-between mb-5">
                            <div className="flex items-center gap-3">
                                <div className={`p-2.5 rounded-xl ${note.note_type === 'quote' ? 'bg-indigo-100 dark:bg-indigo-900/30' :
                                    note.note_type === 'thought' ? 'bg-amber-100 dark:bg-amber-900/30' :
                                        'bg-green-100 dark:bg-green-900/30'
                                    }`}>
                                    {getNoteIcon(note.note_type)}
                                </div>
                                <div>
                                    <span className="font-black text-base sm:text-lg text-slate-800 dark:text-slate-100">{getNoteLabel(note.note_type)}</span>
                                    {note.page_number && (
                                        <span className="ml-2 sm:ml-3 text-[10px] sm:text-sm bg-slate-100 dark:bg-slate-700 px-2 sm:px-3 py-0.5 sm:py-1 rounded-full font-bold text-slate-600 dark:text-slate-300">
                                            S. {note.page_number}
                                        </span>
                                    )}
                                </div>
                            </div>
                            <div
                                className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity"
                                onClick={(e) => e.stopPropagation()}
                            >
                                <button
                                    onClick={() => startEditing(note)}
                                    className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-lg transition-all"
                                >
                                    <Edit2 size={18} />
                                </button>
                                <NoteStoryExport
                                    note={note}
                                    bookTitle={note.book?.title || ''}
                                    bookAuthor={note.book?.author || undefined}
                                    bookCoverUrl={note.book?.cover_url || undefined}
                                />
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        deleteNote.mutate(note.id);
                                    }}
                                    className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-all"
                                >
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="relative">
                            {note.title && (
                                <h4 className="text-xl font-black text-slate-900 dark:text-slate-100 mb-3 pl-8">
                                    {note.title}
                                </h4>
                            )}
                            {note.note_type === 'quote' && (
                                <Quote size={24} className="absolute -left-1 sm:-left-2 -top-1 sm:-top-2 text-indigo-200 dark:text-indigo-800 opacity-50" />
                            )}
                            <div className="text-slate-700 dark:text-slate-300 text-base sm:text-lg leading-relaxed font-medium pl-6 sm:pl-8 mb-4 sm:mb-5 whitespace-pre-line">
                                <NoteLink content={note.content} />
                            </div>
                        </div>

                        {/* Backlinks */}
                        {(() => {
                            const backlinks = notes.filter(n =>
                                n.id !== note.id &&
                                note.title &&
                                n.content.includes(`[[${note.title}]]`)
                            );
                            if (backlinks.length > 0) {
                                return (
                                    <div className="pl-8 mb-5 space-y-2">
                                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Geri Bağlantılar</p>
                                        <div className="flex flex-wrap gap-2">
                                            {backlinks.map(bn => (
                                                <button
                                                    key={bn.id}
                                                    onClick={() => setSearchQuery(bn.title || '')}
                                                    className="text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 px-2 py-1 rounded-lg hover:bg-indigo-100 transition-all border border-indigo-100 dark:border-indigo-800/50"
                                                >
                                                    ← {bn.title || 'Adsız Not'}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                );
                            }
                            return null;
                        })()}

                        {/* Tags and Categories */}
                        {(note.categories || note.tags) && (
                            <div className="flex flex-wrap gap-2 mb-4" onClick={(e) => e.stopPropagation()}>
                                {note.categories?.map((cat, i) => (
                                    <button
                                        key={i}
                                        onClick={() => setFilterCategory(cat)}
                                        className="px-4 py-2 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 hover:from-green-100 hover:to-emerald-100 dark:hover:from-green-800/20 dark:hover:to-emerald-800/20 border border-green-200 dark:border-green-800/50 rounded-xl text-sm font-bold text-green-700 dark:text-green-400 transition-all hover:scale-105 hover:shadow-md"
                                    >
                                        📁 {cat}
                                    </button>
                                ))}
                                {note.tags?.map((tag, i) => (
                                    <button
                                        key={i}
                                        onClick={() => setFilterTag(tag)}
                                        className="px-4 py-2 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 hover:from-indigo-100 hover:to-purple-100 dark:hover:from-indigo-800/20 dark:hover:to-purple-800/20 border border-indigo-200 dark:border-indigo-800/50 rounded-xl text-sm font-bold text-indigo-700 dark:text-indigo-400 flex items-center gap-1.5 transition-all hover:scale-105 hover:shadow-md"
                                    >
                                        <Tag size={14} />
                                        {tag}
                                    </button>
                                ))}
                            </div>
                        )}

                        {/* Footer */}
                        <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-700">
                            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                                {new Date(note.created_at).toLocaleString('tr-TR', {
                                    day: 'numeric',
                                    month: 'long',
                                    year: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                })}
                            </p>
                        </div>
                    </>
                )}
            </div>
        </div>
    );

    if (isLoading) {
        return (
            <Layout>
                <div className="flex items-center justify-center min-h-[400px]">
                    <div className="text-slate-600">Notlar yükleniyor...</div>
                </div>
            </Layout>
        );
    }

    return (
        <Layout>
            <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
                {/* Header */}
                <div>
                    <h1 className="text-2xl sm:text-4xl font-black text-slate-900 dark:text-slate-100 mb-1 sm:mb-2">Tüm Notlarım</h1>
                    <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 font-medium">Tüm kitaplardan {notes.length} not</p>
                </div>

                {/* Filters */}
                <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-lg p-5 sm:p-6 space-y-5 sm:space-y-6">
                    {/* Search */}
                    <div className="relative">
                        <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
                        <input
                            type="text"
                            placeholder="Notlarda ara..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-12 pr-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all text-slate-900 dark:text-slate-100"
                        />
                    </div>

                    {/* Type Filter */}
                    <div>
                        <label className="block text-sm font-black text-slate-700 dark:text-slate-300 mb-3 uppercase tracking-wider">Not Tipi</label>
                        <div className="flex flex-wrap gap-2">
                            {(['all', 'quote', 'thought', 'summary'] as const).map((type) => (
                                <button
                                    key={type}
                                    onClick={() => setFilterType(type)}
                                    className={`px-4 py-2 rounded-xl font-bold transition-all ${filterType === type
                                        ? 'bg-indigo-600 dark:bg-indigo-500 text-white shadow-md'
                                        : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
                                        }`}
                                >
                                    {type === 'all' ? 'Tümü' : getNoteLabel(type)}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Tags */}
                    {allTags.length > 0 && (
                        <div>
                            <label className="block text-sm font-black text-slate-700 dark:text-slate-300 mb-3 uppercase tracking-wider">Etiketler</label>
                            <div className="flex flex-wrap gap-2">
                                {allTags.map((tag) => (
                                    <button
                                        key={tag}
                                        onClick={() => setFilterTag(filterTag === tag ? null : tag)}
                                        className={`px-4 py-2 rounded-xl text-sm font-bold transition-all flex items-center gap-1.5 ${filterTag === tag
                                            ? 'bg-indigo-600 dark:bg-indigo-500 text-white shadow-md'
                                            : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
                                            }`}
                                    >
                                        <Tag size={14} />
                                        {tag}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Categories */}
                    {allCategories.length > 0 && (
                        <div>
                            <label className="block text-sm font-black text-slate-700 dark:text-slate-300 mb-3 uppercase tracking-wider">Kategoriler</label>
                            <div className="flex flex-wrap gap-2">
                                {allCategories.map((cat) => (
                                    <button
                                        key={cat}
                                        onClick={() => setFilterCategory(filterCategory === cat ? null : cat)}
                                        className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${filterCategory === cat
                                            ? 'bg-green-600 dark:bg-green-500 text-white shadow-md'
                                            : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
                                            }`}
                                    >
                                        📁 {cat}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Options */}
                    <div className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-slate-700">
                        <label className="flex items-center gap-3 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={groupByBook}
                                onChange={(e) => setGroupByBook(e.target.checked)}
                                className="w-5 h-5 rounded border-slate-300 dark:border-slate-600 text-indigo-600 focus:ring-indigo-500 bg-white dark:bg-slate-700"
                            />
                            <span className="font-bold text-slate-700 dark:text-slate-300">Kitaplara Göre Grupla</span>
                        </label>
                        <div className="text-sm text-slate-600 dark:text-slate-400 font-medium">
                            <span className="font-black text-indigo-600 dark:text-indigo-400">{filteredNotes.length}</span> not gösteriliyor
                        </div>
                    </div>
                </div>

                {/* Notes */}
                {groupByBook && groupedNotes ? (
                    <div className="space-y-8">
                        {Object.entries(groupedNotes).map(([bookId, bookNotes]) => {
                            const notes = bookNotes as typeof filteredNotes;
                            return (
                                <div key={bookId}>
                                    <h2 className="text-2xl font-black text-slate-900 dark:text-slate-100 mb-4 flex items-center gap-3">
                                        <BookOpen className="text-indigo-600" />
                                        {notes[0].book?.title || 'Bilinmeyen Kitap'}
                                    </h2>
                                    <div className="space-y-5">
                                        {notes.map(renderNoteCard)}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="space-y-5">
                        {filteredNotes.length === 0 ? (
                            <div className="text-center py-12 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-700">
                                <FileText size={48} className="mx-auto mb-4 text-slate-300 dark:text-slate-600" />
                                <p className="text-slate-600 dark:text-slate-300 font-medium">
                                    {searchQuery || filterType !== 'all' || filterTag || filterCategory
                                        ? 'Bu filtreler için not bulunamadı'
                                        : 'Henüz not eklemediniz'}
                                </p>
                            </div>
                        ) : (
                            filteredNotes.map(renderNoteCard)
                        )}
                    </div>
                )}
            </div>
        </Layout>
    );
};
