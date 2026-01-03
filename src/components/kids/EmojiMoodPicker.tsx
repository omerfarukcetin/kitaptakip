import React from 'react';

const MOODS = [
    { emoji: '🤩', label: 'Harika' },
    { emoji: '😊', label: 'Mutlu' },
    { emoji: '🤔', label: 'Düşünceli' },
    { emoji: '😴', label: 'Yorgun' },
    { emoji: '🤯', label: 'Şaşırmış' },
];

interface EmojiMoodPickerProps {
    selectedMood: string | null;
    onSelect: (mood: string) => void;
}

export const EmojiMoodPicker: React.FC<EmojiMoodPickerProps> = ({ selectedMood, onSelect }) => {
    return (
        <div className="flex flex-col items-center gap-4">
            <p className="text-lg font-black text-slate-800 dark:text-slate-100 italic text-center">
                Bu kitabı okurken nasıl hissettin? ✨
            </p>
            <div className="flex flex-wrap justify-center gap-4">
                {MOODS.map((m) => (
                    <button
                        key={m.label}
                        onClick={() => onSelect(m.emoji)}
                        className={`flex flex-col items-center gap-2 p-4 rounded-[2rem] transition-all duration-300 transform hover:scale-110 active:scale-90 ${selectedMood === m.emoji
                                ? 'bg-orange-500 text-white shadow-xl shadow-orange-500/30 ring-4 ring-orange-200 dark:ring-orange-900/40'
                                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-orange-50 dark:hover:bg-orange-900/20'
                            }`}
                    >
                        <span className="text-4xl">{m.emoji}</span>
                        <span className="text-xs font-black uppercase tracking-widest">{m.label}</span>
                    </button>
                ))}
            </div>
        </div>
    );
};
