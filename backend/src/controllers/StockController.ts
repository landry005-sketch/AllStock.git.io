import type {Request, Response} from 'express';
import {GoogleGenerativeAI} from "@google/generative-ai";
import { parse } from 'node:path';
import { pool } from '../config/db';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY as string);

export const scanReceipt = async (req: Request, res: Response) =>{
   try {
        if (!req.file) {
            return res.status(400).json({ error: "Aucune image fournie" });
        }

        // Utilisation du modèle flash stable
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

        const imagePart = {
            inlineData: {
                data: req.file.buffer.toString("base64"),
                mimeType: req.file.mimetype
            }
        };

        // On simplifie le prompt pour qu'il ne cherche que le visible
        const prompt = `Analyse ce document. Extrais les informations visibles. 
        Si une information est absente, laisse la valeur à null ou "".
        Retourne UNIQUEMENT ce JSON :
        {
            "fournisseur": { "nom": "string", "telephone": "string", "adresse": "string" },
            "produits": [
                { "nom": "string", "unite": "string", "prix_achat_unitaire": number, "quantite": number, "code_barre": "string" }
            ],
            "orgName_detecte": "string"
        }`;

        const result = await model.generateContent([prompt, imagePart]);
        const responseText = result.response.text();
        
        // Nettoyage et parsing du JSON
        const cleanJson = responseText.replace(/```json|```/g, "").trim();
        const extractedData = JSON.parse(cleanJson);

        // On renvoie juste les données à l'utilisateur pour validation
        // On ne touche pas à la base de données ici !
        return res.status(200).json({
            message: "Analyse terminée",
            data: extractedData
        });

    } catch (error) {
        console.error("Erreur Gemini:", error);
        return res.status(500).json({ error: "Echec de l'analyse du document" });
    }
   
}
// backend/src/controllers/StockController.ts
// backend/src/controllers/StockController.ts

export const confirmSave = async (req: Request, res: Response) => {
    const client = await pool.connect();
    
    // Récupération des données validées par l'utilisateur via le formulaire
    const { produits, fournisseur } = req.body;
    
    // Sécurité : On utilise l'ID de l'organisation de la session utilisateur
    const orgId = (req as any).user?.org_id;
    console.log("Id de l'organisation", orgId);
    const userId = (req as any).user?.id;
    if (!orgId) {
        return res.status(400).json({ error: "ID d'organisation manquant dans le token" });
    }

    try {
        await client.query('BEGIN');

        // 1. Gestion du Fournisseur
        let fournisseurId = null;
        if (fournisseur && fournisseur.nom) {
            const fouRes = await client.query(
                `INSERT INTO fournisseur (nom, email, telephone, adresse, org_id) 
                 VALUES ($1, $2, $3, $4, $5) 
                 ON CONFLICT (nom, org_id) 
                 DO UPDATE SET telephone = EXCLUDED.telephone, adresse = EXCLUDED.adresse
                 RETURNING id`,
                [fournisseur.nom, fournisseur.email, fournisseur.telephone, fournisseur.adresse, orgId]
            );
            fournisseurId = fouRes.rows[0].id;
        }

        // 2. Traitement de chaque produit validé
        for (const prod of produits) {
            // On vérifie que le nom du produit n'est pas vide
            if (!prod.nom || prod.nom.trim() === "") continue;

            const proRes = await client.query(
                `INSERT INTO produits (nom, unite, prix_achat_unitaire,categorie_id, quantite_stock, code_barre, four_id, org_id)
                 VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
                 ON CONFLICT (nom, org_id) 
                 DO UPDATE SET 
                    quantite_stock = produits.quantite_stock + EXCLUDED.quantite_stock,
                    prix_achat_unitaire = EXCLUDED.prix_achat_unitaire,
                    code_barre = COALESCE(produits.code_barre, EXCLUDED.code_barre)
                 RETURNING id`,
                [
                    prod.nom, 
                    prod.unite || 'pce', 
                    prod.prix_achat_unitaire || 0, 
                    prod.categorie_id ,
                    prod.quantite || 0, 
                    prod.code_barre, 
                    fournisseurId, 
                    orgId
                ]
            );

            const produitId = proRes.rows[0].id;

            // 3. Enregistrement du mouvement de stock (Entrée)
            await client.query(
                `INSERT INTO mouvements_stock (org_id, produit_id, users_id, type_mouvement, quantite, prix_unitaire_mouvement, description) 
                 VALUES ($1, $2, $3, $4, $5, $6, $7)`,
                [
                    orgId, 
                    produitId, 
                    userId, 
                    "Entree",
                    prod.quantite, 
                    prod.prix_achat_unitaire, 
                    "Entrée de stock via scan IA validé"
                ]
            );
        }

        await client.query('COMMIT');
        return res.status(200).json({ message: "Stock mis à jour avec succès" });

    } catch (error) {
        await client.query('ROLLBACK');
        console.error("Erreur confirm-save:", error);
        return res.status(500).json({ error: "Erreur lors de l'enregistrement final" });
    } finally {
        client.release();
    }
};