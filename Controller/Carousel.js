import Carousel from "../Models/Carousel.js";
import multer from "multer";
import path from "path";
import fs from "fs";

// Reuse multer setup from Product controller
export const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = "uploads/carousel";
    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
    cb(null, uniqueName);
  },
});

export const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|webp/;
  const extName = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimeType = allowedTypes.test(file.mimetype);
  if (extName && mimeType) cb(null, true);
  else cb(new Error("Only images are allowed (jpeg, jpg, png, webp)"));
};

export const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB limit
});

// Upload carousel image
export const uploadCarouselImage = async (req, res) => {
  try {
    if (!req.file)
      return res.status(400).json({ success: false, message: "No file uploaded" });

    const imageUrl = `${req.protocol}://${req.get("host")}/uploads/carousel/${req.file.filename}`;

    res.status(200).json({
      success: true,
      message: "Image uploaded successfully",
      data: { imageUrl },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get carousel images
export const getCarousel = async (req, res) => {
  try {
    let carousel = await Carousel.findOne();
    if (!carousel) {
      // Create default if not exists
      carousel = await Carousel.create({ images: [] });
    }
    res.json({ success: true, data: carousel });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update carousel images
export const updateCarousel = async (req, res) => {
  try {
    const { images } = req.body;

    if (!Array.isArray(images)) {
      return res.status(400).json({ success: false, message: "Images must be an array" });
    }

    let carousel = await Carousel.findOne();
    if (!carousel) {
      carousel = new Carousel();
    }

    carousel.images = images;
    await carousel.save();

    res.json({ success: true, message: "Carousel updated successfully", data: carousel });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
