import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Nos aseguramos de tener cargadas las variables antes de acceder a ellas
dotenv.config();

const MONGODB_URI = process.env.MONGO_URI || process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('❌ ERROR CRÍTICO: No se encontró la variable de entorno MONGO_URI o MONGODB_URI');
  process.exit(1); // Patrón Fail-Fast
}

/**
 * Función asíncrona para iniciar la conexión con la base de datos
 */
export const connectDB = async () => {
  try {
    // Conectamos usando la URI configurada en variables de entorno.
    // Aunque Mongoose v8 ya habilita de forma predeterminada el nuevo analizador y motor de topología,
    // pasamos las opciones de compatibilidad solicitadas por el temario de la academia.
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
  } catch (error) {
    console.error('❌ Falló la conexión inicial a la base de datos:', error.message);
  }
};

const db = mongoose.connection;

// Ocultamos la contraseña para no mostrarla en consola/proyector frente a los alumnos
const maskedURI = MONGODB_URI.replace(/:([^@]+)@/, ':****@');

// Manejadores de Eventos del Ciclo de Vida de la Conexión (Requerimiento del temario)
db.on('connected', () => {
  console.log(`🟢 Mongoose: Conectado con éxito a MongoDB en: ${maskedURI}`);
});

db.on('error', (err) => {
  console.error('❌ Mongoose: Ocurrió un error en la conexión:', err.message);
});

db.on('disconnected', () => {
  console.log('⚠️ Mongoose: Conexión con la base de datos finalizada/desconectada.');
});