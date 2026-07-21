 import mongoose from "mongoose";
/**
 * Definición del Schema del producto (ProductSchema)
 * Especifica la estructura de los documentos en la colección y sus reglas de validación.
 */
const productSchema = new mongoose.Schema({
    title: { 
        type: String, 
        required: [true, "El nombre del producto es obligatorio"],
        trim: true//Limpia espacios en blanco al inicio y al final del nombre
    },
    description:{
     type: String, 
     default: "Sin descripción adicional" 
    },
    code: {
        type: String,
        required: [true, "El código es obligatorio"],
        unique: true,
        //Validador personalizado para asegurar que el código siga un formato específico (ejemplo: PROD-1234)
        validate: {
            validator: function (v) {
                return /^PROD-\d{4}$/.test(v);
            },
            message: props => `El código ${props.value} no es un código de producto válido. Debe ser similar a PROD-1234.`,
        }
    },
    price: { 
        type: Number, 
        required: [true, "El precio es obligatorio"], 
        min: [0, "El precio no puede ser menor que 0"]//Validacion numerica integrada
    },
    status: { 
        type: Boolean, 
        required: [true], 
    },
    stock: { 
        type: Number, 
        required: [true], 
    },
    category: { 
        type: String, 
        required: [true],
         match: [/^[A-Za-z]+$/, 'La categoria debe contener letras sin números y caracteres especiales '] 
        },
    thumbnails: { 
        type: [String], default: [] 
    },
    isDeleted: { 
        type: Boolean, 
        default: false 
    },
    createdAt: { 
        type: Date, 
        default: Date.now 
    },
  
});

 export const Product = mongoose.model('Product', productSchema, 'productos');
