import express from "express";
import {
  registerUser,
  loginUser,
  forgotPassword,
  resetPassword,
  getAllUsers,
  getUserById,
  getUserProfile,
  updateUserProfile,
  deleteUserProfile,
  uploadProfileImage,
  getProfileImage,
  deleteProfileImage
} from "../Controller/User.js";

import { Auth, authorizeRoles } from "../Middleware/Auth.js";
import { upload } from  "../Utils/upload.js";


const router = express.Router();

// ---------- Public Routes ----------
router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPassword);

// ---------- Admin Routes ----------
// GET /admin/users?search=abc&role=user&page=1&limit=10
router.get("/all", Auth, authorizeRoles("admin", "super admin"), getAllUsers);
router.get("/byId/:id", Auth, authorizeRoles("admin", "super admin"), getUserById);



// ---------- Normal User Routes ----------
router.get("/me", Auth, getUserProfile);            // view own profile
router.put("/update/:id", Auth, updateUserProfile); // update any user by id (if allowed)
router.delete("/delete/:id", Auth, deleteUserProfile); // delete any user by id (if allowed)

// Upload profile image
router.post("/upload-profile", Auth, upload.single("profileImage"), uploadProfileImage);

// Get profile image by userId
router.get("/profile-image/:id", getProfileImage);

// Delete profile image
router.delete("/delete-profile-image", Auth, deleteProfileImage);

export default router;
