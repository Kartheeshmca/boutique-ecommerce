import express from "express";
import {
  getCarousel,
  updateCarousel,
  uploadCarouselImage,
  upload,
} from "../Controller/Carousel.js";
import { Auth, authorizeRoles } from "../Middleware/Auth.js";


const router = express.Router();
// Get carousel images
router.get("/", Auth, authorizeRoles("admin", "super admin"),getCarousel);

// Update carousel images
router.put("/update",Auth, authorizeRoles("admin", "super admin"), updateCarousel);

// Upload carousel image
router.post("/upload",Auth, authorizeRoles("admin", "super admin"), upload.single("file"), uploadCarouselImage);

export default router;
