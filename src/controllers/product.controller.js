import { Product } from "../models/Product.models.js";

//===============================
// 1. Crear un producto (POST, /api/products)
//===============================
export const createProduct = async (req, res, next) => {
  try {
    const product = await Product.create(req.body);
    res.status(201).json({
      status: "success",
      payload: product,
    });
  } catch (error) {
    next(error);
  }
};

//===============================
// 2. Obtener productos con paginación (GET, /api/products)
//===============================
export const getProducts = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const query = req.query.query ? String(req.query.query).trim() : "";
    const sort = req.query.sort ? String(req.query.sort).toLowerCase() : "";

    const filter = { isDeleted: { $ne: true } };

    if (query) {
      if (query === "true" || query === "false") {
        filter.status = query === "true";
      } else {
        filter.$or = [
          { category: new RegExp(query, "i") },
          { title: new RegExp(query, "i") },
        ];
      }
    }

    let productsQuery = Product.find(filter);

    if (sort === "asc") {
      productsQuery = productsQuery.sort({ price: 1 });
    } else if (sort === "desc") {
      productsQuery = productsQuery.sort({ price: -1 });
    }

    const [products, totalItems] = await Promise.all([
      productsQuery.skip(skip).limit(limit),
      Product.countDocuments(filter),
    ]);

    const totalPages = totalItems === 0 ? 0 : Math.ceil(totalItems / limit);
    const prevPage = page > 1 ? page - 1 : null;
    const nextPage = page < totalPages ? page + 1 : null;

    const baseUrl = `${req.protocol}://${req.get("host")}${req.baseUrl}${req.path}`;
    const buildLink = (p) =>
      `${baseUrl}?limit=${limit}&page=${p}${query ? `&query=${encodeURIComponent(query)}` : ""}${sort ? `&sort=${sort}` : ""}`;

    res.status(200).json({
      status: "success",
      payload: products,
      totalPages,
      prevPage,
      nextPage,
      page,
      hasPrevPage: prevPage !== null,
      hasNextPage: nextPage !== null,
      prevLink: prevPage ? buildLink(prevPage) : null,
      nextLink: nextPage ? buildLink(nextPage) : null,
    });
  } catch (error) {
    next(error);
  }
};

//===============================
// 3. Obtener un producto por ID (GET, /api/products/:id)
//===============================
export const getProductById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const product = await Product.findOne({
      _id: id,
      isDeleted: { $ne: true },
    });

    if (!product) {
      return res.status(404).json({
        status: "error",
        message: `No se encontró ningún producto activo con el ID ${id}`,
      });
    }

    res.status(200).json({
      status: "success",
      payload: product,
    });
  } catch (error) {
    next(error);
  }
};

//===============================
// 4. Actualizar un producto por ID (PUT, /api/products/:id)
//===============================
export const updateProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updated = await Product.findOneAndUpdate(
      { _id: id, isDeleted: { $ne: true } },
      req.body,
      { new: true, runValidators: true }
    );

    if (!updated) {
      return res.status(404).json({
        status: "error",
        message: `No se encontró ningún producto activo con el ID ${id} para actualizar`,
      });
    }

    res.status(200).json({
      status: "success",
      payload: updated,
    });
  } catch (error) {
    next(error);
  }
};

//===============================
// 5. Eliminar un producto (DELETE, /api/products/:id)
//===============================
export const deleteProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    const deleted = await Product.findByIdAndDelete(id);

    if (!deleted) {
      return res.status(404).json({
        status: "error",
        message: `No se encontró ningún producto con el ID: ${id} para eliminar`,
      });
    }

    res.status(200).json({
      status: "success",
      message: `El producto "${deleted.title || deleted.name || id}" fue eliminado correctamente`,
      payload: deleted,
    });
  } catch (error) {
    next(error);
  }
};