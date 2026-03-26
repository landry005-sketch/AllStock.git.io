import { Router } from 'express';
import { deleteUser, getUserFullProfile } from '../controllers/userController';
import { getCategoryByOrg } from '../controllers/CategoryController';
import { createUser, getAllUsers, getRoles } from '../controllers/authController';
import { getMarqueByOrg } from '../controllers/MarqueController';
import { authenticateToken } from '../middlewares/authMiddleware';

const router = Router();
router.get('/roles', getRoles);

// Route pour récupérer le profil complet par ID
router.get('/profile/:id', getUserFullProfile);
//Route pour récupérer les catégories

// route pour les marques
router.get('/by-org-marque', getMarqueByOrg);
//Routes pour voir tous les utilisateurs
router.get('/getusers', authenticateToken, getAllUsers);
// route pour creer un utilisateur 
router.post('/employee',authenticateToken, createUser);
// Route pour la suppression des utilisateurs
router.delete('/:id',authenticateToken, deleteUser);
export default router;