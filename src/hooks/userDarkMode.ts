import { useEffect, useState } from "react";

export function useTheme() {
    // On vérifie le thème stocké ou on utilise le thème système
    const [theme, setTheme] = useState(() => {
        return localStorage.getItem("theme") || "light";
    });

    useEffect(() => {
        const root = window.document.documentElement;
        
        // Retrait des classes précédentes
        root.classList.remove("light", "dark");
        
        // Application du nouveau thème
        root.classList.add(theme);
        
        // Persistance
        localStorage.setItem("theme", theme);
        
        // Optionnel : Changer la couleur de la barre d'adresse mobile (Meta theme-color)
        const metaThemeColor = document.querySelector('meta[name="theme-color"]');
        if (metaThemeColor) {
            metaThemeColor.setAttribute("content", theme === "dark" ? "#020617" : "#ffffff");
        }
    }, [theme]);

    return { theme, setTheme };
}