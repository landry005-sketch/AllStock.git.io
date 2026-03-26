import React, { createContext, useContext, useEffect, useState } from 'react';

// Définition des types pour une meilleure autocomplétion
type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  // Initialisation sécurisée avec le localStorage
  const [theme, setTheme] = useState<Theme>(() => {
    const saved = localStorage.getItem('theme') as Theme;
    return saved || 'light';
  });

  const toggleTheme = () => {
    setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
  };

  useEffect(() => {
    const root = window.document.documentElement;
    
    // On nettoie et on applique la classe sur <html>
    root.classList.remove('light', 'dark');
    root.classList.add(theme);
    
    // On force le style de la page pour éviter les résidus blancs
    root.style.colorScheme = theme;
    
    // Persistance locale
    localStorage.setItem('theme', theme);
    
    // Mise à jour de la couleur de la barre d'état (mobile)
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
      // #020617 correspond au Navy profond de ton nouveau visuel
      metaThemeColor.setAttribute("content", theme === "dark" ? "#020617" : "#ffffff");
    }
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

// Hook personnalisé avec vérification de sécurité
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme doit être utilisé à l’intérieur d’un ThemeProvider');
  }
  return context;
};