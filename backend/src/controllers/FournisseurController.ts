import type { Request, Response } from 'express';
import { pool } from '../config/db';
//Créer tous es fournisseurs 
export const createSuppliers = async (req: Request, res:Response) =>{
    const {
        name,
        address,
        phone,
        email
    } = req.body;
    const org_id = (req as any).user?.org_id || req.body.org_id;

    if (!org_id) {
        return res.status(400).json({ error: "ID d'organisation manquant." });
    }
    // 1. VÉRIFICATION : Doublon dans la même organisation
   
    try {
         const existingSupplier = await pool.query(
            "SELECT id FROM fournisseur WHERE LOWER(nom) = LOWER($1) AND org_id = $2",
            [name.trim(), org_id]
        );

        if (existingSupplier.rows.length > 0) {
            return res.status(400).json({ 
                error: "Ce fournisseur est déjà lié à votre entreprise." 
            });
        }
        const query = `INSERT INTO fournisseur (nom, email, telephone , adresse, org_id) VALUES ($1, $2, $3, $4, $5) RETURNING *`;
        const values = [
            name.trim(),
            email,
            phone,
            address,
            org_id
        ];
        const newSupplier = await pool.query(query,values);
        res.status(201).json({
            message: "Fournisseur ajouté avec succès",
            supplier: {
                id: newSupplier.rows[0].id,
                name: newSupplier.rows[0].nom,
                email: newSupplier.rows[0].email,
                telephone:newSupplier.rows[0].telephone,
                adresse: newSupplier.rows[0].adresse,
                org_id: newSupplier.rows[0].org_id
            }
        })
    }catch(error){
        console.error("Erreur pour le fournisseur", error);
        res.status(500).json({error: "Echec de la création d'un fournisseur"})
    }
}
export const deleteSuppliers = async (req:Request, res:Response) => {
    const { id } = req.params;
    const org_id = (req as any).user?.org_id;

    if (!org_id) {
        return res.status(401).json({ error: "Session expirée ou organisation non identifiée" });
    }
    try {
        const result = await pool.query(
            'DELETE FROM fournisseur WHERE id = $1 AND org_id = $2 RETURNING *',
            [id, org_id]
        );

        if (result.rowCount === 0) {
            return res.status(404).json({ message: "Fournisseur introuvable ou vous n'avez pas les droits" });
        }

        res.status(200).json({ message: "Fournisseur supprimé avec succès" });
    }catch(error){
        console.error("Erreur lors de la suppression:", error);
        res.status(500).json({error: "Erreur serveur"})
    }
}
// Récupérer tous les fournisseurs de l'organisation
export const getSuppliers = async (req: Request, res: Response) => {
  try {
    const orgId = (req.query.org_id as string) || (req as any).user?.org_id;

    if (!orgId) return res.status(400).json({ message: "OrgId manquant" });

    const query = `
      SELECT 
        id, 
        nom AS "name", 
        -- Suppression de "contact" qui cause l'erreur 500
        telephone AS "phone", 
        email AS email, 
        adresse AS "address"
      FROM fournisseur 
      WHERE org_id = $1 
      ORDER BY nom ASC
    `;

    const result = await pool.query(query, [orgId]);
    
    // On renvoie result.rows qui est un tableau
    res.status(200).json(result.rows);
  } catch (error) {
    console.error("Erreur Suppliers:", error);
    res.status(500).json({ message: "Erreur serveur lors de la récupération" });
  }
};