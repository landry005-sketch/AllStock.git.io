import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { 
  Package, 
  Users, 
  TrendingUp, 
  AlertTriangle,
  Clock,
  BarChart3,
  DollarSign,
  TrendingDown,
  Percent,
  Loader2
} from "lucide-react";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from "recharts";
import type { User, Product } from "@/lib/type"; // Import des types uniquement
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { useDashboard } from "@/hooks/useDashboard";

export default function DashboardHome() {
  


  // --- 1. CHARGEMENT DES DONNÉES DEPUIS LE BACKEND ---
 const { products, recentUsers: allUsers, loading, error, currentUser } = useDashboard();

  if (loading) {
    return (
      <div className="h-full w-full flex items-center justify-center min-h-100">
        <Loader2 className="w-10 h-10 animate-spin text-indigo-600" />
      </div>
    );
  }

  if (error) return <div className="text-red-500 p-4 font-bold">Erreur : {error}</div>;
  if (!currentUser) return null;

  // --- 2. CALCULS DYNAMIQUES (Basés sur l'état 'products') ---
  const today = new Date();
  
  const expiringProducts = products.filter((p) => {
    if (!p.expiryDate) return false;
    const days = Math.ceil((new Date(p.expiryDate).getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return days <= 7 && days > 0;
  });

  const sortedProducts = [...products].sort((a, b) => (b.sales || 0) - (a.sales || 0));
  const topProducts = sortedProducts.slice(0, 5);
  const bottomProducts = [...sortedProducts].reverse().slice(0, 5);

  const totalStockPurchaseValue = products.reduce((sum, p) => sum + (p.purchasePrice * p.quantity), 0);
  const totalStockSellingValue = products.reduce((sum, p) => sum + (p.sellingPrice * p.quantity), 0);
  const potentialProfit = totalStockSellingValue - totalStockPurchaseValue;
  const profitMargin = totalStockPurchaseValue > 0 ? ((potentialProfit / totalStockPurchaseValue) * 100) : 0;

 const totalUnits = products.reduce((sum, p) => sum + Number(p.quantity || 0), 0);
  const lowStockCount = products.filter((p) => p.quantity < 20).length;

  return (
    <div className="space-y-6 ">
      {/* Header */}
      <div>
        <h1 className="text-3xl mb-2 font-bold uppercase tracking-tight">Tableau de bord</h1>
        <p className="text-gray-600 italic">
          Session active : {currentUser.username} | Accès : <span className="text-indigo-600 font-bold">{currentUser.role.toUpperCase()}</span>
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="dark:bg-[#0f172a]">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-semibold text-gray-500 uppercase">Stock Global</CardTitle>
            <Package className="h-4 w-4 text-indigo-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalUnits}</div>
            <p className="text-xs text-gray-400">{products.length} références actives</p>
          </CardContent>
        </Card>

        {(currentUser.role === "ADMIN" || currentUser.role === "MANAGER") && (
          <Card className="dark:bg-[#0f172a]">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-semibold text-gray-500 uppercase">Équipe</CardTitle>
              <Users className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{allUsers.length}</div>
              <p className="text-xs text-gray-400">Collaborateurs</p>
            </CardContent>
          </Card>
        )}

        <Card className="dark:bg-[#0f172a]">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-semibold text-gray-500 uppercase">Rupture Proche</CardTitle>
            <AlertTriangle className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{lowStockCount}</div>
            <p className="text-xs text-gray-400">Articles sous le seuil</p>
          </CardContent>
        </Card>

        <Card className="dark:bg-[#0f172a]">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-semibold text-gray-500 uppercase">Alertes DLC</CardTitle>
            <Clock className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{expiringProducts.length}</div>
            <p className="text-xs text-gray-400">Péremption &lt; 7j</p>
          </CardContent>
        </Card>
      </div>

      {/* Section Financière DYNAMIQUE */}
      {(currentUser.role === "ADMIN" || currentUser.role === "MANAGER") && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-blue-50/50 dark:bg-blue-400 border-blue-100">
            <CardHeader className="pb-2"><CardTitle className="text-xs text-blue-800 uppercase">Investissement</CardTitle></CardHeader>
            <CardContent>
              <div className="text-xl font-bold">{totalStockPurchaseValue.toLocaleString()} FCFA</div>
            </CardContent>
          </Card>

          <Card className="bg-green-50/50 dark:bg-green-400 border-green-100">
            <CardHeader className="pb-2"><CardTitle className="text-xs text-green-800 uppercase">C.A Prévu</CardTitle></CardHeader>
            <CardContent>
              <div className="text-xl font-bold">{totalStockSellingValue.toLocaleString()} FCFA</div>
            </CardContent>
          </Card>

          <Card className="bg-purple-50/50 dark:bg-purple-400  border-purple-100">
            <CardHeader className="pb-2"><CardTitle className="text-xs text-purple-800 uppercase">Marge Brute</CardTitle></CardHeader>
            <CardContent >
              <div className="text-xl font-bold text-purple-700">+{potentialProfit.toLocaleString()} FCFA</div>
            </CardContent>
          </Card>

          <Card className="bg-orange-50/50 dark:bg-orange-400 border-orange-100">
            <CardHeader className="pb-2"><CardTitle className="text-xs text-orange-800 uppercase">Rentabilité</CardTitle></CardHeader>
            <CardContent>
              <div className="text-xl font-bold text-orange-700">{profitMargin.toFixed(2)}%</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Graphiques */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="dark:bg-[#0f172a]">
          <CardHeader><CardTitle className="text-md">Top 5 Performances</CardTitle></CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topProducts.map(p => ({ name: p.name.substring(0, 10), ventes: p.sales }))}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" fontSize={10} />
                <YAxis fontSize={10} />
                <Tooltip />
                <Bar dataKey="ventes" fill="#4f46e5" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="dark:bg-[#0f172a]">
          <CardHeader><CardTitle className="text-md">Articles à Flux Faible</CardTitle></CardHeader>
          <CardContent className="h-75">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={bottomProducts.map(p => ({ name: p.name.substring(0, 10), ventes: p.sales }))}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" fontSize={10} />
                <YAxis fontSize={10} />
                <Tooltip />
                <Bar dataKey="ventes" fill="#ef4444" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Listes d'alertes et Utilisateurs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="dark:bg-[#0f172a]">
          <CardHeader><CardTitle className="text-sm font-bold uppercase">Risques Péremption</CardTitle></CardHeader>
          <CardContent className="max-h-75 overflow-y-auto">
            {expiringProducts.length === 0 ? <p className="text-center text-gray-400 py-4 text-sm">RAS</p> : (
              expiringProducts.map(p => (
                <div key={p.id} className="flex justify-between p-2 mb-2 bg-red-50 rounded border-l-4 border-red-500">
                  <span className="text-sm font-medium">{p.name}</span>
                  <span className="text-xs font-bold text-red-600">{format(new Date(p.expiryDate!), "dd/MM/yy")}</span>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {currentUser.role === "ADMIN" && (
          <Card className="dark:bg-[#0f172a]">
            <CardHeader><CardTitle className="text-sm font-bold uppercase">Surveillance Équipe</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-2">
                {allUsers.slice(0, 5).map(u => (
                  <div key={u.id} className="flex dark:bg-gray-600 items-center justify-between p-2 bg-gray-50 rounded text-sm">
                    <span>{u.name}</span>
                    <span className="text-[10px] bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded font-bold uppercase">{u.role}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}