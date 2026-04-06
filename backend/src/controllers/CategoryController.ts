/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Request, Response } from 'express';
import {pool, query} from '../config/db';

export const getCategoryByOrg = async (req: Request, res: Response) => {
    // 1. On récupère l'ID soit du token, soit de la requête URL (query)
    // On privilégie req.query car c'est ce que ton React envoie : ?org_id=...
    const org_id = (req.query.org_id as string) || (req as any).user?.org_id;
    console.log("voici le id org:",org_id)
    if (!org_id) {
        console.error("Tentative d'accès sans org_id");
        return res.status(400).json({ error: "Organisation non identifiée" });
    }

    try {
        // 2. Correction de la requête SQL (ambiguïté sur la colonne 'id')
        const result = await pool.query(
            `SELECT 
                c.id, 
                c.nom AS name, 
                c.description, 
                COUNT(p.id)::int AS "productCount" 
             FROM categories c
             LEFT JOIN produits p ON c.id = p.categorie_id
             WHERE c.org_id = $1
             GROUP BY c.id, c.nom, c.description
             ORDER BY c.nom ASC`, 
            [org_id]
        );
        
        console.log(`Chargement de ${result.rows.length} catégories pour l'org: ${org_id}`);
        res.status(200).json(result.rows);

    } catch (error) {
        console.error("Erreur SQL lors du chargement des catégories:", error);
        res.status(500).json({ error: "Erreur serveur lors du chargement" });
    }
};
export const deleteCategory = async (req:Request, res:Response) => {
     const {id} = req.params;
     const org_id = (req as any).user?.org_id;

  if (!req.user) {
    return res.status(401).json({ error: "Utilisateur non authentifié" });
  }
  
  try{
    const result = await pool.query('DELETE FROM categories WHERE id=$1 AND org_id=$2 RETURNING *',[id,org_id]);
    if (result.rowCount === 0){
     return  res.status(404).json({message: "Impossible de supprimer la catégorie"});
    }
     res.status(200).json({message: "Catégorie supprimé avec succès"})
  }catch(error){
    console.error("Erreur suppression", error)
    res.status(500).json({message: "Erreur serveur"})
  }
}
export const addCategory = async (req: Request, res: Response) => {
    const { name, description } = req.body;
    const org_id = (req as any).user?.org_id || req.body.org_id;
    
    try {
        // 1. VÉRIFICATION : Existe-t-il déjà une catégorie avec ce nom pour cette ORG ?
        const existingCategory = await pool.query(
            "SELECT id FROM categories WHERE LOWER(nom) = LOWER($1) AND org_id = $2",
            [name.trim(), org_id]
        );

        if (existingCategory.rows.length > 0) {
            return res.status(400).json({ 
                error: "Une catégorie avec ce nom existe déjà dans votre organisation." 
            });
        }

        // 2. INSERTION si tout est bon
        const newCategory = await pool.query(
            "INSERT INTO categories (nom, description, org_id) VALUES ($1, $2, $3) RETURNING *",
            [name, description, org_id]
        );

        res.status(201).json(newCategory.rows[0]);

    } catch (error) {
        console.error(error);
        console.log("voici le org_id dans addCategory:", org_id);
        res.status(500).json({ error: "Erreur lors de la création" });
    }
};
export const alterCategorie = async (req:Request, res:Response) => {
    const {id} = req.params;
    const { name, description} = req.body;
    const org_id = (req as any).user?.org_id;

    try {
        const result = await query(
            'UPDATE categories SET nom=$1, description = $2 WHERE org_id = $3 AND id = $4 RETURNING id, nom AS name, description', [name, description, org_id, id],
        );

        if (result.rows.length === 0) {
            return res.status(404).json({error: "Categorie non trouvé ou opération impossible"})
        };

        res.status(201).json({message: "Categorie mise à jour avec succès", category:result.rows[0]})
    }catch(error){
        console.log("Erreur lors de la modification:", error);
        res.status(500).json({message: "Erreur du serveur lors de la modification"})
    }
}

