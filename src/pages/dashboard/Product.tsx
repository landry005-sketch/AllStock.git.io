/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "../../components/ui/table";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../../components/ui/dialog";
const UNITES_OPTIONS = [
  { label: "Pièce", value: "piece" },
  { label: "Kilogramme", value: "kilo" },
  { label: "Litre", value: "litre" },
  { label: "Carton", value: "carton" },
  { label: "Mètre", value: "metre" },
];
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { Package, Plus, Trash2, Edit, QrCode, AlertCircle, Loader2, SquareDashed, Barcode, ScanBarcode } from "lucide-react";
import { format } from "date-fns";
import { toast } from "react-toastify";

export default function Products() {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [availableUnits, setAvailableUnits] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [error, setError] = useState('')

  const [newProduct, setNewProduct] = useState({
  name: "",
  category_id: "",
  unite: "pce",
  quantity: 0,
  purchasePrice: 0,
  sellingPrice: 0,
  supplier_id: "", // ID du fournisseur sélectionné
  expiryDate: "",
  storageZone: "",
  code_barre: ""
});

  
  // --- 1. CHARGEMENT INITIAL ---
  useEffect(() => {
    const userStr = localStorage.getItem("currentUser");
    if (userStr) {
      const user = JSON.parse(userStr);
      setCurrentUser(user);
      fetchProducts(user.orgCode);
      fetchCategories(user.orgCode);
      loadProducts();
      fetchExixtingsUnits(user.orgCode);
    }
  }, []);
  const fetchExixtingsUnits = async (orgId: string) =>{
    try{
      const response = await fetch(`http://localhost:5000/api/stock/units?org_id=${orgId}`, {
        headers: {
          'Authorization': `Bearer: ${localStorage.getItem('token')}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setAvailableUnits(data.length > 0 ? data: UNITES_OPTIONS.map(u => u.value));
      }
    }catch(error){
      console.error("Erreur des unités", error)
      setAvailableUnits(UNITES_OPTIONS.map(u =>u.value));
    }
  }
  const loadProducts = async () => {
    try {
      setIsLoading(true);
      
      // On récupère l'utilisateur pour avoir son org_id
      const userStr = localStorage.getItem("currentUser");
      if (!userStr) throw new Error("Utilisateur non connecté");
      
      const user = JSON.parse(userStr);
      const orgId = user.orgCode || user.org_id; // Supporte les deux formats

      // Appel à ton API Backend
      const response = await fetch(`http://localhost:5000/api/stock/products?orgId=${orgId}`);
      
      if (!response.ok) throw new Error("Erreur lors de la récupération des données");
      
      const data = await response.json();
      setProducts(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };
  const fetchProducts = async (orgId: string) => {
    try {
      const response = await fetch(`http://localhost:5000/api/stock/products?org_id=${orgId}`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (response.ok) {
        const data = await response.json();
        setProducts(data);
      }
    } catch (error) {
      toast.error("Erreur lors du chargement des produits");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCategories = async (orgId: string) => {
    try {
      const response = await fetch(`http://localhost:5000/api/stock/getCategory?org_id=${orgId}`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (response.ok) {
        const data = await response.json();
        setCategories(data);
      }
    } catch (error) {
      console.error("Erreur catégories:", error);
    }
  };

  // --- 2. ACTIONS ---
 const handleAddProduct = async (e: React.FormEvent) => {
  e.preventDefault();
  const toastId = toast.loading("Enregistrement...");

  // Préparation des données pour correspondre au backend
  const productToSave = {
    ...newProduct,
    category_id: newProduct.category_id === "" ? null : newProduct.category_id,
    org_id: currentUser.orgCode || currentUser.org_id //
  };

  try {
    const response = await fetch('http://localhost:5000/api/stock/addProduct', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}` 
      },
      body: JSON.stringify(productToSave),
    });

    if (response.ok) {
      const addedProduct = await response.json();
      
      // On s'assure que le produit ajouté a les bonnes clés pour l'affichage immédiat
      const formattedProduct = {
        ...addedProduct,
        name: addedProduct.nom || addedProduct.name,
        quantity: addedProduct.quantite_stock || addedProduct.quantity,
        category_name: categories.find(c => String(c.id) === String(productToSave.category_id))?.nom || "Général"
      };

      setProducts([formattedProduct, ...products]);
      setIsAddDialogOpen(false);
      setNewProduct({ name: "", category_id: "", unite: "pce", quantity: 0, purchasePrice: 0, sellingPrice: 0, supplier_id: "", expiryDate: "", storageZone: "", code_barre: "" });
      toast.update(toastId, { render: "Produit enregistré !", type: "success", isLoading: false, autoClose: 2000 });
    } else {
      const err = await response.json();
      throw new Error(err.error || "Erreur lors de l'ajout");
    }
  } catch (error: any) {
    toast.update(toastId, { render: error.message, type: "error", isLoading: false, autoClose: 3000 });
  }
};
  const handleDeleteProduct = async (id: string) => {
    if (!confirm("Supprimer ce produit ?")) return;
    
    try {
      const response = await fetch(`http://localhost:5000/api/stock/deleteProduct/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });

      if (response.ok) {
        setProducts(products.filter((p) => p.id !== id));
        toast.success("Produit supprimé");
      }
    } catch (error) {
      toast.error("Erreur lors de la suppression");
    }
  };

  // --- 3. LOGIQUE DE FILTRE ---
  const filteredProducts = products.filter((product) =>
    product.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.category_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const isExpiringSoon = (expiryDate: string) => {
    if (!expiryDate) return false;
    const expiry = new Date(expiryDate);
    const daysUntil = Math.ceil((expiry.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
    return daysUntil <= 7 && daysUntil > 0;
  };

  if (isLoading) return <div className="flex justify-center p-10"><Loader2 className="animate-spin" /></div>;

  return (
    <div className="space-y-6">
      <div className="grid gap-2 md:gap-0 md:flex items-center justify-between">
        <div>
          <h1 className="text-3xl mb-2">Gestion des Produits</h1>
          <p className="text-gray-600">{products.length} produits au total</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-indigo-600 hover:bg-indigo-700">
              <Plus className="w-4 h-4 mr-2" /> Ajouter un produit
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Nouveau produit</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAddProduct} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Nom du produit</Label>
                  <Input value={newProduct.name} onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })} required />
                </div>
                <div className="space-y-2">
                  <Label>Code barre</Label>
                  <div className="flex gap-2 justify-center items-center ">
                    <Input value={newProduct.code_barre} onChange={(e) => setNewProduct({...newProduct, code_barre: e.target.value})}/>
                    <ScanBarcode className="cursor-pointer"/>
                  </div>
                </div>
                <div className="space-y-2">
                   <Label>Zone de stockage</Label>
                   <Input value={newProduct.storageZone} onChange={(e) => setNewProduct({ ...newProduct, storageZone: e.target.value })} />
                </div>

                <div className="space-y-2">
                  <Label>Catégorie</Label>
                  <Select 
                    value={newProduct.category_id} 
                    onValueChange={(val) => setNewProduct({ ...newProduct, category_id: val })}
                  >
                    <SelectTrigger className="w-full">
                              {/* On laisse SelectValue gérer l'affichage via le placeholder si vide */}
                      <SelectValue placeholder="Choisir une catégorie" />
                    </SelectTrigger>
                    <SelectContent className="z-9999"> {/* Force l'affichage au-dessus de la modale */}
                      {categories.map((cat) => (
                        <SelectItem key={cat.id} value={String(cat.id)}>
                          {cat.nom || cat.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Unité</Label>
                    <Select
                      value={newProduct.unite}
                      onValueChange={(val) => setNewProduct({ ...newProduct, unite: val })}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Choisir une unité" />
                      </SelectTrigger>
                      <SelectContent className="z-9999">
                        {availableUnits.map((unit) => (
                          <SelectItem key={unit} value={unit}>
                            {unit}
                          </SelectItem>
                        ))}
            
      
                      </SelectContent>
                    </Select>
                </div>
                <div className="space-y-2">
                  <Label>Quantité</Label>
                  <Input type="number" value={newProduct.quantity} onChange={(e) => setNewProduct({ ...newProduct, quantity: Number(e.target.value) })} required />
                </div>

                <div className="space-y-2">
                  <Label>Prix d'achat (XAF)</Label>
                  <Input type="number" value={newProduct.purchasePrice} onChange={(e) => setNewProduct({ ...newProduct, purchasePrice: Number(e.target.value) })} required />
                </div>

                <div className="space-y-2">
                  <Label>Prix de vente (XAF)</Label>
                  <Input type="number" value={newProduct.sellingPrice} onChange={(e) => setNewProduct({ ...newProduct, sellingPrice: Number(e.target.value) })} required />
                </div>

                <div className="space-y-2">
                  <Label>Date de péremption</Label>
                  <Input type="date" value={newProduct.expiryDate} onChange={(e) => setNewProduct({ ...newProduct, expiryDate: e.target.value })} />
                </div>
              </div>
              <Button type="submit" className="w-full bg-indigo-600">Enregistrer le produit</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="dark:bg-[#0f172a]">
        <CardContent className="pt-6">
          <Input placeholder="Rechercher un produit..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
        </CardContent>
      </Card>

      <Card className="dark:bg-[#0f172a]">
        <CardHeader><CardTitle>Liste des produits</CardTitle></CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="font-semibold">ID</TableHead>
                  <TableHead className="font-semibold">Code barre</TableHead>
                  <TableHead className="font-semibold">Nom</TableHead>
                  <TableHead className="font-semibold">Catégorie</TableHead>
                  <TableHead className="font-semibold">Stock</TableHead>
                  <TableHead className="font-semibold">Zone de stockage</TableHead>
                  <TableHead className="font-semibold">Unité</TableHead>
                  <TableHead className="font-semibold">Prix Vente</TableHead>
                  <TableHead className="font-semibold">Fournisseur</TableHead>
                  <TableHead className="font-semibold">Nombre de vente</TableHead>
                  <TableHead className="font-semibold">Péremption</TableHead>
                  <TableHead className="font-semibold">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProducts.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell className="font-mono text-xs">{ product.id.slice(0,8)}</TableCell>
                    <TableCell>{product.code_barre}</TableCell>
                    <TableCell className="font-medium">{product.name}</TableCell>
                    <TableCell><span className="px-2 py-1 bg-gray-100 rounded dark:bg-[#0f172a] dark:text-green-400 text-xs">{product.category_name || "Général"}</span></TableCell>
                    <TableCell><span className={product.quantity < 10 ? "text-red-600 font-bold" : ""}>{product.quantity}</span></TableCell>
                    <TableCell>{product.zone_stockage || "non définie"}</TableCell>
                    <TableCell>{product.unite || "//"}</TableCell>
                    <TableCell>{product.selling_price || product.sellingPrice} XAF</TableCell>
                    <TableCell>{product.supplier_name || "Indéfinie"}</TableCell>
                    <TableCell className="text-center font-bold text-indigo-600">
                      {product.nombre_vente || product.sales || 0}
                    </TableCell>
                    <TableCell>
                      {product.expiry_date && (
                        <div className="flex items-center gap-1">
                           {isExpiringSoon(product.expiry_date) && <AlertCircle className="w-3 h-3 text-red-500" />}
                           <span className={isExpiringSoon(product.expiry_date) ? "text-red-500" : "Produit non perissable"}>
                             {format(new Date(product.expiry_date), "dd/MM/yyyy")}
                           </span>
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="sm"><Edit className="w-4 h-4" /></Button>
                        <Button variant="ghost" size="sm" onClick={() => handleDeleteProduct(product.id)}><Trash2 className="w-4 h-4 text-red-500" /></Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
