import {Router} from 'express';
import {adminCreateUser, completeSetup, forgotPassword, login, registerDirector, registerEmployee, resetPassword} from '../controllers/authController.js';
import { upload } from '../middlewares/upload.js';
import { authenticateToken } from '../middlewares/authMiddleware.js';

const router = Router();
/**
 * @route  POST/api/auth/register-employee
 * @desc Route pour le createur
 * @access Public
 */
router.post('/register-director',upload.single('logo'),registerDirector);

/**
 * @route POST/api/auth/register-employee
 * @desc Route pour les employés ayant recu le code
 * @access Public (nécessite le code de l'organisation)
 */

router.post('/employee', upload.single('logo'),registerEmployee);

/**
 * @route POST/api/auth/login
 * @desc Connexion universelle
 */
/**
 * @route GET /api/auth/roles
 * @desc Récupère les rôles disponibles en base de données pour le menu déroulant
 */

/**
 * @route POST /api/auth/admin-create-user
 * @desc Création d'un compte par l'admin + envoi de mail avec identifiants
 */
router.post('/admin-create-user', upload.single('photo'), adminCreateUser);
router.post('/login',upload.single('logo'),login)
router.post('/forgot-password', forgotPassword);
router.post('/reset-password/:token', resetPassword);
// route pour les categories

//Changement de mot de passe
router.post('/complete-setup', completeSetup);
export default router
