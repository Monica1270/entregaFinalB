import express from 'express';
import router from './src/routs/product.routs.js';

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/products', router);

app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    service: 'Mongoose CRUD Store API',
  });
});

export default app;
