import {Router} from 'express';
import {login, registerDirector, registerEmployee} from '../controllers/authController.js';
import { upload } from '../middlewares/upload.js';

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

router.post('/register-employee', upload.single('logo'),registerEmployee);

/**
 * @route POST/api/auth/login
 * @desc Connexion universelle
 */

router.post('/login',upload.single('logo'),login)

export default router
