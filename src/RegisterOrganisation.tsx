import { ArrowLeft, Building2, CheckCircle2 } from 'lucide-react';
import React, { useState } from 'react'
import  { Button } from './components/ui/button';
import { Card, CardHeader,  CardTitle,  CardDescription,  CardContent } from './components/ui/card';
import { useNavigate } from 'react-router';
import { Label } from "@/components/ui/label"; // Et non "recharts"
import { Input } from './components/ui/input';

const RegisterOrganisation = () => {
   const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, field: "logo" | "photo") => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData({ ...formData, [field]: file });
    }
  };
    const navigate = useNavigate();
    const [status, SetStatus] = useState < 'idle' |'loading'| 'success'| 'error' > ('idle');
    const [message, SetMessage] = useState('');
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [orgCode, setOrgCode] = useState();
     const [formData, setFormData] = useState({
    username: "",
    orgName: "",
    email: "",
    password: "",
    orgCode: "",
    logo: null as File | null,
    photo: null as File | null,
  });
    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    SetStatus('loading');
    SetMessage('');

    // URL pour l'inscription du Directeur (création d'organisation)
    const url = 'http://localhost:5000/api/auth/register-director';

    try {
        const formDataToSend = new FormData();
        
        // Données de l'utilisateur (Directeur)
        formDataToSend.append('username', formData.username);
        formDataToSend.append('email', formData.email);
        formDataToSend.append('password', formData.password);
        
        // Données de l'organisation
        formDataToSend.append('orgName', formData.orgName);
        
        // Envoi du logo (si présent)
        if (formData.logo) {
            formDataToSend.append('logo', formData.logo);
            console.log("Logo prêt à l'envoi:", formData.logo.name);
        }

        const response = await fetch(url, {
            method: 'POST',
            // Rappel : Ne pas mettre de Content-Type pour le FormData
            body: formDataToSend
        });

        const data = await response.json();

        if (response.ok) {
            SetStatus('success');
            // On stocke le code généré pour l'afficher dans l'écran de succès
            if (data.orgCode) {
                setFormData(prev => ({ ...prev, orgCode: data.orgCode }));
                setOrgCode(data.orgCode);
            }
            
            // On bascule vers l'écran de confirmation
            setIsSubmitted(true); 

        } else {
            SetStatus('error');
            SetMessage(data.error || "Erreur lors de la création de l'entreprise.");
        }

    } catch (err) {
        console.error("Erreur register director:", err);
        SetStatus('error');
        SetMessage("Erreur de connexion au serveur.");
    }
};
  
  if (isSubmitted) {
    return (
      <div className="min-h-screen min-w-screen bg-linear-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-10 h-10 text-green-600" />
            </div>
            <CardTitle className="text-2xl">Organisation enregistrée avec succès !</CardTitle>
            <CardDescription>
              Votre organisation a été créée. Partagez ce code avec vos employés.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="bg-indigo-50 border-2 border-indigo-200 rounded-lg p-6 text-center">
              <p className="text-sm text-gray-600 mb-2">Code Organisation</p>
              <p className="text-3xl text-indigo-600 tracking-wider select-all">
                {orgCode}
              </p>
            </div>

            <div className="space-y-2">
              <p className="text-sm text-gray-600">
                <strong>Important :</strong> Conservez ce code en lieu sûr. Il vous sera utile pour la création de vos comptes employés
              </p>
            </div>

            <div className="space-y-3">
              <Button 
                className="w-full bg-indigo-600 hover:bg-indigo-700"
                onClick={() => navigate("/login", {
                  state: { 
      name: formData.username,
      email: formData.email,
      orgName: formData.orgName,
      orgCode: orgCode, // Le code généré par ton backend
       // N'oublie pas l'ID si ton backend le renvoie
    } 
  })}
                
                
              >
                Se connecter
              </Button>
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => {
                  navigator.clipboard.writeText(formData.orgCode ?? "");
                }}
              >
                Copier le code
              </Button>
            </div>
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
              <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center">
                <Building2 className="w-6 h-6 text-indigo-600" />
              </div>
              <CardTitle className="text-2xl">Enregistrer une organisation</CardTitle>
            </div>
            <CardDescription>
              Créez un compte administrateur pour votre organisation
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label >Nom complet</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Jean Dupont"
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
                  placeholder="jean.dupont@exemple.com"
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
                <Label >Nom de l'organisation</Label>
                <Input
                  id="organizationName"
                  type="text"
                  placeholder="Mon Entreprise SARL"
                  value={formData.orgName}
                  onChange={(e) => setFormData({ ...formData, orgName: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>Logo de l'organisation</Label>
                <Input
                  id="logo"
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileChange(e, "logo")}
                  required
                />
                {formData.logo && (
                  <p className="text-sm text-gray-600">
                    ✓ Fichier sélectionné : {formData.logo.name}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label >Photo de profil</Label>
                <Input
                  id="photo"
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileChange(e, "photo")}
                  required
                />
                {formData.photo && (
                  <p className="text-sm text-gray-600">
                    ✓ Fichier sélectionné : {formData.photo.name}
                  </p>
                )}
              </div>

              <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700" size="lg">
                Enregistrer l'organisation
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default RegisterOrganisation
