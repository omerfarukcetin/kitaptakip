# Supabase Kurulum Adımları

Bu dosya, Supabase projenizi kurmak ve veritabanını yapılandırmak için gereken adımları içerir.

## 1. Supabase Projesi Oluşturma

1. [Supabase Dashboard](https://app.supabase.com) adresine gidin
2. "New Project" butonuna tıklayın
3. Proje bilgilerini doldurun:
   - **Name**: okuma-takvimi (veya istediğiniz bir isim)
   - **Database Password**: Güçlü bir şifre oluşturun (kaydedin!)
   - **Region**: En yakın bölgeyi seçin (örn: Europe West)
4. "Create new project" butonuna tıklayın
5. Proje hazırlanırken bekleyin (1-2 dakika sürebilir)

## 2. API Anahtarlarını Alma

Proje hazırlandıktan sonra:

1. Sol menüden **Settings** > **API** sayfasına gidin
2. Aşağıdaki bilgileri kopyalayın:
   - **Project URL** (örn: `https://xxxxxxxxxxxxx.supabase.co`)
   - **anon/public key** (uzun bir string)

## 3. Environment Variables Ayarlama

1. Proje klasöründe `.env.local` dosyasını oluşturun (veya düzenleyin)
2. Kopyaladığınız bilgileri yapıştırın:

\`\`\`bash
VITE_SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
\`\`\`

## 4. Database Schema Kurulumu

1. Supabase Dashboard'da **SQL Editor** sayfasına gidin
2. "New query" butonuna tıklayın
3. \`supabase-schema.sql\` dosyasının içeriğini kopyalayın
4. SQL editörüne yapıştırın
5. **Sağ üst köşedeki "RUN" butonuna tıklayın**

Bu işlem şunları oluşturacak:
- ✅ \`profiles\` tablosu (kullanıcı profilleri)
- ✅ \`books\` tablosu (kitap koleksiyonu)
- ✅ \`reading_plans\` tablosu (okuma planları)
- ✅ \`reading_progress\` tablosu (ilerleme takibi)
- ✅ RLS (Row Level Security) politikaları
- ✅ Otomatik triggers

## 5. Email Authentication Ayarları

1. **Settings** > **Authentication** sayfasına gidin
2. **Email Auth** bölümünde:
   - "Enable Email Signup" aktif olmalı
   - "Confirm email" kapatılabilir (geliştirme için)

## 6. Kurulumu Test Etme

Tüm adımlar tamamlandıktan sonra:

\`\`\`bash
npm run dev
\`\`\`

- Uygulamayı açın
- Yeni bir hesap oluşturun
- Giriş yapın
- Bir kitap eklemeyi deneyin

## Sorun Giderme

### "Missing Supabase environment variables" hatası
- \`.env.local\` dosyasının proje kök dizininde olduğundan emin olun
- Değişken isimlerinin \`VITE_\` ile başladığından emin olun
- Dev server'ı yeniden başlatın (\`npm run dev\`)

### Database hatası
- SQL sorgusu başarılı çalıştı mı kontrol edin
- RLS politikalarının etkin olduğundan emin olun
- Supabase Dashboard > Table Editor'da tabloları görebiliyor musunuz?

### Authentication hatası
- Email confirmation kapalı mı?
- API anahtarları doğru mu?
- Kullanıcı kayıt olduktan sonra \`profiles\` tablosunda satır oluştu mu?

---

**Not**: Tüm bilgiler hazır olduktan sonra \`.env.local\` dosyasını güncelleyin ve dev server'ı yeniden başlatın!
