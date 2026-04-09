/* eslint-disable @typescript-eslint/no-explicit-any */

import { useState, useEffect, useCallback } from "react";
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { Package, Plus, Trash2, Edit, QrCode, AlertCircle, Loader2, SquareDashed, Barcode, ScanBarcode } from "lucide-react";
import { format } from "date-fns";
import { toast } from "react-toastify";

// Une fonction debounce simple pour éviter les appels API excessifs
function useDebounce(value: string, delay: number) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Annuler le timeout si la valeur change (ou si le composant est démonté)
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

const UNITES_OPTIONS = [
  { label: "Pièce", value: "piece" },
  { label: "Kilogramme", value: "kilo" },
  { label: "Litre", value: "litre" },
  { label: "Carton", value: "carton" },
  { label: "Mètre", value: "metre" },
];

export default function Products() {
  const [suggestedAttributes, setSuggestedAttributes] = useState<string[]>([]);
  const [selectedAttributes, setSelectedAttributes] = useState<string[]>([]);
  
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [availableUnits, setAvailableUnits] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  
  const [newProduct, setNewProduct] = useState({
    name: "",
    category_id: "",
    unite: "pce",
    quantity: 0,
    purchasePrice: 0,
    sellingPrice: 0,
    supplier_id: "",
    expiryDate: "",
    storageZone: "",
    code_barre: ""
  });

  // Utilisation du hook de debounce pour le nom du produit
  const debouncedProductName = useDebounce(newProduct.name, 500); // 500ms de délai

  // --- 1. LOGIQUE DE SUGGESTION DE VARIANTES (IA) ---
  const suggestVariants = async (productName: string) => {
    if (productName.length < 3) return;
    try {
      const response = await fetch('http://localhost:5000/api/stock/suggest-variants', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}` 
        },
        body: JSON.stringify({ productName }),
      });
      if (response.ok) {
        const data = await response.json();
        // Filtrer les suggestions pour ne pas montrer celles déjà sélectionnées
        const newSuggestions = (data.attributes || []).filter((attr: string) => !selectedAttributes.includes(attr));
        setSuggestedAttributes(newSuggestions);
      }
    } catch (error) {
      console.error("Erreur de suggestion de variantes:", error);
    }
  };
  
  useEffect(() => {
    if (debouncedProductName) {
      suggestVariants(debouncedProductName);
    }
  }, [debouncedProductName]); // Se déclenche uniquement quand la valeur "débouncée" change

  // Fonction pour ajouter un attribut suggéré aux variantes sélectionnées
  const handleSelectAttribute = (attribute: string) => {
    setSelectedAttributes(prev => [...prev, attribute]);
    setSuggestedAttributes(prev => prev.filter(attr => attr !== attribute));
  };
  
  // Fonction pour retirer une variante sélectionnée
  const handleRemoveAttribute = (attribute: string) => {
    setSelectedAttributes(prev => prev.filter(attr => attr !== attribute));
    // Optionnel: remettre l'attribut dans les suggestions
    if (!suggestedAttributes.includes(attribute)) {
        setSuggestedAttributes(prev => [...prev, attribute]);
    }
  };


  // --- 2. CHARGEMENT INITIAL DES DONNÉES ---
  useEffect(() => {
    const userStr = localStorage.getItem("currentUser");
    if (userStr) {
      const user = JSON.parse(userStr);
      const orgId = user.orgCode || user.org_id;
      setCurrentUser(user);
      fetchProducts(orgId);
      fetchCategories(orgId);
      fetchExistingUnits(orgId);
    } else {
        setIsLoading(false);
        toast.error("Utilisateur non connecté. Veuillez vous reconnecter.");
    }
  }, []);

  const fetchExistingUnits = async (orgId: string) => {
    try {
      const response = await fetch(`http://localhost:5000/api/stock/units?org_id=${orgId}`, {
        headers: {
          // Correction: Espace après "Bearer"
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setAvailableUnits(data.length > 0 ? data : UNITES_OPTIONS.map(u => u.value));
      } else {
         setAvailableUnits(UNITES_OPTIONS.map(u => u.value));
      }
    } catch (error) {
      console.error("Erreur des unités", error);
      setAvailableUnits(UNITES_OPTIONS.map(u => u.value));
    }
  };

  const fetchProducts = async (orgId: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(`http://localhost:5000/api/stock/products?org_id=${orgId}`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (response.ok) {
        const data = await response.json();
        setProducts(data);
      } else {
        toast.error("Erreur lors du chargement des produits.");
      }
    } catch (error) {
      toast.error("Erreur réseau lors du chargement des produits.");
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

  // --- 3. ACTIONS UTILISATEUR (CRUD) ---
  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    const toastId = toast.loading("Enregistrement...");

    // Logique pour combiner le nom et les variantes
    const finalProductName = selectedAttributes.length > 0 
        ? `${newProduct.name} (${selectedAttributes.join(', ')})`
        : newProduct.name;

    const productToSave = {
      ...newProduct,
      name: finalProductName,
      category_id: newProduct.category_id === "" ? null : newProduct.category_id,
      org_id: currentUser.orgCode || currentUser.org_id
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
        
        // On s'assure que le produit ajouté a les bonnes clés pour l'affichage immédiat.
        // NOTE: Idéalement, l'API devrait retourner un format cohérent.
        const formattedProduct = {
          ...addedProduct,
          name: addedProduct.nom || addedProduct.name,
          quantity: addedProduct.quantite_stock || addedProduct.quantity,
          category_name: categories.find(c => String(c.id) === String(productToSave.category_id))?.nom || "Général"
        };
        
        setProducts([formattedProduct, ...products]);
        setIsAddDialogOpen(false);
        // Reset du formulaire et des états de variantes
        setNewProduct({ name: "", category_id: "", unite: "pce", quantity: 0, purchasePrice: 0, sellingPrice: 0, supplier_id: "", expiryDate: "", storageZone: "", code_barre: "" });
        setSelectedAttributes([]);
        setSuggestedAttributes([]);
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
    if (!window.confirm("Supprimer ce produit ? Cette action est irréversible.")) return;
    
    const toastId = toast.loading("Suppression...");
    try {
      const response = await fetch(`http://localhost:5000/api/stock/deleteProduct/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (response.ok) {
        setProducts(products.filter((p) => p.id !== id));
        toast.update(toastId, { render: "Produit supprimé", type: "success", isLoading: false, autoClose: 2000 });
      } else {
         throw new Error("Échec de la suppression");
      }
    } catch (error: any) {
      toast.update(toastId, { render: error.message || "Erreur lors de la suppression", type: "error", isLoading: false, autoClose: 3000 });
    }
  };

  // --- 4. LOGIQUE D'AFFICHAGE ET DE FILTRE ---
  const filteredProducts = products.filter((product) =>
    product.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.category_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const isExpiringSoon = (expiryDateStr: string | null) => {
    if (!expiryDateStr) return false;
    const expiry = new Date(expiryDateStr);
    if (isNaN(expiry.getTime())) return false; // Date invalide
    
    const daysUntil = Math.ceil((expiry.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
    return daysUntil <= 7 && daysUntil >= 0;
  };
  
  const isValidDate = (dateStr: string | null) => {
    if (!dateStr) return false;
    return !isNaN(new Date(dateStr).getTime());
  };

  if (isLoading) return <div className="flex justify-center p-10"><Loader2 className="animate-spin text-indigo-600" size={48} /></div>;

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
                {/* NOM DU PRODUIT + SUGGESTIONS */}
                <div className="space-y-2 col-span-2 md:col-span-1">
                  <Label>Nom du produit</Label>
                  <Input 
                    value={newProduct.name} 
                    onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })} 
                    placeholder="Ex: Samsung Galaxy A07"
                    required 
                  />
                  
                  {suggestedAttributes && suggestedAttributes.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-2">
                        <span className="text-xs text-gray-500 mr-2">Suggestions IA:</span>
                      {suggestedAttributes.map((attr, i) => (
                        <button 
                          key={i} 
                          type="button" 
                          onClick={() => handleSelectAttribute(attr)}
                          className="px-2 py-0.5 text-xs bg-gray-200 dark:bg-gray-700 rounded-full hover:bg-indigo-200 dark:hover:bg-indigo-800 transition-colors"
                        >
                          + {attr}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                {/* ZONE DES VARIANTES SÉLECTIONNÉES */}
                <div className="space-y-2 col-span-2 md:col-span-1">
                  <Label>Variantes</Label>
                  <div className="flex flex-wrap gap-2 min-h-[40px] p-2 border rounded-md bg-slate-50/50 dark:bg-slate-900/50">
                    {selectedAttributes.length === 0 && <span className="text-xs text-gray-400 italic">Aucune variante</span>}
                    {selectedAttributes.map((attr, index) => (
                      <span 
                        key={index} 
                        className="flex items-center gap-1 px-2 py-1 text-xs bg-indigo-600 text-white rounded-md animate-in fade-in zoom-in duration-200"
                      >
                        {attr}
                        <Trash2 
                          className="w-3 h-3 cursor-pointer hover:text-red-200" 
                          onClick={() => handleRemoveAttribute(attr)}
                        />
                      </span>
                    ))}
                  </div>
                </div>

                {/* LE RESTE DU FORMULAIRE */}
                <div className="space-y-2">
                  <Label>Code barre</Label>
                  <div className="flex gap-2 justify-center items-center">
                    <Input value={newProduct.code_barre} onChange={(e) => setNewProduct({...newProduct, code_barre: e.target.value})}/>
                    <ScanBarcode className="cursor-pointer text-gray-500 hover:text-indigo-600 transition-colors"/>
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
                    <SelectTrigger><SelectValue placeholder="Choisir une catégorie" /></SelectTrigger>
                    <SelectContent className="z-[9999]">
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
                    <SelectTrigger><SelectValue placeholder="Choisir une unité" /></SelectTrigger>
                    <SelectContent className="z-[9999]">
                      {availableUnits.map((unit) => (
                        <SelectItem key={unit} value={unit}>{unit}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Quantité</Label>
                  <Input type="text" value={newProduct.quantity} onChange={(e) => setNewProduct({ ...newProduct, quantity: Number(e.target.value) })} required />
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
              <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 mt-4 transition-all">
                Enregistrer le produit
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="dark:bg-[#0f172a]">
        <CardContent className="pt-6">
          <Input placeholder="Rechercher par nom, catégorie..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
        </CardContent>
      </Card>

      <Card className="dark:bg-[#0f172a]">
        <CardHeader><CardTitle>Liste des produits</CardTitle></CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Code barre</TableHead>
                  <TableHead>Nom</TableHead>
                  <TableHead>Catégorie</TableHead>
                  <TableHead>Stock</TableHead>
                  <TableHead>Stockage</TableHead>
                  <TableHead>Unité</TableHead>
                  <TableHead>Prix Vente</TableHead>
                  <TableHead>Fournisseur</TableHead>
                  <TableHead>Ventes</TableHead>
                  <TableHead>Péremption</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProducts.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell className="font-mono text-xs">{ product.id ? product.id.slice(0,8) : 'N/A'}</TableCell>
                    <TableCell>{product.code_barre || "N/A"}</TableCell>
                    <TableCell className="font-medium">{product.name}</TableCell>
                    <TableCell><span className="px-2 py-1 bg-gray-100 rounded dark:bg-[#0f172a] dark:text-green-400 text-xs">{product.category_name || "Général"}</span></TableCell>
                    <TableCell><span className={product.quantity < 10 ? "text-red-600 font-bold" : ""}>{product.quantity}</span></TableCell>
                    <TableCell>{product.zone_stockage || "non définie"}</TableCell>
                    <TableCell>{product.unite || "N/A"}</TableCell>
                    <TableCell>{product.selling_price || product.sellingPrice || 0} XAF</TableCell>
                    <TableCell>{product.supplier_name || "Indéfini"}</TableCell>
                    <TableCell className="text-center font-bold text-indigo-600">{product.nombre_vente || product.sales || 0}</TableCell>
                    <TableCell>
                      {isValidDate(product.expiry_date) ? (
                        <div className="flex items-center gap-1">
                            {isExpiringSoon(product.expiry_date) && <AlertCircle className="w-4 h-4 text-red-500" />}
                            <span className={isExpiringSoon(product.expiry_date) ? "text-red-500 font-semibold" : ""}>
                                {format(new Date(product.expiry_date), "dd/MM/yyyy")}
                            </span>
                        </div>
                      ) : (
                        <span className="text-gray-400 text-xs">N/A</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
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
