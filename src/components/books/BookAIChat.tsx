import React, { useState, useRef, useEffect } from 'react';
import { Bot, Send, X, MessageSquare, Loader2, Sparkles } from 'lucide-react';
import { chatWithNotes } from '../../lib/gemini';
import { useBookNotes } from '../../hooks/useBookNotes';

interface BookAIChatProps {
    bookId: string;
    bookTitle: string;
}

interface Message {
    role: 'user' | 'model';
    text: string;
}

export const BookAIChat: React.FC<BookAIChatProps> = ({ bookId, bookTitle }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [input, setInput] = useState('');
    const [messages, setMessages] = useState<Message[]>([]);
    const [isTyping, setIsTyping] = useState(false);
    const { notes } = useBookNotes(bookId);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        if (isOpen) scrollToBottom();
    }, [messages, isOpen, isTyping]);

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || isTyping) return;

        const userMsg = input.trim();
        setInput('');
        setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
        setIsTyping(true);

        try {
            const notesText = notes.map(n => n.content);
            const history = messages.map(m => ({
                role: m.role,
                parts: [{ text: m.text }]
            }));

            const response = await chatWithNotes(bookTitle, notesText, userMsg, history);
            setMessages(prev => [...prev, { role: 'model', text: response }]);
        } catch (error: any) {
            setMessages(prev => [...prev, {
                role: 'model',
                text: `Hata: ${error.message || 'Yapay zeka ile bağlantı kurulamadı.'}`
            }]);
        } finally {
            setIsTyping(false);
        }
    };

    return (
        <div className="fixed bottom-6 right-6 z-40">
            {/* Toggle Button */}
            {!isOpen && (
                <button
                    onClick={() => setIsOpen(true)}
                    className="flex items-center gap-2 px-6 py-4 bg-indigo-600 text-white rounded-full shadow-2xl hover:bg-indigo-700 transition-all hover:scale-105 active:scale-95 group"
                >
                    <Sparkles size={24} className="group-hover:rotate-12 transition-transform" />
                    <span className="font-black uppercase tracking-wider text-sm">Notlarına Sor</span>
                </button>
            )}

            {/* Chat Panel */}
            {isOpen && (
                <div className="w-[350px] sm:w-[400px] h-[500px] sm:h-[600px] bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.2)] flex flex-col border border-indigo-100 dark:border-slate-800 overflow-hidden animate-in slide-in-from-bottom-5 duration-300">
                    {/* Header */}
                    <div className="p-6 bg-gradient-to-r from-indigo-600 to-purple-600 text-white flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-white/20 rounded-xl">
                                <Bot size={24} />
                            </div>
                            <div>
                                <h3 className="font-black text-sm uppercase tracking-widest leading-none">AI Asistan</h3>
                                <p className="text-[10px] opacity-70 mt-1 font-bold">{bookTitle}</p>
                            </div>
                        </div>
                        <button
                            onClick={() => setIsOpen(false)}
                            className="p-2 hover:bg-white/10 rounded-full transition-all"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto p-6 space-y-6">
                        {messages.length === 0 && (
                            <div className="text-center py-10 space-y-4">
                                <div className="w-16 h-16 bg-slate-50 dark:bg-slate-800 rounded-3xl flex items-center justify-center mx-auto">
                                    <MessageSquare size={32} className="text-indigo-400" />
                                </div>
                                <p className="text-slate-500 dark:text-slate-400 text-sm font-medium px-6">
                                    "{bookTitle}" üzerine tuttuğun {notes.length} notun hazır. Ne sormak istersin?
                                </p>
                            </div>
                        )}
                        {messages.map((m, i) => (
                            <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[85%] p-4 rounded-3xl text-sm leading-relaxed ${m.role === 'user'
                                        ? 'bg-indigo-600 text-white rounded-tr-none font-bold'
                                        : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-100 rounded-tl-none font-medium prose dark:prose-invert prose-xs'
                                    }`}>
                                    {m.text}
                                </div>
                            </div>
                        ))}
                        {isTyping && (
                            <div className="flex justify-start">
                                <div className="bg-slate-100 dark:bg-slate-800 p-4 rounded-3xl rounded-tl-none flex items-center gap-2">
                                    <Loader2 size={16} className="animate-spin text-indigo-600" />
                                    <span className="text-xs font-bold text-slate-500">Düşünüyor...</span>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input */}
                    <form onSubmit={handleSend} className="p-6 bg-slate-50 dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800">
                        <div className="relative">
                            <input
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder="Bir şeyler sor..."
                                className="w-full pl-6 pr-14 py-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full focus:ring-4 focus:ring-indigo-500/10 focus:outline-none text-sm font-bold text-slate-900 dark:text-slate-100"
                            />
                            <button
                                type="submit"
                                disabled={!input.trim() || isTyping}
                                className="absolute right-2 top-2 p-3 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 transition-all disabled:opacity-50 disabled:scale-95 shadow-xl"
                            >
                                <Send size={18} />
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
};
