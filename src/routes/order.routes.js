// backend/routes/orderRoutes.js
import express from 'express';
import mongoose from 'mongoose';
import Order from '../models/Order.js';
import { getAllOrders, getOrderById, updateOrderStatus, deleteOrder } from '../controllers/orderController.js';
import { auth } from '../utils/auth.js';
import asyncHandler from '../utils/asyncHandler.js';
import Cart from '../models/Cart.js';
import Product from '../models/Product.js';
import { io } from "../server.js";

const router = express.Router();

// Get all orders
router.get('/', asyncHandler(getAllOrders));

// Get single order
router.get('/:id', asyncHandler(getOrderById));

// Update order status
router.put('/:id/status', asyncHandler(updateOrderStatus));

// Delete order
router.delete('/:id', asyncHandler(deleteOrder));

// Get all orders of a specific user
router.get(
  '/user/:userId',
  auth, // optional authentication middleware
  asyncHandler(async (req, res) => {
    const { userId } = req.params;

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ success: false, message: 'Invalid user ID' });
    }

    // Fetch orders
    const orders = await Order.find({ userId })
      .populate({ path: 'items.productId', select: 'name price' }) // select only needed fields
      .sort({ createdAt: -1 });

    res.json({ success: true, orders });
  })
);

router.post('/checkout', auth, asyncHandler(async (req, res) => {
  const userId = req.user.id;

  const cart = await Cart.findOne({ userId }).populate('items.productId');
  if (!cart || cart.items.length === 0) {
    return res.status(400).json({ message: 'Cart is empty' });
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    let totalAmount = 0;
    const orderItems = [];

    for (const item of cart.items) {
      const product = await Product.findById(item.productId._id).session(session);
      if (!product) throw new Error(`Product ${item.productId.name} not found`);

      if (item.quantity > product.stock) {
        throw new Error(`Only ${product.stock} units of ${product.name} available`);
      }

      const discountedPrice = product.discountedPrice || product.price;
      totalAmount += discountedPrice * item.quantity;

      // Deduct stock
      product.stock -= item.quantity;
      await product.save({ session });

      orderItems.push({
        productId: product._id,
        name: product.name,
        quantity: item.quantity,
        price: product.price,
        discountedPrice,
      });
    }

    const newOrder = await Order.create([{ userId, items: orderItems, totalAmount, status: 'pending' }], { session });

    // Clear cart
    cart.items = [];
    await cart.save({ session });

    await session.commitTransaction();

    // Emit stock updated to all clients
    io.emit('stockUpdated');

    res.json({ success: true, message: 'Order placed successfully', order: newOrder[0] });
  } catch (err) {
    await session.abortTransaction();
    res.status(400).json({ message: err.message });
  } finally {
    session.endSession();
  }
}));

export default router;
