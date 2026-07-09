import express from "express";
import {
    createProduct,
    getProducts,
    getProductById,
    updateProduct,
    deleteProduct,
} from "../controllers/product.controller.js";
import { validateProductBody } from "../middleware/validation.Middleware.js";

const router = express.Router();
//1.Crear producto Post-Aplica pre-validacion y luego creaciòn
router.post("/", validateProductBody, createProduct);

// 2. Obtener productos con paginación Get
router.get("/", getProducts);

// 3. Obtener producto por ID Get
router.get("/:id", getProductById);

// 4. Actualizar producto por ID Put-Aplica pre-validacion y luego actualizacion
router.put("/:id", validateProductBody, updateProduct);

// 5. Eliminar producto por ID Delete
router.delete("/:id", deleteProduct);

export default router;