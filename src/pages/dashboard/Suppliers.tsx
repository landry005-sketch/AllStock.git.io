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
import { Truck, Plus, Trash2, Edit, Mail, Phone, MapPin, ShoppingCart, Loader2 } from "lucide-react";
import { toast } from "react-toastify";

export default function Suppliers() {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isOrderDialogOpen, setIsOrderDialogOpen] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState<any>(null);

  const [newSupplier, setNewSupplier] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
  });

  const [orderForm, setOrderForm] = useState({
    productName: "",
    quantity: 0,
    deliveryDate: "",
  });

  // --- 1. CHARGEMENT DES DONNÉES ---
  useEffect(() => {
    const userStr = localStorage.getItem("currentUser");
    if (userStr) {
      const user = JSON.parse(userStr);
      setCurrentUser(user);
      fetchSuppliers(user.orgCode);
    }
  }, []);

  const fetchSuppliers = async (orgId: string) => {
    try {
      const response = await fetch(`http://localhost:5000/api/stock/getsupplier?org_id=${orgId}`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (response.ok) {
        const data = await response.json();
        setSuppliers(data);
      }
    } catch (error) {
      toast.error("Erreur lors de la récupération des fournisseurs");
    } finally {
      setIsLoading(false);
    }
  };

  // --- 2. ACTIONS ---
  const handleAddSupplier = async (e: React.FormEvent) => {
    e.preventDefault();
    const toastId = toast.loading("Création du fournisseur...");

    try {
      const response = await fetch('http://localhost:5000/api/stock/addsupplier', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}` 
        },
        body: JSON.stringify({ ...newSupplier, org_id: currentUser.orgCode }),
      });

      if (response.ok) {
        const added = await response.json();
        const mappedSupplier = {
          ...added,
          name: added.name || added.nom,
          email: added.email,
          phone: added.phone || added.telephone, // Mappe 'telephone' vers 'phone'
          address: added.address || added.adresse, // Mappe 'adresse' vers 'address'
        };
        setSuppliers([...suppliers, mappedSupplier]);
        setIsAddDialogOpen(false);
        setNewSupplier({ name: "", email: "", phone: "", address: "" });
        toast.update(toastId, { render: "Fournisseur ajouté !", type: "success", isLoading: false, autoClose: 2000 });
      } else {
        const err = await response.json();
        throw new Error(err.error || "Erreur lors de l'ajout");
      }
    } catch (error: any) {
      toast.update(toastId, { render: error.message, type: "error", isLoading: false, autoClose: 3000 });
    }
  };

  const handleDeleteSupplier = async (id: string) => {
    if (!confirm("Supprimer ce fournisseur ?")) return;

    try {
      const response = await fetch(`http://localhost:5000/api/stock/deletesupplier/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });

      if (response.ok) {
        setSuppliers(suppliers.filter((s) => s.id !== id));
        toast.success("Fournisseur supprimé");
      }
    } catch (error) {
      toast.error("Impossible de supprimer ce fournisseur");
    }
  };

  const handleOrder = (supplier: any) => {
    setSelectedSupplier(supplier);
    setIsOrderDialogOpen(true);
  };

  const handleSubmitOrder = (e: React.FormEvent) => {
    e.preventDefault();
    // Logique simulée de commande (peut être liée à une table 'orders' plus tard)
    toast.success(`Commande envoyée à ${selectedSupplier?.name}`);
    setIsOrderDialogOpen(false);
    setOrderForm({ productName: "", quantity: 0, deliveryDate: "" });
  };

  if (isLoading) return <div className="flex justify-center p-10"><Loader2 className="animate-spin" /></div>;

  return (
    <div className="space-y-6">
      <div className="md:flex grid gap-2 md:gap-0 items-center justify-between">
        <div>
          <h1 className="text-xl md:text-3xl mb-2 font-bold">Gestion des Fournisseurs</h1>
          <p className="text-gray-600">{suppliers.length} partenaires enregistrés</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-indigo-600 hover:bg-indigo-700">
              <Plus className="w-4 h-4 mr-2" /> Nouveau fournisseur
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Ajouter un fournisseur</DialogTitle>
              <DialogDescription>Renseignez les coordonnées du nouveau partenaire.</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleAddSupplier} className="space-y-4">
              <div className="space-y-2">
                <Label>Nom du fournisseur</Label>
                <Input value={newSupplier.name} onChange={(e) => setNewSupplier({ ...newSupplier, name: e.target.value })} required />
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input type="email" value={newSupplier.email} onChange={(e) => setNewSupplier({ ...newSupplier, email: e.target.value })} required />
              </div>
              <div className="space-y-2">
                <Label>Téléphone</Label>
                <Input value={newSupplier.phone} onChange={(e) => setNewSupplier({ ...newSupplier, phone: e.target.value })} required />
              </div>
              <div className="space-y-2">
                <Label>Adresse</Label>
                <Input value={newSupplier.address} onChange={(e) => setNewSupplier({ ...newSupplier, address: e.target.value })} required />
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>Annuler</Button>
                <Button type="submit" className="bg-indigo-600">Enregistrer</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Vue en Grille (Cards) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {suppliers.map((supplier) => (
          <Card key={supplier.id} className="dark:bg-[#0f172a] hover:shadow-md transition-shadow">
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-indigo-50 rounded-lg">
                    <Truck className="w-5 h-5 text-indigo-600" />
                  </div>
                  <CardTitle className="text-lg">{supplier.name}</CardTitle>
                </div>
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" className="h-8 w-8"><Edit className="w-4 h-4" /></Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500" onClick={() => handleDeleteSupplier(supplier.id)}><Trash2 className="w-4 h-4" /></Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex items-center gap-2"><Mail className="w-4 h-4" /> {supplier.email}</div>
                <div className="flex items-center gap-2"><Phone className="w-4 h-4" /> {supplier.phone}</div>
                <div className="flex items-center gap-2"><MapPin className="w-4 h-4" /> {supplier.address}</div>
              </div>
              <div className="pt-3 border-t">
                <p className="text-xs text-gray-500 mb-3">
                   ID: <span className="font-mono">{String(supplier.id).slice(0, 8)}</span>
                </p>
                <Button className="w-full bg-green-600 hover:bg-green-700" size="sm" onClick={() => handleOrder(supplier)}>
                  <ShoppingCart className="w-4 h-4 mr-2" /> Commander
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Boîte de dialogue de commande */}
      <Dialog open={isOrderDialogOpen} onOpenChange={setIsOrderDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Passer une commande</DialogTitle>
            <DialogDescription>Commande auprès de <span className="font-bold text-indigo-600">{selectedSupplier?.name}</span></DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmitOrder} className="space-y-4">
            <div className="space-y-2">
              <Label>Produit souhaité</Label>
              <Input value={orderForm.productName} onChange={(e) => setOrderForm({ ...orderForm, productName: e.target.value })} required />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Quantité</Label>
                <Input type="number" value={orderForm.quantity} onChange={(e) => setOrderForm({ ...orderForm, quantity: Number(e.target.value) })} required min="1" />
              </div>
              <div className="space-y-2">
                <Label>Date prévue</Label>
                <Input type="date" value={orderForm.deliveryDate} onChange={(e) => setOrderForm({ ...orderForm, deliveryDate: e.target.value })} required />
              </div>
            </div>
            <Button type="submit" className="w-full bg-indigo-600">Confirmer l'envoi</Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}