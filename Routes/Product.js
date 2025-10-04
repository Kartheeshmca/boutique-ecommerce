import express from "express";
import {
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  decreaseStock,
  increaseStock,
  uploadProductImage, // upload handler
  upload,             // multer middleware

} from "../Controller/Product.js";
import { Auth, authorizeRoles } from "../Middleware/Auth.js";

const router = express.Router();

// Create product (Admin & SuperAdmin)
router.post("/create", Auth, authorizeRoles("admin", "super admin"), createProduct);

// Get all products (All roles)
router.get("/all", Auth, authorizeRoles("user", "admin", "super admin"), getAllProducts);

// Get product by ID (All roles)
router.get("/byId/:id", Auth, authorizeRoles("user", "admin", "super admin"), getProductById);

// Update product (Admin & SuperAdmin)
router.put("/update/:id", Auth, authorizeRoles("admin", "super admin"), updateProduct);

// Delete product (SuperAdmin only)
router.delete("/delete/:id", Auth, authorizeRoles("super admin"), deleteProduct);

// Decrease stock (Admin & SuperAdmin)
router.post("/stock/decrease", Auth, authorizeRoles("admin", "super admin"), decreaseStock);

// Increase stock (Admin & SuperAdmin)
router.post("/stock/increase", Auth, authorizeRoles("admin", "super admin"), increaseStock);

// Upload product image
// Upload product image (Admin & SuperAdmin)
router.post(
  "/upload",
  Auth,
  authorizeRoles("admin", "super admin"),
  upload.single("file"),
  uploadProductImage
);
export default router;
