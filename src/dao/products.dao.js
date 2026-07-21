import ProductModel from "../models/Product.models.js";

export const getProducts = async ({ limit = 10, page = 1, query = '', sort = '' } = {}) => {
  let filter = {};

  if (query) {
    if (query === 'true' || query === 'false') {
      filter.status = query === 'true';
    } else {
      filter.$or = [
        { category: new RegExp(query, 'i') },
        { title: new RegExp(query, 'i') }
      ];
    }
  }

  let sortOption = {};
  if (sort === 'asc') sortOption.price = 1;
  if (sort === 'desc') sortOption.price = -1;

  const totalProducts = await ProductModel.countDocuments(filter);
  const totalPages = totalProducts === 0 ? 0 : Math.ceil(totalProducts / limit);
  const skip = (page - 1) * limit;

  const payload = await ProductModel.find(filter)
    .sort(sortOption)
    .skip(skip)
    .limit(limit);

  return {
    payload,
    totalProducts,
    totalPages,
    page,
    hasPrevPage: page > 1,
    hasNextPage: totalPages > 0 && page < totalPages,
    prevPage: page > 1 ? page - 1 : null,
    nextPage: totalPages > 0 && page < totalPages ? page + 1 : null
  };
};

export const getProductById = async (pid) => {
  return await ProductModel.findById(pid);
};

export const createProduct = async (data) => {
  return await ProductModel.create(data);
};

export const updateProduct = async (pid, data) => {
  return await ProductModel.findByIdAndUpdate(pid, data, { new: true, runValidators: true });
};

export const deleteProduct = async (pid) => {
  return await ProductModel.findByIdAndDelete(pid);
};