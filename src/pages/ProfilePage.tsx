import React, { useState } from 'react';
import { Layout } from '../components/shared/Layout';
import { useProfile } from '../hooks/useProfile';
import { useAuth } from '../hooks/useAuth';
import { User, Target, LogOut, Save } from 'lucide-react';

export const ProfilePage: React.FC = () => {
    const { profile, updateProfile } = useProfile();
    const { signOut } = useAuth();
    const [yearlyGoal, setYearlyGoal] = useState(profile?.reading_goal_yearly || 12);
    const [fullName, setFullName] = useState(profile?.full_name || '');
    const [isSaving, setIsSaving] = useState(false);

    const handleSave = async () => {
        setIsSaving(true);
        try {
            await updateProfile.mutateAsync({
                reading_goal_yearly: yearlyGoal,
                full_name: fullName,
            });
            alert('Profil güncellendi!');
        } catch (error) {
            console.error('Error updating profile:', error);
            alert('Profil güncellenirken hata oluştu');
        } finally {
            setIsSaving(false);
        }
    };

    const handleSignOut = async () => {
        if (confirm('Çıkış yapmak istediğinizden emin misiniz?')) {
            await signOut();
        }
    };

    return (
        <Layout>
            <div className="max-w-4xl mx-auto space-y-8 pb-20 md:pb-8">
                <div>
                    <h1 className="text-4xl font-black text-slate-900 mb-2">Profil & Ayarlar</h1>
                    <p className="text-slate-600">Hesap bilgilerinizi ve okuma hedeflerinizi yönetin</p>
                </div>

                {/* Profile Info */}
                <div className="bg-white rounded-3xl shadow-lg p-8">
                    <div className="flex items-center gap-4 mb-8 pb-6 border-b border-slate-100">
                        <div className="w-20 h-20 rounded-full bg-indigo-100 flex items-center justify-center">
                            <User size={40} className="text-indigo-600" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-black text-slate-900">{profile?.full_name || 'Kullanıcı'}</h2>
                            <p className="text-slate-600">{profile?.email}</p>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-600 uppercase tracking-wider">
                                Ad Soyad
                            </label>
                            <input
                                type="text"
                                className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all"
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                                placeholder="Adınız Soyadınız"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-600 uppercase tracking-wider flex items-center gap-2">
                                <Target size={16} className="text-indigo-500" /> Yıllık Okuma Hedefi (2025)
                            </label>
                            <div className="flex items-center gap-4">
                                <input
                                    type="number"
                                    min="1"
                                    className="flex-1 px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all"
                                    value={yearlyGoal}
                                    onChange={(e) => setYearlyGoal(parseInt(e.target.value) || 1)}
                                />
                                <span className="text-slate-600 font-medium">kitap</span>
                            </div>
                            <p className="text-sm text-slate-500">
                                Bu yıl kaç kitap okumayı hedefliyorsunuz?
                            </p>
                        </div>

                        <button
                            onClick={handleSave}
                            disabled={isSaving}
                            className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-400 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all"
                        >
                            <Save size={20} />
                            {isSaving ? 'Kaydediliyor...' : 'Değişiklikleri Kaydet'}
                        </button>
                    </div>
                </div>

                {/* Logout */}
                <div className="bg-white rounded-3xl shadow-lg p-8">
                    <h3 className="text-xl font-black text-slate-900 mb-4">Hesap İşlemleri</h3>
                    <button
                        onClick={handleSignOut}
                        className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-red-50 hover:bg-red-100 text-red-600 font-bold rounded-xl transition-all"
                    >
                        <LogOut size={20} />
                        Çıkış Yap
                    </button>
                </div>
            </div>
        </Layout>
    );
};
