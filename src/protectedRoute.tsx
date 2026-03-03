
import type { ReactNode } from 'react';
import { Navigate } from 'react-router';

// On définit les types des props ici
interface ProtectedRouteProps {
  children: ReactNode;
  setActiveForm: (form: 'none' | 'director' | 'employé' | 'login') => void;
}

const ProtectedRoute = ({ children, setActiveForm }: ProtectedRouteProps) => {
  const token = localStorage.getItem('token');

  if (!token) {
    // Si pas de token, on demande d'afficher le login sur la page d'accueil
    setActiveForm('login');
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;