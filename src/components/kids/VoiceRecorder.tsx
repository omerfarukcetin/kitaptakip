import React, { useState, useRef } from 'react';
import { Mic, Square, Play, Trash2, CheckCircle2 } from 'lucide-react';

interface VoiceRecorderProps {
    onRecordingComplete: (audioUrl: string) => void;
}

export const VoiceRecorder: React.FC<VoiceRecorderProps> = ({ onRecordingComplete }) => {
    const [isRecording, setIsRecording] = useState(false);
    const [audioUrl, setAudioUrl] = useState<string | null>(null);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const chunksRef = useRef<Blob[]>([]);

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const mediaRecorder = new MediaRecorder(stream);
            mediaRecorderRef.current = mediaRecorder;
            chunksRef.current = [];

            mediaRecorder.ondataavailable = (e) => {
                if (e.data.size > 0) chunksRef.current.push(e.data);
            };

            mediaRecorder.onstop = () => {
                const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
                const url = URL.createObjectURL(blob);
                setAudioUrl(url);
                onRecordingComplete(url);
                // Stop all tracks to release the microphone
                stream.getTracks().forEach(track => track.stop());
            };

            mediaRecorder.start();
            setIsRecording(true);
        } catch (err) {
            console.error('Mikrofon erişim hatası:', err);
            alert('Mikrofona erişilemedi!');
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
        }
    };

    const deleteRecording = () => {
        setAudioUrl(null);
        onRecordingComplete('');
    };

    return (
        <div className="flex flex-col items-center gap-6 p-8 bg-indigo-50 dark:bg-indigo-900/20 rounded-[2.5rem] border-2 border-indigo-100 dark:border-indigo-900/30">
            <p className="text-lg font-black text-indigo-900 dark:text-indigo-100 italic text-center">
                Bugün neler olduğunu sesinle anlatmak ister misin? 🎙️
            </p>

            {!audioUrl ? (
                <button
                    onClick={isRecording ? stopRecording : startRecording}
                    className={`w-24 h-24 rounded-full flex items-center justify-center transition-all duration-500 shadow-2xl relative group ${isRecording
                            ? 'bg-red-500 animate-pulse ring-8 ring-red-100 dark:ring-red-900/40'
                            : 'bg-indigo-600 hover:bg-indigo-700 ring-8 ring-indigo-100 dark:ring-indigo-900/40 hover:scale-110'
                        }`}
                >
                    {isRecording ? (
                        <Square className="text-white fill-white" size={32} />
                    ) : (
                        <Mic className="text-white" size={32} />
                    )}

                    {isRecording && (
                        <div className="absolute inset-0 rounded-full border-4 border-white animate-ping opacity-20"></div>
                    )}
                </button>
            ) : (
                <div className="flex flex-col items-center gap-4 w-full">
                    <div className="flex items-center gap-3 bg-white dark:bg-slate-800 p-4 rounded-2xl w-full border border-indigo-200 dark:border-indigo-800 shadow-sm">
                        <CheckCircle2 className="text-green-500" size={24} />
                        <span className="flex-1 font-bold text-slate-700 dark:text-slate-200">Kayıt Hazır! ✨</span>
                        <div className="flex gap-2">
                            <button
                                onClick={() => {
                                    const audio = new Audio(audioUrl);
                                    audio.play();
                                }}
                                className="p-2 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 rounded-lg hover:bg-indigo-100"
                            >
                                <Play size={20} />
                            </button>
                            <button
                                onClick={deleteRecording}
                                className="p-2 bg-red-50 text-red-500 rounded-lg hover:bg-red-100"
                            >
                                <Trash2 size={20} />
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <p className="text-xs font-bold text-indigo-500 dark:text-indigo-400 uppercase tracking-widest">
                {isRecording ? 'KAYIT YAPILIYOR...' : audioUrl ? 'KAYIT TAMAMLANDI' : 'BAŞLATMAK İÇİN DOKUN'}
            </p>
        </div>
    );
};
