import React, { createContext, useContext, useState, useEffect } from 'react';

type AppMode = 'adult' | 'kid';

interface KidModeContextType {
    mode: AppMode;
    toggleMode: () => void;
    setMode: (mode: AppMode) => void;
}

const KidModeContext = createContext<KidModeContextType | undefined>(undefined);

export const KidModeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [mode, setModeState] = useState<AppMode>(() => {
        const savedMode = localStorage.getItem('app-mode');
        return (savedMode as AppMode) || 'adult';
    });

    const setMode = (newMode: AppMode) => {
        setModeState(newMode);
        localStorage.setItem('app-mode', newMode);
    };

    const toggleMode = () => {
        const newMode = mode === 'adult' ? 'kid' : 'adult';
        setMode(newMode);
    };

    useEffect(() => {
        // Apply class to body for global styling if needed
        document.body.classList.toggle('kid-mode-active', mode === 'kid');
    }, [mode]);

    return (
        <KidModeContext.Provider value={{ mode, toggleMode, setMode }}>
            {children}
        </KidModeContext.Provider>
    );
};

export const useAppMode = () => {
    const context = useContext(KidModeContext);
    if (!context) {
        throw new Error('useAppMode must be used within a KidModeProvider');
    }
    return context;
};
