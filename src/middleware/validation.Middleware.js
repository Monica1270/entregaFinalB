/**
 * Middleware para validar que los campos obligatorios del producto esten presentes
 * antes de pasárselo a Mongoose para su procesamiento
 */

export const validateProductBody = (req, res, next) => {
  const { title, code, price, status, stock, category } = req.body;
  // Realizamos una validación rápida solo para solicitudes POST (creación)
  // en las solicitudes PUT (actualización) permitimos envíos parciales
  if (req.method === 'POST') {
    if (!title || price === undefined || !category || !code) {
      return res.status(400).json({
        status: 'error',
        message: 'Validación Express: Faltan campos obligatorios en el cuerpo. Debes enviar title, price, category, code',
      });
    }
  }
  next(); // Si está todo OK, continúa con el controlador
};


