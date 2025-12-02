
// backend/routes/paymentRoutes.js
import express from "express";
import crypto from "crypto";
import Razorpay from "razorpay";
import { auth } from "../utils/auth.js";
import asyncHandler from "../utils/asyncHandler.js";
import Order from "../models/Order.js";
import Product from "../models/Product.js";
import Cart from "../models/Cart.js";
import Payment from "../models/Payment.js";

const router = express.Router();

// ✅ Create Razorpay order
router.post(
  "/create-order",
  auth,
  asyncHandler(async (req, res) => {
    const { amount, currency } = req.body;

    const rzp = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });

    const options = {
      amount: Math.round(amount * 100),
      currency: currency || "INR",
      receipt: "receipt_" + Date.now(),
    };

    const order = await rzp.orders.create(options);
    res.json({ key: process.env.RAZORPAY_KEY_ID, order });
  })
);

// ✅ Verify Razorpay signature + Deduct stock + Create order
router.post(
  "/verify",
  auth,
  asyncHandler(async (req, res) => {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, items, shippingAddress } = req.body;

    // 🔐 Verify Razorpay signature
    const sign = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(razorpay_order_id + "|" + razorpay_payment_id)
      .digest("hex");

    if (sign !== razorpay_signature) {
      return res.status(400).json({ success: false, message: "Payment verification failed" });
    }

    // ✅ Start transaction
    const session = await Product.startSession();
    session.startTransaction();

    try {
      // Validate and update stock for each product
      for (const item of items) {
        const product = await Product.findById(item.productId).session(session);
        if (!product) throw new Error(`Product ${item.productId} not found`);
        if (product.stock < item.quantity)
          throw new Error(`Insufficient stock for ${product.name}`);

        product.stock -= item.quantity;
        await product.save({ session });
      }

      // ✅ Create order
      const order = await Order.create(
        [
          {
            userId: req.user.id,
            items: items.map((i) => ({
              productId: i.productId,
              quantity: i.quantity,
              price: i.price,
              discountedPrice: i.discountedPrice || i.price,

            })),
            totalAmount: items.reduce((sum, i) => sum + i.price * i.quantity, 0),
            // total: items.reduce((sum, i) => sum + i.price * i.quantity, 0),
            status: "paid",
            paymentId: razorpay_payment_id,
            razorpayOrderId: razorpay_order_id,
            razorpaySignature: razorpay_signature,
            shippingAddress,
          },
        ],
        { session }
      );

      // ✅ Clear user’s cart
      await Cart.findOneAndUpdate({ userId: req.user.id }, { items: [] }).session(session);

      // Commit transaction
      await session.commitTransaction();
      session.endSession();

      res.json({ success: true, message: "Order placed successfully", order: order[0] });
    } catch (err) {
      await session.abortTransaction();
      session.endSession();
      console.error("Checkout transaction error:", err);
      res.status(500).json({ success: false, message: err.message });
    }
  })
);

export default router;
