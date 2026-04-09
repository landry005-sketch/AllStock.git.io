/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
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
  const [isSendingOrder, setIsSendingOrder] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isOrderDialogOpen, setIsOrderDialogOpen] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState<any>(null);

  // State pour le nouveau fournisseur
  const [newSupplier, setNewSupplier] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
  });

  // --- NOUVEAUX STATES POUR COMMANDE MULTI-PRODUITS ---
  const [orderItems, setOrderItems] = useState([
    { id: Date.now(), productName: "", quantity: 1 }
  ]);
  const [deliveryDate, setDeliveryDate] = useState("");

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
        setSuppliers([...suppliers, { ...added, name: added.name || added.nom }]);
        setIsAddDialogOpen(false);
        setNewSupplier({ name: "", email: "", phone: "", address: "" });
        toast.update(toastId, { render: "Fournisseur ajouté !", type: "success", isLoading: false, autoClose: 2000 });
      }
    } catch (error: any) {
      toast.update(toastId, { render: "Erreur lors de l'ajout", type: "error", isLoading: false, autoClose: 3000 });
    }
  };

  // --- LOGIQUE MULTI-PRODUITS ---
  const addOrderItem = () => {
    setOrderItems([...orderItems, { id: Date.now(), productName: "", quantity: 1 }]);
  };

  const removeOrderItem = (id: number) => {
    if (orderItems.length > 1) {
      setOrderItems(orderItems.filter(item => item.id !== id));
    }
  };

  const updateOrderItem = (id: number, field: string, value: any) => {
    setOrderItems(orderItems.map(item => 
      item.id === id ? { ...item, [field]: value } : item
    ));
  };

  const handleOrder = (supplier: any) => {
    setSelectedSupplier(supplier);
    setIsOrderDialogOpen(true);
  };

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSendingOrder(true);
    const toastId = toast.loading("Envoi de la commande par email...");

    try {
      const response = await fetch('http://localhost:5000/api/stock/send-supplier-order', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}` 
        },
        body: JSON.stringify({
          supplierEmail: selectedSupplier.email,
          supplierName: selectedSupplier.name,
          items: orderItems,
          deliveryDate,
          orgName: currentUser.organizationName
        }),
      });

      if (response.ok) {
        toast.update(toastId, { render: `Commande envoyée à ${selectedSupplier.name}`, type: "success", isLoading: false, autoClose: 3000 });
        setIsOrderDialogOpen(false);
        setOrderItems([{ id: Date.now(), productName: "", quantity: 1 }]);
        setDeliveryDate("");
      } else {
        throw new Error();
      }
    } catch (error) {
      toast.update(toastId, { render: "Échec de l'envoi de l'email", type: "error", isLoading: false, autoClose: 3000 });
    } finally {
      setIsSendingOrder(false);
    }
  };

  if (isLoading) return <div className="flex justify-center p-10"><Loader2 className="animate-spin" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div>
          <h1 className="text-xl md:text-3xl font-bold">Gestion des Fournisseurs</h1>
          <p className="text-gray-600">{suppliers.length} partenaires enregistrés</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-indigo-600 hover:bg-indigo-700 w-full md:w-auto">
              <Plus className="w-4 h-4 mr-2" /> Nouveau fournisseur
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Ajouter un fournisseur</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAddSupplier} className="space-y-4">
              <div className="space-y-2">
                <Label>Nom</Label>
                <Input value={newSupplier.name} onChange={(e) => setNewSupplier({ ...newSupplier, name: e.target.value })} required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input type="email" value={newSupplier.email} onChange={(e) => setNewSupplier({ ...newSupplier, email: e.target.value })} required />
                </div>
                <div className="space-y-2">
                  <Label>Téléphone</Label>
                  <Input value={newSupplier.phone} onChange={(e) => setNewSupplier({ ...newSupplier, phone: e.target.value })} required />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Adresse</Label>
                <Input value={newSupplier.address} onChange={(e) => setNewSupplier({ ...newSupplier, address: e.target.value })} required />
              </div>
              <Button type="submit" className="w-full bg-indigo-600">Enregistrer le partenaire</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {suppliers.map((supplier) => (
          <Card key={supplier.id} className="dark:bg-[#0f172a] border-slate-200 dark:border-slate-800">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Truck className="w-5 h-5 text-indigo-600" />
                  <CardTitle className="text-lg">{supplier.name}</CardTitle>
                </div>
                <Button variant="ghost" size="icon" className="text-red-500" onClick={() => fetch(`http://localhost:5000/api/stock/deletesupplier/${supplier.id}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` } }).then(() => fetchSuppliers(currentUser.orgCode))}>
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2 text-sm text-gray-500 dark:text-slate-400">
                <div className="flex items-center gap-2"><Mail className="w-4 h-4" /> {supplier.email}</div>
                <div className="flex items-center gap-2"><Phone className="w-4 h-4" /> {supplier.phone}</div>
                <div className="flex items-center gap-2"><MapPin className="w-4 h-4" /> {supplier.address}</div>
              </div>
              <Button className="w-full bg-green-600 hover:bg-green-700" size="sm" onClick={() => handleOrder(supplier)}>
                <ShoppingCart className="w-4 h-4 mr-2" /> Passer commande
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* DIALOG DE COMMANDE MODIFIÉ */}
      <Dialog open={isOrderDialogOpen} onOpenChange={setIsOrderDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Nouvelle commande</DialogTitle>
            <DialogDescription>Fournisseur : <span className="font-bold text-indigo-600">{selectedSupplier?.name}</span></DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmitOrder} className="space-y-4">
            <div className="space-y-2">
              <Label>Date de livraison souhaitée</Label>
              <Input type="date" value={deliveryDate} onChange={(e) => setDeliveryDate(e.target.value)} required />
            </div>

            <div className="space-y-3 max-h-[250px] overflow-y-auto pr-2">
              <Label>Liste des produits</Label>
              {orderItems.map((item, index) => (
                <div key={item.id} className="flex gap-2 items-center bg-slate-50 dark:bg-slate-900 p-2 rounded-lg">
                  <Input 
                    placeholder="Produit" 
                    value={item.productName} 
                    onChange={(e) => updateOrderItem(item.id, 'productName', e.target.value)}
                    className="flex-1"
                    required 
                  />
                  <Input 
                    type="number" 
                    className="w-20"
                    value={item.quantity} 
                    onChange={(e) => updateOrderItem(item.id, 'quantity', Number(e.target.value))}
                    required 
                    min="1" 
                  />
                  {orderItems.length > 1 && (
                    <Button type="button" variant="ghost" size="icon" onClick={() => removeOrderItem(item.id)} className="text-red-500">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>

            <Button type="button" variant="outline" onClick={addOrderItem} className="w-full border-dashed">
              <Plus className="w-4 h-4 mr-2" /> Ajouter une ligne
            </Button>

            <Button type="submit" className="w-full bg-indigo-600" disabled={isSendingOrder}>
              {isSendingOrder ? <Loader2 className="animate-spin mr-2" /> : <Mail className="mr-2 w-4 h-4" />}
              Envoyer la commande ({orderItems.length})
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}