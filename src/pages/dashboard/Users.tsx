import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import  { Input } from '@/components/ui/input'
import { SelectTrigger, SelectValue, SelectContent, SelectItem, Select } from '@/components/ui/select'
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { type UserRole, type User, canDeleteManager, canDeleteStaff } from '@/lib/type'
import { UserPlus, Shield, UsersIcon, Mail, Circle, Clock, Trash2, Activity } from 'lucide-react'
import  { differenceInMinutes, format } from 'date-fns'
import { toast } from 'react-toastify'
import { fr } from "date-fns/locale";


import  {  useEffect, useState } from 'react'
import { Label } from 'recharts'

const Users = () => {
  const notify = () => toast("Utilisateur ajouté avec succès")
  const [isdelete, setIsdelete] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentUser, setCurrentUser] = useState < User | null > (null);
  const [users, setUsers] = useState<User[]>([]);
  const [isAddUserDialogOpen, setIsAddUserDialogOpen] = useState(false);
  const isUserOnline = (user: User) => {
  // Un utilisateur est en ligne s'il a un loginTime et 
  // soit pas de logoutTime, soit un loginTime plus récent que le logoutTime
  if (!user.loginTime) return false;
  if (!user.logoutTime) return true;
  
  return new Date(user.loginTime) > new Date(user.logoutTime);
};
 
  const onlineUsers = users.filter(isUserOnline); 
  const offlineUsers = users.filter(u => !isUserOnline(u));
  const [newUserData, setNewUserData] = useState({
    username : '',
    email: "",
    role: "" as UserRole | "",
  });
   useEffect(() => {
  const loadData = async () => {
    // 1. Récupérer l'utilisateur connecté pour les permissions
    const userStr = localStorage.getItem("currentUser");
    const token = localStorage.getItem("token");
    
    if (userStr) {
      const parsedUser = JSON.parse(userStr);
      setCurrentUser(parsedUser);

      // 2. Récupérer TOUS les utilisateurs depuis le backend
      try {
        const response = await fetch("http://localhost:5000/api/user/getusers", {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          setUsers(data); 
          // Si l'admin n'est pas dans la liste renvoyée, on peut l'ajouter manuellement pour le test
          console.log("Utilisateurs chargés :", data);
        }else {
          // Gérer le cas où le token est expiré ou invalide
          console.error("Erreur réponse:", response.status);
        }
      } catch (error) {
        console.error("Erreur lors du chargement des utilisateurs :", error);
        toast.error("Impossible de charger la liste des utilisateurs");
      }
    }
  };

  loadData();
}, []);

  if (!currentUser) return null;

 const handleAddUser = async () => {
  setIsSubmitting(true)
  // 1. Vérifications de base pour l'email
  if (!newUserData.username || !newUserData.email || !newUserData.role) {
    toast.error("Veuillez remplir tous les champs");
    setIsSubmitting(false);
    return;
  }

  try {
    const token = localStorage.getItem("token");
    

    const response = await fetch("http://localhost:5000/api/user/employee", { 
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify({
        nom_utilisateur: newUserData.username, 
        email: newUserData.email,
        role: newUserData.role
      }),
    });

    const data = await response.json();

    if (response.ok) {
      toast.success("Utilisateur créé et email envoyé !");
      
      // On ajoute le nouvel utilisateur à la liste (le backend renvoie newUser.rows[0])
      // On s'assure de mapper 'nom_utilisateur' du backend vers 'name' du frontend si nécessaire
      const userForList = {
        ...data.user,
        name: data.user.nom_utilisateur // Adaptation pour ton tableau React
      };

      setUsers(prev => [...prev, userForList]); 
      
      // Fermer le modal et reset
      setIsAddUserDialogOpen(false);
      setNewUserData({ username: '', email: '', role: '' as UserRole | "" });
    } else {
      toast.error(data.error || "Erreur lors de la création");
    }
  } catch (error) {
    console.error("Erreur:", error);
    toast.error("Impossible de joindre le serveur");
  }finally {
    setIsSubmitting(false)
  }
};
  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "ADMIN":
        return "bg-red-100 text-red-700";
      case "MANAGER":
        return "bg-blue-100 text-blue-700";
      case "STAFF":
        return "bg-green-100 text-green-700";
      default:
        return  "bg-gray-100 text-gray-700";
    }
  }
  const getSessionDuration = (user: User) =>{
    if (!user.loginTime) return null ;
    const endTime = user.logoutTime ? new Date(user.logoutTime) : new Date;
    const startTime = new Date(user.loginTime)
    const minutes = differenceInMinutes(endTime, startTime);
    const hours = Math.floor(minutes/60);
    
    return `${hours}h ${minutes}min`;
  }
   const handleDeleteUser = async  (userId: string, userRole: string) => {
    
    const targetUser = users.find((u) => u.id === userId);
    if (!targetUser) return;

    //les permissions
    if (userRole === "MANAGER" && !canDeleteManager(currentUser.role)) {
      toast.info("Seul l'administrateur peut supprimer un manager");
      return;
    }

    if (userRole === "STAFF" && !canDeleteStaff(currentUser.role)) {
      toast.warning("Vous n'avez pas la permission de supprimer cet utilisateur");
      return;
    }

    if (confirm(`Êtes-vous sûr de vouloir supprimer ${targetUser.username} ?`)) {
      setIsdelete(true);
      const idToast = toast.loading("Sppression en cours...")
      try{
        const token = localStorage.getItem("token");
        const response = await fetch(`http://localhost:5000/api/user/${userId}`,{
          method: "DELETE",
          headers: {
            "Authorization": `Bearer  ${token}`
          }
        });
        if (response.ok){
           setUsers(prev => prev.filter((u) => u.id !== userId));
           toast.update(idToast, {
            render: "Utilisateur supprimé avec succès",
            type: "success",
            isLoading: false,
            autoClose: 3000
           });
        }else {
          const data = await response.json();
          toast.update (idToast, {
            render: data.message || "Erreur lors de la suppression",
            type: "error",
            isLoading: false,
            autoClose: 3000
          })
        }
      }catch(error){
        console.error("Erreur réseau:", error)
        toast.update(idToast, {
          render: "Impossible d'accéder au serveur",
          type: "error",
          isLoading: false,
          autoClose: 3000
        })
      } finally{
        setIsdelete(false)
      }
     
    }
  };
  const canDelete = (targetRole: string) => {
    if (targetRole === "MANAGER") {
      return canDeleteManager(currentUser.role);
    }
    return canDeleteStaff(currentUser.role );
  };
  return (
    
    <div className="space-y-6">
      <div className="grid md:gap-0 gap-2 md:flex items-center justify-between">
        <div>
          <h1 className="text-lg md:text-3xl mb-2">Gestion des Utilisateurs</h1>
          <p className="text-gray-600">{users.length } utilisateurs</p>
        </div>
        
        {/* Bouton d'ajout d'utilisateur (visible uniquement pour les ADMINs) */}
        {currentUser?.role === "ADMIN" && (
          <Dialog open={isAddUserDialogOpen} onOpenChange={setIsAddUserDialogOpen} >
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
                <UserPlus className="w-4 h-4" />
                Ajouter un utilisateur
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-125 ">
              <DialogHeader>
                <DialogTitle>Ajouter un nouvel utilisateur</DialogTitle>
                <DialogDescription>
                  Créez un compte pour un nouvel employé. Les informations de connexion seront envoyées par email.
                </DialogDescription>
              </DialogHeader>
              
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label >Nom complet</Label>
                  <Input
                    id="name"
                    placeholder="Ex: Jean Dupont"
                    value={newUserData.username}
                    onChange={(e) => setNewUserData({ ...newUserData, username: e.target.value })}
                  />
                </div>
                
                <div className="grid gap-2">
                  <Label >Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Ex: jean.dupont@entreprise.com"
                    value={newUserData.email}
                    onChange={(e) => setNewUserData({ ...newUserData, email: e.target.value })}
                  />
                </div>
                
                <div className="grid gap-2">
                  <Label >Rôle</Label>
                  <Select
                    value={newUserData.role}
                    onValueChange={(value) => setNewUserData({ ...newUserData, role: value as UserRole })}
                  >
                    <SelectTrigger id="role">
                      <SelectValue placeholder="Sélectionnez un rôle" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ADMIN">
                        <div className="flex items-center gap-2">
                          <Shield className="w-4 h-4 text-red-600" />
                          <span>ADMIN - Accès complet</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="MANAGER">
                        <div className="flex items-center gap-2">
                          <UsersIcon className="w-4 h-4 text-blue-600" />
                          <span>MANAGER - Gestion avancée</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="STAFF">
                        <div className="flex items-center gap-2">
                          <UsersIcon className="w-4 h-4 text-green-600" />
                          <span>STAFF - Accès limité</span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="bg-blue-50 dark:bg-gray-400 border border-blue-200 rounded-lg p-3">
                  <div className="flex  items-start gap-2">
                    <Mail className="w-5  h-5 text-blue-600 mt-0.5" />
                    <div className="text-sm text-blue-800">
                      <p className="font-medium mb-1">Envoi automatique par email</p>
                      <p className="text-xs text-blue-700">
                        Un mot de passe sécurisé sera généré automatiquement et envoyé à l'adresse email fournie avec les instructions de connexion.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddUserDialogOpen(false)}>
                  Annuler
                </Button>
                <Button  onClick={handleAddUser} disabled={isSubmitting} className={isSubmitting ? "bg-gray-400  cursor-not-allowed" :"bg-black dark:text-white dark:bg-gray-800"}>
                  {isSubmitting ? "Création en cours..." : "Créer et envoyer"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className='dark:bg-[#0f172a]'>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Administrateurs</CardTitle>
            <Shield className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl">
              {users.filter((u) => u.role === "ADMIN").length}
            </div>
          </CardContent>
        </Card>

        <Card className='dark:bg-[#0f172a]'>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Managers</CardTitle>
            <UsersIcon className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl">
              {users.filter((u) => u.role === "MANAGER").length}
            </div>
          </CardContent>
        </Card>

        <Card className='dark:bg-[#0f172a]'>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Staff</CardTitle>
            <UsersIcon className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl">
              {users.filter((u) => u.role === "STAFF").length}
            </div>
          </CardContent>
        </Card>

        <Card className='dark:bg-[#0f172a]'>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">En ligne</CardTitle>
            <Activity className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl text-green-600">{onlineUsers.length}</div>
            <p className="text-xs text-gray-600">{offlineUsers.length} hors ligne</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs pour connectés/déconnectés */}
      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid w-full dark:bg-[#0f172a] max-w-md grid-cols-3">
          <TabsTrigger value="all">Tous ({users.length})</TabsTrigger>
          <TabsTrigger value="online">En ligne ({onlineUsers.length})</TabsTrigger>
          <TabsTrigger value="offline">Hors ligne ({offlineUsers.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-6">
          <Card className='dark:bg-[#0f172a]'>
            <CardHeader>
              <CardTitle>Tous les utilisateurs</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Statut</TableHead>
                      <TableHead>Nom</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Rôle</TableHead>
                      <TableHead>Connexion</TableHead>
                      <TableHead>Déconnexion</TableHead>
                      <TableHead>Durée</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell>
                          {isUserOnline(user) ? (
                            <Circle className="w-3 h-3 fill-green-600 text-green-600" />
                          ) : (
                            <Circle className="w-3 h-3 fill-gray-400 text-gray-400" />
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-indigo-200 rounded-full flex items-center justify-center">
                              <span className="text-sm text-indigo-700">
                                {user.username.charAt(0)}
                              </span>
                            </div>
                            {user.username}
                          </div>
                        </TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>
                          <span className={`px-2 py-1 text-xs rounded ${getRoleBadgeColor(user.role)}`}>
                            {user.role.toUpperCase()}
                          </span>
                        </TableCell>
                        <TableCell >
                          {user.loginTime ? (
                            <div className="flex items-center gap-2">
                              <Clock className="w-4 h-4 text-green-600" />
                              <span className="text-sm">
                                {format(new Date(user.loginTime), "dd/MM/yyyy HH:mm", { locale: fr })}
                              </span>
                            </div>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {user.logoutTime ? (
                            <div className="flex items-center gap-2">
                              <Clock className="w-4 h-4 text-red-600" />
                              <span className="text-sm">
                                {format(new Date(user.logoutTime), "dd/MM/yyyy HH:mm", { locale: fr })}
                              </span>
                            </div>
                          ) : (
                            <span className="text-green-600 text-sm">En ligne</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <span className="text-sm text-gray-600">
                            {getSessionDuration(user) || "-"}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {canDelete(user.role) && user.id !== currentUser?.id && (
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => handleDeleteUser(user.id, user.role)}
                              >
                                <Trash2 className="w-4 h-4 text-red-600" />
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="online" className="mt-6">
          <Card className='dark:bg-[#0f172a]'>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Circle className="w-3 h-3 fill-green-600 text-green-600" />
                Utilisateurs en ligne
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 ">
                {onlineUsers.length === 0 ? (
                  <p className="text-center text-gray-600 py-8">Aucun utilisateur en ligne</p>
                ) : (
                  onlineUsers.map((user) => (
                    <div key={user.id} className="flex items-center dark:bg-gray-300 justify-between p-4 bg-green-50 border border-green-200 rounded-lg">
                      <div className="flex items-center gap-3 ">
                        <div className="w-12 h-12 bg-indigo-200 rounded-full flex items-center justify-center">
                          <span className="text-lg text-indigo-700">
                            {user.username.charAt(0)}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium">{user.name}</p>
                          <p className="text-sm text-gray-600">{user.email}</p>
                          <span className={`inline-block px-2 py-1 text-xs rounded mt-1 ${getRoleBadgeColor(user.role)}`}>
                            {user.role.toUpperCase()}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-green-600 flex items-center gap-1">
                          <Circle className="w-2 h-2 fill-green-600" />
                          Actif
                        </p>
                        {user.loginTime && (
                          <p className="text-xs text-gray-600">
                            Connecté à {format(new Date(user.loginTime), "HH:mm")}
                          </p>
                        )}
                        <p className="text-xs text-gray-600">
                          Durée: {getSessionDuration(user)}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="offline" className="mt-6">
          <Card className='dark:bg-[#0f172a]'>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Circle className="w-3 h-3 fill-gray-400 text-gray-400" />
                Utilisateurs hors ligne
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {offlineUsers.length === 0 ? (
                  <p className="text-center text-gray-600 py-8">Tous les utilisateurs sont en ligne</p>
                ) : (
                  offlineUsers.map((user) => (
                    <div key={user.id} className="flex items-center dark:bg-gray-300 justify-between p-4 bg-gray-50 border border-gray-200 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-indigo-200 rounded-full flex items-center justify-center">
                          <span className="text-lg text-indigo-700">
                            {user.username.charAt(0)}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium">{user.name}</p>
                          <p className="text-sm text-gray-600">{user.email}</p>
                          <span className={`inline-block px-2 py-1 text-xs rounded mt-1 ${getRoleBadgeColor(user.role)}`}>
                            {user.role.toUpperCase()}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-600 flex items-center gap-1">
                          <Circle className="w-2 h-2 fill-gray-400" />
                          Hors ligne
                        </p>
                        {user.logoutTime && (
                          <p className="text-xs text-gray-600">
                            Déconnecté à {format(new Date(user.logoutTime), "HH:mm")}
                          </p>
                        )}
                        {user.loginTime && (
                          <p className="text-xs text-gray-600">
                            Durée session: {getSessionDuration(user)}
                          </p>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
    
}

export default Users
