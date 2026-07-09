import express from 'express';
import router from './src/routs/product.routs.js';

const app = express();
const PORT = process.env.PORT || 8080;

// Middlewares globales obligatorios para interpretar los cuerpos de las peticiones
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rutas de nuestra API
app.use('/api/products', router);

// Endpoint simple de verificación de estado (Health Check)
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    service: 'Mongoose CRUD Store API',
  });
});

app.listen(PORT, () => {
  console.log(`Servidor escuchando en el puerto ${PORT}`);
});

export { app, PORT };