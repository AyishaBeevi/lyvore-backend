
// controllers/analyticsController.js
import Order from "../models/Order.js";
import Product from "../models/Product.js";
import asyncHandler from "../utils/asyncHandler.js";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc.js";
import timezone from "dayjs/plugin/timezone.js";

dayjs.extend(utc);
dayjs.extend(timezone);

// Set your local timezone
const LOCAL_TZ = "Asia/Kolkata";


// ------------------------------------
// ✅ Daily Sales Analytics
// ------------------------------------
export const getDailySales = asyncHandler(async (req, res) => {
  const startOfDay = dayjs().tz(LOCAL_TZ).startOf("day").toDate();
  const endOfDay = dayjs().tz(LOCAL_TZ).endOf("day").toDate();

  const dailySales = await Order.aggregate([
    {
      $match: {
        createdAt: { $gte: startOfDay, $lte: endOfDay },
        status: "paid",
      },
    },
    {
      $group: {
        _id: null,
        totalSales: { $sum: "$totalAmount" },
        orders: { $sum: 1 },
      },
    },
  ]);

  res.json({
    success: true,
    date: startOfDay,
    totalSales: dailySales[0]?.totalSales || 0,
    totalOrders: dailySales[0]?.orders || 0,
  });
});


// ------------------------------------
// ✅ Weekly Sales Analytics
// ------------------------------------
export const getWeeklySales = asyncHandler(async (req, res) => {
  const startOfWeek = dayjs().tz(LOCAL_TZ).startOf("week").toDate();
  const endOfWeek = dayjs().tz(LOCAL_TZ).endOf("week").toDate();

  const weeklySales = await Order.aggregate([
    {
      $match: {
        createdAt: { $gte: startOfWeek, $lte: endOfWeek },
        status: "paid",
      },
    },
    {
      $group: {
        _id: { $dayOfWeek: "$createdAt" },
        totalSales: { $sum: "$totalAmount" },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  res.json({ success: true, weeklySales });
});


// ------------------------------------
// ✅ Monthly Sales Analytics
// ------------------------------------
export const getMonthlySales = asyncHandler(async (req, res) => {
  const startOfMonth = dayjs().tz(LOCAL_TZ).startOf("month").toDate();
  const endOfMonth = dayjs().tz(LOCAL_TZ).endOf("month").toDate();

  const monthlySales = await Order.aggregate([
    {
      $match: {
        createdAt: { $gte: startOfMonth, $lte: endOfMonth },
        status: "paid",
      },
    },
    {
      $group: {
        _id: { $dayOfMonth: "$createdAt" },
        totalSales: { $sum: "$totalAmount" },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  res.json({ success: true, monthlySales });
});


// ------------------------------------
// ✅ Top Selling Products
// ------------------------------------
export const getTopProducts = asyncHandler(async (req, res) => {
  const topProducts = await Order.aggregate([
    { $unwind: "$items" },

    {
      $group: {
        _id: "$items.productId",
        totalSold: { $sum: "$items.quantity" },
      },
    },

    {
      $lookup: {
        from: "products",
        localField: "_id",
        foreignField: "_id",
        as: "productData",
      },
    },

    { $unwind: "$productData" },

    {
      $project: {
        _id: 0,
        productId: "$_id",
        name: "$productData.name",
        totalSold: 1,
      },
    },

    { $sort: { totalSold: -1 } },
    { $limit: 3 },
  ]);

  res.json({ success: true, topProducts });
});


// ------------------------------------
// ✅ Low Stock Alerts
// ------------------------------------
export const getLowStockProducts = asyncHandler(async (req, res) => {
  const lowStock = await Product.find({ stock: { $lt: 10 } })
    .select("name stock");

  res.json({
    success: true,
    count: lowStock.length,
    lowStock,
  });
});
