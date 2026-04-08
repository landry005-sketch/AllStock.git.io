/* eslint-disable @typescript-eslint/no-explicit-any */
import  { Button } from '@/components/ui/button'
import  { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import  { TableHeader, TableRow, TableHead, TableBody, TableCell ,Table } from '@/components/ui/table'
import { Plus, FolderTree, Edit, Trash2, } from 'lucide-react'
import  { Label } from '@/components/ui/label';
import React, { useEffect, useState } from 'react'
import { Textarea } from '@/components/ui/textarea'
import axios from 'axios'
import { toast } from 'react-toastify'
import type { User } from '@/lib/type'

const Categories = () => {
    const [categories, setCategories] = useState<any[]> ([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
const [isloading, setIsloading] = useState(false);
    const [newCategory, setNewCategory] = useState({
        name : "",
        description: "",
    });
    
    const fetchCategories = async () => {
      setIsloading(true); // Active le loader
      try {
        const rawUser = localStorage.getItem('currentUser');
    console.log("Contenu brut de 'user':", rawUser)
        const token = localStorage.getItem('token');
        const user = JSON.parse(localStorage.getItem('currentUser') || '{}');
        const org_id = user?.orgCode; 
        console.log(org_id, "le voici")
        if (!org_id) {
          console.error("Aucun orgId trouvé dans le localStorage");
          return;
        }

        // On utilise la route qui attend l'org_id en paramètre
        const response = await fetch(`http://localhost:5000/api/stock/getCategory?org_id=${org_id}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          const data = await response.json();
          // SÉCURITÉ : Si le serveur renvoie 'nom' au lieu de 'name', on corrige ici
          const formattedData = data.map((cat: any) => ({
              ...cat,
              id: cat.id || cat.categorie_id,
              name: cat.name || cat.nom,
              productCount: cat.productCount || 0
          }));
          setCategories(formattedData);
        }
      } catch (error) {
        console.error("Erreur chargement catégories:", error);
        toast.error("Erreur de connexion au serveur");
      } finally {
        setIsloading(false); 
      }
  };


  useEffect(() => {
    fetchCategories()
    
  }, []); 
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [currentCategory, setCurrentCategory] = useState<any>(null);
   const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsloading(true);
    const user = JSON.parse(localStorage.getItem('currentUser') || '{}');
    const org_id = user?.orgCode; // Vérifie si c'est orgCode ou org_id dans ton localStorage
    const toastId = toast.loading("Création de la catégorie...");

    try {
        const token = localStorage.getItem('token');
console.log("Token:", token)
        const response = await fetch('http://localhost:5000/api/stock/addCategory', {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}` 
            },
            body: JSON.stringify({
                ...newCategory,
                org_id: org_id
            })
          
        });
        console.log("voici:", newCategory)

        const data = await response.json();
        console.log("voici les données:", data)
        if (response.ok) {
            const newAddedCategory = {
              id: data.categorie_id, // On utilise la clé renvoyée par le serveur
              name: newCategory.name,
              description: newCategory.description,
              productCount: 0
            };
            setCategories([...categories, newAddedCategory]);
            setNewCategory({ name: "", description: "" });
            setIsAddDialogOpen(false);
            toast.update(toastId, { render: "Catégorie créée avec succès", type: "success", isLoading: false, autoClose: 2000 });
        } else {
            throw new Error(data.error || "Une categorie avec ce nom existe déjà");
        }
    } catch (error) {
        toast.update(toastId, { render: "Echec lors de la création", type: "error", isLoading: false, autoClose: 2000 });
        console.log("Erreur:", error)
    } finally {
        setIsloading(false);
    }
};
    
    const handleDeleteCategory = async (id:string) => {
        if(!confirm("Etes vous sûr de vouloir supprimer cette catégorie ?")) return
        const toastId = toast.loading("Suppression en cours ...");
        try {
          const response = await fetch(`http://localhost:5000/api/stock/deleteCategory/${id}`,{
            method: 'DELETE',
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
          });

          const data = await response.json();
          if (response.ok) {
            setCategories(prevCategories => prevCategories.filter((c) => c.id !== id));
            toast.update(toastId, {render: "Catégorie supprimée avec succès",type:"success", isLoading:false, autoClose: 3000})
          }else {
            throw new Error(data.error || "Erreur lors de la suppression")
          }
        }catch(error: any){
          toast.update(toastId, {render: "Erreur serveur",type:"error", isLoading:false, autoClose: 3000})
          console.log("erreur suppression:", error)
        }finally {
          setIsloading(false);
        }
    }
    const handleEditCategory = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!currentCategory) return;

      setIsloading(true);
      const toastId = toast.loading("Mise à jour de la catégorie...");

      try {
        const response = await fetch(`http://localhost:5000/api/stock/upgradeCategory/${currentCategory.id}`, {
            method: 'PUT', // On utilise PUT pour la modification
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({
                name: currentCategory.name,
                description: currentCategory.description
            }),
        });

        const data = await response.json();

        if (response.ok) {
            // On remplace l'ancienne catégorie par la nouvelle dans le tableau
            setCategories(prev => prev.map(c => {
              if (c.id === currentCategory.id) {
      
                return { 
                ...c, 
                ...data.category,
                name: data.category.name || data.category.nom || c.name,
                description: data.category.description || c.description
            }; 
              }
              return c;
            }));
            
            setIsEditDialogOpen(false);
            toast.update(toastId, { render: "Modification réussie", type: "success", isLoading: false, autoClose: 2000 });
        } else {
            throw new Error(data.message || "Erreur lors de la modification");
        }
      } catch (error: any) {
          toast.update(toastId, { render: "Echec lors de la modification", type: "error", isLoading: false, autoClose: 2000 });
      } finally {
          setIsloading(false);
      }
    };
    if (isloading && categories.length === 0) {
      return <div className="flex justify-center p-10">Chargement de vos catégories...</div>;
    }
    console.log("voici les categories:",categories)
  return (
    
      <div className="space-y-6 dark:text-gray-50">
      <div className="grid md:gap-0 gap-2 md:flex items-center justify-between">
        <div>
          <h1 className="text-xl md:text-3xl mb-2">Gestion des Catégories</h1>
          <p className="text-gray-600">{categories.length} catégories</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-indigo-600 hover:bg-indigo-700">
              <Plus className="w-4 h-4 mr-2" />
              Nouvelle catégorie
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Ajouter une catégorie</DialogTitle>
              <DialogDescription>
                Créez une nouvelle catégorie de produits
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleAddCategory} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="categoryName">Nom de la catégorie</Label>
                <Input
                  id="categoryName"
                  value={newCategory.name}
                  onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={newCategory.description}
                  onChange={(e) => setNewCategory({ ...newCategory, description: e.target.value })}
                  required
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  Annuler
                </Button>
                <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700">
                  Ajouter
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent>
  <DialogHeader>
    <DialogTitle>Modifier la catégorie</DialogTitle>
  </DialogHeader>
  
  {/* Sécurité : On n'affiche le formulaire que si currentCategory est chargé */}
  {currentCategory ? (
    <form onSubmit={handleEditCategory} className="space-y-4">
      <div className="space-y-2">
        <Label>Nom</Label>
        <Input
          value={currentCategory.name || ""} 
          onChange={(e) => setCurrentCategory({ ...currentCategory, name: e.target.value })}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="editDescription">Description</Label>
        <Textarea
          id="editDescription"
          value={currentCategory.description || ""} 
          onChange={(e) => setCurrentCategory({ ...currentCategory, description: e.target.value })}
        />
      </div>
      {/* ... reste de tes champs ... */}
      <Button type="submit">Enregistrer</Button>
    </form>
  ) : (
    <p>Chargement des données...</p>
  )}
</DialogContent>
        </Dialog>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map((category) => (
          <Card key={category?.id || Math.random()} className='dark:bg-[#0f172a]'>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <FolderTree className="w-5 h-5 text-indigo-600" />
                  <CardTitle className="text-lg">{category?.name || category?.nom || "Sans nom"}</CardTitle>
                </div>
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="sm" onClick={() =>{setCurrentCategory(category); 
    setIsEditDialogOpen(true);}}>
                    <Edit className="w-4 h-4"  />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => handleDeleteCategory(category.id)}
                  >
                    <Trash2 className="w-4 h-4 text-red-600" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4">{category.description}</p>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Produits</span>
                <span className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm">
                  {category.productCount}
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Categories Table */}
      <Card className='dark:bg-[#0f172a]'>
        <CardHeader>
          <CardTitle>Liste des catégories</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nom</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Nombre de produits</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {categories.map((category) => (
                <TableRow key={category.id}>
                  <TableCell>{category?.name || category?.nom}</TableCell>
                  <TableCell>{category.description}</TableCell>
                  <TableCell>{category.productCount}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="sm" onClick={()=> { setCurrentCategory(category); 
    setIsEditDialogOpen(true);}}>
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleDeleteCategory(category.id)}
                      >
                        <Trash2 className="w-4 h-4 text-red-600" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}

export default Categories