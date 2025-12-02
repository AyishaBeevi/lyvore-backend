import User from '../models/User.js';
import { asyncHandler } from '../utils/asyncHandler.js';

// GET all users
export const getAllUsers = asyncHandler(async (req, res) => {
  const users = await User.find().select('-password'); // exclude password
  res.json({ users });
});

// GET single user by ID
export const getUserById = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id).select('-password');
  if (!user) return res.status(404).json({ message: 'User not found' });
  res.json(user);
});

// DELETE user
export const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).json({ message: 'User not found' });
  await user.remove();
  res.json({ message: 'User deleted successfully' });
});

const user = await User.findById(req.user._id);

user.phone = req.body.phone;
user.shippingAddress = req.body.shippingAddress;
user.billingAddress = req.body.billingAddress;
await user.save();