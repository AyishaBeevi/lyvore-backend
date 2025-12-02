import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema({
  orderId: { type: mongoose.Schema.Types.ObjectId, ref: "Order" },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  amount: Number,
  paymentMethod: String,
  paymentDate: { type: Date, default: Date.now },
  status: { type: String, enum: ["Pending", "Success", "Failed"], default: "Pending" }
});

export default mongoose.model("Payment", paymentSchema);
