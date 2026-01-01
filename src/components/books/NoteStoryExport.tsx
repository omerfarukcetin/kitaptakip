import React, { useRef, useState } from 'react';
import html2canvas from 'html2canvas';
import { Download, Share2, Palette, X, Maximize2, Square } from 'lucide-react';
import type { BookNote } from '../../lib/database.types';

interface NoteStoryExportProps {
    note: BookNote;
    bookTitle: string;
    bookAuthor?: string;
    bookCoverUrl?: string;
}

type ThemeStyle = {
    name: string;
    background: string;
    textColor: string;
    glassColor: string;
    borderColor: string;
    tagColor: string;
};

const themes: ThemeStyle[] = [
    {
        name: 'Gökkuşağı',
        background: 'from-indigo-600 via-purple-600 to-pink-600',
        textColor: 'text-white',
        glassColor: 'bg-white/15',
        borderColor: 'border-white/30',
        tagColor: 'bg-white/25'
    },
    {
        name: 'Karanlık',
        background: 'from-slate-900 to-slate-800',
        textColor: 'text-slate-100',
        glassColor: 'bg-slate-800/50',
        borderColor: 'border-slate-700',
        tagColor: 'bg-slate-700'
    },
    {
        name: 'Doğa',
        background: 'from-emerald-600 to-teal-700',
        textColor: 'text-white',
        glassColor: 'bg-white/10',
        borderColor: 'border-white/20',
        tagColor: 'bg-white/20'
    },
    {
        name: 'Minimal',
        background: 'from-slate-50 to-white',
        textColor: 'text-slate-900',
        glassColor: 'bg-slate-100/50',
        borderColor: 'border-slate-200',
        tagColor: 'bg-slate-200'
    },
    {
        name: 'Gün Batımı',
        background: 'from-orange-500 via-red-500 to-pink-600',
        textColor: 'text-white',
        glassColor: 'bg-white/15',
        borderColor: 'border-white/30',
        tagColor: 'bg-white/25'
    },
    {
        name: 'Asil Siyah',
        background: 'from-black to-slate-900',
        textColor: 'text-white',
        glassColor: 'bg-white/5',
        borderColor: 'border-white/10',
        tagColor: 'bg-white/15'
    },
    {
        name: 'Okyanus',
        background: 'from-blue-600 to-indigo-800',
        textColor: 'text-white',
        glassColor: 'bg-white/10',
        borderColor: 'border-white/20',
        tagColor: 'bg-white/20'
    },
    {
        name: 'Antik',
        background: 'from-amber-100 to-orange-100',
        textColor: 'text-amber-900',
        glassColor: 'bg-white/40',
        borderColor: 'border-amber-200',
        tagColor: 'bg-amber-200'
    },
];

export const NoteStoryExport: React.FC<NoteStoryExportProps> = ({
    note,
    bookTitle,
    bookAuthor,
    bookCoverUrl,
}) => {
    const storyRef = useRef<HTMLDivElement>(null);
    const [showModal, setShowModal] = useState(false);
    const [selectedTheme, setSelectedTheme] = useState(themes[0]);
    const [format, setFormat] = useState<'story' | 'square'>('story');

    const handleExport = async () => {
        if (!storyRef.current) return;

        try {
            const canvas = await html2canvas(storyRef.current, {
                backgroundColor: null,
                scale: 2,
                width: format === 'story' ? 1080 : 1080,
                height: format === 'story' ? 1920 : 1080,
            });

            const link = document.createElement('a');
            link.download = `${bookTitle.replace(/[^a-z0-9]/gi, '_')}-not-${Date.now()}.png`;
            link.href = canvas.toDataURL();
            link.click();
            setShowModal(false);
        } catch (error) {
            console.error('Export error:', error);
            alert('Görsel oluşturulurken hata oluştu');
        }
    };

    const getNoteTypeLabel = (type: string) => {
        switch (type) {
            case 'quote': return '💬 Alıntı';
            case 'thought': return '💡 Düşünce';
            case 'summary': return '📄 Özet';
            default: return 'Not';
        }
    };

    return (
        <>
            <button
                onClick={() => setShowModal(true)}
                className="flex items-center gap-2 px-3 py-1.5 bg-indigo-50 dark:bg-indigo-900/30 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 rounded-lg font-bold text-sm transition-all"
                title="Paylaşım kartı oluştur"
            >
                <Share2 size={14} />
                Paylaş
            </button>

            {/* Customization Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl max-w-4xl w-full p-8 max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between mb-8">
                            <div>
                                <h3 className="text-2xl font-black text-slate-900 dark:text-slate-100">Paylaşım Kartı Tasarımı</h3>
                                <p className="text-slate-600 dark:text-slate-400 text-sm mt-1">Tema ve format seçerek görselini oluştur</p>
                            </div>
                            <button
                                onClick={() => setShowModal(false)}
                                className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                            >
                                <X size={24} />
                            </button>
                        </div>

                        <div className="grid lg:grid-cols-[1fr_400px] gap-8">
                            {/* Controls */}
                            <div className="space-y-8">
                                {/* Format Selection */}
                                <div>
                                    <label className="text-sm font-black text-slate-700 dark:text-slate-300 mb-4 block uppercase tracking-wider">
                                        Görünüm Formatı
                                    </label>
                                    <div className="grid grid-cols-2 gap-4">
                                        <button
                                            onClick={() => setFormat('story')}
                                            className={`flex items-center justify-center gap-3 p-4 rounded-2xl border-2 transition-all ${format === 'story'
                                                    ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400'
                                                    : 'border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-500'
                                                }`}
                                        >
                                            <Maximize2 size={20} />
                                            <span className="font-bold">Story (9:16)</span>
                                        </button>
                                        <button
                                            onClick={() => setFormat('square')}
                                            className={`flex items-center justify-center gap-3 p-4 rounded-2xl border-2 transition-all ${format === 'square'
                                                    ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400'
                                                    : 'border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-500'
                                                }`}
                                        >
                                            <Square size={20} />
                                            <span className="font-bold">Kare (1:1)</span>
                                        </button>
                                    </div>
                                </div>

                                {/* Theme Selection */}
                                <div>
                                    <label className="text-sm font-black text-slate-700 dark:text-slate-300 mb-4 block uppercase tracking-wider">
                                        Tema Seçimi
                                    </label>
                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                        {themes.map((theme, idx) => (
                                            <button
                                                key={idx}
                                                onClick={() => setSelectedTheme(theme)}
                                                className={`relative h-20 rounded-xl bg-gradient-to-br ${theme.background} transition-all ${selectedTheme.name === theme.name
                                                        ? 'ring-4 ring-indigo-500 scale-105 shadow-lg'
                                                        : 'hover:scale-105'
                                                    }`}
                                            >
                                                {selectedTheme.name === theme.name && (
                                                    <div className="absolute inset-0 flex items-center justify-center">
                                                        <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center border-2 border-indigo-600">
                                                            <div className="w-2.5 h-2.5 bg-indigo-600 rounded-full"></div>
                                                        </div>
                                                    </div>
                                                )}
                                                <p className={`absolute bottom-1 left-0 right-0 text-center text-[10px] font-black uppercase tracking-tighter ${theme.textColor} drop-shadow-md`}>
                                                    {theme.name}
                                                </p>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Action Buttons */}
                                <div className="flex gap-4 pt-4 border-t border-slate-100 dark:border-slate-700">
                                    <button
                                        onClick={() => setShowModal(false)}
                                        className="flex-1 px-6 py-4 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 font-bold rounded-2xl transition-all"
                                    >
                                        İptal
                                    </button>
                                    <button
                                        onClick={handleExport}
                                        className="flex-[2] px-6 py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-200 dark:shadow-none"
                                    >
                                        <Download size={20} />
                                        Görseli İndir
                                    </button>
                                </div>
                            </div>

                            {/* Preview Window */}
                            <div className="flex items-center justify-center bg-slate-50 dark:bg-slate-900/50 rounded-[2rem] p-8 border-2 border-dashed border-slate-200 dark:border-slate-700">
                                <div className={`relative transition-all duration-500 shadow-2xl overflow-hidden rounded-2xl ${format === 'story' ? 'aspect-[9/16] w-[280px]' : 'aspect-square w-[320px]'
                                    }`}>
                                    <div className={`absolute inset-0 bg-gradient-to-br ${selectedTheme.background} p-6 flex flex-col justify-between`}>
                                        <div className={selectedTheme.textColor}>
                                            <div className="text-xl font-black mb-1">{getNoteTypeLabel(note.note_type)}</div>
                                            {note.page_number && (
                                                <div className="text-sm opacity-80 font-bold">Sayfa {note.page_number}</div>
                                            )}
                                        </div>

                                        <div className="flex-1 flex items-center justify-center">
                                            <div className={`${selectedTheme.glassColor} backdrop-blur-md rounded-2xl p-5 border-2 ${selectedTheme.borderColor} shadow-xl`}>
                                                <p className={`${selectedTheme.textColor} ${format === 'story' ? 'text-lg' : 'text-base'} font-bold text-center leading-relaxed line-clamp-[8]`}>
                                                    {note.content}
                                                </p>
                                            </div>
                                        </div>

                                        <div className={`${selectedTheme.textColor} text-center`}>
                                            <div className={`${selectedTheme.glassColor} backdrop-blur-sm rounded-xl p-4 border-2 ${selectedTheme.borderColor}`}>
                                                <div className={`${format === 'story' ? 'text-xl' : 'text-lg'} font-black leading-tight mb-1`}>{bookTitle}</div>
                                                {bookAuthor && (
                                                    <div className="text-sm opacity-90 font-bold">{bookAuthor}</div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Hidden Export Template */}
            <div className="fixed -left-[9999px] top-0">
                <div
                    ref={storyRef}
                    className={`bg-gradient-to-br ${selectedTheme.background} p-20 flex flex-col justify-between ${format === 'story' ? 'w-[1080px] h-[1920px]' : 'w-[1080px] h-[1080px]'
                        }`}
                    style={{ fontFamily: 'Inter, system-ui, sans-serif' }}
                >
                    <div className={selectedTheme.textColor}>
                        <div className={`${format === 'story' ? 'text-6xl' : 'text-5xl'} font-black mb-6`}>{getNoteTypeLabel(note.note_type)}</div>
                        {note.page_number && (
                            <div className={`${format === 'story' ? 'text-4xl' : 'text-3xl'} opacity-90 font-semibold`}>Sayfa {note.page_number}</div>
                        )}
                    </div>

                    <div className="flex-1 flex items-center justify-center px-12">
                        <div className={`${selectedTheme.glassColor} backdrop-blur-xl rounded-[3rem] p-20 border-[6px] ${selectedTheme.borderColor} shadow-2xl`}>
                            <p className={`${selectedTheme.textColor} ${format === 'story' ? 'text-6xl' : 'text-5xl'} leading-relaxed font-bold text-center`}>
                                {note.content}
                            </p>
                        </div>
                    </div>

                    <div className={`${selectedTheme.textColor} text-center`}>
                        {bookCoverUrl && format === 'story' && (
                            <div className="flex justify-center mb-10">
                                <img
                                    src={bookCoverUrl}
                                    alt={bookTitle}
                                    className="w-64 h-96 object-cover rounded-3xl shadow-2xl border-8 border-white/40"
                                />
                            </div>
                        )}
                        <div className={`${selectedTheme.glassColor} backdrop-blur-lg rounded-[2.5rem] p-12 border-[5px] ${selectedTheme.borderColor} shadow-xl mb-6`}>
                            <div className={`${format === 'story' ? 'text-6xl' : 'text-5xl'} font-black leading-tight mb-4`}>{bookTitle}</div>
                            {bookAuthor && (
                                <div className={`${format === 'story' ? 'text-4xl' : 'text-3xl'} opacity-95 font-bold`}>{bookAuthor}</div>
                            )}
                        </div>
                        {(note.tags && note.tags.length > 0) && (
                            <div className="flex flex-wrap gap-4 justify-center">
                                {note.tags.map((tag, i) => (
                                    <span
                                        key={i}
                                        className={`px-8 py-4 ${selectedTheme.tagColor} backdrop-blur-md rounded-3xl ${format === 'story' ? 'text-3xl' : 'text-2xl'} font-black border-2 ${selectedTheme.borderColor}`}
                                    >
                                        #{tag}
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
};
