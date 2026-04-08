/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from 'react';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [isEmailSent, setIsEmailSent] = useState(false);
  const navigate = useNavigate();

  const handleVerifyEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      // Appel au backend pour vérifier l'email et envoyer le token
      const response = await axios.post('http://localhost:5000/api/auth/forgot-password', { email });
      
      setIsEmailSent(true);
      setMessage({ type: 'success', text: "Email vérifié ! Un lien de réinitialisation a été envoyé à votre adresse." });
    } catch (err: any) {
      setMessage({ 
        type: 'error', 
        text: err.response?.data?.error || "Cet email n'existe pas dans notre base de données." 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen min-w-screen bg-blue-100 flex items-centerflex-col items-center justify-center p-4">
        <div>
            <Button variant="ghost" onClick={() => navigate("/")} className="mb-4">
                <ArrowLeft className="w-4 h-4 mr-2" /> Retour
            </Button>
            <div className="w-full max-w-md p-8 bg-white rounded-xl shadow-lg border h-min border-gray-100">
                <div className="text-center mb-8">
                    <h2 className="text-3xl font-bold text-gray-800">Récupération</h2>
                    <p className="text-gray-500 mt-2">Validez votre compte AllStock</p>
                </div>

                {!isEmailSent ? (
                    <form onSubmit={handleVerifyEmail} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Adresse Email</label>
                                <input 
                                    type="email" 
                                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 outline-none transition"
                                    placeholder="exemple@allstock.cm"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required 
                                />
                        </div>
            
                        <button 
                            type="submit" 
                            disabled={loading}
                            className={`w-full py-3 rounded-lg text-white font-semibold transition ${loading ? 'bg-gray-400' : 'bg-indigo-600 hover:bg-indigo-700'}`}
                        >
                            {loading ? 'Vérification en cours...' : 'Vérifier mon email'}
                        </button>
                    </form>
                    ) : (
                        <div className="text-center space-y-4">
                            <div className="text-green-500 text-5xl">✓</div>
                                <p className="text-gray-700 font-medium">{message.text}</p>
                                <button 
                                    onClick={() => setIsEmailSent(false)}
                                    className="text-sm text-indigo-600 hover:underline"
                                >
                                    Essayer un autre email
                                </button>
                            </div>
                )}

                {message.type === 'error' && (
                    <div className="mt-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm text-center">
                        {message.text}
                    </div>
                )}
            </div>
        </div>
        
    </div>
  );
};
export default ForgotPassword;