import express from 'express';
import { asyncHandler } from '../utils/asyncHandler.js';
import { getProductStats } from '../controllers/productController.js';
import Product from '../models/Product.js';
import { auth, requireAdmin } from '../utils/auth.js';
import multer from 'multer';
import fs from 'fs';
import path from 'path';
import slugify from 'slugify';

const router = express.Router();

// Ensure uploads folder exists
const uploadDir = './src/uploads';
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);

// Configure multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const safeName = file.originalname
      .replace(/\s+/g, '-') // replace spaces with dashes
      .replace(/[()]/g, '') // remove parentheses
      .replace(/[^a-zA-Z0-9.-]/g, ''); // remove unsafe chars

    cb(null, `${Date.now()}-${safeName}`);
  },
});

const upload = multer({ storage });

// ----------------- Public Routes -----------------

// Get all products
router.get(
  '/',
  asyncHandler(async (req, res) => {
    const products = await Product.find().sort('-createdAt');
    res.json({ products });
  })
);

// Get single product by slug
router.get(
  '/:slug',
  asyncHandler(async (req, res) => {
    const product = await Product.findOne({ slug: req.params.slug });
    if (!product) return res.status(404).json({ message: 'Not found' });

    // Increment views each time it's fetched (optional)
    product.views = (product.views || 0) + 1;
    await product.save();

    res.json({ product });
  })
);

// Get product by ID (for admin edit page)
router.get(
  '/id/:id',
  asyncHandler(async (req, res) => {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json({ product });
  })
);

// Get product by slug (duplicate-safe route)
router.get(
  '/slug/:slug',
  asyncHandler(async (req, res) => {
    const product = await Product.findOne({ slug: req.params.slug });
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json({ product });
  })
);

// 📊 Get product stats (sales, views)
router.get('/stats/:id', auth, requireAdmin, getProductStats);

// ----------------- Admin Routes -----------------

// Add New Product
router.post(
  '/',
  auth,
  requireAdmin,
  upload.array('images', 5),
  asyncHandler(async (req, res) => {
    const { name, price, stock, description, category, tags, discount } = req.body;

    if (!name || !price)
      return res.status(400).json({ message: 'Name and price are required' });

    const slug = slugify(name, { lower: true, strict: true });
    const images = req.files ? req.files.map(f => `/uploads/${f.filename}`) : [];

    const product = await Product.create({
      name,
      slug,
      price,
      stock: stock || 0,
      description,
      category,
      tags: tags ? tags.split(',') : [],
      images,
      views: 0, // initialize views
    });

    res.status(201).json({ product });
  })
);

// get
router.get('/stats/all', asyncHandler(async (req, res) => {
  const products = await Product.find();
  const totalSales = products.reduce((acc, p) => acc + (p.sales || 0), 0);
  const totalViews = products.reduce((acc, p) => acc + (p.views || 0), 0);
  res.json({ totalSales, totalViews });
}));


// Edit Product
router.put(
  "/:id",
  auth,
  requireAdmin,
  upload.array("images", 5),
  asyncHandler(async (req, res) => {
    const { id } = req.params;

    let updateData = {
      name: req.body.name,
      price: req.body.price,
      stock: req.body.stock,
      description: req.body.description,
      category: req.body.category,
      tags: req.body.tags ? req.body.tags.split(",") : [],
      discount: req.body.discount,
      discountedPrice: req.body.calculatedPrice,
    };

    // New images uploaded → replace old ones
    if (req.files && req.files.length > 0) {
      updateData.images = req.files.map((f) => `/uploads/${f.filename}`);
    }

    // No new images → keep old images as is
    else if (req.body.keepOldImages === "true") {
      delete updateData.images;
    }

    const updated = await Product.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!updated)
      return res.status(404).json({ message: "Product not found" });

    res.json({ success: true, product: updated });
  })
);



// Delete Product
router.delete(
  '/:id',
  auth,
  requireAdmin,
  asyncHandler(async (req, res) => {
    await Product.findByIdAndDelete(req.params.id);
    res.json({ ok: true });
  })
);

export default router;
