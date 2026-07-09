import {app} from './app.js';
import {connectDB} from './config/db.js';
import dotenv from 'dotenv';

dotenv.config();
const PORT = process.env.PORT || 8080;

/**
 * *función principal para iniciar el servidor y la conexión a la base de datos
 *sigue el principio Fail-fast: si la conexión a la base de datos falla
 *no inciamos el servidor web
  */
 const startServer = async () => {
    console.log('🔄️Iniciando la conexión a la base de datos...');
    await connectDB();
    //Escuchamos el puerto configurado una vez que se intenta la conectar
    app.listen(PORT, () => {
        console.log(`🚀 Servidor Express escuchando en el puerto ${PORT}`);
        console.log(`Health Check disponible en : http://localhost:${PORT}/healthd`);
        console.log(`API de productos en: http://localhost:${PORT}/api/products`);
    });
};

startServer();