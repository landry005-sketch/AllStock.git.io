import type { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import {query} from '../config/db.js';
import jwt from 'jsonwebtoken'
import { v2 as cloudinary } from 'cloudinary';
import { rejects } from 'node:assert';


cloudinary.config({
    cloud_name: 'dbv9bfb7c',
    api_key: '557176812794176',
    api_secret: '_Pr3OpSuYoseY-pk86wEZtdC32M'
});
export const registerDirector = async (req:Request, res:Response) =>{
    console.log("Fichier reçu par le backend :", req.file);
    const {username, email, password, orgName } = req.body;
    const file = req.file;

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
        await query('BEGIN');

        // Creer le code unique
        const orgCode = `${orgName.substring(0, 3).toUpperCase()}-${Math.floor(1000 + Math.random()*9000)}`;

        //Inserer l'organisation
        const orgRes = await query(
            'INSERT INTO organisations (nom, org_code, logo_url) VALUES ($1, $2, $3) RETURNING id', [orgName, orgCode, logoUrl]
        );
        const orgId = orgRes.rows[0].id;

        //Hacher le mot de passe et creer l'admin
        const hash = await bcrypt.hash(password, 10);
        await query(
            'INSERT INTO users(nom_utilisateur, email, passeword_hash, org_id, role) VALUES($1, $2, $3, $4, $5)',
            [username,email, hash, orgId, 'ADMIN']
        );

        await query ('COMMIT');
        res.status(201).json({message:"Organisation créée avec succès !", orgCode});
    } catch(error){
        console.error("Detail de l'erreur SQL :", error)
        await query('ROLLBACK');
        res.status(500).json({error: "Erreur de l'inscription",details: error instanceof Error ? error.message: error});
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

export const login = async (req:Request, res:Response) =>{
    const {identifier, password} =req.body;
    try{
        //on cherche et recupere l'utilisateur par son adresse mail
        const userRes = await query(
            'SELECT * FROM users WHERE nom_utilisateur=$1 OR email=$1',[identifier]
        );

        if (userRes.rows.length === 0){
            return res.status(401).json({error: "Identifiants invalides."});
        }
        const user = userRes.rows[0];

        // Verifier le mot de passe avec Bcrypt

        const isMatch = await bcrypt.compare(password, user.passeword_hash);

        if (!isMatch){
            return res.status(401).json({error: "Identifiants non valides"});
        }

        //Creer le token
        const token = jwt.sign({
            username: user.nom_utilisateur,
            userId: user.id,
            role: user.role,
            orgId: user.org_id
        },
            process.env.JWT_SECRET as string,
            {expiresIn: '24h'}
        );

        //envoyer le reponse
        res.json({
            message: "Connexion reussie",
            token,
            user: {
                username: user.nom_utilisateur,
                email: user.email,
                role: user.role,
                orgId: user.org_Id
            }
        });
    }catch(error){
        console.error("Erreur Login:", error);
        res.status(500).json({error: "Erreur seveur lors de la connexion."});
    }
};

