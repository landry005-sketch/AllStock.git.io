import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Switch } from "../../components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { Settings as SettingsIcon, Bell, Mail, FileText, Database, User as UserIcon, Palette, Languages, Camera, Lock, Eye, EyeOff, Moon, Sun } from "lucide-react";
import type { User } from "@/lib/type";
import { toast } from "sonner";
import { changeLanguage, t } from "i18next";
import i18n from "@/i18n";
import { useTheme } from "@/ThemeContent";


export default function Settings() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [settings, setSettings] = useState({
    emailNotifications: true,
    autoInvoice: true,
    lowStockAlert: true,
    expiryAlert: true,
    lowStockThreshold: 20,
    expiryAlertDays: 7,
    theme: "light",
    language: "fr",
  });
  const { theme, setTheme } = useTheme();
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    const userStr = localStorage.getItem("currentUser");
    console.log('voici le currentUser:', userStr)
    if (userStr) {
      setCurrentUser(JSON.parse(userStr));
    }
    
    // Charger le thème depuis localStorage
    const savedTheme = localStorage.getItem("theme") || "light";
    const savedLanguage = localStorage.getItem("language") || "fr";
    setSettings(prev => ({ ...prev, theme: savedTheme, language: savedLanguage }));
    
    // Appliquer le thème
    document.documentElement.classList.toggle("dark", savedTheme === "dark");
  }, []);

  const handleSaveSettings = () => {
    localStorage.setItem("theme", settings.theme);
    localStorage.setItem("language", settings.language);
    document.documentElement.classList.toggle("dark", settings.theme === "dark");
    toast.success("Paramètres sauvegardés avec succès !");
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
        toast.info("Photo mise à jour ! (Enregistrez les paramètres pour sauvegarder)");
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({ ...prev, [name]: value }));
  };

  const handlePasswordSave = () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error("Les nouveaux mots de passe ne correspondent pas !");
      return;
    }
    // Ici, vous devriez ajouter la logique pour vérifier le mot de passe actuel et mettre à jour le nouveau mot de passe
    toast.success("Mot de passe mis à jour avec succès !");
    setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl mb-2">Paramètres</h1>
        <p className="text-gray-600">Configurez votre système AllStock</p>
      </div>

      {/* Profil utilisateur */}
      <Card className="dark:bg-[#0f172a] ">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserIcon className="w-5 h-5 text-indigo-600" />
            Mon Profil
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex  items-center gap-6">
            <div className="relative">
              <div className="md:w-24 h-10 w-10 md:h-24 bg-indigo-200 rounded-full flex items-center justify-center overflow-hidden">
                {photoPreview ? (
                  <img src={photoPreview} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-3xl text-indigo-700">
                    {currentUser?.username.charAt(0)}
                  </span>
                )}
              </div>
              <label htmlFor="photoUpload" className="absolute bottom-0 right-0 md:bg-indigo-600 text-white rounded-full p-2 cursor-pointer hover:bg-indigo-700">
                <Camera className="md:w-4 md:h-4" />
                <input 
                  id="photoUpload" 
                  type="file" 
                  accept="image/*" 
                  className="hidden"
                  onChange={handlePhotoChange}
                />
              </label>
            </div>
            <div className="flex-1">
              <p className="text-lg">{currentUser?.username}</p>
              <p className="text-sm text-gray-600">{currentUser?.email}</p>
              <span className={`inline-block px-2 py-1 text-xs rounded mt-2 ${
                currentUser?.role === "ADMIN" ? "bg-red-100 text-red-700" :
                currentUser?.role === "MANAGER" ? "bg-blue-100 text-blue-700" :
                "bg-green-100 text-green-700"
              }`}>
                {currentUser?.role.toUpperCase()}
              </span>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Nom</Label>
            <Input value={currentUser?.username || ""} disabled />
          </div>

          <div className="space-y-2">
            <Label>Email</Label>
            <Input value={currentUser?.email || ""} disabled />
          </div>

          {currentUser?.role === "ADMIN" && (
            <div className="space-y-2">
              <Label>Code Organisation</Label>
              <Input value={currentUser?.orgCode || ""} disabled />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Apparence */}
      <Card className="dark:bg-[#0f172a]">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sun className="w-5 h-5 dark:hidden" />
            <Moon className="w-5 h-5 hidden dark:block" />
              Apparence
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="theme">Thème</Label>
            <Select
             value={theme} onValueChange={setTheme}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="dark:bg-slate-900 dark:border-slate-800">
                <SelectItem value="light">
                  <div className="flex items-center gap-2">
                    <Sun className="w-4 h-4" /> Mode Clair
                  </div>
                </SelectItem>
                <SelectItem value="dark">
                  <div className="flex items-center gap-2">
                    <Moon className="w-4 h-4" /> Mode Sombre
                  </div>
                </SelectItem>
                <SelectItem value="auto">Automatique</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-sm text-gray-600">
              Choisissez le thème de l'interface
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Langue */}
      <Card className="dark:bg-[#0f172a]">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
           {t('language')}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="language">Langue</Label>
            <Select
             value={i18n.language} 
            onValueChange={changeLanguage}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="fr">Français</SelectItem>
                <SelectItem value="en">English</SelectItem>
                <SelectItem value="es">Español</SelectItem>
                <SelectItem value="de">Deutsch</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-sm text-gray-600">
              Langue de l'interface utilisateur
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Notifications */}
      <Card className="dark:bg-[#0f172a]">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-indigo-600" />
            Notifications
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="emailNotif">Notifications par email</Label>
              <p className="text-sm text-gray-600">
                Recevoir des emails pour les événements importants
              </p>
            </div>
            <Switch
              id="emailNotif"
              checked={settings.emailNotifications}
              onCheckedChange={(checked) =>
                setSettings({ ...settings, emailNotifications: checked })
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="lowStockAlert">Alertes de stock faible</Label>
              <p className="text-sm text-gray-600">
                Être notifié quand le stock est bas
              </p>
            </div>
            <Switch
              id="lowStockAlert"
              checked={settings.lowStockAlert}
              onCheckedChange={(checked) =>
                setSettings({ ...settings, lowStockAlert: checked })
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="expiryAlert">Alertes de péremption</Label>
              <p className="text-sm text-gray-600">
                Être notifié des produits proches de la péremption
              </p>
            </div>
            <Switch
              id="expiryAlert"
              checked={settings.expiryAlert}
              onCheckedChange={(checked) =>
                setSettings({ ...settings, expiryAlert: checked })
              }
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="lowStockThreshold">Seuil de stock faible</Label>
            <Input
              id="lowStockThreshold"
              type="number"
              value={settings.lowStockThreshold}
              onChange={(e) =>
                setSettings({ ...settings, lowStockThreshold: Number(e.target.value) })
              }
              min="1"
            />
            <p className="text-sm text-gray-600">
              Alerter quand le stock est inférieur à cette valeur
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="expiryAlertDays">Délai d'alerte péremption (jours)</Label>
            <Input
              id="expiryAlertDays"
              type="number"
              value={settings.expiryAlertDays}
              onChange={(e) =>
                setSettings({ ...settings, expiryAlertDays: Number(e.target.value) })
              }
              min="1"
            />
            <p className="text-sm text-gray-600">
              Alerter X jours avant la date de péremption
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Facturation automatique */}
      {(currentUser?.role === "ADMIN" || currentUser?.role === "MANAGER") && (
        <Card className="dark:bg-[#0f172a]">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-indigo-600" />
              Facturation
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="autoInvoice">Génération automatique de factures</Label>
                <p className="text-sm text-gray-600">
                  Créer automatiquement une facture lors de chaque vente
                </p>
              </div>
              <Switch
                id="autoInvoice"
                checked={settings.autoInvoice}
                onCheckedChange={(checked) =>
                  setSettings({ ...settings, autoInvoice: checked })
                }
              />
            </div>

            <div className="space-y-3">
              <Label>Format d'export des rapports</Label>
              <div className="flex gap-2">
                <Button variant="outline" className="flex-1">
                  <FileText className="w-4 h-4 mr-2" />
                  PDF
                </Button>
                <Button variant="outline" className="flex-1">
                  <Database className="w-4 h-4 mr-2" />
                  Excel
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Mot de passe */}
      <Card className="dark:bg-[#0f172a]">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="w-5 h-5 text-indigo-600" />
            Mot de passe
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label>Mot de passe actuel</Label>
            <div className="relative">
              <Input
                type={showCurrentPassword ? "text" : "password"}
                value={passwordData.currentPassword}
                onChange={handlePasswordChange}
                name="currentPassword"
                className="pr-10"
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 px-3 py-2 text-gray-500 hover:text-gray-700"
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
              >
                {showCurrentPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Nouveau mot de passe</Label>
            <div className="relative">
              <Input
                type={showNewPassword ? "text" : "password"}
                value={passwordData.newPassword}
                onChange={handlePasswordChange}
                name="newPassword"
                className="pr-10"
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 px-3 py-2 text-gray-500 hover:text-gray-700"
                onClick={() => setShowNewPassword(!showNewPassword)}
              >
                {showNewPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Confirmer le nouveau mot de passe</Label>
            <div className="relative">
              <Input
                type={showConfirmPassword ? "text" : "password"}
                value={passwordData.confirmPassword}
                onChange={handlePasswordChange}
                name="confirmPassword"
                className="pr-10"
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 px-3 py-2 text-gray-500 hover:text-gray-700"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          <div className="flex justify-end">
            <Button
              className="bg-indigo-600 hover:bg-indigo-700"
              onClick={handlePasswordSave}
            >
              Enregistrer le mot de passe
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button 
          className="bg-indigo-600 hover:bg-indigo-700"
          onClick={handleSaveSettings}
        >
          Enregistrer les paramètres
        </Button>
      </div>
    </div>
  );
}