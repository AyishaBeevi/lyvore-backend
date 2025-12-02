
import express from 'express';
import { asyncHandler } from '../utils/asyncHandler.js';
import { auth } from '../utils/auth.js';
import Cart from '../models/Cart.js';
import Product from '../models/Product.js';

const router = express.Router();

// -------------------- Get Cart --------------------
router.get('/', auth, asyncHandler(async (req, res) => {
  let cart = await Cart.findOne({ userId: req.user.id }).populate('items.productId');
  if (!cart) cart = await Cart.create({ userId: req.user.id, items: [] });
  res.json({ items: cart.items });
}));

// -------------------- Add to Cart --------------------
router.post('/add', auth, asyncHandler(async (req, res) => {
  const { productId, quantity = 1 } = req.body;

  const product = await Product.findById(productId);
  if (!product) return res.status(404).json({ message: 'Product not found' });

  let cart = await Cart.findOne({ userId: req.user.id });
  if (!cart) cart = await Cart.create({ userId: req.user.id, items: [] });

  // Check existing item in cart
  const idx = cart.items.findIndex(i => i.productId.toString() === productId);
  const existingQty = idx > -1 ? cart.items[idx].quantity : 0;
  const totalQty = existingQty + quantity;

  if (totalQty > product.stock) {
    return res.status(400).json({
      message: `Cannot add ${quantity} units. Only ${product.stock - existingQty} more units available`,
    });
  }

  if (idx > -1) {
    cart.items[idx].quantity = totalQty;
  } else {
    cart.items.push({ productId, quantity });
  }

  await cart.save();
  await cart.populate('items.productId');
  res.json({ success: true, items: cart.items });
}));

// -------------------- Remove from Cart --------------------
router.post('/remove', auth, asyncHandler(async (req, res) => {
  const { productId } = req.body;
  const cart = await Cart.findOne({ userId: req.user.id });
  if (!cart) return res.json({ items: [] });

  cart.items = cart.items.filter(i => i.productId.toString() !== productId);
  await cart.save();
  await cart.populate('items.productId');
  res.json({ success: true, items: cart.items });
}));

// -------------------- Clear Cart --------------------
router.delete('/clear', auth, asyncHandler(async (req, res) => {
  const cart = await Cart.findOne({ userId: req.user.id });
  if (!cart) return res.status(404).json({ message: 'Cart not found' });

  cart.items = [];
  await cart.save();
  res.json({ success: true, message: 'Cart cleared successfully' });
}));

export default router;
