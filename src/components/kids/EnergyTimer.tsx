import React, { useState, useEffect, useRef } from 'react';
import { Rocket, Gem, Trophy, Play, Pause, X, Star } from 'lucide-react';

interface EnergyTimerProps {
    durationMinutes?: number;
    onFinish: (durationSeconds: number) => void;
    onCancel: () => void;
    bookTitle: string;
}

export const EnergyTimer: React.FC<EnergyTimerProps> = ({
    durationMinutes = 20,
    onFinish,
    onCancel,
    bookTitle
}) => {
    const [timeLeft, setTimeLeft] = useState(durationMinutes * 60);
    const [isActive, setIsActive] = useState(true);
    const [isFinished, setIsFinished] = useState(false);
    const totalSeconds = durationMinutes * 60;

    // Character walking progress (0 to 100)
    const progress = ((totalSeconds - timeLeft) / totalSeconds) * 100;

    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (isActive && timeLeft > 0) {
            interval = setInterval(() => {
                setTimeLeft((prev) => prev - 1);
            }, 1000);
        } else if (timeLeft === 0 && !isFinished) {
            setIsFinished(true);
            setIsActive(false);
        }
        return () => clearInterval(interval);
    }, [isActive, timeLeft, isFinished]);

    const handleFinish = () => {
        onFinish(totalSeconds - timeLeft);
    };

    return (
        <div className="fixed inset-0 z-50 bg-gradient-to-b from-indigo-600 to-purple-700 flex flex-col items-center justify-between p-8 text-white overflow-hidden">
            {/* Background Decorations */}
            <div className="absolute top-10 left-10 opacity-20 animate-pulse">
                <Star size={40} className="fill-yellow-400" />
            </div>
            <div className="absolute bottom-40 right-10 opacity-20 animate-bounce">
                <Star size={60} className="fill-yellow-400" />
            </div>

            {/* Header */}
            <div className="w-full max-w-2xl flex justify-between items-center z-10">
                <div className="bg-white/10 backdrop-blur-md px-6 py-3 rounded-2xl border border-white/10">
                    <p className="text-[10px] font-black uppercase tracking-widest opacity-60">Görev</p>
                    <p className="text-xl font-black italic truncate max-w-[200px]">{bookTitle}</p>
                </div>
                <button
                    onClick={onCancel}
                    className="p-4 bg-white/10 hover:bg-red-500/50 rounded-2xl transition-all"
                >
                    <X size={24} />
                </button>
            </div>

            {/* Main World */}
            <div className="relative w-full max-w-4xl flex-1 flex flex-col items-center justify-center">

                {!isFinished ? (
                    <>
                        <div className="text-center mb-12">
                            <h2 className="text-3xl sm:text-4xl font-black mb-4 italic">Enerji Toplanıyor... ⚡</h2>
                            <p className="text-indigo-100 font-bold">Okumaya devam et, karakterin sandığa ulaşsın!</p>
                        </div>

                        {/* Walking Path */}
                        <div className="w-full relative h-40 flex items-end px-10">
                            {/* The Path Line */}
                            <div className="absolute bottom-4 left-10 right-10 h-4 bg-white/20 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-yellow-400 shadow-[0_0_15px_rgba(250,204,21,0.5)] transition-all duration-1000"
                                    style={{ width: `${progress}%` }}
                                />
                            </div>

                            {/* Character */}
                            <div
                                className="absolute bottom-8 transition-all duration-1000 ease-linear flex flex-col items-center"
                                style={{ left: `calc(${progress}% + 40px)`, transform: 'translateX(-50%)' }}
                            >
                                <div className="bg-white dark:bg-slate-800 text-indigo-600 px-3 py-1 rounded-full text-xs font-black mb-2 shadow-lg animate-bounce">
                                    Az Kaldı! 🚀
                                </div>
                                <div className="text-orange-400 filter drop-shadow-[0_5px_15px_rgba(0,0,0,0.3)]">
                                    <Rocket size={64} className={isActive ? 'animate-pulse rotate-45' : ''} />
                                </div>
                            </div>

                            {/* Treasure Chest */}
                            <div className="absolute bottom-6 right-10 flex flex-col items-center">
                                <Trophy size={80} className={`${progress >= 95 ? 'text-yellow-400 animate-tada' : 'text-white/40'}`} />
                                <span className="mt-2 font-black text-sm uppercase">Hazine!</span>
                            </div>
                        </div>

                        <div className="mt-16 bg-white/10 backdrop-blur-xl p-8 rounded-[3rem] border-2 border-white/20 shadow-2xl">
                            <div className="text-7xl font-mono font-black tracking-tighter mb-8">
                                {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
                            </div>
                            <div className="flex gap-4">
                                <button
                                    onClick={() => setIsActive(!isActive)}
                                    className={`flex-1 px-8 py-5 rounded-3xl font-black text-xl transition-all flex items-center justify-center gap-3 ${isActive ? 'bg-white/10 text-white' : 'bg-yellow-400 text-indigo-900 shadow-xl'
                                        }`}
                                >
                                    {isActive ? <><Pause /> Duraklat</> : <><Play /> Devam Et</>}
                                </button>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="text-center space-y-8 animate-in zoom-in duration-500">
                        <div className="relative">
                            <Trophy size={160} className="text-yellow-400 mx-auto drop-shadow-[0_0_30px_rgba(250,204,21,0.5)]" />
                            <div className="absolute inset-0 animate-ping opacity-20 bg-yellow-400 rounded-full scale-150"></div>
                        </div>
                        <div>
                            <h2 className="text-5xl font-black italic mb-4">MUAZZAM! 🎉</h2>
                            <p className="text-xl text-indigo-100 font-bold">Harika bir okuma macerası tamamladın!</p>
                        </div>
                        <div className="flex justify-center gap-6">
                            <div className="bg-white/10 backdrop-blur-md px-8 py-6 rounded-3xl border border-white/20">
                                <p className="text-sm font-black opacity-60 uppercase mb-1">Kazanılan</p>
                                <div className="flex items-center gap-3">
                                    <Gem className="text-blue-400" size={32} />
                                    <span className="text-4xl font-black">20 Altın</span>
                                </div>
                            </div>
                            <div className="bg-white/10 backdrop-blur-md px-8 py-6 rounded-3xl border border-white/20">
                                <p className="text-sm font-black opacity-60 uppercase mb-1">Tecrübe</p>
                                <div className="flex items-center gap-3">
                                    <Star className="text-yellow-400 fill-yellow-400" size={32} />
                                    <span className="text-4xl font-black">50 XP</span>
                                </div>
                            </div>
                        </div>
                        <button
                            onClick={handleFinish}
                            className="bg-white text-indigo-600 px-12 py-6 rounded-[2.5rem] font-black text-2xl shadow-2xl hover:scale-110 active:scale-95 transition-all"
                        >
                            Ödüllerimi Al! ✨
                        </button>
                    </div>
                )}
            </div>

            {/* Footer Tip */}
            {!isFinished && (
                <div className="w-full text-center opacity-40 font-black tracking-widest text-xs uppercase mb-4">
                    Görev Tamamlandığında Otomatik Altın Kazanırsın
                </div>
            )}
        </div>
    );
};
