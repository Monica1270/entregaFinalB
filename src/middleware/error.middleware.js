/**
 * *Middleware centralizado para el precesamiento y formateo de errores
 * *Captura exepciones especifica de Mongose (validacion, claves duplicadas, casteo)
 * y devuelve respuestas estructuradas al cliente
 */
export const errorHandler = (err, req, res, next) =>{
    console.error('---[ERROR DETECTADO EN EL SERVIDOR]---');
    console.error(err);

    //1. Error de validacion de Mongose (validationErrror)
    //Ocurre cuando el cliente envia datos que no cumplen las reglas del sistema (min, required, match, etc)
    if(err.name==='ValidationError') {
        const errorDatails = Object.values(err.errors).map(e => e.message);
        return res.status(400).json({
            status:'error',
            errorType: 'ValidationError',
            message: 'Fallo de validación: Algunos campos no cumplen las reglas del schema',
            errors: errorDatails
        });
    }
    //2.Error de clave duplicada en mongoDB (código 11000)
    //Ocurre cuando se intenta insertar un valor que ya existe en una propiedad marcada com "unique:true" (ej:code)
    if (err.code === 11000) {
        const duplicateField = Object.keys(err.keyValue || {})[0];
        const duplicateValue = Object.values(err.keyValue || {})[0];
        return res.status(409).json({
            status:'error',
            errorType:'DuplicateKeyError',
            message:`El valor '${duplicateValue}' ya está registrado para el campo único '${duplicateField}'`
        });
    }
    //3. Error de casteo de Mongoose (castError)
    //Ocurre cuando un parámetro no coincide con el tipo esperado, por ejemplo,
    //enviar un ID DE 12 BYTES INVÁLIDO EN LA RUTA /api/productos/:id
    if(err.name==='CastError') {
        return res.status(400).json({
            status:'error',
            errorType:'CastError',
            message:`El formato del valor '${err.value}' no es un identificador válido para la propiedad '${err.path}'se esperaba tipo ${err.kind}`
        });
    }
    //4. Error interno genérico (500)
    res.status(500).json({
        status:"error",
        errorType:"InternalServerError",
        message: err.message || "Ocurrió un error inesperado en el servidor."
    });

};