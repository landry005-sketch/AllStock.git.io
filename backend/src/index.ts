import  express  from "express";
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.js'

dotenv.config();

const app = express();

//middlewares
app.use(cors());
app.use(express.json());

//prefixe toutes les routes d'auth par /api/auth
app.use('/api/auth', authRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, ()=>{
    console.log(`Serveur BAO démarré sur http://localhost:${PORT}`);
})