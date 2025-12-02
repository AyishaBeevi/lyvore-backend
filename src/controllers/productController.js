import Product from '../models/Product.js';
import Cart from '../models/Cart.js';
import Order from '../models/Order.js';
import slugify from 'slugify';

// Async handler helper
const asyncHandler = fn => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

// ---------------- Create Product ----------------
export const createProduct = asyncHandler(async (req, res) => {
  const { name, description, price, discount, stock, category, tags } = req.body;

  if (!name || price === undefined) {
    return res.status(400).json({ message: 'Name and price are required' });
  }

  const slug = slugify(name, { lower: true, strict: true });
  const images = req.files ? req.files.map(file => `/uploads/${file.filename}`) : [];

  const product = await Product.create({
    name,
    slug,
    description,
    price,
    discount: discount || 0,
    stock: stock || 0,
    category: category || 'General',
    tags: tags ? tags.split(',') : [],
    images,
    views: 0,
  });

  res.status(201).json(product);
});

// ---------------- Update Product ----------------
export const updateProduct = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { name, description, price, discount, stock, category, tags, existingImages } = req.body;

  const slug = name ? slugify(name, { lower: true, strict: true }) : undefined;
  const newImages = req.files ? req.files.map(file => `/uploads/${file.filename}`) : [];
  const allImages = [...(existingImages || []), ...newImages];

  const updatedFields = {
    ...(name && { name, slug }),
    ...(description && { description }),
    ...(price !== undefined && { price }),
    ...(discount !== undefined && { discount }),
    ...(stock !== undefined && { stock }),
    ...(category && { category }),
    ...(tags && { tags: tags.split(',') }),
    images: allImages,
  };

  const updated = await Product.findByIdAndUpdate(id, updatedFields, { new: true });

  if (!updated) {
    return res.status(404).json({ message: 'Product not found' });
  }

  res.status(200).json(updated);
});

// ---------------- Delete Product ----------------
export const deleteProduct = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const deleted = await Product.findByIdAndDelete(id);
  if (!deleted) return res.status(404).json({ message: 'Product not found' });

  // Remove deleted product from all carts
  await Cart.updateMany({}, { $pull: { products: { productId: id } } });

  res.status(200).json({ message: 'Product deleted and removed from carts' });
});

// ---------------- Get Product Stats ----------------
export const getProductStats = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const product = await Product.findById(id);
  if (!product) return res.status(404).json({ message: 'Product not found' });

  // Total views
  const views = product.views || 0;

  // Total sales from orders
  const orders = await Order.find({ 'products.productId': id });
  const sales = orders.reduce((total, order) => {
    const item = order.products.find(p => p.productId.toString() === id);
    return total + (item?.quantity || 0);
  }, 0);

  res.status(200).json({ productId: id, sales, views });
});

// ---------------- Get All Product Stats ----------------
export const getAllProductStats = asyncHandler(async (req, res) => {
  const products = await Product.find();
  let totalSales = 0;
  let totalViews = 0;

  for (const p of products) {
    totalViews += p.views || 0;
const orders = await Order.find().sort({ createdAt: -1 });

    // const orders = await Order.find({ 'products.productId': p._id });
    totalSales += orders.reduce((sum, order) => {
      const item = order.products.find(i => i.productId.toString() === p._id.toString());
      return sum + (item?.quantity || 0);
    }, 0);
  }

  res.status(200).json({ totalSales, totalViews });
});
