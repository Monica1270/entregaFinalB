import { Product } from "../models/Product.models.js";
//===============================
//1 . Crear un producto (POST, /api/products)
//===============================
export const createProduct = async (req, res, next) => {
    try {
        //Product.create validada automáticamente el req.body contra el schema antes de guardar.
        //Si falla alguna validación, arrojara un ValidationError que sera capturado por catch.
    const product = await Product.create(req.body);
    res.status(201).json({
        status: "success",
        message: "Producto creado exitosamente",    
        data: product,
    });
    } catch (error) {
        next(error); // Delega el error al middleware global de Express.
    }
};
//===============================    
//2. Obterner productos  con paginación (GET, /api/products)
//===============================
export const getProducts = async (req, res, next) => {
    try{
        //obtenemos los parammetros de consulta (?page=2&limit=5)
        // si no vienene, seteamos valores por defecto seguros(pagina 1, limite de 5 elementos)
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit; // calcula cuantos productos saltarse

        //Filtro basico para excluir de la lista los productos eliminado de forma logica(soft delete)
        const filter = {isDeleted: { $ne: true }};
        // Tecnica Avanzada (Promise.all): Ejecutamos las dos consultas asincronicas en paralelo
        // en lugar de usar dos await secuenciales. Esto duplica la velocidad de respuesta de la API.

        const [products, totalItems] = await Promise.all([
            Product.find(filter).skip(skip).limit(limit), // Consulta de productos con paginación
            Product.countDocuments(filter) // Conteo total de productos no eliminados
        ]);
        const totalPages = Math.ceil(totalItems / limit); // Calcula el total de páginas
    res.status(200).json({
        status: "success",
        pagination: {
            totalItems,
            totalPages,
            currentPage: page,  
            limit,  
        },
        data: products,
    });
    } catch (error) {
        next(error); // Delega el error al middleware global de Express.
    };
}
    //===============================
    //3. Obtener un producto por ID (GET, /api/products/:id)
    //===============================
export const getProductById = async (req, res, next) => {
        const { id } = req.params;
        // Buscamo por ID y nos aseguramos de que no este  marcado como eliminado de forma logica
        const product = await Product.findOne({ 
            _id: id, 
            isDeleted: { $ne: true } 
        });
        if (!product) {
            return res.status(404).json({
                status: "error",
                message:`No se encontró ningún producto activo con el ID ${id}`,
            });
        }
        res.status(200).json({
            status: "success",
            data: product,
        });
    };
    //===============================
    //4. Actualizar un producto por ID (PUT, /api/products/:id)->IMPORTANTE
    //===============================
export const updateProduct = async (req, res, next) => {
    try {
        const { id } = req.params;
        // findOneAndUpdate busca por id (exluyendo borrados logicoe) y aplica los cambios.
        //Opciones clave:
        //new: true ->Retorna el documento ya modicicado en vez de su estado previo.
        // runVaidators:true-> Fuerza a Mongoose a validar los datos modificados conta el Schema antes de guardarlos.
        const updated = await Product.findOneAndUpdate(
            { _id: id, isDeleted: { $ne: true } }, // Filtro para encontrar el producto activo por ID
            req.body, // Datos a actualizar
            { new: true, runValidators: true } // Opciones
        );
        if (!updated) {
            return res.status(404).json({
                status: "error",
                message: `No se encontró ningún producto activo con el ID ${id} para actualizar`,
            });
        }
        res.status(200).json({
            status: "success",
            data: updated,
        });
    } catch (error) {
        next(error);
    }
};
//===============================
//5. Eliminar un producto  (DELETE, /api/products/:id)
//==============================
export const deleteProduct = async (req, res, next) => {
    try {
        const { id } = req.params;
        //[OPCION A: eliminacion fisica] Borra el documento definitivamente del disco.
        const deleted = await Product.findOneAndDelete(id);
        
        if(!deleted) {
            return res.status(404).json({
                status:"error",
                message:`No se encontró ningún producto con el ID: ${id} para eliminar`,
            });
        }
        res.status(200).json({
            status:"succes",
            message:`El producto "${deleted.name}" fue eliminado fisicamente del servidor`,
            data:deleted,
        });
    }catch(error) {
        next(error);
    }
};