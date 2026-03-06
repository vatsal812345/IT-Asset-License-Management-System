import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
};

export const ThemeProvider = ({ children }) => {
    const [theme, setTheme] = useState(() => {
        const savedTheme = localStorage.getItem('itam-theme');
        return savedTheme || 'light';
    });

    useEffect(() => {
        const root = window.document.documentElement;
        console.log('[ThemeContext] Current theme:', theme);
        if (theme === 'dark') {
            root.classList.add('dark');
            console.log('[ThemeContext] Applied .dark class to root');
        } else {
            root.classList.remove('dark');
            console.log('[ThemeContext] Removed .dark class from root');
        }
        localStorage.setItem('itam-theme', theme);
    }, [theme]);

    const toggleTheme = () => {
        setTheme((prevTheme) => (prevTheme === 'light' ? 'dark' : 'light'));
    };

    return (
        <ThemeContext.Provider value={{ theme, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
};
