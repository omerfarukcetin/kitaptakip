import React, { useState } from 'react';
import { Layout } from '../components/shared/Layout';
import { useKidProfile } from '../hooks/useKidProfile';
import { Gem, Plus, Star, Package, CheckCircle2, ShoppingBag } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useQuery } from '@tanstack/react-query';

interface Reward {
    id: string;
    user_id: string;
    title: string;
    price: number;
    icon: string | null;
    is_claimed: boolean;
    created_at: string;
}

export const BazaarPage: React.FC = () => {
    const { profile, addReward, claimReward } = useKidProfile();
    const [showAddModal, setShowAddModal] = useState(false);
    const [newReward, setNewReward] = useState({ title: '', price: 50, icon: '🎁' });

    const { data: rewards, isLoading } = useQuery({
        queryKey: ['kid_rewards'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('kid_rewards')
                .select('*')
                .order('created_at', { ascending: false });
            if (error) throw error;
            return (data || []) as Reward[];
        }
    });

    const handleAddReward = async () => {
        if (!newReward.title) return;
        await addReward.mutateAsync(newReward);
        setShowAddModal(false);
        setNewReward({ title: '', price: 50, icon: '🎁' });
    };

    const handleClaim = async (rewardId: string) => {
        try {
            await claimReward.mutateAsync(rewardId);
        } catch (err: any) {
            alert(err.message);
        }
    };

    return (
        <Layout>
            <div className="max-w-7xl mx-auto space-y-8 pb-20 md:pb-8">
                {/* Bazaar Header */}
                <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-[2.5rem] p-8 text-white shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-8 opacity-20">
                        <ShoppingBag size={120} />
                    </div>
                    <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-6">
                        <div className="flex items-center gap-6">
                            <div className="w-20 h-20 bg-white/20 backdrop-blur-xl rounded-full flex items-center justify-center border-4 border-white/30 shadow-inner">
                                <Gem size={40} className="text-blue-200" />
                            </div>
                            <div>
                                <h1 className="text-3xl font-black italic mb-1">Hazine Çarşısı 🏺</h1>
                                <p className="text-blue-100 font-bold">Biriktirdiğin altınlarla harika ödüller alabilirsin!</p>
                            </div>
                        </div>
                        <div className="bg-white/20 backdrop-blur-md px-8 py-4 rounded-3xl border border-white/20 flex items-center gap-4">
                            <div className="text-right">
                                <p className="text-[10px] font-black uppercase tracking-widest opacity-60">Mevcut Altın</p>
                                <p className="text-3xl font-black">{profile?.gold || 0}</p>
                            </div>
                            <Gem size={32} className="text-blue-300 animate-pulse" />
                        </div>
                    </div>
                </div>

                {/* Parent Warning / Add Reward */}
                <div className="flex justify-between items-center bg-orange-50 dark:bg-orange-950/20 p-6 rounded-3xl border-2 border-dashed border-orange-200 dark:border-orange-800">
                    <div className="flex items-center gap-3">
                        <Star className="text-orange-500" />
                        <p className="text-sm font-bold text-slate-700 dark:text-orange-200">
                            Ebeveynler için: Buraya çocuğunuzun gerçek hayatta alabileceği ödülleri ekleyin.
                        </p>
                    </div>
                    <button
                        onClick={() => setShowAddModal(true)}
                        className="bg-orange-500 hover:bg-orange-600 text-white font-black px-6 py-3 rounded-2xl shadow-lg shadow-orange-500/20 transition-all flex items-center gap-2"
                    >
                        <Plus size={20} /> Ödül Ekle
                    </button>
                </div>

                {/* Rewards Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {isLoading ? (
                        <p>Yükleniyor...</p>
                    ) : (rewards?.length || 0) === 0 ? (
                        <div className="col-span-full text-center py-20 bg-white dark:bg-slate-800 rounded-[2.5rem] border border-slate-100 dark:border-slate-800">
                            <Package size={64} className="text-slate-200 mx-auto mb-4" />
                            <p className="text-slate-500 dark:text-slate-400 font-bold italic">Henüz hiç ödül eklenmemiş!</p>
                        </div>
                    ) : (
                        rewards?.map((reward) => (
                            <div
                                key={reward.id}
                                className={`bg-white dark:bg-slate-800 rounded-[2.5rem] p-6 shadow-lg border-2 transition-all group ${reward.is_claimed
                                        ? 'border-green-100 bg-green-50/30'
                                        : 'border-slate-100 hover:border-blue-200 dark:border-slate-800 dark:hover:border-blue-900'
                                    }`}
                            >
                                <div className="flex items-start justify-between mb-6">
                                    <div className="w-16 h-16 bg-slate-50 dark:bg-slate-900 rounded-3xl flex items-center justify-center text-4xl shadow-inner group-hover:scale-110 transition-transform">
                                        {reward.icon || '🎁'}
                                    </div>
                                    {reward.is_claimed ? (
                                        <div className="bg-green-500 text-white px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider flex items-center gap-2">
                                            <CheckCircle2 size={14} /> Alındı!
                                        </div>
                                    ) : (
                                        <div className="bg-blue-50 dark:bg-blue-950/30 px-4 py-1.5 rounded-full border border-blue-100 dark:border-blue-900 text-blue-600 dark:text-blue-400 flex items-center gap-2">
                                            <Gem size={14} />
                                            <span className="font-black">{reward.price}</span>
                                        </div>
                                    )}
                                </div>

                                <h3 className="text-xl font-black text-slate-800 dark:text-slate-100 mb-2">{reward.title}</h3>

                                {!reward.is_claimed && (
                                    <button
                                        onClick={() => handleClaim(reward.id)}
                                        disabled={!profile || (profile.gold || 0) < reward.price}
                                        className={`w-full py-4 rounded-2xl font-black transition-all ${profile && (profile.gold || 0) >= reward.price
                                                ? 'bg-blue-600 text-white shadow-xl shadow-blue-600/20 hover:scale-105 active:scale-95'
                                                : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                                            }`}
                                    >
                                        {profile && (profile.gold || 0) >= reward.price ? 'Almak İstiyorum! ✨' : 'Daha Fazla Altın Lazım 🪙'}
                                    </button>
                                )}
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Add Reward Modal */}
            {showAddModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setShowAddModal(false)} />
                    <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-[2.5rem] shadow-2xl relative p-8 animate-in zoom-in duration-300">
                        <h2 className="text-2xl font-black italic mb-6">Yeni Ödül Oluştur 🎁</h2>
                        <div className="space-y-4">
                            <div>
                                <label className="text-xs font-black uppercase text-slate-500 ml-1">Ödül İsmi (örn: 1 Saat Oyun)</label>
                                <input
                                    type="text"
                                    className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border-2 border-slate-100 dark:border-slate-700 mt-1 focus:border-orange-500 transition-all outline-none font-bold"
                                    value={newReward.title}
                                    onChange={(e) => setNewReward({ ...newReward, title: e.target.value })}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs font-black uppercase text-slate-500 ml-1">Altın Fiyatı</label>
                                    <input
                                        type="number"
                                        className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border-2 border-slate-100 dark:border-slate-700 mt-1 focus:border-orange-500 transition-all outline-none font-bold"
                                        value={newReward.price}
                                        onChange={(e) => setNewReward({ ...newReward, price: Number(e.target.value) })}
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-black uppercase text-slate-500 ml-1">İkon (Emoji)</label>
                                    <input
                                        type="text"
                                        className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border-2 border-slate-100 dark:border-slate-700 mt-1 focus:border-orange-500 transition-all outline-none font-bold text-center"
                                        value={newReward.icon}
                                        onChange={(e) => setNewReward({ ...newReward, icon: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className="pt-4 flex gap-3">
                                <button
                                    onClick={() => setShowAddModal(false)}
                                    className="flex-1 py-4 bg-slate-100 text-slate-600 rounded-2xl font-black"
                                >
                                    Vazgeç
                                </button>
                                <button
                                    onClick={handleAddReward}
                                    className="flex-[2] py-4 bg-orange-500 text-white rounded-2xl font-black shadow-xl shadow-orange-500/20"
                                >
                                    Ödülü Ekle ✨
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </Layout>
    );
};
