import type { Request, Response } from 'express';
import { pool } from '../config/db';
export const addProductManual = async (req: Request, res: Response) => {
    const client = await pool.connect();
    
    const { 
        name, 
        category_id, 
        unite, 
        quantity, 
        purchasePrice, 
        sellingPrice, 
        supplier_id, 
        expiryDate, 
        storageZone,
        code_barre 
    } = req.body;

    const orgId = (req as any).user?.org_id || req.body.org_id;
    const userId = (req as any).user?.id;

    if (!orgId) {
        return res.status(400).json({ error: "ID d'organisation manquant." });
    }

    try {
        await client.query('BEGIN');

        // 1. INSERT ou UPDATE (si le nom existe déjà dans cette boutique)
        const productQuery = `
            INSERT INTO produits (
                nom, categorie_id, unite, quantite_stock, 
                prix_achat_unitaire, prix_vente_unitaire, four_id, 
                date_peremption, zone_stockage, code_barre, org_id, nombre_vente
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, 0)
            ON CONFLICT (nom, org_id) 
            DO UPDATE SET 
                quantite_stock = (produits.quantite_stock)::integer + (EXCLUDED.quantite_stock)::integer,
                prix_achat_unitaire = EXCLUDED.prix_achat_unitaire,
                prix_vente_unitaire = EXCLUDED.prix_vente_unitaire,
                zone_stockage = EXCLUDED.zone_stockage,
                date_peremption = EXCLUDED.date_peremption
            RETURNING *
        `;

        const productValues = [
            name, category_id === "" ? null:category_id, unite || 'pce', quantity || 0,
            purchasePrice || 0, sellingPrice || 0, supplier_id === "" ? null:supplier_id,
            expiryDate || null, storageZone, code_barre, orgId
        ];

        const productRes = await client.query(productQuery, productValues);
        const product = productRes.rows[0];

        // 2. ENREGISTRER LE MOUVEMENT (Pour l'historique)
        await client.query(
            `INSERT INTO mouvements_stock (org_id, produit_id, users_id, type_mouvement, quantite, prix_unitaire_mouvement, description) 
             VALUES ($1, $2, $3, $4, $5, $6, $7)`,
            [orgId, product.id, userId, "Entree", quantity, purchasePrice, "Ajout manuel via formulaire"]
        );

        await client.query('COMMIT');

        // On renvoie l'objet avec les alias attendus par ton Front
        res.status(201).json({
            ...product,
            name: product.nom,
            quantity: product.quantite_stock,
            purchasePrice: product.prix_achat_unitaire,
            sellingPrice: product.prix_vente_unitaire
        });

    } catch (error) {
        await client.query('ROLLBACK');
        console.error("Erreur addProductManual:", error);
        res.status(500).json({ error: "Erreur lors de l'enregistrement du produit" });
    } finally {
        client.release();
    }
};

export const deleteProduct = async (req: Request, res: Response) => {
    const { id } = req.params;
    const org_id = (req as any).user?.org_id;

    if (!org_id) {
        return res.status(401).json({ error: "Session expirée ou organisation non identifiée" });
    }

    try {
        // On vérifie l'ID ET l'org_id pour éviter qu'un admin supprime le produit d'une autre boutique
        const result = await pool.query(
            'DELETE FROM produits WHERE id = $1 AND org_id = $2 RETURNING *',
            [id, org_id]
        );

        if (result.rowCount === 0) {
            return res.status(404).json({ message: "Produit introuvable ou vous n'avez pas les droits" });
        }

        res.status(200).json({ message: "Produit supprimé avec succès" });
    } catch (error) {
        console.error("Erreur suppression:", error);
        res.status(500).json({ message: "Erreur serveur lors de la suppression" });
    }
};

export const getProducts = async (req: Request, res: Response) => {
  try {
   // On cherche d'abord org_id (utilisé par ton front), puis orgId, puis le token
    const orgId = req.query.org_id || req.query.orgId || (req as any).user?.org_id;

    if (!orgId) {
      return res.status(400).json({ message: "ID d'organisation manquant pour la récupération." });
    }
    

    // 2. La requête SQL avec les alias pour le Front-end
  const query = `
    SELECT 
        p.id, 
        p.nom, 
        p.nom AS "name", 
        p.categorie_id,
        c.nom AS "category_name",
        p.unite,
        p.quantite_stock AS "quantity", 
        p.prix_achat_unitaire AS "purchasePrice",
        p.prix_vente_unitaire AS "sellingPrice",
        p.prix_vente_unitaire AS "selling_price",
        p.date_peremption AS "expiryDate",
        p.date_peremption AS "expiry_date",
        p.nombre_vente AS "sales",
        p.nombre_vente,
        -- AJOUT DES COLONNES DU FOURNISSEUR
        p.four_id,
        f.nom AS "supplier_name", 
        f.telephone AS "supplier_phone"
    FROM produits p
    LEFT JOIN categories c ON p.categorie_id = c.id
    LEFT JOIN fournisseur f ON p.four_id = f.id -- DEUXIÈME JOINTURE ICI
    WHERE p.org_id = $1 
    ORDER BY p.id DESC 
`;
    

    const result = await pool.query(query, [orgId]);

    
    res.status(200).json(result.rows);

  } catch (error) {
    console.error("Erreur Backend GetProducts:", error);
    res.status(500).json({ message: "Erreur lors de la récupération des produits" });
  }
};
export const getExistingUnits = async (req: Request, res: Response) => {
    
    const orgId = req.query.org_id || (req as any).user?.org_id;

    if (!orgId) {
        return res.status(400).json({ error: "ID d'organisation manquant." });
    }

    try {
    
        const query = `
            SELECT DISTINCT unite 
            FROM produits 
            WHERE org_id = $1 AND unite IS NOT NULL 
            ORDER BY unite ASC
        `;
        const result = await pool.query(query, [orgId]);
    
        const units = result.rows.map(row => row.unite);
        res.status(200).json(units);
    } catch (error) {
        console.error("Erreur getExistingUnits:", error);
        res.status(500).json({ error: "Erreur lors de la récupération des unités" });
    }
};