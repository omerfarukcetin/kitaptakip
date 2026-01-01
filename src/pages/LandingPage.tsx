import React, { useState } from 'react';
import { BookOpen, Calendar, Target, TrendingUp, Users, Zap } from 'lucide-react';
import { AuthModal } from '../components/auth/AuthModal';

export const LandingPage: React.FC = () => {
    const [showAuthModal, setShowAuthModal] = useState(false);

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
            {/* Header */}
            <header className="container mx-auto px-4 py-6">
                <nav className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center">
                            <BookOpen className="text-white" size={24} />
                        </div>
                        <span className="text-2xl font-black text-slate-900">
                            Kitap <span className="text-indigo-600">Takip</span>
                        </span>
                    </div>
                    <button
                        onClick={() => setShowAuthModal(true)}
                        className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all"
                    >
                        Giriş Yap / Kayıt Ol
                    </button>
                </nav>
            </header>

            {/* Hero Section */}
            <section className="container mx-auto px-4 py-20 text-center">
                <div className="max-w-4xl mx-auto">
                    <div className="inline-block px-4 py-2 bg-indigo-100 text-indigo-700 rounded-full text-sm font-bold mb-6">
                        🎉 Kişisel Kütüphane Yöneticin
                    </div>
                    <h1 className="text-5xl md:text-7xl font-black text-slate-900 mb-6 leading-tight">
                        Kitaplarını Takip Et,
                        <br />
                        <span className="text-indigo-600">Hedeflerine Ulaş</span>
                    </h1>
                    <p className="text-xl text-slate-600 mb-10 max-w-2xl mx-auto">
                        Okuma alışkanlığını güçlendir. ISBN ile hızlıca kitap ekle, okuma planı
                        oluştur, ilerlemeni takip et.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <button
                            onClick={() => setShowAuthModal(true)}
                            className="px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-lg rounded-2xl shadow-xl hover:shadow-2xl transition-all transform hover:scale-105"
                        >
                            Ücretsiz Başla
                        </button>
                        <button
                            onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
                            className="px-8 py-4 bg-white hover:bg-slate-50 text-slate-900 font-bold text-lg rounded-2xl shadow-lg hover:shadow-xl transition-all border-2 border-slate-200"
                        >
                            Nasıl Çalışır?
                        </button>
                    </div>
                </div>
            </section>

            {/* Features */}
            <section id="features" className="container mx-auto px-4 py-20">
                <div className="text-center mb-16">
                    <h2 className="text-4xl font-black text-slate-900 mb-4">
                        Neden Kitap Takip?
                    </h2>
                    <p className="text-slate-600 text-lg">
                        Okuma hayatını kolaylaştıracak tüm özellikler bir arada
                    </p>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
                    <FeatureCard
                        icon={<Zap className="text-indigo-600" size={32} />}
                        title="ISBN ile Hızlı Ekleme"
                        description="ISBN numarasını gir, kitap bilgileri otomatik gelsin. Manuel giriş de yapabilirsin."
                    />
                    <FeatureCard
                        icon={<Calendar className="text-indigo-600" size={32} />}
                        title="Akıllı Okuma Takvimi"
                        description="Her kitap için özel okuma planı oluştur. Günlük hedeflerini belirle, PDF olarak indir."
                    />
                    <FeatureCard
                        icon={<Target className="text-indigo-600" size={32} />}
                        title="Okuma Hedefleri"
                        description="Yıllık okuma hedefi koy, ilerlemeni takip et. Motivasyonunu yüksek tut."
                    />
                    <FeatureCard
                        icon={<TrendingUp className="text-indigo-600" size={32} />}
                        title="İlerleme Takibi"
                        description="Hangi sayfadasın? Kaç gün kaldı? Tüm istatistiklerin bir arada."
                    />
                    <FeatureCard
                        icon={<BookOpen className="text-indigo-600" size={32} />}
                        title="Kişisel Kütüphane"
                        description="Okudukların, okuduğun, okuyacakların... Hepsi güvenle bulutta."
                    />
                    <FeatureCard
                        icon={<Users className="text-indigo-600" size={32} />}
                        title="Her Yerde Erişim"
                        description="Web, telefon, tablet... Her cihazdan kütüphanene ulaş."
                    />
                </div>
            </section>

            {/* CTA Section */}
            <section className="container mx-auto px-4 py-20">
                <div className="max-w-4xl mx-auto bg-gradient-to-r from-indigo-600 to-purple-600 rounded-3xl p-12 text-center text-white shadow-2xl">
                    <h2 className="text-4xl font-black mb-4">
                        Okuma Yolculuğuna Şimdi Başla
                    </h2>
                    <p className="text-lg mb-8 text-indigo-100">
                        Ücretsiz hesap oluştur, kitaplarını ekle, hedeflerine ulaş.
                    </p>
                    <button
                        onClick={() => setShowAuthModal(true)}
                        className="px-8 py-4 bg-white text-indigo-600 hover:bg-indigo-50 font-bold text-lg rounded-2xl shadow-xl hover:shadow-2xl transition-all transform hover:scale-105"
                    >
                        Hemen Kayıt Ol
                    </button>
                </div>
            </section>

            {/* Footer */}
            <footer className="container mx-auto px-4 py-8 text-center text-slate-500 text-sm">
                <p>&copy; {new Date().getFullYear()} Kitap Takip • Okuma alışkanlığını güçlendir</p>
            </footer>

            {/* Auth Modal */}
            <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
        </div>
    );
};

interface FeatureCardProps {
    icon: React.ReactNode;
    title: string;
    description: string;
}

const FeatureCard: React.FC<FeatureCardProps> = ({ icon, title, description }) => {
    return (
        <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all border border-slate-100 group hover:border-indigo-200">
            <div className="mb-4 transform group-hover:scale-110 transition-transform">
                {icon}
            </div>
            <h3 className="text-xl font-black text-slate-900 mb-3">{title}</h3>
            <p className="text-slate-600 leading-relaxed">{description}</p>
        </div>
    );
};
