import type { Request, Response } from 'express';
import { pool } from '../config/db';

export const createSale = async (req: Request, res: Response) => {
    const { productId, quantity, nomClient, telephoneClient, emailClient, users_id: userIdFromHome } = req.body;
const users_id = (req as any).user?.id || (req as any).user?.userId || req.body.users_id || userIdFromHome;
    const orgId = (req as any).user?.org_id;
    if (!users_id) {
        return res.status(401).json({ error: "Utilisateur non identifié. Veuillez vous reconnecter." });
    }

    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        //  INFOS DU PRODUIT (Prix, Unité, Zone)
        const productData = await client.query(
            `SELECT prix_vente_unitaire, unite, zone_stockage, quantite_stock
             FROM produits WHERE id = $1 AND org_id = $2`,
            [productId, orgId]
        );

        if (productData.rowCount === 0) {
            throw new Error("Produit introuvable ou accès refusé.");
        }

        const { prix_vente_unitaire, unite, zone_stockage, quantite_stock } = productData.rows[0];

        if (quantite_stock < quantity) {
            throw new Error(`Stock insuffisant. Disponible : ${quantite_stock}`);
        }

        // 2. CALCUL DU MONTANT TOTAL
        const montantTotal = prix_vente_unitaire * quantity;

        // 3. INSERTION DANS LA TABLE VENTE
        // On enregistre les valeurs récupérées pour garder une trace historique
        const saleQuery = `
           INSERT INTO vente (
    users_id, 
    produits_id, 
    org_id, 
    quantite, 
    prix_unitaire, 
    montant_total, 
    unite, 
    nom_client, 
    telephone_client,
    heure
  )
  SELECT 
    $1, -- users_id
    $2, -- produits_id (productId)
    $3, -- org_id
    $4, -- quantite
    p.prix_vente_unitaire, -- On prend le prix réel en BD
    ($4 * p.prix_vente_unitaire), -- Calcul automatique du montant total
    p.unite, -- ON PREND L'UNITÉ DE LA TABLE PRODUIT ICI
    $5, -- nom_client
    $6, -- telephone_client
    NOW()
  FROM produits p
  WHERE p.id = $2 AND p.org_id = $3
  RETURNING *;
`;
        const newSale = await client.query(saleQuery, [
            productId,
            users_id  ,
            orgId,
            nomClient ,
            telephoneClient ,
            emailClient || 'N/A',
            quantity,
            prix_vente_unitaire, // Pris directement de la BD
            montantTotal,
            zone_stockage,       
            unite               
        ]);

        // 4. MISE À JOUR DU STOCK ET DES STATISTIQUES
        await client.query(
            "UPDATE produits SET quantite_stock = quantite_stock - $1, nombre_vente = nombre_vente + $1 WHERE id = $2",
            [quantity, productId]
        );

        await client.query('COMMIT');
        res.status(201).json({ message: "Vente validée avec succès", sale: newSale.rows[0] });

    } catch (error: any) {
        await client.query('ROLLBACK');
        console.error("Erreur vente:", error.message);
        res.status(400).json({ error: error.message });
    } finally {
        client.release();
    }
};
export const cancelSale = async (req: Request, res: Response) => {
    const { id } = req.params; 
    const orgId = (req as any).user?.org_id;

    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        // 1. Récupérer les détails de la vente AVANT de la supprimer
        const saleData = await client.query(
            "SELECT produits_id, quantite FROM vente WHERE id = $1 AND org_id = $2",
            [id, orgId]
        );

        if (saleData.rowCount === 0) {
            throw new Error("Vente introuvable ou déjà annulée.");
        }

        const { produits_id, quantite } = saleData.rows[0];
        const updateProductQuery = `
            UPDATE produits 
            SET 
                quantite_stock = quantite_stock + $1,
                nombre_vente = GREATEST(0, nombre_vente - $1) -- Évite les nombres négatifs
            WHERE id = $2 AND org_id = $3
        `;
        await client.query(updateProductQuery, [quantite, produits_id, orgId]);

        await client.query("DELETE FROM vente WHERE id = $1", [id]);
        await client.query('COMMIT');
        res.status(200).json({ message: "Vente annulée et stock restauré avec succès." });

    } catch (error: any) {
        await client.query('ROLLBACK');
        console.error("Erreur annulation vente:", error.message);
        res.status(400).json({ error: error.message });
    } finally {
        client.release();
    }
};
export const getSales = async (req: Request, res: Response) => {
    try {
        // Récupération de l'org_id via query params ou token
        const orgId = req.query.org_id || (req as any).user?.org_id;

        if (!orgId) {
            return res.status(400).json({ message: "ID d'organisation manquant." });
        }

        const query = `
            SELECT 
                v.id ,
                v.users_id AS userId,
                v.etat AS "etat",
                p.unite AS "unite",
                u.nom_utilisateur AS "userName",
                v.heure AS "date",
                p.nom AS "productName",
                v.quantite AS quantity,
                v.prix_unitaire AS "unitPrice",
                v.montant_total AS "totalPrice",
                v.nom_client AS "customerName",
                v.telephone_client AS "customerPhone",
                v.unite,
                v.zone_vente AS "zone"
            FROM vente v
            INNER JOIN produits p ON v.produits_id = p.id
            LEFT JOIN users u ON v.users_id = u.id
            WHERE v.org_id = $1
            ORDER BY v.heure DESC; -- Les ventes les plus récentes en haut
        `;

        const result = await pool.query(query, [orgId]);
        
        // On renvoie directement le tableau rows
        res.status(200).json(result.rows);

    } catch (error) {
        console.error("Erreur Backend GetSales:", error);
        res.status(500).json({ message: "Erreur lors de la récupération des ventes." });
    }
};