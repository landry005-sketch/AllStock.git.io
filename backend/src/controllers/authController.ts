/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import {pool, query} from '../config/db.js';
import jwt from 'jsonwebtoken'
import { v2 as cloudinary } from 'cloudinary';
import nodemailer from 'nodemailer';
import { sendCredentialsEmail } from '../mail/email.services.js';
import crypto from 'crypto';


cloudinary.config({
    cloud_name: 'dbv9bfb7c',
    api_key: '557176812794176',
    api_secret: '_Pr3OpSuYoseY-pk86wEZtdC32M'
});
export const registerDirector = async (req:Request, res:Response) =>{
    console.log("Fichier reçu par le backend :", req.file);
    const {username, email, password, orgName } = req.body;
    const file = req.file;
    const client = await pool.connect();
    try{

        let logoUrl= '';

        if (file){
            const uploadPromise = new Promise ((resolve, reject)=>{
                const stream = cloudinary.uploader.upload_stream((error, result)=>{
                    if (result) resolve(result.secure_url);
                    else reject(error);
                });
                stream.end(file.buffer);
            });
            logoUrl =(await uploadPromise) as string;
        }
        //debut transaction
        await client.query('BEGIN');

        // Creer le code unique
        const orgCode = `${orgName.substring(0, 3).toUpperCase()}-${Math.floor(1000 + Math.random()*9000)}`;

        //Inserer l'organisation
        const orgRes = await client.query(
            'INSERT INTO public.organisations (nom, org_code, logo_url) VALUES ($1, $2, $3) RETURNING id', [orgName, orgCode, logoUrl]
        );
        const orgId = orgRes.rows[0].id;

        //Hacher le mot de passe et creer l'admin
        const hash = await bcrypt.hash(password, 10);
        await client.query(
            'INSERT INTO public.users(nom_utilisateur, email, passeword_hash, org_id, role) VALUES($1, $2, $3, $4, $5)',
            [username,email, hash, orgId, 'ADMIN']
        );

        await client.query ('COMMIT');
        res.status(201).json({message:"Organisation créée avec succès !", orgCode});
    } catch(error){
        console.error("Detail de l'erreur SQL :", error)
        await client.query('ROLLBACK');
        res.status(500).json({error: "Erreur de l'inscription",details: error instanceof Error ? error.message: error});
    }finally {
        client.release();
    }
};

export const registerEmployee = async (req: Request, res: Response) => {
    const {username, email, password, orgCode } = req.body;
    console.log("Corps de la requête:", req.body)

    try {
        console.log("Tentative d'inscription pour:", email);

        // 1. Vérification de l'organisation
        const orgCheck = await query('SELECT id FROM organisations WHERE org_code = $1', [orgCode]);
        
        if (orgCheck.rows.length === 0) {
            console.log("Code invalide !");
            return res.status(404).json({ error: "Code entreprise invalide." });
        }

        const orgId = orgCheck.rows[0].id;

        // 2. Hachage du mot de passe
        const hashedPassword = await bcrypt.hash(password, 10);
        console.log("Hachage réussi");

        // 3. Insertion (Vérifie bien l'orthographe 'passeword_hash' ici)
        await query(
            'INSERT INTO users (nom_utilisateur, email, passeword_hash, org_id, role) VALUES ($1, $2, $3, $4, $5)',
            [username, email, hashedPassword, orgId, 'STAFF']
        );

        console.log("Utilisateur inséré avec succès au nom:", username);
        
        // N'OUBLIE PAS CETTE LIGNE, c'est elle qui arrête le chargement dans Postman
        return res.status(201).json({ message: "Employé inscrit avec succès !" });

    } catch (error: any) {
        console.error("ERREUR DÉTAILLÉE :", error.message);
        // On répond à Postman même en cas d'erreur pour éviter le chargement infini
        return res.status(500).json({ error: "Erreur serveur", details: error.message });
    }
};
export const adminCreateUser = async (req: Request, res: Response): Promise<void> => {
  // On récupère le rôle choisi par l'admin dans le formulaire
  const { username, email, role, org_id, orgName } = req.body;

  try {
    // Génération du mot de passe temporaire
    const tempPassword = Math.random().toString(36).slice(-10);
    const hashedPassword = await bcrypt.hash(tempPassword, 10);

    // Requête INSERT : On passe la variable 'role' qui vient du front-end
    const query = `
      INSERT INTO users (nom, email, passeword, role, org_id) 
      VALUES ($1, $2, $3, $4, $5) 
      RETURNING id;
    `;
    const values = [username, email, hashedPassword, role, org_id];

    await pool.query(query, values);

    // Envoi des accès par mail à l'employé
    await sendCredentialsEmail({
      email,
      username,
      tempPassword,
      orgName
    });

    res.status(201).json({ message: "Utilisateur créé avec le rôle " + role });
  } catch (error) {
    console.log("Erreur getRoles:", error);
    res.status(500).json({ error: "Erreur lors de l'insertion en base de données" });
  }
};
export const getRoles = async (req: Request, res: Response): Promise<void> => {
  try {
    // On récupère les noms des rôles (ex: ADMIN, STAFF, MANAGER)
    const roles = await pool.query("SELECT id, nom_role FROM roles"); 
    res.json(roles.rows);
  } catch (error) {
    console.log("Erreur getRoles:", error);
    res.status(500).json({ error: "Erreur lors de la récupération des rôles" });
  }
};
export const getAllUsers = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
        return res.status(401).json({ error: "Utilisateur non authentifié" });
    }
    // On récupère l'organisation de l'utilisateur connecté (depuis le token)
    const { org_id } = req.user; 

    const query = `
      SELECT 
        id, 
        nom_utilisateur as username, 
        email, 
        role, 
        login_time as "loginTime", 
        logout_time as "logoutTime",
        org_id
      FROM users 
      WHERE org_id = $1
      ORDER BY nom_utilisateur ASC
    `;
    
    const result = await pool.query(query, [org_id]);
    res.status(200).json(result.rows);
  } catch (error) {
    console.error("Erreur getAllUsers:", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};
export const createUser = async (req: Request, res: Response) => {
    const { nom_utilisateur, email, role } = req.body;
     if (!req.user) {
        return res.status(401).json({ error: "Utilisateur non authentifié" });
    }
    const { org_id } = req.user; // On récupère l'ID de l'organisation via le token

    try {
        // 1. Générer un mot de passe provisoire de 10 caractères
        const tempPassword = crypto.randomBytes(5).toString('hex');

        // 2. Hacher le mot de passe pour la base de données
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(tempPassword, salt);
        const orgRes = await pool.query('SELECT nom FROM organisations WHERE id = $1', [org_id]);
        const orgName = orgRes.rows[0]?.nom || "StockFlow";
        // 3. Enregistrer l'utilisateur dans PostgreSQL
        const newUser = await pool.query(
            `INSERT INTO users (nom_utilisateur, email, passeword_hash, role, org_id, must_change_password) 
             VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
            [nom_utilisateur, email, passwordHash, role, org_id, true]
        );
        await sendCredentialsEmail({
            email: email,
            username: nom_utilisateur,
            tempPassword: tempPassword,
            orgName: orgName 
        });

        res.status(201).json({ 
            message: "Utilisateur créé et email envoyé avec succès",
            user: {
                id: newUser.rows[0].id,
                username: newUser.rows[0].nom_utilisateur,
                email: newUser.rows[0].email,
                role: newUser.rows[0].role,
                org_id: newUser.rows[0].org_id
            }
        });

    } catch (error) {
        console.error("Erreur création utilisateur:", error);
        res.status(500).json({ error: "Échec de la création de l'utilisateur" });
    }
};
export const completeSetup = async (req: Request, res: Response) => {
    const { userId, newPassword } = req.body;

    try {
        // 1. On hache le nouveau mot de passe choisi par l'utilisateur
        const salt = await bcrypt.genSalt(10);
        const hashedPw = await bcrypt.hash(newPassword, salt);

        // 2. Mise à jour de la DB : Nouveau mot de passe + Flag à FALSE
        const result = await pool.query(
            'UPDATE users SET passeword_hash = $1, must_change_password = FALSE WHERE id = $2 RETURNING id, nom_utilisateur, email, role, org_id',
            [hashedPw, userId]
        );

        if (result.rowCount === 0) {
            return res.status(404).json({ error: "Utilisateur non trouvé." });
        }

        const user = result.rows[0];

        // 3. On génère maintenant le vrai Token pour qu'il puisse se connecter directement
        const token = jwt.sign(
            { userId: user.id, orgId: user.org_id, role: user.role },
            process.env.JWT_SECRET as string,
            { expiresIn: '24h' }
        );

        res.status(200).json({
            message: "Mot de passe mis à jour avec succès !",
            token,
            user: {
                id: user.id,
                name: user.nom_utilisateur,
                role: user.role,
                orgId: user.org_id
            }
        });

    } catch (error) {
        console.error("Erreur completeSetup:", error);
        res.status(500).json({ error: "Erreur lors de la mise à jour du mot de passe." });
    }
};
export const login = async (req: Request, res: Response) => {
    const { identifier, password } = req.body;
    try {
        // 1. On cherche l'utilisateur (Correction : nom_utilisateur)
        const userRes = await query(
            'SELECT * FROM users WHERE nom_utilisateur=$1 OR email=$1', [identifier]
        );

        if (userRes.rows.length === 0) {
            return res.status(401).json({ error: "Identifiants invalides." });
        }
        const user = userRes.rows[0];

        // 2. Vérifier le mot de passe
        const isMatch = await bcrypt.compare(password, user.passeword_hash);
        if (!isMatch) {
            return res.status(401).json({ error: "Identifiants non valides" });
        }

        if (user.must_change_password) {
            return res.status(200).json({
                mustChangePassword: true,
                userId: user.id,
                message: "Changement de mot de passe requis."
            });
        }
        // --- AJOUT : MISE À JOUR DU STATUT EN LIGNE ---
        // On met login_time à l'heure actuelle et on vide logout_time
        await query(
            'UPDATE users SET login_time = NOW(), logout_time = NULL WHERE id = $1',
            [user.id]
        );
        // ----------------------------------------------

        // 3. Créer le token (On garde orgId pour le multi-tenant de StockFlow)
        const token = jwt.sign({
            username: user.nom_utilisateur,
            userId: user.id,
            role: user.role,
            org_id: user.org_id
        },
            process.env.JWT_SECRET as string,
            { expiresIn: '24h' }
        );

        // 4. Envoyer la réponse
        res.json({
            message: "Connexion reussie",
            token,
            user: {
                id: user.id,
                name: user.nom_utilisateur, // Utilise 'name' pour correspondre à ton composant Users.tsx
                email: user.email,
                role: user.role,
                org_id: user.org_id // Attention : 'org_id' et non 'org_Id' (casse)
            }
        });
    } catch (error) {
        console.error("Erreur Login:", error);
        res.status(500).json({ error: "Erreur serveur lors de la connexion." });
    }
};


// ÉTAPE A : Demande de réinitialisation
export const forgotPassword = async (req: Request, res: Response) => {
    const { email } = req.body;
    const client = await pool.connect();

    try {
        const userRes = await client.query('SELECT id FROM users WHERE email = $1', [email]);
        if (userRes.rowCount === 0) {
            return res.status(404).json({ error: "Aucun utilisateur avec cet email." });
        }

        // Génération d'un token de 32 caractères
        const token = crypto.randomBytes(32).toString('hex');
        const expires = new Date(Date.now() + 3600000); // Expire dans 1 heure
        
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
        

        await client.query(
            'UPDATE users SET reset_token = $1, reset_token_expiry = $2 WHERE email = $3',
            [token, expires, email]
        );
    const resetUrl = `http://localhost:5173/reset-password/${token}`;

    const mailOptions = {
        from: '"AllStock Support" <noreply@allstock.com>',
        to: email,
        subject: 'Réinitialisation de votre mot de passe - AllStock',
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #ddd; padding: 20px;">
                <h2 style="color: #4F46E5;">Réinitialisation de mot de passe</h2>
                <p>Bonjour,</p>
                <p>Vous avez demandé la réinitialisation de votre mot de passe pour votre compte <strong>AllStock</strong>.</p>
                <p>Cliquez sur le bouton ci-dessous pour choisir un nouveau mot de passe. Ce lien est valable 1 heure.</p>
                <a href="${resetUrl}" style="display: inline-block; padding: 10px 20px; background-color: #4F46E5; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0;">Réinitialiser mon mot de passe</a>
                <p>Si vous n'êtes pas à l'origine de cette demande, vous pouvez ignorer cet email.</p>
                <hr>
                <p style="font-size: 12px; color: #888;">L'équipe technique AllStock - Douala, Cameroun</p>
            </div>
        `
    };

    await transporter.sendMail(mailOptions);
    res.json({ message: "Email de réinitialisation envoyé avec succès !" });
        res.json({ message: "Lien de réinitialisation généré (Simulation)", token });

    } catch (error: any) {
        res.status(500).json({ error: error.message });
    } finally {
        client.release();
    }
};

// ÉTAPE B : Mise à jour du mot de passe
export const resetPassword = async (req: Request, res: Response) => {
    const { token } = req.params;
    const { password } = req.body;
    const client = await pool.connect();

    try {
        const userRes = await client.query(
            'SELECT id FROM users WHERE reset_token = $1 AND reset_token_expiry > NOW()',
            [token]
        );

        if (userRes.rowCount === 0) {
            return res.status(400).json({ error: "Token invalide ou expiré." });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        await client.query(
            'UPDATE users SET passeword_hash = $1, reset_token = NULL, reset_token_expiry = NULL WHERE id = $2',
            [hashedPassword, userRes.rows[0].id]
        );

        res.json({ message: "Mot de passe mis à jour avec succès !" });

    } catch (error: any) {
        res.status(500).json({ error: error.message });
    } finally {
        client.release();
    }
};