import { CheckCircle2, ArrowLeft, Users } from 'lucide-react';
import { Label } from 'recharts';
import React, { useState } from 'react'
import { Button } from './components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './components/ui/card';
import { Input } from './components/ui/input';
import { useNavigate } from 'react-router';

const RegistrerEmployer = () => {
    const navigate = useNavigate();
    const [status, SetStatus] = useState < 'idle' |'loading'| 'success'| 'error' > ('idle');
    const [message, SetMessage] = useState('');
    const [formData, setFormData] = useState({
        username: "",
        email: "",
        password: "",
        orgCode: "",
        photo: null as File | null,
    });

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setFormData({ ...formData, photo: file });
        }
    }
    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
  
        SetStatus('loading');
        SetMessage(''); // On utilise SetMessage pour les retours d'inscription

        // URL spécifique pour l'inscription d'un employé
        const url = 'http://localhost:5000/api/auth/register-employee';

        try {
            // Pour un employé, on utilise FormData car il pourrait y avoir une photo de profil 
            // ou simplement pour rester cohérent avec ta structure globale
                const formDataToSend = new FormData();
                formDataToSend.append('username', formData.username);
                formDataToSend.append('email', formData.email);
                formDataToSend.append('password', formData.password);
    
            // TRÈS IMPORTANT : Le code que le directeur a donné à l'employé
                formDataToSend.append('orgCode', formData.orgCode); 

                const response = await fetch(url, {
                    method: 'POST',
                    // Note : On ne définit pas 'Content-Type' manuellement pour FormData, 
                    // le navigateur le fait automatiquement avec le "boundary".
                    body: formDataToSend
                });

                const data = await response.json();

                if (response.ok) {
                    SetStatus('success');
                    SetMessage("Inscription réussie ! Vous pouvez maintenant vous connecter.");
                  setIsSubmitted(true);
                    // On peut rediriger vers le composant Login après 2 secondes
      

                } else {
                        // Gestion des erreurs (ex: code organisation invalide)
                    SetStatus('error');
                    SetMessage(data.error || "Une erreur est survenue lors de l'inscription.");
                }

            } catch (err) {
                console.error("Erreur inscription employé:", err);
                SetStatus('error');
                SetMessage("Impossible de joindre le serveur. Vérifiez votre connexion.");
            }
    };
  const [isSubmitted, setIsSubmitted] = useState(false);

  


  if (isSubmitted) {
    return (
      <div className="min-h-screen min-w-screen bg-linear-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-10 h-10 text-green-600" />
            </div>
            <CardTitle className="text-2xl">Compte créé avec succès !</CardTitle>
            <CardDescription>
              Votre compte employé a été créé. Vous pouvez maintenant vous connecter.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-sm text-gray-700">
                <strong>Email :</strong> {formData.email}
              </p>
              <p className="text-sm text-gray-700">
                <strong>Organisation :</strong> {formData.orgCode}
              </p>
            </div>

            <Button 
              className="w-full bg-green-600 hover:bg-green-700"
              onClick={() => navigate("/")}
            >
              Retour à l'accueil
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }
   return (
    <div className="min-h-screen min-w-screen bg-linear-to-br from-blue-50 to-indigo-100 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <Button
          variant="ghost"
          onClick={() => navigate("/")}
          className="mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Retour
        </Button>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <Users className="w-6 h-6 text-green-600" />
              </div>
              <CardTitle className="text-2xl">Rejoindre une organisation</CardTitle>
            </div>
            <CardDescription>
              Créez votre compte employé avec le code fourni par votre organisation
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label >Nom complet</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Marie Martin"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label >Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="marie.martin@exemple.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label >Mot de passe</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                  minLength={6}
                />
              </div>

              <div className="space-y-2">
                <Label >Code Organisation</Label>
                <Input
                  id="orgCode"
                  type="text"
                  placeholder="ORG-XXXXXXXX"
                  value={formData.orgCode}
                  onChange={(e) => setFormData({ ...formData, orgCode: e.target.value.toUpperCase() })}
                  required
                  className="uppercase"
                />
                <p className="text-sm text-gray-600">
                  Demandez le code à l'administrateur de votre organisation
                </p>
              </div>

              <div className="space-y-2">
                <Label >Photo de profil</Label>
                <Input
                  id="photo"
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  required
                />
                {formData.photo && (
                  <p className="text-sm text-gray-600">
                    ✓ Fichier sélectionné : {formData.photo.name}
                  </p>
                )}
              </div>

              <Button type="submit" className="w-full bg-green-600 hover:bg-green-700" size="lg">
                Créer mon compte
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}




export default RegistrerEmployer
