import type { Request, Response } from 'express';
import {pool} from '../config/db';

export const getMarqueByOrg = async (req: Request, res: Response) => {
    const {org_id} = req.query;
    if(!org_id){
        return res.status(400).json({error: "L'identifiant de l'organisation est manquant"})
    }

    try{
        const result = await pool.query(
            "SELECT id, nom, description FROM marques WHERE org_id= $1 ORDER by nom ASC", [org_id]
        );
        res.json(result.rows);
    }catch (error){
        console.error("Erreur SQL", error)
        return res.status(500).json({error: "Erreur lors de la récupération de la marque ."})
    }

}