/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

const ResetPassword = () => {
    const { token } = useParams(); // Récupère le ${token} du lien email
    const navigate = useNavigate();
    
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleReset = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (password !== confirmPassword) {
            return setError("Les mots de passe ne correspondent pas.");
        }

        setLoading(true);
        setError('');

        try {
            // Envoi du nouveau mot de passe au backend
            await axios.post(`http://localhost:5000/api/auth/reset-password/${token}`, { password });
            
            alert("Mot de passe mis à jour ! Vous pouvez maintenant vous connecter.");
            navigate('/login'); // Redirection vers la connexion
        } catch (err: any) {
            setError(err.response?.data?.error || "Le lien est invalide ou a expiré.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-50 p-4">
            <div className="min-h-screen min-w-screen bg-blue-100 flex items-centerflex-col items-center justify-center p-4">
                <div>
                    <Button variant="ghost" onClick={() => navigate("/")} className="mb-4">
                        <ArrowLeft className="w-4 h-4 mr-2" /> Retour
                    </Button>
                    <div className="w-full max-w-md p-8 bg-white rounded-xl shadow-lg border border-gray-100">
                        <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">Nouveau mot de passe</h2>
                
                        <form onSubmit={handleReset} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Nouveau mot de passe</label>
                                    <input 
                                        type="password" 
                                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required 
                                    />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Confirmer le mot de passe</label>
                                    <input 
                                        type="password" 
                                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        required 
                                    />
                            </div>

                            {error && <p className="text-red-500 text-xs text-center">{error}</p>}

                            <button 
                                type="submit" 
                                disabled={loading}
                                className={`w-full py-2 rounded-lg text-white font-semibold ${loading ? 'bg-gray-400' : 'bg-green-600 hover:bg-green-700'}`}
                            >
                                {loading ? 'Mise à jour...' : 'Changer le mot de passe'}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ResetPassword;