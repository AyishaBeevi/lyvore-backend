import express from 'express'
import asyncHandler from '../utils/asyncHandler.js'
import User from '../models/User.js'
import { auth } from "../utils/auth.js";

const router = express.Router()

// GET all users
router.get('/', asyncHandler(async (req, res) => {
  const users = await User.find({ role: 'user' })
  res.json({ users })
}))

// GET single user
router.get('/:id', asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id)
  if (!user) return res.status(404).json({ message: 'User not found' })
  res.json(user)
}))

// DELETE user
router.delete('/:id', asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id)
  if (!user) return res.status(404).json({ message: 'User not found' })
  await user.remove()
  res.json({ message: 'User deleted' })
}))

router.get("/:id", asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id).select("-password");
  if (!user) return res.status(404).json({ success: false, message: "User not found" });
  res.json(user);
}));

//  Update shipping address
router.put("/:id/shipping", auth, asyncHandler(async (req, res) => {
  const { address, city, state, zip, country } = req.body;
  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).json({ success: false, message: "User not found" });

  user.shippingAddress = { address, city, state, zip, country };
  await user.save();

  res.json({ success: true, message: "Shipping address updated", shippingAddress: user.shippingAddress });
}));

export default router
