import express from "express";
import {
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  decreaseStock,
  increaseStock,
  uploadProductImage,
  upload,
} from "../Controller/Product.js";
import { Auth, authorizeRoles } from "../Middleware/Auth.js";

const router = express.Router();

// ✅ Public Routes (no login required)
router.get("/all", getAllProducts);
router.get("/byId/:id", getProductById);

// 🔒 Protected Routes (Admin / SuperAdmin only)
router.post("/create", Auth, authorizeRoles("admin", "super admin"), createProduct);
router.put("/update/:id", Auth, authorizeRoles("admin", "super admin"), updateProduct);
router.delete("/delete/:id", Auth, authorizeRoles("admin","super admin"), deleteProduct);

// 🔒 Stock Management (Admin & SuperAdmin)
router.post("/stock/decrease", Auth, authorizeRoles("admin", "super admin"), decreaseStock);
router.post("/stock/increase", Auth, authorizeRoles("admin", "super admin"), increaseStock);

// 🔒 Upload product image (Admin & SuperAdmin)
router.post(
  "/upload",
  Auth,
  authorizeRoles("admin", "super admin"),
  upload.single("file"),
  uploadProductImage
);

export default router;
