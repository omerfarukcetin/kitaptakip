import React, { useState } from 'react';
import { Plus, Quote, Lightbulb, FileText, Trash2, Tag, Edit2, Check, X, Camera, Loader2 } from 'lucide-react';
import Tesseract from 'tesseract.js';
import { useBookNotes } from '../../hooks/useBookNotes';
import { useAllNotes } from '../../hooks/useAllNotes';
import { NoteStoryExport } from './NoteStoryExport';
import { ExportBookNotes } from './ExportBookNotes';
import { NoteLink } from '../notes/NoteLink';
import type { NoteType } from '../../lib/database.types';

interface BookNotesProps {
    bookId: string;
    bookTitle?: string;
    bookAuthor?: string;
    bookCoverUrl?: string;
}

export const BookNotes: React.FC<BookNotesProps> = ({ bookId, bookTitle = '', bookAuthor, bookCoverUrl }) => {
    const { notes, addNote, deleteNote, updateNote } = useBookNotes(bookId);
    const { notes: allNotes } = useAllNotes();
    const [showForm, setShowForm] = useState(false);
    const [noteType, setNoteType] = useState<NoteType>('quote');
    const [content, setContent] = useState('');
    const [pageNumber, setPageNumber] = useState<number | ''>('');
    const [categories, setCategories] = useState('');
    const [tags, setTags] = useState('');
    const [filterTag, setFilterTag] = useState<string | null>(null);
    const [filterCategory, setFilterCategory] = useState<string | null>(null);
    const [title, setTitle] = useState('');
    const [isProcessingOCR, setIsProcessingOCR] = useState(false);

    const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
    const [editContent, setEditContent] = useState('');
    const [editNoteType, setEditNoteType] = useState<NoteType>('quote');
    const [editPageNumber, setEditPageNumber] = useState<number | ''>('');
    const [editTags, setEditTags] = useState('');
    const [editCategories, setEditCategories] = useState('');
    const [editTitle, setEditTitle] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!content.trim()) return;

        try {
            await addNote.mutateAsync({
                book_id: bookId,
                title: title.trim() || null,
                note_type: noteType,
                content: content.trim(),
                page_number: pageNumber ? Number(pageNumber) : null,
                categories: categories ? categories.split(',').map(c => c.trim()).filter(Boolean) : null,
                tags: tags ? tags.split(',').map(t => t.trim()).filter(Boolean) : null,
            });

            // Reset form
            setTitle('');
            setContent('');
            setPageNumber('');
            setCategories('');
            setTags('');
            setShowForm(false);
        } catch (error) {
            console.error('Not eklenirken hata:', error);
            alert('Not eklenirken hata oluştu');
        }
    };

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

    const getNoteColor = (type: NoteType) => {
        switch (type) {
            case 'quote': return 'bg-indigo-50 border-indigo-200';
            case 'thought': return 'bg-amber-50 border-amber-200';
            case 'summary': return 'bg-green-50 border-green-200';
        }
    };

    // Filter notes
    const filteredNotes = notes.filter(note => {
        if (filterTag && (!note.tags || !note.tags.includes(filterTag))) return false;
        if (filterCategory && (!note.categories || !note.categories.includes(filterCategory))) return false;
        return true;
    });

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

    const handleOCR = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsProcessingOCR(true);
        try {
            const worker = await Tesseract.createWorker('tur');
            const { data: { text } } = await worker.recognize(file);
            setContent(prev => prev + (prev ? '\n' : '') + text.trim());
            await worker.terminate();
        } catch (error) {
            console.error('OCR Hatası:', error);
            alert('Metin tarama sırasında bir hata oluştu.');
        } finally {
            setIsProcessingOCR(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h3 className="text-lg sm:text-xl font-black text-slate-900 dark:text-slate-100">Notlar</h3>
                    {(filterTag || filterCategory) && (
                        <div className="flex gap-2 mt-2">
                            {filterTag && (
                                <span className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-lg text-sm font-bold flex items-center gap-2">
                                    #{filterTag}
                                    <button onClick={() => setFilterTag(null)} className="hover:text-indigo-900">×</button>
                                </span>
                            )}
                            {filterCategory && (
                                <span className="px-3 py-1 bg-green-100 text-green-700 rounded-lg text-sm font-bold flex items-center gap-2">
                                    📁 {filterCategory}
                                    <button onClick={() => setFilterCategory(null)} className="hover:text-green-900">×</button>
                                </span>
                            )}
                        </div>
                    )}
                </div>
                <div className="flex items-center gap-2">
                    <ExportBookNotes notes={notes} bookTitle={bookTitle} bookAuthor={bookAuthor} />
                    <button
                        onClick={() => setShowForm(!showForm)}
                        className="flex items-center gap-2 px-3 py-2 sm:px-4 sm:py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-all text-xs sm:text-sm"
                    >
                        <Plus size={16} />
                        Not Ekle
                    </button>
                </div>
            </div>

            {/* Add Note Form */}
            {showForm && (
                <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 shadow-xl border border-slate-100 dark:border-slate-700">
                    <h3 className="text-xl font-black text-slate-900 dark:text-slate-100 mb-6 flex items-center gap-3">
                        <Plus className="text-indigo-600" />
                        Yeni Not Ekle
                    </h3>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="p-6 space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-black text-slate-700 mb-2 uppercase tracking-wider">
                                        Başlık (Opsiyonel)
                                    </label>
                                    <input
                                        type="text"
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                        placeholder="Örn: Karakter Analizi"
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 text-sm font-medium"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-black text-slate-700 mb-2 uppercase tracking-wider">
                                        Not Türü
                                    </label>
                                    <div className="grid grid-cols-3 gap-2">
                                        {(['quote', 'thought', 'summary'] as NoteType[]).map((type) => (
                                            <button
                                                key={type}
                                                type="button"
                                                onClick={() => setNoteType(type)}
                                                className={`px-3 py-2 text-sm font-black rounded-xl border transition-all ${noteType === type
                                                    ? 'bg-indigo-600 border-indigo-600 text-white shadow-md scale-105'
                                                    : 'bg-white border-slate-200 text-slate-500 hover:border-indigo-300'
                                                    }`}
                                            >
                                                {getNoteLabel(type)}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div>
                                <div className="flex justify-between items-center mb-2">
                                    <label className="block text-sm font-black text-slate-700 uppercase tracking-wider">
                                        Not İçeriği
                                    </label>
                                    <label className="flex items-center gap-2 px-3 py-1 bg-indigo-50 text-indigo-600 rounded-lg text-xs font-black cursor-pointer hover:bg-indigo-100 transition-all">
                                        {isProcessingOCR ? (
                                            <Loader2 size={14} className="animate-spin" />
                                        ) : (
                                            <Camera size={14} />
                                        )}
                                        {isProcessingOCR ? 'Taranıyor...' : 'Görselden Tara'}
                                        <input
                                            type="file"
                                            accept="image/*"
                                            capture="environment"
                                            onChange={handleOCR}
                                            className="hidden"
                                            disabled={isProcessingOCR}
                                        />
                                    </label>
                                </div>
                                <textarea
                                    value={content}
                                    onChange={(e) => setContent(e.target.value)}
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 min-h-[150px] text-sm font-medium resize-none"
                                    placeholder="Notunu buraya yaz veya görselden tara..."
                                    required
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <input
                                type="number"
                                placeholder="Sayfa no (opsiyonel)"
                                className="px-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-slate-900 dark:text-slate-100"
                                value={pageNumber}
                                onChange={(e) => setPageNumber(e.target.value ? parseInt(e.target.value) : '')}
                            />
                            <input
                                type="text"
                                placeholder="Kategoriler (virgülle)"
                                className="px-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-slate-900 dark:text-slate-100"
                                value={categories}
                                onChange={(e) => setCategories(e.target.value)}
                            />
                            <input
                                type="text"
                                placeholder="Etiketler (virgülle)"
                                className="px-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-slate-900 dark:text-slate-100"
                                value={tags}
                                onChange={(e) => setTags(e.target.value)}
                            />
                        </div>

                        <div className="flex gap-2">
                            <button
                                type="button"
                                onClick={() => setShowForm(false)}
                                className="flex-1 px-4 py-2 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 font-bold rounded-xl transition-all"
                            >
                                İptal
                            </button>
                            <button
                                type="submit"
                                disabled={addNote.isPending}
                                className="flex-1 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-400 dark:disabled:bg-slate-700 text-white font-bold rounded-xl transition-all"
                            >
                                {addNote.isPending ? 'Kaydediliyor...' : 'Kaydet'}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Notes List */}
            <div className="space-y-5">
                {filteredNotes.length === 0 ? (
                    <div className="text-center py-12 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-700">
                        <FileText size={48} className="mx-auto mb-4 text-slate-300 dark:text-slate-600" />
                        <p className="text-slate-600 dark:text-slate-300 font-medium">
                            {(filterTag || filterCategory) ? 'Bu filtre için not bulunamadı' : 'Henüz not eklemediniz'}
                        </p>
                        <p className="text-slate-500 dark:text-slate-400 text-sm mt-2">Alıntı, düşünce veya özet ekleyerek başlayın</p>
                    </div>
                ) : (
                    filteredNotes.map((note) => (
                        <div
                            key={note.id}
                            className="group relative bg-white dark:bg-slate-800 rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-slate-100 dark:border-slate-700"
                        >
                            {/* Gradient Accent on Left */}
                            <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${note.note_type === 'quote' ? 'bg-gradient-to-b from-indigo-500 to-purple-600' :
                                note.note_type === 'thought' ? 'bg-gradient-to-b from-amber-500 to-orange-600' :
                                    'bg-gradient-to-b from-green-500 to-emerald-600'
                                }`}></div>

                            {/* Content Container */}
                            <div className="p-5 sm:p-8 pl-8 sm:pl-10">
                                {editingNoteId === note.id ? (
                                    <div className="space-y-4">
                                        <div className="grid grid-cols-3 gap-2 p-1 bg-slate-100 dark:bg-slate-900 rounded-xl mb-4">
                                            {(['quote', 'thought', 'summary'] as NoteType[]).map((type) => (
                                                <button
                                                    key={type}
                                                    onClick={() => setEditNoteType(type)}
                                                    className={`py-2 px-3 rounded-lg text-xs font-black transition-all ${editNoteType === type
                                                        ? 'bg-white dark:bg-slate-700 shadow-sm text-indigo-600 dark:text-indigo-400'
                                                        : 'text-slate-500 hover:text-slate-700'
                                                        }`}
                                                >
                                                    {getNoteLabel(type)}
                                                </button>
                                            ))}
                                        </div>
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
                                        {/* Header */}
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
                                            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button
                                                    onClick={() => startEditing(note)}
                                                    className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all dark:hover:bg-indigo-900/30 dark:hover:text-indigo-400"
                                                >
                                                    <Edit2 size={18} />
                                                </button>
                                                <NoteStoryExport
                                                    note={note}
                                                    bookTitle={bookTitle}
                                                    bookAuthor={bookAuthor}
                                                    bookCoverUrl={bookCoverUrl}
                                                />
                                                <button
                                                    onClick={() => deleteNote.mutate(note.id)}
                                                    className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all dark:hover:bg-red-900/30 dark:hover:text-red-400"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </div>

                                        {/* Quote Content with Icon */}
                                        <div className="relative">
                                            {note.title && (
                                                <h4 className="text-lg sm:text-xl font-black text-slate-900 dark:text-slate-100 mb-2 sm:mb-3 pl-6 sm:pl-8">
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
                                            const backlinks = allNotes.filter(n =>
                                                n.id !== note.id &&
                                                note.title &&
                                                n.content.includes(`[[${note.title}]]`)
                                            );
                                            if (backlinks.length > 0) {
                                                return (
                                                    <div className="pl-8 mb-5 space-y-2">
                                                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 font-bold">Geri Bağlantılar</p>
                                                        <div className="flex flex-wrap gap-2">
                                                            {backlinks.map(bn => (
                                                                <button
                                                                    key={bn.id}
                                                                    // Since these can be from other books, navigate to Notes page with search
                                                                    onClick={() => window.location.href = `/notes?search=${encodeURIComponent(bn.title || '')}`}
                                                                    className="text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 px-2 py-1 rounded-lg hover:bg-indigo-100 transition-all border border-indigo-100 dark:border-indigo-800/50"
                                                                >
                                                                    ← {bn.title || 'Adsız Not'} {bn.book?.title ? `(${bn.book.title})` : ''}
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
                                            <div className="flex flex-wrap gap-2 mb-4">
                                                {note.categories?.map((cat, i) => (
                                                    <button
                                                        key={i}
                                                        onClick={() => setFilterCategory(cat)}
                                                        className="px-4 py-2 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 hover:from-green-100 hover:to-emerald-100 dark:hover:from-green-800/30 dark:hover:to-emerald-800/30 border border-green-200 dark:border-green-800/50 rounded-xl text-sm font-bold text-green-700 dark:text-green-400 transition-all hover:scale-105 hover:shadow-md cursor-pointer"
                                                    >
                                                        📁 {cat}
                                                    </button>
                                                ))}
                                                {note.tags?.map((tag, i) => (
                                                    <button
                                                        key={i}
                                                        onClick={() => setFilterTag(tag)}
                                                        className="px-4 py-2 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 hover:from-indigo-100 hover:to-purple-100 dark:hover:from-indigo-800/30 dark:hover:to-purple-800/30 border border-indigo-200 dark:border-indigo-800/50 rounded-xl text-sm font-bold text-indigo-700 dark:text-indigo-400 flex items-center gap-1.5 transition-all hover:scale-105 hover:shadow-md cursor-pointer"
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
                    ))
                )}
            </div>
        </div>
    );
};
