import { Cart} from "../models/cart.models.js";
import { Product } from "../models/Product.models.js";
import { io } from "../../api.js";

// 1. Crear un nuevo carrito (POST /api/carts)
export const createCart = async (req, res, next) => {
  try {
    const cart = await Cart.create({ products: [] });
    res.status(201).json({ status: 'success', payload: cart });
  } catch (error) {
    next(error);
  }
};

// 2. Obtener un carrito por ID con Populate (GET /api/carts/:cid)
export const getCartById = async (req, res, next) => {
  try {
    const cart = await Cart.findById(req.params.cid)
      .populate( 'products.product')
      .lean();

    if (!cart) {
      return res.status(404).json({ status: 'error', message: 'Carrito no encontrado' });
    }

    res.json({ status: 'success', payload: cart });
  } catch (error) {
    next(error);
  }
};

// 3. Agregar un producto al carrito (POST /api/carts/:cid/products/:pid)
export const addProductToCart = async (req, res, next) => {
  try {
    const { cid, pid } = req.params;

    const cart = await Cart.findById(cid);
    if (!cart) {
      return res.status(404).json({ status: 'error', message: 'Carrito no encontrado' });
    }

    const product = await Product.findById(pid);
    if (!product || product.isDeleted) {
      return res.status(404).json({ status: 'error', message: 'Producto no encontrado o no disponible' });
    }

    const existingItem = cart.products.find(item => item.product.toString() === pid);

    if (existingItem) {
      existingItem.quantity += 1;
    } else {
      cart.products.push({ product: pid, quantity: 1 });
    }

    await cart.save();

    const populatedCart = await Cart.findById(cid)
      .populate({ path: 'products.product', model: Product })
      .lean();

    io.emit('cart-changed', { cid, timestamp: new Date().toISOString() });

    res.json({ status: 'success', payload: populatedCart });
  } catch (error) {
    next(error);
  }
};

// 4. Eliminar un producto específico del carrito (DELETE /api/carts/:cid/products/:pid)
export const removeProductFromCart = async (req, res, next) => {
  try {
    const { cid, pid } = req.params;

    const cart = await Cart.findById(cid);
    if (!cart) {
      return res.status(404).json({ status: 'error', message: 'Carrito no encontrado' });
    }

    cart.products = cart.products.filter(item => item.product.toString() !== pid);
    await cart.save();

    io.emit('cart-changed', { cid, timestamp: new Date().toISOString() });

    res.json({ status: 'success', payload: cart });
  } catch (error) {
    next(error);
  }
};

// 5. Reemplazar el arreglo entero de productos (PUT /api/carts/:cid)
export const updateCartProducts = async (req, res, next) => {
  try {
    const { cid } = req.params;
    const { products } = req.body;

    const cart = await Cart.findByIdAndUpdate(
      cid,
      { products: products || [] },
      { new: true }
    ).populate({ path: 'products.product', model: Product }).lean();

    if (!cart) {
      return res.status(404).json({ status: 'error', message: 'Carrito no encontrado' });
    }

    io.emit('cart-changed', { cid, timestamp: new Date().toISOString() });

    res.json({ status: 'success', payload: cart });
  } catch (error) {
    next(error);
  }
};

// 6. Actualizar SOLO la cantidad de un producto (PUT /api/carts/:cid/products/:pid)
export const updateProductQuantity = async (req, res, next) => {
  try {
    const { cid, pid } = req.params;
    const { quantity } = req.body;

    if (typeof quantity !== 'number' || quantity < 1) {
      return res.status(400).json({ status: 'error', message: 'La cantidad debe ser un número positivo mayor a 0' });
    }

    const cart = await Cart.findById(cid);
    if (!cart) {
      return res.status(404).json({ status: 'error', message: 'Carrito no encontrado' });
    }

    const item = cart.products.find(item => item.product.toString() === pid);
    if (!item) {
      return res.status(404).json({ status: 'error', message: 'Producto no encontrado en el carrito' });
    }

    item.quantity = quantity;
    await cart.save();

    io.emit('cart-changed', { cid, timestamp: new Date().toISOString() });

    res.json({ status: 'success', payload: cart });
  } catch (error) {
    next(error);
  }
};

// 7. Vaciar un carrito por completo (DELETE /api/carts/:cid)
export const clearCart = async (req, res, next) => {
  try {
    const { cid } = req.params;

    const cart = await Cart.findByIdAndUpdate(
      cid,
      { products: [] },
      { new: true }
    ).lean();

    if (!cart) {
      return res.status(404).json({ status: 'error', message: 'Carrito no encontrado' });
    }

    io.emit('cart-changed', { cid, timestamp: new Date().toISOString() });

    res.json({ status: 'success', message: 'Carrito vaciado exitosamente', payload: cart });
  } catch (error) {
    next(error);
  }
};