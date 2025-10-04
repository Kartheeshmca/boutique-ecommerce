import express from "express";
import {
  createOrderItem,
  getAllOrderItems,
  getOrderItemById,
  updateOrderItem,
  deleteOrderItem
} from "../Controller/Orderitem.js";
import { Auth } from "../Middleware/Auth.js";

const router = express.Router();

router.post("/create", Auth,createOrderItem);          // Create
router.get("/all",Auth, getAllOrderItems);       // Get all 
    // Get all
router.get("/byId/:id",Auth, getOrderItemById);       // Get one
router.put("/update/:id", Auth,updateOrderItem);        // Update
router.delete("/delete/:id",Auth, deleteOrderItem);     // Delete

export default router;

