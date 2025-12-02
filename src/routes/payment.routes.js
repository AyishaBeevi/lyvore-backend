import express from "express";
import Razorpay from "razorpay";
import crypto from "crypto";
import { asyncHandler } from "../utils/asyncHandler.js";
import { auth } from "../utils/auth.js";
import Order from "../models/Order.js";
import Product from "../models/Product.js";
const router = express.Router();

//  Razorpay Instance
const getRzp = () =>
  new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });


router.post(
  "/create-order",
  auth,
  asyncHandler(async (req, res) => {
    const { amount, currency = "INR" } = req.body;

    if (!amount)
      return res.status(400).json({ success: false, message: "Amount is required." });

    const rzp = getRzp();

    const options = {
      amount: Math.round(amount * 100), 
      currency,
      receipt: `rcpt_${Date.now()}`,
    };

    const order = await rzp.orders.create(options);

    res.json({
      success: true,
      key: process.env.RAZORPAY_KEY_ID,
      order,
    });
  })
);


router.post(
  "/verify",
  auth,
  asyncHandler(async (req, res) => {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      items,
      shippingAddress,
    } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({
        success: false,
        message: "Missing Razorpay payment details.",
      });
    }

    // Verify signature
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({
        success: false,
        message: "Invalid payment signature.",
      });
    }

    // Calculate total
    const totalAmount = items.reduce(
      (sum, i) => sum + Number(i.price) * Number(i.quantity),
      0
    );
console.log("Incoming Items:", items);

   
    

    for (const item of items) {
  console.log("Processing item:", item);

  if (!item.productId) {
    console.error("❌ Missing productId in item:", item);
    throw new Error("Missing productId in cart item.");
  }

  const product = await Product.findById(item.productId);
  if (!product) {
    console.error("❌ Product not found:", item.productId);
    throw new Error("Product not found.");
  }

      // Prevent negative stock
      if (product.stock < item.quantity) {
        throw new Error(`Insufficient stock for ${product.name}`);
      }

      product.stock -= item.quantity;
      product.sales += item.quantity;

      await product.save();
    }

    // Create Order
    const order = await Order.create({
      userId: req.user.id,
      items: items.map((i) => ({
        productId: i.productId,
        name: i.productName,
        quantity: i.quantity,
        price: i.price,
        discountedPrice: i.discountedPrice || i.price,
      })),
      totalAmount,
      status: "paid",
      shippingAddress: {
        address: shippingAddress.address,
        city: shippingAddress.city,
        state: shippingAddress.state,
        zip: shippingAddress.pincode,
        country: shippingAddress.country,
      },
      phone: shippingAddress.phone,

      // Save correctly
      paymentId: razorpay_payment_id,
      razorpayOrderId: razorpay_order_id,
      razorpaySignature: razorpay_signature,
    });

    res.status(201).json({
      success: true,
      message: "Payment verified, stock updated, order saved.",
      order,
    });
  })
);
export default router;

