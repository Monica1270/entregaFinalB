import mongoose from 'mongoose';
import dotenv from 'dotenv';

// mongosh "mongodb+srv://monicalombardi1970_db_user:Pirulo43$@cluster0.4hwqowi.mongodb.net/?appName=Cluster0"
dotenv.config();


const MONGO_URI = process.env.MONGO_URI || 'mongodb+srv://monicalombardi1970_db_user:Pirulo43$@cluster0.4hwqowi.mongodb.net/?appName=Cluster0'

if (!MONGO_URI) {
    console.error('Error Crítico:La variable MONGODB_URI no está definida en .env');
    process.exit(1);
}
export const connectDB = async () => {
    try {
        await mongoose.connect(MONGO_URI,{ 
            useNewUrlParser: true,
            useUnifiedTopology: true,
           
        }, console.log('✅Mongoose conectado a MongoDB'));
    } catch (error) {
        console.error('Fallo la conexión  inicial a la base de datos:', error.message); 
    }
};
const db = mongoose.connection;
const maskedUri = MONGO_URI.replace(/(mongodb:\/\/)(.*):(.*)@(.*)/, '$1****:****@$4');

db.on('connected', () => {
    console.log(`✅Mongoose:Conectado con éxito a MongoDB en ${maskedUri}`);
});

db.on('error', (err) => {
    console.error('❌Mongoose: Ocurió un error en la conexión:', err.message);
 });
 
 db.on('disconnected', () => {
    console.log('❗Mongoose: Conexión con la base de datos finalizada/desconectada');
 });