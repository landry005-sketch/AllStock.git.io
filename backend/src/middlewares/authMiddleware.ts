import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export const authenticateToken = (req:Request, res:Response, next: NextFunction) =>{
    console.log("recuuuu", req.headers)
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(/\s+/)[1]
    

    if (! token) return res.status(401).json({error: "Accès refusé,token manquant."});

    jwt.verify(token, process.env.JWT_SECRET as string, (err, decoded)=>{
        if (err) return res.status(403).json({error: "Token invalide ou expiré."});

        (req as any).user = decoded;
        next();
    });
};