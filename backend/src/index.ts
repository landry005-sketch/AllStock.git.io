import  express  from "express";
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.js'
import userRoutes from './routes/user.js'
import stockRoutes from './routes/stock.js'
import dataRoutes from './routes/data.js';
import salesRoutes from './routes/sales.js'

dotenv.config();

const app = express();

//middlewares
app.use(cors());
app.use(express.json());

//prefixe toutes les routes d'auth par /api/auth
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/stock', stockRoutes);
app.use('/api/data', dataRoutes);
app.use('/api/sales', salesRoutes);
// Ce bloc va capturer TOUTES les erreurs que tu ne vois pas actuellement
// eslint-disable-next-line @typescript-eslint/no-explicit-any
app.use((err: any, req: any, res: any, next: any) => {
  console.error("!!! ERREUR GLOBALE DÉTECTÉE !!!");
  console.error(err.stack);
  res.status(500).send("Erreur fatale du serveur");
});


const PORT = process.env.PORT || 5000;
app.listen(PORT, ()=>{
    console.log(`Serveur démarré sur http://localhost:${PORT}`);
})