import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label'; // Correction de l'import ici
import { ArrowLeft, Loader, Package } from 'lucide-react';
import React, { useState } from 'react';
import { useNavigate } from 'react-router';

const Login = () => {
    const [loginStatus, setLoginStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [loginError, setLoginError] = useState('');
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
    });

    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoginStatus('loading');
        setLoginError('');

        const url = 'http://localhost:5000/api/auth/login';
        
        try {
            const loginValue = (formData.email || formData.username).trim();
            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    identifier: loginValue,
                    password: formData.password
                }),
                
            });
            console.log("données:", {
               identifier: loginValue,
                    password: formData.password
            })

            const data = await response.json();
            console.log("Réponse complète du serveur :", data); // 👈 AJOUTE CECI
           if (response.ok) {
    // 1. GESTION DU CHANGEMENT DE MOT DE PASSE REQUIS
    if (data.mustChangePassword) {
        // On s'arrête ici et on redirige vers la configuration
        return navigate('/complete-setup', { state: { userId: data.userId } });
    }
    

    // 2. SI PAS DE CHANGEMENT REQUIS, ON CONTINUE LE LOGIN NORMAL
    const userFromServer = data.user;

    // Sécurité au cas où l'objet user est manquant
    if (!userFromServer) {
        setLoginError("Données utilisateur manquantes");
        setLoginStatus('error');
        return;
    }

    localStorage.setItem('token', data.token);
    localStorage.setItem('currentUser', JSON.stringify({
        id: userFromServer.id,
        name: userFromServer.username || userFromServer.nom_utilisateur, // Gère tes deux dénominations
        email: userFromServer.email,
        role: userFromServer.role,
        org_id: userFromServer.org_id,
        orgName: userFromServer.orgName,
        orgCode: userFromServer.orgCode,
        logoUrl: userFromServer.logoUrl
    }));

    setLoginStatus('success');
    
    setTimeout(() => {
        navigate("/dashboard");
    }, 500);
} else {
                // Le ELSE est maintenant bien rattaché au IF de la réponse
                setLoginError(data.error || "Identifiant ou mot de passe incorrect");
                setLoginStatus('error');
            }
        } catch (err) {
            console.error("Erreur login:", err);
            setLoginError("Erreur de connexion au serveur");
            setLoginStatus('error');
        }
    };

    return (
        <div className="min-h-screen min-w-screen bg-blue-100 flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                <Button variant="ghost" onClick={() => navigate("/")} className="mb-4">
                    <ArrowLeft className="w-4 h-4 mr-2" /> Retour
                </Button>

                <Card>
                    <CardHeader className="text-center">
                        <div className="flex items-center justify-center gap-3 mb-2">
                            <Package className="w-10 h-10 text-indigo-600" />
                            <CardTitle className="text-3xl text-indigo-600">AllStock</CardTitle>
                        </div>
                        <CardDescription>Connectez-vous à votre espace</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            {loginError && (
                                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded text-sm">
                                    {loginError}
                                </div>
                            )}

                            <div className="space-y-2">
                                <Label htmlFor="email">Email ou Nom d'utilisateur</Label>
                                <Input
                                    id="email"
                                    type="text"
                                    placeholder="nom@exemple.com"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="password">Mot de passe</Label>
                                <Input
                                    id="password"
                                    type="password"
                                    placeholder="••••••••"
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    required
                                />
                            </div>

                            <Button 
                                type="submit" 
                                className="w-full bg-indigo-600 hover:bg-indigo-700" 
                                disabled={loginStatus === 'loading'}
                            >
                                {loginStatus === 'loading' ? <Loader className="animate-spin h-5 w-5" /> : "Se connecter"}
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default Login;