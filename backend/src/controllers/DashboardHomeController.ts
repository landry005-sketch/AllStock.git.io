/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Request, Response } from 'express';
import { pool } from '../config/db'
import type {Product, DashboardUser, dashboardResponse} from '../../../src/lib/type';
export const getDashboardSummary = async (req: Request, res: Response) => {
  try {
    // 1. Requête Produits
   const orgId = (req.query.org_id as string) || (req as any).user?.org_id;


    if (!orgId) {
      return res.status(400).json({ message: "ID d'organisation manquant" });
    }
    const productsQuery = `
      SELECT 
        id, nom AS name, quantite_stock,
        prix_achat_unitaire AS "purchasePrice", 
        prix_vente_unitaire AS "sellingPrice", 
        date_peremption AS "expiryDate",
        nombre_vente
      FROM produits 
      WHERE org_id = $1
      ORDER BY nom ASC
    `;

    // 2. Requête Utilisateurs
    const usersQuery = `
      SELECT 
        id, nom_utilisateur AS name, role, 
        org_id AS "orgCode"
      FROM users 
      WHERE org_id = $1
      LIMIT 10
    `;

    // Exécution typée avec Promise.all
    const [productsRes, usersRes] = await Promise.all([
      pool.query<Product>(productsQuery, [orgId]),
      pool.query<DashboardUser>(usersQuery, [orgId])
    ]);

    const response: dashboardResponse = {
      product: productsRes.rows,
      user: usersRes.rows,
      timeStamp: new Date()
    };

    res.status(200).json(response);

  } catch (error) {
    console.error("Erreur Dashboard TS:", error);
    res.status(500).json({ message: "Erreur serveur lors de la récupération du summary" });
  }
};