import type { dashboardResponse, Product, User, userSession } from "@/lib/type"
import { useEffect, useState } from "react"

export const useDashboard = () => {
    const [products, setProducts] = useState<Product[]>([]);
    const [recentUsers, setRecentUsers] = useState<userSession[]>([]);
    const [loading, setLoading] = useState<boolean >(true);
    const [error, setError] = useState<String | null> (null);
    const [currentUser, setCurrentUser] = useState< User | null >(null)
    useEffect(() => {
        const userStr = localStorage.getItem("currentUser");
        if (userStr) setCurrentUser(JSON.parse(userStr));
        const fetchDashboard = async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await fetch('http://localhost:5000/api/data/summary', {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });
                if (!response.ok) throw new Error ('Erreur de réseau');
                const data: dashboardResponse = await response.json();
                const mappedProducts: Product[] = data.product.map((p: any) => ({
                    id: p.id,
                    name: p.name || p.nom, // Gère le français/anglais
                    category: p.category || p.categorie,
                    quantity: Number(p.quantite_stock || p.quantite || 0), // Force le type Number
                    purchasePrice: Number(p.purchasePrice || p.prix_achat_unitaire || 0),
                    sellingPrice: Number(p.sellingPrice || p.prix_vente_unitaire || 0),
                    supplier: p.supplier || p.fournisseur,
                    expiryDate: p.expiryDate || p.date_peremption,
                    storageZone: p.storageZone || p.zone_stockage,
                    qrCode: p.qrCode || "",
                    sales: Number(p.sales || p.nombre_vente || 0)
                }));
                setProducts(mappedProducts);
                setRecentUsers(data.user)
            }catch (error) {
                setError (error instanceof Error ? error.message: "Une erreur est survenue");
            }finally {
                setLoading(false);
            }
        };
        fetchDashboard();
    }, []);
    return {products, recentUsers, loading, error, currentUser}
}