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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { ShoppingCart, Plus, FileText, Download, TrendingUp, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { toast } from "react-toastify";

export default function Sales() {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [sales, setSales] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  
  const [newSale, setNewSale] = useState({
    productId: "",
    quantity: 1,
    customerName: "",
    customerPhone: "",
    customerMail: "",
    unite: ""
  });

  // --- 1. CHARGEMENT INITIAL ---
  useEffect(() => {
    const userStr = localStorage.getItem("currentUser");
    if (userStr) {
      const user = JSON.parse(userStr);
      setCurrentUser(user);
      fetchData(user.orgCode);
    }
  }, []);

  const fetchData = async (orgId: string) => {
    try {
      const token = localStorage.getItem('token');
      const headers = { 'Authorization': `Bearer ${token}` };

      const [salesRes, productsRes] = await Promise.all([
        fetch(`http://localhost:5000/api/sales/getSales?org_id=${orgId}`, { headers }),
        fetch(`http://localhost:5000/api/stock/products?org_id=${orgId}`, { headers })
      ]);

      if (salesRes.ok && productsRes.ok) {
        setSales(await salesRes.json());
        setProducts(await productsRes.json());
      }
    } catch (error) {
      toast.error("Erreur de synchronisation des données");
    } finally {
      setIsLoading(false);
    }
  };

  // --- 2. ACTIONS ---
 const handleAddSale = async (e: React.FormEvent) => {
  e.preventDefault();
  if (!currentUser || !currentUser.id) {
    toast.error("Session expirée, veuillez vous reconnecter");
    return;
  }
  const user = JSON.parse(localStorage.getItem("currentUser") || "{}");
  const saleData = {
    ...newSale,
    users_id: currentUser.id || user.id || user.users_id, // On injecte l'ID de celui qui vend
    org_id: currentUser.orgCode || currentUser.org_id //
  };
  
  const selectedProduct = products.find(p => p.id === newSale.productId);
  if (!selectedProduct || selectedProduct.quantity < newSale.quantity) {
    return toast.error("Stock insuffisant !");
  }

  const toastId = toast.loading("Enregistrement de la vente...");

  try {
    const response = await fetch('http://localhost:5000/api/sales/createSale', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}` 
      },
      body: JSON.stringify({
        saleData,
        productId: newSale.productId,
        quantity: newSale.quantity,
        nomClient: newSale.customerName, // Correction ici : nomClient au lieu de customerName
        telephoneClient: newSale.customerPhone || "N/A", // Correction ici
        org_id: currentUser.orgCode,
        userId: saleData.users_id
      }),
    });
    console.log("saleData:", saleData)

    if (response.ok) {
      await fetchData(currentUser.orgCode);
      setIsAddDialogOpen(false);
      setNewSale({ productId: "", quantity: 1, customerName: "", customerPhone: "", customerMail: "", unite:"" });
      toast.update(toastId, { render: "Vente réussie !", type: "success", isLoading: false, autoClose: 2000 });
    } else {
      const errorData = await response.json();
      throw new Error(errorData.error || "Erreur lors de la transaction");
    }
  } catch (error: any) {
    toast.update(toastId, { render: error.message, type: "error", isLoading: false, autoClose: 3000 });
  }
};

  // Calculs dynamiques
  const totalRevenue = sales.reduce((sum, sale) => sum + Number(sale.totalPrice), 0);
  const todaySales = sales.filter(
    (sale) => format(new Date(sale.date), "yyyy-MM-dd") === format(new Date(), "yyyy-MM-dd")
  ).length;

  const handleGenerateInvoice = (sale: any) => {
    toast.info(`Facture ${sale.id} en cours de génération...`);
    // Ici tu pourras appeler une route backend qui génère un PDF avec une lib comme jspdf ou puppeteer
  };

  if (isLoading) return <div className="flex justify-center p-10"><Loader2 className="animate-spin" /></div>;
  const getStatusBadgeColor = (etat: string) => {
  // On utilise toUpperCase pour éviter les erreurs de casse (Payé vs payé)
  switch (etat?.toUpperCase()) {
    case "payé":
      return "bg-green-100 text-green-700 border-green-200";
    case "impayé":
      return "bg-red-100 text-red-700 border-red-200";
    case "partiel":
      return "bg-orange-100 text-orange-700 border-orange-200";
    default:
      return "bg-gray-100 text-gray-700 border-gray-200";
  }
};

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2 dark:text-white text-gray-800">Gestion des Ventes</h1>
          <p className="text-gray-600">{sales.length} transactions effectuées</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-green-600 hover:bg-green-700">
              <Plus className="w-4 h-4 mr-2" /> Nouvelle commande
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Enregistrer une vente</DialogTitle>
              <DialogDescription>Vendeur : {currentUser?.username}</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleAddSale} className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label>Produit</Label>
                <Select
                  value={newSale.productId}
                  onValueChange={(prodId) => {
    
                    const selectedProd = products.find(p => p.id === prodId);

                    setNewSale({ 
                      ...newSale, 
                      productId: prodId, 
                      unite: selectedProd?.unite || "" 
                    });
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Choisir un article" />
                  </SelectTrigger>
                  <SelectContent>
                    {products.map((product) => (
                      <SelectItem key={product.id} value={product.id} disabled={product.quantity <= 0}>
                        {product.name} ({product.sellingPrice} FCFA) - Stock: {product.quantity}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Unité de mesure</Label>
                <Input 
                  value={newSale.unite} 
                  readOnly 
                  className="bg-gray-100 cursor-not-allowed" 
                  placeholder="Sélectionnez un produit..."
                />
              </div>


              <div className="space-y-2">
                <Label>Quantité</Label>
                <Input
                  type="number"
                  value={newSale.quantity}
                  onChange={(e) => setNewSale({ ...newSale, quantity: Number(e.target.value) })}
                  min="1"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>Nom du client</Label>
                <Input
                  placeholder="Client comptant"
                  value={newSale.customerName}
                  onChange={(e) => setNewSale({ ...newSale, customerName: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Numéro de téléphone</Label>
                <Input
                  placeholder="6XXXXXXXX"
                  value={newSale.customerPhone}
                  onChange={(e) => setNewSale({...newSale, customerPhone:e.target.value})}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Adresse mail</Label>
                <Input
                  placeholder="example@gmail.com"
                  value={newSale.customerMail}
                  onChange={(e) => setNewSale({...newSale, customerMail: e.target.value})}
                  
                />
              </div>


              {newSale.productId && (
                <div className="bg-green-50 p-4 rounded-lg border border-green-100">
                  <p className="text-sm text-green-800 font-semibold text-center">
                    Total : {(products.find(p => p.id === newSale.productId)?.sellingPrice * newSale.quantity).toLocaleString()} FCFA
                  </p>
                </div>
              )}

              <Button type="submit" className="w-full bg-green-600 hover:bg-green-700">
                Valider la commande
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Cartes de statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-l-4 border-green-500 dark:bg-[#0f172a]">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Volume Ventes</CardTitle>
            <ShoppingCart className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{sales.length}</div>
            <p className="text-xs text-gray-500">Total cumulé</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-blue-500 dark:bg-[#0f172a]">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Aujourd'hui</CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{todaySales}</div>
            <p className="text-xs text-gray-500 capitalize">{format(new Date(), "EEEE dd MMM", { locale: fr })}</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-indigo-500 dark:bg-[#0f172a]">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Chiffre d'Affaires</CardTitle>
            <FileText className="h-4 w-4 text-indigo-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalRevenue.toLocaleString()} FCFA</div>
            <p className="text-xs text-gray-500">Recettes totales</p>
          </CardContent>
        </Card>
      </div>

      {/* Tableau de l'historique */}
      <Card className="dark:bg-[#0f172a]">
        <CardHeader>
          <CardTitle>Dernières Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Facture</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Effectuée par:</TableHead>
                <TableHead>Article</TableHead>
                <TableHead>Unité</TableHead>
                <TableHead>Qté</TableHead>
                <TableHead>Zone</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Client</TableHead>
                <TableHead>Etat</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {[...sales].reverse().map((sale) => (
                <TableRow key={sale.id}>
                  <TableCell className="font-mono text-xs dark:text-yellow-400">{sale.id}</TableCell>
                  <TableCell className="text-xs">
                    {format(new Date(sale.date), "dd/MM/yy HH:mm")}
                  </TableCell>
                  <TableCell>
                    {sale.userName || "inconnu"}
                  </TableCell>
                  <TableCell className="font-medium">{sale.productName}</TableCell>
                  <TableCell className="text-blue-500">{sale.unite}</TableCell>
                  <TableCell>{sale.quantity}</TableCell>
                  <TableCell></TableCell>
                  <TableCell className="font-semibold text-green-700">{Number(sale.totalPrice).toLocaleString()} FCFA</TableCell>
                  <TableCell>{sale.customerName}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold border ${getStatusBadgeColor(sale.etat)}`}>
                      {sale.etat || "Non défini"}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="outline" size="sm" onClick={() => handleGenerateInvoice(sale)}>
                      <Download className="w-3 h-3 mr-1" /> PDF
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {sales.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-10 text-gray-500">
                    Aucune vente enregistrée pour le moment.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}