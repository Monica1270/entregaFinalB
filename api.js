
import express from 'express';
import { engine } from 'express-handlebars';
import path from 'path';
import http from 'http';
import { Server } from 'socket.io';
import mongoose from 'mongoose';
import { fileURLToPath } from 'url';
import 'dotenv/config';

import productrouter from './src/routs/product.routs.js';
import cartRouter from './src/routs/carts.routs.js'


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = http.createServer(app);
export const io = new Server(server);

app.engine('handlebars', engine({
  defaultLayout: 'main',
  layoutsDir: path.join(__dirname, 'src/view/layout'),
  partialsDir: path.join(__dirname, 'src/view/partial'),
  helpers: {
    eq: (a, b) => a === b,
    multiply: (a, b) => (Number(a) || 0) * (Number(b) || 0)
  }
}));

app.set('view engine', 'handlebars');
app.set('views', path.join(__dirname, 'src/view'));

//Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use("/api/products", productrouter);
app.use("/api/carts", cartRouter);



// ===================== MODELOS =====================
const productSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  code: { type: String, required: true, unique: true },
  price: { type: Number, required: true },
  status: { type: Boolean, default: true },
  stock: { type: Number, required: true, default: 0 },
  category: { type: String, required: true },
  thumbnails: { type: [String], default: [] }
}, { timestamps: true, versionKey: false });

productSchema.set('toJSON', {
  transform: (doc, ret) => {
    ret.id = ret._id.toString();
    delete ret._id;
    return ret;
  }
});

const Product = mongoose.model('Products', productSchema, 'products')
/* 
const cartItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Products',
    required: true
  },
  quantity: {
    type: Number,
    default: 1,
    min: 1
  }
}, { _id: false });

const cartSchema = new mongoose.Schema({
  products: {
    type: [cartItemSchema],
    default: []
  }
}, { timestamps: true, versionKey: false });

cartSchema.set('toJSON', {
  transform: (doc, ret) => {
    ret.id = ret._id.toString();
    delete ret._id;
    return ret;
  }
});

const Cart = mongoose.model('Cart', cartSchema, 'carts'); */
import { Cart } from "./src/models/cart.models.js";


// ===================== SOCKETS =====================
io.on('connection', (socket) => {
  console.log('Cliente conectado al socket');
});

const emitProductsUpdate = () => {
  io.emit('products-changed', { timestamp: new Date().toISOString() });
};

const emitCartUpdate = (cid) => {
  io.emit('cart-changed', { cid, timestamp: new Date().toISOString() });
};

// ===================== RUTA DE VISTA PARA HANDLEBARS =====================
app.get('/products', async (req, res, next) => {
  try {
const query = req.query.query ? String(req.query.query).trim() : '';
    let filter = {};

    if (query) {
      filter.$or = [
        { category: new RegExp(query, 'i') },
        { title: new RegExp(query, 'i') }
      ];
    }
 //Importante usar .lean() para que Handlebars pueda leer los datos sin restricciones
    const products = await Product.find(filter).lean();
    
    // Renderiza tu archivo src/view/home.handlebars
    res.render('home', { 
      title: 'Mi Tienda - Catálogo', 
      products 
    });
  } catch (error) {
    next(error);
  }
});
 
/*app.get('/products', async (req, res, next) => {
  try {
    const { cid } = req.params;
    
    // Si envían ":cid" o un ID roto, devolvemos el carrito vacío sin romper la app
    if (!mongoose.Types.ObjectId.isValid(cid)) {
      return res.render('cart', { title: 'Mi Carrito', cart: { products: [] } });
    }

    const cart = await Cart.findById(cid).populate('products.product').lean();

    if (!cart) {
      return res.render('cart', { title: 'Mi Carrito', cart: { products: [] } });
    }

    res.render('cart', { title: 'Mi Carrito', cart });
  } catch (error) {
    next(error);
  }
});*/

// Ruta principal de productos (soporta búsqueda por categoría y título)
/* app.get('/products', async (req, res, next) => {
  try {
    const query = req.query.query ? String(req.query.query).trim() : '';
    let filter = {};

    if (query) {
      filter.$or = [
        { category: new RegExp(query, 'i') },
        { title: new RegExp(query, 'i') }
      ];
    }
 
    const products = await Product.find(filter).lean();
    res.render('home', { title: 'Mi Tienda - Catálogo', products });
  } catch (error) {
    next(error);
  }
});*/

// Alias /home por si alguien entra a /home
app.get('/home', (req, res) => {
  res.redirect('/products');
});

// Alias /products-view por si alguien entra a /products-view
app.get('/products-view', (req, res) => {
  res.redirect('/products');
});

// Redirigimos la raíz '/' hacia '/products'
app.get('/', (req, res) => {
  res.redirect('/products');
});

app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    service: 'Mongoose CRUD Store API'
  });
});

// Ruta para ver el carrito por vista Handlebars
app.get('/cart-view/:cid', async (req, res, next) => {
  try {
    const { cid } = req.params;
    
    // Obtenemos el carrito y populamos los datos del producto
    const cart = await Cart.findById(cid).populate('products.product').lean();

    if (!cart) {
      return res.render('cart', { title: 'Mi Carrito', cart: { products: [] } });
    }

    res.render('cart', { title: 'Mi Carrito', cart });
  } catch (error) {
    next(error);
  }
});

// ================Productos==============
app.get('/api/products', async (req, res, next) => {
  try {
    const limit = Number(req.query.limit) || 10;
    const page = Number(req.query.page) || 1;
    const query = req.query.query ? String(req.query.query).trim() : '';
    const sort = req.query.sort ? String(req.query.sort).toLowerCase() : '';

    let filter = {};

    if (query) {
      if (query === 'true' || query === 'false') {
        filter.status = query === 'true';
      } else {
        filter.$or = [
          { category: new RegExp(query, 'i') },
          { title: new RegExp(query, 'i') }
        ];
      }
    }

    let productsQuery = Product.find(filter);

    if (sort === 'asc') {
      productsQuery = productsQuery.sort({ price: 1 });
    } else if (sort === 'desc') {
      productsQuery = productsQuery.sort({ price: -1 });
    }

    const totalProducts = await Product.countDocuments(filter);
    const totalPages = totalProducts === 0 ? 0 : Math.ceil(totalProducts / limit);
    const skip = (page - 1) * limit;

    const payload = await productsQuery.skip(skip).limit(limit);

    const baseUrl = `${req.protocol}://${req.get('host')}${req.originalUrl.split('?')[0]}`;
    const buildLink = (p) => `${baseUrl}?limit=${limit}&page=${p}${query ? `&query=${encodeURIComponent(query)}` : ''}${sort ? `&sort=${sort}` : ''}`;

    res.json({
      status: 'success',
      payload,
      totalPages,
      prevPage: page > 1 ? page - 1 : null,
      nextPage: totalPages > 0 && page < totalPages ? page + 1 : null,
      page,
      hasPrevPage: page > 1,
      hasNextPage: totalPages > 0 && page < totalPages,
      prevLink: page > 1 ? buildLink(page - 1) : null,
      nextLink: totalPages > 0 && page < totalPages ? buildLink(page + 1) : null
    });
  } catch (error) {
    next(error);
  }
});

app.get('/api/products/:pid', async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.pid);
    if (!product) {
      return res.status(404).json({ status: 'error', message: 'Producto no encontrado' });
    }
    res.json({ status: 'success', payload: product });
  } catch (error) {
    next(error);
  }
});

app.post('/api/products', async (req, res, next) => {
  try {
    const product = await Product.create(req.body);
    emitProductsUpdate();
    res.status(201).json({ status: 'success', payload: product });
  } catch (error) {
    next(error);
  }
});

app.put('/api/products/:pid', async (req, res, next) => {
  try {
    const { id, ...rest } = req.body;
    const product = await Product.findByIdAndUpdate(req.params.pid, rest, {
      new: true,
      runValidators: true
    });

    if (!product) {
      return res.status(404).json({ status: 'error', message: 'Producto no encontrado' });
    }

    emitProductsUpdate();
    res.json({ status: 'success', payload: product });
  } catch (error) {
    next(error);
  }
});

app.delete('/api/products/:pid', async (req, res, next) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.pid);
    if (!product) {
      return res.status(404).json({ status: 'error', message: 'Producto no encontrado' });
    }

    emitProductsUpdate();
    res.json({ status: 'success', message: 'Producto eliminado' });
  } catch (error) {
    next(error);
  }
});

// Carritos
app.post('/api/carts', async (req, res, next) => {
  try {
    const cart = await Cart.create({ products: [] });
    res.status(201).json({ status: 'success', payload: cart });
  } catch (error) {
    next(error);
  }
});
//obtener carrito por ID
app.get('/api/carts/:cid', async (req, res, next) => {
  try {
    const { cid } = req.params;
     console.log("GET /api/carts/:cid -> cid:", cid);

    if (!mongoose.Types.ObjectId.isValid(cid)) {
      return res.status(400).json({ status: 'error', message: 'ID de carrito no válido' });
    }
    const cart = await Cart.findById(/* req.params. */cid).populate('products.product');
    if (!cart) {
      return res.status(404).json({ status: 'error', message: 'Carrito no encontrado' });
    }
    res.json({ status: 'success', payload: cart });
  } catch (error) {
    next(error);
  }
});
//Agregar producto al carrito
app.post('/api/carts/:cid/products/:pid', async (req, res, next) => {
  try {
    const { cid, pid } = req.params;
if (!mongoose.Types.ObjectId.isValid(cid) || !mongoose.Types.ObjectId.isValid(pid)) {
      return res.status(400).json({ status: 'error', message: 'ID de carrito o producto no válido' });
    }
    const cart = await Cart.findById(cid);
    if (!cart) {
      return res.status(404).json({ status: 'error', message: 'Carrito no encontrado' });
    }

    const product = await Product.findById(pid);
    if (!product) {
      return res.status(404).json({ status: 'error', message: 'Producto no encontrado' });
    }

    const existingItem = cart.products.find(item => item.product.toString() === pid);

    if (existingItem) {
      existingItem.quantity += 1;
    } else {
      cart.products.push({ product: pid, quantity: 1 });
    }

    await cart.save();

    const populatedCart = await Cart.findById(cart._id).populate('products.product');
    emitCartUpdate(cid);

    res.json({ status: 'success', payload: populatedCart });
  } catch (error) {
    next(error);
  }
});
//Eliminar producto del carrito
app.delete('/api/carts/:cid/products/:pid', async (req, res, next) => {
  try {
    const { cid, pid } = req.params;
if (!mongoose.Types.ObjectId.isValid(cid) || !mongoose.Types.ObjectId.isValid(pid)) {
      return res.status(400).json({ status: 'error', message: 'ID de carrito o producto no válido' });
    }

    const cart = await Cart.findById(cid);

    if (!cart) {
      return res.status(404).json({ status: 'error', message: 'Carrito no encontrado' });
    }

    cart.products = cart.products.filter(item => item.product.toString() !== pid);
    await cart.save();

    emitCartUpdate(cid);
    res.json({ status: 'success', payload: cart });
  } catch (error) {
    next(error);
  }
});
//Actualizar todos los productos
app.put('/api/carts/:cid', async (req, res, next) => {
  try {
    const { cid } = req.params;
if (!mongoose.Types.ObjectId.isValid(cid)) {
      return res.status(400).json({ status: 'error', message: 'ID de carrito no válido' });
    }
    const cart = await Cart.findByIdAndUpdate(cid, { products: req.body.products || [] }, { new: true });
    if (!cart) {
      return res.status(404).json({ status: 'error', message: 'Carrito no encontrado' });
    }

    emitCartUpdate(cid);
    res.json({ status: 'success', payload: cart });
  } catch (error) {
    next(error);
  }
});
//Actualizar cantidad de un producto en el carrito
app.put('/api/carts/:cid/products/:pid', async (req, res, next) => {
  try {
    const { cid, pid } = req.params;
    const { quantity } = req.body;

if (!mongoose.Types.ObjectId.isValid(cid) || !mongoose.Types.ObjectId.isValid(pid)) {
      return res.status(400).json({ status: 'error', message: 'ID de carrito o producto no válido' });
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

    emitCartUpdate(cid);
    res.json({ status: 'success', payload: cart });
  } catch (error) {
    next(error);
  }
});
//Vaciar o eliminar carrito
app.delete('/api/carts/:cid', async (req, res, next) => {
  try {
    const { cid } = req.params;

    if (!mongoose.Types.ObjectId.isValid(cid)) {
      return res.status(400).json({ status: 'error', message: 'ID de carrito no válido' });
    }

    const cart = await Cart.findByIdAndDelete(/* req.params. */cid);
    if (!cart) {
      return res.status(404).json({ status: 'error', message: 'Carrito no encontrado' });
    }

    emitCartUpdate(/* req.params. */cid);
    res.json({ status: 'success', message: 'Carrito vaciado' });
  } catch (error) {
    next(error);
  }
});

// ===================== ERROR HANDLER =====================
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({
    status: 'error',
    message: err.message || 'Error interno del servidor'
  });
});

// ===================== ARRANQUE =====================
const PORT = process.env.PORT || 8080;
const MONGO_URI = process.env.MONGO_URI || process.env.MONGODB_URI;

if (!MONGO_URI) {
  console.error('❌ ERROR CRÍTICO: No se encontró la variable de entorno MONGO_URI o MONGODB_URI');
  process.exit(1);
}

const start = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('MongoDB conectado');

    server.listen(PORT, () => {
      console.log(`Servidor Express escuchando en http://localhost:${PORT}`);
      console.log(`Health: http://localhost:${PORT}/health`);
      console.log(`Productos: http://localhost:${PORT}/api/products`);
      console.log(`Carritos: http://localhost:${PORT}/api/carts`);
    });
  } catch (error) {
    console.error('Error al conectar a MongoDB:', error.message);
    process.exit(1);
  }
};

start();
export { app };