import { createContext, useContext, useState } from "react";
import type { ReactNode } from "react";

interface AuthcontextType {
    user: any,
    login: (userData: any) => void,
    logout: () => void
}

const AuthContext = createContext<AuthcontextType | undefined>(undefined);

export const Authprovider = ({children }:
    {children: ReactNode}) =>{
        const [user, setUser] = useState<any>(null);

        const login = (userData: any) => {
            setUser(userData);
        };
        const logout = () => setUser(null);

        return (
           < AuthContext.Provider value = {{user, login, logout}}>
                {children}
           </AuthContext.Provider>
        )
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error("useAuth doit être utilise dans un AuthProvider");
    return context
}