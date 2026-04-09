/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Request, Response } from 'express';
import { pool } from '../config/db';
import nodemailer from 'nodemailer';
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
export  const sendSupplierOrder = async (req:Request, res:Response) => {
    const { supplierEmail, supplierName, items, deliveryDate } = req.body;
    const {orgName }= req.body || "AllStock"; // Utilise "AllStock" si le nom est indéfini

  // 1. Configuration du transporteur (Utilise tes variables d'environnement)
  
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.EMAIL_PORT || '465'),
    secure:true,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
    tls:{
      rejectUnauthorized: false
    }
  });

  // 2. Création du tableau de produits en HTML
  const itemsHtml = items.map((item: any) => `
    <tr>
      <td style="padding: 10px; border: 1px solid #ddd;">${item.productName}</td>
      <td style="padding: 10px; border: 1px solid #ddd; text-align: center;">${item.quantity}</td>
    </tr>
  `).join('');

  // 3. Contenu de l'email
  const mailOptions = {
    from: `"${orgName} - AllStock" <${process.env.EMAIL_USER}>`,
    to: supplierEmail,
    subject: `Bon de Commande - ${orgName}`,
    html: `
      <div style="font-family: Arial, sans-serif; color: #333;">
        <h2 style="color: #4f46e5;">Bon de Commande</h2>
        <p>Bonjour <strong>${supplierName}</strong>,</p>
        <p>L'entreprise <strong>${orgName}</strong> souhaite commander les articles suivants pour une livraison prévue le <strong>${new Date(deliveryDate).toLocaleDateString('fr-FR')}</strong> :</p>
        
        <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
          <thead>
            <tr style="background-color: #f8fafc;">
              <th style="padding: 10px; border: 1px solid #ddd; text-align: left;">Désignation du Produit</th>
              <th style="padding: 10px; border: 1px solid #ddd;">Quantité</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHtml}
          </tbody>
        </table>

        <p style="margin-top: 30px;">Merci de nous confirmer la disponibilité de ces produits et de nous transmettre la facture proforma.</p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
        <p style="font-size: 12px; color: #666;">Généré automatiquement par AllStock.</p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    res.status(200).json({ message: "Email envoyé avec succès" });
  } catch (error) {
    console.error("Erreur envoi mail:", error);
    res.status(500).json({ error: "Erreur lors de l'envoi de l'email" });
  }
}