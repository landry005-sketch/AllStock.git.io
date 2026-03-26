import { cancelSale, createSale, getSales } from "@/controllers/SalesController";
import { authenticateToken } from "@/middlewares/authMiddleware";
import { Router } from "express";


const router = Router()
router.post('/createSale', authenticateToken, createSale);
router.delete('/cancelSale', authenticateToken, cancelSale);
router.get('/getsales', authenticateToken, getSales)
export default router ;