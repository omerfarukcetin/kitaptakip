import React, { useState, useEffect } from 'react';
import { Sparkles, RefreshCw, BookMarked, ArrowRight, Loader2 } from 'lucide-react';
import { getBookRecommendations } from '../../lib/gemini';
import { useBooks } from '../../hooks/useBooks';

interface Recommendation {
    title: string;
    author: string;
    reason: string;
    category: string;
}

export const BookRecommendations: React.FC = () => {
    const { books } = useBooks();
    const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchRecommendations = async (force = false) => {
        if (!books || books.length < 3) return;

        // Check cache
        const cached = localStorage.getItem('ai_recommendations');
        const cacheTime = localStorage.getItem('ai_recommendations_time');
        const now = Date.now();

        if (!force && cached && cacheTime && now - Number(cacheTime) < 24 * 60 * 60 * 1000) {
            setRecommendations(JSON.parse(cached));
            return;
        }

        setIsLoading(true);
        setError(null);
        try {
            const contextBooks = books.map(b => ({
                title: b.title,
                author: b.author,
                categories: b.categories
            }));

            const data = await getBookRecommendations(contextBooks);
            setRecommendations(data.recommendations);
            localStorage.setItem('ai_recommendations', JSON.stringify(data.recommendations));
            localStorage.setItem('ai_recommendations_time', String(now));
        } catch (err: any) {
            console.error('Öneri hatası:', err);
            setError('Öneriler alınırken bir sorun oluştu.');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchRecommendations();
    }, [books?.length]);

    if (!books || books.length < 3) return null;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                    <div className="p-2 bg-indigo-600 rounded-xl text-white shadow-lg shadow-indigo-200 dark:shadow-none">
                        <Sparkles size={20} />
                    </div>
                    <h2 className="text-xl font-black text-slate-900 dark:text-slate-100 uppercase tracking-tighter">Senin İçin Seçtiklerimiz</h2>
                </div>
                <button
                    onClick={() => fetchRecommendations(true)}
                    disabled={isLoading}
                    className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-xl transition-all disabled:opacity-50"
                    title="Önerileri Yenile"
                >
                    {isLoading ? <Loader2 size={20} className="animate-spin" /> : <RefreshCw size={20} />}
                </button>
            </div>

            {error ? (
                <div className="p-6 bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/20 rounded-3xl text-red-600 dark:text-red-400 text-sm font-bold text-center">
                    {error}
                </div>
            ) : isLoading && recommendations.length === 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="bg-white dark:bg-slate-800 rounded-3xl p-6 border border-slate-100 dark:border-slate-800 animate-pulse h-48">
                            <div className="h-4 w-24 bg-slate-100 dark:bg-slate-700 rounded-full mb-4"></div>
                            <div className="h-6 w-full bg-slate-100 dark:bg-slate-700 rounded-full mb-2"></div>
                            <div className="h-4 w-2/3 bg-slate-50 dark:bg-slate-800 rounded-full mb-6"></div>
                            <div className="h-10 w-full bg-slate-50 dark:bg-slate-800 rounded-xl"></div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {recommendations.map((rec, i) => (
                        <div
                            key={i}
                            className="group bg-white dark:bg-slate-800 rounded-3xl p-6 shadow-sm hover:shadow-xl transition-all border border-slate-100 dark:border-slate-700 flex flex-col relative overflow-hidden"
                        >
                            {/* Category Badge */}
                            <span className="inline-block px-3 py-1 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 text-[10px] font-black uppercase tracking-widest rounded-full mb-3 self-start">
                                {rec.category}
                            </span>

                            <h3 className="text-lg font-black text-slate-900 dark:text-slate-100 leading-tight mb-1 group-hover:text-indigo-600 transition-colors">
                                {rec.title}
                            </h3>
                            <p className="text-sm text-slate-500 dark:text-slate-400 font-bold mb-4">{rec.author}</p>

                            <p className="text-xs text-slate-600 dark:text-slate-300 font-medium leading-relaxed italic mb-6">
                                "{rec.reason}"
                            </p>

                            <a
                                href={`https://www.google.com/search?q=${encodeURIComponent(rec.title + ' ' + rec.author + ' kitap')}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="mt-auto flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-900/50 rounded-2xl group/btn hover:bg-indigo-600 hover:text-white transition-all text-slate-600 dark:text-slate-400"
                            >
                                <span className="text-xs font-black uppercase">İncele</span>
                                <ArrowRight size={16} className="group-hover/btn:translate-x-1 transition-transform" />
                            </a>

                            <div className="absolute -right-4 -bottom-4 opacity-5 pointer-events-none group-hover:scale-110 transition-transform">
                                <BookMarked size={100} />
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};
