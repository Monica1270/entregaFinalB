/* const express = require('express');
const path = require('path');
const { connectDB } = require('./src/config/db.config');

const app = express();
const PORT = process.env.PORT || 8080;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK' });
});

const startServer = async () => {
  console.log('🔄 Iniciando conexión a MongoDB...');
  await connectDB();

  app.listen(PORT, () => {
    console.log(`🚀 Servidor Express escuchando en http://localhost:${PORT}`);
  });
};

startServer(); */
