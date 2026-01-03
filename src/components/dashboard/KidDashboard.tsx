import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Rocket, Gem, Star, Trophy, Map as MapIcon, ChevronRight } from 'lucide-react';
import { useBooks } from '../../hooks/useBooks';
import { useAuth } from '../../hooks/useAuth';
import { useKidProfile } from '../../hooks/useKidProfile';

export const KidDashboard: React.FC = () => {
    const navigate = useNavigate();
    const { books, isLoading: booksLoading } = useBooks();
    const { user } = useAuth();
    const { profile, isLoading: profileLoading } = useKidProfile();

    const activeBooks = books?.filter(b => b.status === 'reading') || [];
    const isLoading = booksLoading || profileLoading;

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center p-20 animate-pulse">
                <Rocket className="text-orange-400 mb-4 animate-bounce" size={48} />
                <p className="text-orange-600 font-black italic">Maceraya Hazırlanıyor...</p>
            </div>
        );
    }

    return (
        <div className="space-y-8 pb-12">
            {/* Kid Header */}
            <div className="bg-gradient-to-r from-orange-400 to-pink-500 rounded-[2.5rem] p-8 text-white shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-20 rotate-12">
                    <Trophy size={120} />
                </div>
                <div className="relative z-10 flex flex-col md:flex-row items-center gap-6">
                    <div className="w-24 h-24 bg-white/20 backdrop-blur-xl rounded-full flex items-center justify-center border-4 border-white/30 shadow-inner">
                        <Rocket size={48} />
                    </div>
                    <div className="text-center md:text-left">
                        <h2 className="text-3xl font-black italic mb-1">Merhaba, Maceracı! 👋</h2>
                        <p className="text-orange-100 font-bold">Bugün seviye {profile?.kid_level || 1} gezegenindeyiz!</p>
                        <div className="flex flex-wrap gap-3 mt-4">
                            <div className="bg-white/20 backdrop-blur-md px-4 py-1.5 rounded-full flex items-center gap-2 border border-white/20">
                                <Star size={16} className="fill-yellow-400 text-yellow-400" />
                                <span className="font-black">{profile?.xp || 0} XP</span>
                            </div>
                            <div className="bg-white/20 backdrop-blur-md px-4 py-1.5 rounded-full flex items-center gap-2 border border-white/20">
                                <Gem size={16} className="fill-blue-400 text-blue-400" />
                                <span className="font-black">{profile?.gold || 0} Altın</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* The Map (Super Mario Style Path) */}
            <div className="relative pt-10 px-4">
                <div className="absolute left-1/2 -translate-x-1/2 top-0 bottom-0 w-4 bg-orange-100 dark:bg-orange-900/30 rounded-full"></div>

                <div className="space-y-24 relative z-10">
                    {activeBooks.length === 0 ? (
                        <div className="bg-white dark:bg-slate-800 rounded-3xl p-10 text-center border-4 border-dashed border-orange-200 dark:border-orange-800">
                            <div className="bg-orange-100 dark:bg-orange-900/30 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                                <MapIcon size={40} className="text-orange-500" />
                            </div>
                            <h3 className="text-xl font-black text-slate-900 dark:text-slate-100 mb-2">Henüz Bir Görevin Yok!</h3>
                            <p className="text-slate-500 dark:text-slate-400 font-bold mb-6">Kütüphaneden bir kitap seçip okumaya başlayarak ilk gezegenini oluştur!</p>
                            <button
                                onClick={() => navigate('/library')}
                                className="bg-orange-500 hover:bg-orange-600 text-white font-black px-8 py-4 rounded-2xl shadow-xl shadow-orange-500/20 transition-all flex items-center gap-2 mx-auto active:scale-95"
                            >
                                Hazinelerime Git <ChevronRight size={20} />
                            </button>
                        </div>
                    ) : (
                        activeBooks.map((book, index) => {
                            const progress = Math.round((book.current_page / book.total_pages) * 100);
                            const isLeft = index % 2 === 0;

                            return (
                                <div
                                    key={book.id}
                                    className={`flex items-center ${isLeft ? 'flex-row' : 'flex-row-reverse'} gap-8 md:gap-16`}
                                >
                                    {/* Planet/Book Icon */}
                                    <button
                                        onClick={() => navigate(`/book/${book.id}`)}
                                        className={`flex-shrink-0 relative group transition-all duration-500 transform hover:scale-110 active:scale-90`}
                                    >
                                        <div className={`w-28 h-28 sm:w-36 sm:h-36 rounded-full flex items-center justify-center p-1 sm:p-2 border-4 sm:border-8 border-white dark:border-slate-800 shadow-2xl relative overflow-hidden transition-all duration-500 ${index % 3 === 0 ? 'bg-gradient-to-tr from-orange-400 to-yellow-300' :
                                            index % 3 === 1 ? 'bg-gradient-to-tr from-purple-500 to-pink-400' :
                                                'bg-gradient-to-tr from-blue-500 to-emerald-400'
                                            }`}>
                                            {book.cover_url ? (
                                                <img src={book.cover_url} alt="" className="w-full h-full object-cover rounded-full opacity-60 mix-blend-overlay" />
                                            ) : (
                                                <Rocket className="text-white" size={48} />
                                            )}

                                            {/* Progress Ring */}
                                            <div className="absolute inset-0 p-1.5 sm:p-3">
                                                <svg className="w-full h-full -rotate-90">
                                                    <circle
                                                        cx="50%"
                                                        cy="50%"
                                                        r="45%"
                                                        fill="none"
                                                        stroke="rgba(255,255,255,0.2)"
                                                        strokeWidth="8"
                                                    />
                                                    <circle
                                                        cx="50%"
                                                        cy="50%"
                                                        r="45%"
                                                        fill="none"
                                                        stroke="white"
                                                        strokeWidth="8"
                                                        strokeDasharray="283"
                                                        strokeDashoffset={283 - (283 * progress) / 100}
                                                        strokeLinecap="round"
                                                        className="transition-all duration-1000 ease-out"
                                                    />
                                                </svg>
                                            </div>

                                            <div className="absolute inset-0 flex items-center justify-center">
                                                <span className="text-2xl sm:text-3xl font-black text-white drop-shadow-lg">%{progress}</span>
                                            </div>
                                        </div>

                                        {/* Avatar indicator for current book if active */}
                                        {index === 0 && (
                                            <div className="absolute -top-12 sm:-top-16 left-1/2 -translate-x-1/2 flex flex-col items-center">
                                                <div className="bg-white dark:bg-slate-800 px-3 sm:px-4 py-1 sm:py-2 rounded-full shadow-lg border-2 border-orange-400 mb-2">
                                                    <span className="text-xs sm:text-sm font-black whitespace-nowrap">Buradasın! 📍</span>
                                                </div>
                                                <div className="animate-bounce">
                                                    <Rocket className="text-orange-500" size={32} />
                                                </div>
                                            </div>
                                        )}
                                    </button>

                                    {/* Book Info Cloud */}
                                    <div className={`flex-1 max-w-[200px] sm:max-w-xs ${isLeft ? 'text-left' : 'text-right'}`}>
                                        <h4 className="text-lg sm:text-xl font-black text-slate-800 dark:text-slate-100 line-clamp-2 leading-tight mb-2">
                                            {book.title}
                                        </h4>
                                        <p className="text-xs sm:text-sm font-bold text-slate-500 dark:text-slate-400">
                                            {book.current_page} / {book.total_pages} sayfa keşfedildi!
                                        </p>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>

            {/* Legend / Info */}
            {activeBooks.length > 0 && (
                <div className="bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm p-6 rounded-[2rem] border-2 border-orange-100 dark:border-orange-900/30 text-center">
                    <p className="text-sm font-bold text-slate-600 dark:text-slate-400">
                        Her sayfa okuduğunda avatarın gezegende ilerler! <br />
                        Tüm gezegeni keşfettiğinde büyük bir kutlama seni bekliyor! 🎉
                    </p>
                </div>
            )}
        </div>
    );
};
