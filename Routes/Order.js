import express from "express";
import {
  createOrder,
  getOrderById,
  updateOrder,
  deleteOrder,
  getAllOrders,
  confirmOrderPayment,
  refundOrderPayment
} from "../Controller/Order.js";
import { Auth, authorizeRoles } from "../Middleware/Auth.js";

const router = express.Router();

// ✅ Create a new order (authenticated users)
router.post("/create", Auth, createOrder);

// ✅ Get a specific order by ID (authenticated users)
router.get("/:id", Auth, getOrderById);

// ✅ Update an order by ID (admin only)
router.put("/:id", Auth, updateOrder);

// ✅ Delete an order by ID 
router.delete("/:id", Auth,  deleteOrder);

// ✅ Get all orders with filters, pagination, search (admin can see all, users see their own)
router.get("/all", Auth, getAllOrders);

// ✅ Confirm order payment (optional route if you want manual confirmation)
router.post("/confirm/:id", Auth, async (req, res) => {
  const result = await confirmOrderPayment(req.params.id);
  if (result.success) return res.json(result);
  res.status(500).json(result);
});

// ✅ Refund order payment (manual refund by admin)
router.post("/refund/:id", Auth,  async (req, res) => {
  const { amount } = req.body;
  const result = await refundOrderPayment(req.params.id, amount);
  if (result.success) return res.json(result);
  res.status(500).json(result);
});

export default router;
