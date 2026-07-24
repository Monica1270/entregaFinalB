
import { Router } from "express";
import {
  createCart,
  getCartById,
  addProductToCart,
  removeProductFromCart,
  updateCartProducts,
  updateProductQuantity,
  clearCart
} from "../controllers/carts.controller.js";

const cartRouter = Router();

// 1. Crear un nuevo carrito POST /api/carts
cartRouter.post("/", createCart);

// 2. Obtener un carrito por ID con populate GET /api/carts/:cid
cartRouter.get("/:cid", getCartById);

// 3. Agregar un producto al carrito POST /api/carts/:cid/products/:pid
cartRouter.post("/:cid/products/:pid", addProductToCart);

// 4. Eliminar un producto específico del carrito DELETE /api/carts/:cid/products/:pid
cartRouter.delete("/:cid/products/:pid", removeProductFromCart);

// 5. Actualizar el carrito completo con un arreglo de productos PUT /api/carts/:cid
cartRouter.put("/:cid", updateCartProducts);

// 6. Actualizar SÓLO la cantidad de un producto PUT /api/carts/:cid/products/:pid
cartRouter.put("/:cid/products/:pid", updateProductQuantity);

// 7. Vaciar completamente el carrito DELETE /api/carts/:cid
cartRouter.delete("/:cid", clearCart);

export default cartRouter;






