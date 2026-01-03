import React, { useState } from 'react';
import { Trophy, Star, Gem, ChevronRight, X } from 'lucide-react';
import { EmojiMoodPicker } from './EmojiMoodPicker';
import { VoiceRecorder } from './VoiceRecorder';

interface KidSessionModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (data: { mood: string; voiceUrl: string; pagesRead: number }) => void;
    pagesRead: number;
    xpEarned: number;
    goldEarned: number;
}

export const KidSessionModal: React.FC<KidSessionModalProps> = ({
    isOpen,
    onClose,
    onSave,
    pagesRead,
    xpEarned,
    goldEarned
}) => {
    const [step, setStep] = useState<'mood' | 'voice' | 'congrats'>('mood');
    const [mood, setMood] = useState<string>('');
    const [voiceUrl, setVoiceUrl] = useState<string>('');

    if (!isOpen) return null;

    const handleMoodSelect = (selectedMood: string) => {
        setMood(selectedMood);
        setStep('voice');
    };

    const handleFinish = () => {
        onSave({ mood, voiceUrl, pagesRead });
        onClose();
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-indigo-900/60 backdrop-blur-md" onClick={onClose} />

            <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-[3rem] shadow-2xl relative overflow-hidden animate-in zoom-in duration-300">
                {/* Header Decoration */}
                <div className="h-32 bg-gradient-to-r from-orange-400 to-pink-500 flex items-center justify-center relative">
                    <button
                        onClick={onClose}
                        className="absolute top-6 right-6 p-2 bg-white/20 hover:bg-white/30 rounded-full text-white transition-all"
                    >
                        <X size={20} />
                    </button>
                    <div className="bg-white/20 backdrop-blur-xl p-4 rounded-full border-4 border-white/30 shadow-inner">
                        <Trophy size={48} className="text-white" />
                    </div>
                </div>

                <div className="p-8">
                    {step === 'mood' && (
                        <div className="animate-in slide-in-from-right duration-500">
                            <EmojiMoodPicker selectedMood={mood} onSelect={handleMoodSelect} />
                        </div>
                    )}

                    {step === 'voice' && (
                        <div className="animate-in slide-in-from-right duration-500 space-y-8">
                            <VoiceRecorder onRecordingComplete={(url) => setVoiceUrl(url)} />
                            <div className="flex justify-center">
                                <button
                                    onClick={() => setStep('congrats')}
                                    className="bg-orange-500 hover:bg-orange-600 text-white font-black px-10 py-5 rounded-[2rem] shadow-xl shadow-orange-500/20 transition-all flex items-center gap-2"
                                >
                                    Kaydet ve Ödülleri Gör <ChevronRight size={24} />
                                </button>
                            </div>
                        </div>
                    )}

                    {step === 'congrats' && (
                        <div className="text-center space-y-8 animate-in zoom-in duration-500">
                            <div>
                                <h2 className="text-4xl font-black italic mb-2 text-slate-900 dark:text-slate-100">HARİKASIN! 🎉</h2>
                                <p className="text-slate-500 dark:text-slate-400 font-bold">Bugün tam {pagesRead} sayfa keşfettin!</p>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-orange-50 dark:bg-orange-950/20 p-6 rounded-3xl border-2 border-orange-100 dark:border-orange-900/30">
                                    <div className="bg-orange-500 w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-lg">
                                        <Star size={24} className="text-white fill-white" />
                                    </div>
                                    <p className="text-xs font-black text-orange-600 uppercase mb-1">Tecrübe</p>
                                    <p className="text-3xl font-black text-slate-800 dark:text-orange-200">+{xpEarned} XP</p>
                                </div>
                                <div className="bg-blue-50 dark:bg-blue-950/20 p-6 rounded-3xl border-2 border-blue-100 dark:border-blue-900/30">
                                    <div className="bg-blue-500 w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-lg">
                                        <Gem size={24} className="text-white fill-white" />
                                    </div>
                                    <p className="text-xs font-black text-blue-600 uppercase mb-1">Altın</p>
                                    <p className="text-3xl font-black text-slate-800 dark:text-blue-200">+{goldEarned}</p>
                                </div>
                            </div>

                            <button
                                onClick={handleFinish}
                                className="w-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-black py-6 rounded-[2rem] shadow-2xl hover:scale-105 transition-all text-xl active:scale-95"
                            >
                                Hazinelerime Ekle ✨
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
