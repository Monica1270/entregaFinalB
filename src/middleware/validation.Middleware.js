export const validateProductBody = (req, res, next) => {
  const { title, code, price, status, stock, category } = req.body || {};

  const errors = [];

  if (!title || typeof title !== 'string') errors.push('title is required and must be a string');
  if (!code || typeof code !== 'string' || !/^PROD-\d{4}$/.test(code)) errors.push('code is required and must match PROD-1234');
  if (price === undefined || typeof price !== 'number' || price < 0) errors.push('price is required and must be a non-negative number');
  if (status === undefined || typeof status !== 'boolean') errors.push('status is required and must be boolean');
  if (stock === undefined || typeof stock !== 'number' || stock < 0) errors.push('stock is required and must be a non-negative number');
  if (!category || typeof category !== 'string' || !/^[A-Za-z]+$/.test(category)) errors.push('category is required and must contain only letters');

  if (errors.length) {
    return res.status(400).json({ status: 'error', errors });
  }

  next();
};

export default validateProductBody;
