import { Cart } from "../models/cart.model.js";

export const createCart = async () => {
  return await Cart.create({ products: [] });
};

export const getCartById = async (cid) => {
  return await Cart.findById(cid).populate("products.product");
};

// Agregar un producto o incrementar su cantidad
export const addProductToCart = async (cid, pid) => {
  const cart = await Cart.findById(cid);
  if (!cart) return null;

  const existingItem = cart.products.find(item => item.product.toString() === pid);

  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    cart.products.push({ product: pid, quantity: 1 });
  }

  await cart.save();
  return await Cart.findById(cid).populate("products.product");
};

// Eliminar un producto específico del carrito
export const removeProductFromCart = async (cid, pid) => {
  const cart = await Cart.findById(cid);
  if (!cart) return null;

  cart.products = cart.products.filter(item => item.product.toString() !== pid);
  await cart.save();
  return cart;
};

// Actualizar la cantidad de un producto específico
export const updateProductQuantity = async (cid, pid, quantity) => {
  const cart = await Cart.findById(cid);
  if (!cart) return null;

  const item = cart.products.find(item => item.product.toString() === pid);
  if (!item) return null;

  item.quantity = quantity;
  await cart.save();
  return cart;
};

// Actualizar todo el arreglo de productos
export const updateCartProducts = async (cid, products) => {
  return await Cart.findByIdAndUpdate(cid, { products }, { new: true });
};

// Vaciar el carrito sin eliminar el documento
export const clearCart = async (cid) => {
  return await Cart.findByIdAndUpdate(cid, { products: [] }, { new: true });
};