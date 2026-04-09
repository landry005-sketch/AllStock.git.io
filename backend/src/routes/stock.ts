import { Router } from "express";
import { upload } from "../middlewares/upload";
import { confirmSave,  scanReceipt } from "../controllers/StockController";
import { authenticateToken } from "../middlewares/authMiddleware";
import { addCategory, alterCategorie, deleteCategory, getCategoryByOrg } from "../controllers/CategoryController";
import { addProductManual, deleteProduct, getExistingUnits, getProducts } from "../controllers/ProductController";
import { createSuppliers, deleteSuppliers, getSuppliers, sendSupplierOrder } from "@/controllers/FournisseurController";
import { getProductSuggestions } from "@/controllers/AiController";

const router = Router ()

router.post('/scan-receipt',authenticateToken,upload.single("image"),scanReceipt)
router.post('/confirm-save', authenticateToken,confirmSave)
router.post('/addCategory', authenticateToken, addCategory)
router.delete('/deleteCategory/:id', authenticateToken,deleteCategory)
router.put('/upgradeCategory/:id', authenticateToken,alterCategorie)
router.get('/getCategory',getCategoryByOrg);
router.post('/addProduct', authenticateToken, addProductManual)
router.delete('/deleteProduct/:id', authenticateToken, deleteProduct)
router.get('/products', getProducts);
router.post('/addsupplier', authenticateToken, createSuppliers);
router.get('/getsupplier', authenticateToken, getSuppliers);
router.delete('deletesupplier/:id', authenticateToken, deleteSuppliers);
router.get('/units', authenticateToken,getExistingUnits);
router.post('/send-supplier-order', authenticateToken, sendSupplierOrder);
router.post('/suggest-variants', authenticateToken, getProductSuggestions);
export default router