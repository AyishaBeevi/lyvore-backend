import express from "express";
import {
  getDailySales,
  getWeeklySales,
  getMonthlySales,
  getTopProducts,
  getLowStockProducts,
} from "../controllers/analyticsController.js";

const router = express.Router();

router.get("/analytics/daily", getDailySales);
router.get("/analytics/weekly", getWeeklySales);
router.get("/analytics/monthly", getMonthlySales);
router.get("/analytics/top", getTopProducts);
router.get("/analytics/stock", getLowStockProducts);

export default router;
