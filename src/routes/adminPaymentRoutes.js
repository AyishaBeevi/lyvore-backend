import express from 'express';
import asyncHandler from '../utils/asyncHandler.js';
import { auth } from '../utils/auth.js';
import Order from '../models/Order.js';

const router = express.Router();

// Get all payments for admin dashboard
router.get('/payments', auth, asyncHandler(async (req, res) => {
  const payments = await Order.find()
    .populate('userId', 'name email')
    .select('orderId userId status paymentMethod amount');
  res.json({ success: true, payments });
}));

export default router;
