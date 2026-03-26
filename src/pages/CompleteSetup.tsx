import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router';
import { Lock, Eye, EyeOff, CheckCircle } from 'lucide-react';

const CompleteSetup = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const userId = location.state?.userId; // Récupéré depuis la redirection du Login

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      return setError("Les mots de passe ne correspondent pas.");
    }

    try {
      const response = await fetch('http://localhost:5000/api/auth/complete-setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, newPassword: password }),
      });

      const data = await response.json();

      if (response.ok) {
        // On stocke le token et l'utilisateur comme dans le login classique
        localStorage.setItem('token', data.token);
        localStorage.setItem('currentUser', JSON.stringify(data.user));
        navigate('/dashboard');
      } else {
        setError(data.error || "Une erreur est survenue.");
      }
    } catch (err) {
      setError("Erreur de connexion au serveur.");
    }
  };

  return (
    <div className="min-h-screen min-w-screen bg-blue-100 flex items-center justify-center  p-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 border border-gray-100">
        <div className="text-center mb-8">
          <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <Lock className="text-blue-600" size={32} />
          </div>
          <h2 className="text-2xl font-bold text-gray-800">Sécurisez votre compte</h2>
          <p className="text-gray-500 mt-2">Définissez votre mot de passe définitif pour accéder à StockFlow.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">{error}</div>}

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Nouveau mot de passe</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <Lock className="absolute left-3 top-3.5 text-gray-400" size={18} />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3.5 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Confirmer le mot de passe</label>
            <div className="relative">
              <input
                type="password"
                className="w-full pl-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
              <CheckCircle className="absolute left-3 top-3.5 text-gray-400" size={18} />
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition shadow-md shadow-blue-200"
          >
            Activer mon compte
          </button>
        </form>
      </div>
    </div>
  );
};

export default CompleteSetup;