/// <reference types="vite/client" />
import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

export const chatWithNotes = async (
    bookTitle: string,
    notes: string[],
    userMessage: string,
    history: { role: "user" | "model"; parts: { text: string }[] }[] = []
) => {
    if (!API_KEY) {
        throw new Error("Lütfen .env dosyasına VITE_GEMINI_API_KEY ekleyin.");
    }

    const genAI = new GoogleGenerativeAI(API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const context = `
Sen "OkurNot" isimli kitap takip uygulamasının yapay zeka asistanısın. 
Kullanıcının okuduğu "${bookTitle}" kitabı hakkında aldığı notlara dayanarak sorularını yanıtlamalısın.

KULLANICI NOTLARI:
${notes.map((n, i) => `${i + 1}. ${n}`).join("\n")}

TALİMATLAR:
1. Öncelikle kullanıcının kendi notlarına sadık kal.
2. Eğer notlarda bilgi yoksa ama kitap hakkında genel bir bilgin varsa, "Notlarında buna dair bir bilgi bulamadım ama kitap genelinde..." şeklinde yanıt ver.
3. Yanıtların samimi, teşvik edici ve bir kitap dostu gibi olsun.
4. Markdown formatında yanıt ver.
`.trim();

    const chat = model.startChat({
        history: [
            {
                role: "user",
                parts: [{ text: context }],
            },
            {
                role: "model",
                parts: [{ text: "Anlaşıldı! Notlarını inceledim. Bu kitap hakkında ne sormak istersin?" }],
            },
            ...history
        ],
    });

    const result = await chat.sendMessage(userMessage);
    const response = await result.response;
    return response.text();
};

export const getBookRecommendations = async (books: { title: string; author: string | null; categories: string[] | null }[]) => {
    if (!API_KEY) {
        throw new Error("API Anahtarı bulunamadı.");
    }

    const genAI = new GoogleGenerativeAI(API_KEY);
    const model = genAI.getGenerativeModel({
        model: "gemini-1.5-flash",
        generationConfig: { responseMimeType: "application/json" }
    });

    const prompt = `
Kullanıcının okuduğu veya kütüphanesine eklediği kitapların listesi aşağıdadır:
${books.map(b => `- ${b.title}${b.author ? ` (${b.author})` : ''} [Kategoriler: ${b.categories?.join(', ') || 'Yok'}]`).join('\n')}

Bu listeye dayanarak kullanıcıya 3 yeni kitap önerisinde bulun. 
Önerilerin mümkün olduğunca kullanıcının zevkine uygun, benzer temalarda veya türlerde olsun.

Yanıtını şu JSON formatında ver:
{
  "recommendations": [
    {
      "title": "Kitap Adı",
      "author": "Yazar Adı",
      "reason": "Neden önerildiğine dair kısa, etkileyici bir açıklama (Maksimum 150 karakter)",
      "category": "Kitabın türü"
    }
  ]
}
`.trim();

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return JSON.parse(response.text());
};

