// backend/models/Order.js
import mongoose from 'mongoose';

const addressSchema = new mongoose.Schema({
  address: String,
  city: String,
  state: String,
  zip: String,
  country: String,
}, { _id: false });

const billingSchema = new mongoose.Schema({
  name: String,
  email: String,
  phone: String,
  address: String,
  city: String,
  state: String,
  pincode: String,
  country: String,
}, { _id: false });

const orderSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  items: [
    {
      productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
      name: String,
      quantity: Number,
      price: Number,
      discountedPrice: Number,
    },
  ],
  totalAmount: { type: Number, required: true },
  status: {
    type: String,
    enum: ['pending', 'paid', 'shipped', 'delivered', 'cancelled'],
    default: 'pending'
  },
  billingDetails: billingSchema,
  shippingAddress: addressSchema,
  phone: String,
  paymentId: { type: String },
  razorpayOrderId: { type: String },
  razorpaySignature: { type: String },

}, { timestamps: true });

export default mongoose.model('Order', orderSchema);
