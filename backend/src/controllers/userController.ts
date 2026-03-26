import type { Request, Response } from 'express';
import {pool} from '../config/db'; // Ton instance de connexion PostgreSQL

export const getUserFullProfile = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const query = `
      SELECT 
       u.id, 
        u.nom_utilisateur as username, 
        u.email, 
        u.role,
        o.nom as "orgName",
        o.id as "orgCode",
        o.logo_url as "logoUrl"
    FROM users u
    LEFT JOIN organisations o ON u.org_id = o.id
    WHERE u.id = $1
    `;
    
    const result = await pool.query(query, [id]);
    console.log("Données récupérées en BD pour l'utilisateur :", result.rows[0]);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Utilisateur non trouvé" });
    }

    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error("Erreur récupération profil:", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

export const deleteUser = async (req:Request, res:Response) =>{
  const {id} = req.params;
  if (!req.user) {
    return res.status(401).json({ error: "Utilisateur non authentifié" });
  }
  const {org_id} = req.user;

  try{
    const result = await pool.query('DELETE FROM users WHERE id=$1 AND org_id=$2 RETURNING *',[id,org_id]);
    if (result.rowCount === 0){
     return  res.status(404).json({message: "Utilisateur non trouvé ou accès refusé"});
    }
     res.status(200).json({message: "Utilisateur supprimé avec succès"})
  }catch(error){
    console.error("Erreur suppression", error)
    res.status(500).json({message: "Erreur serveur"})
  }
}