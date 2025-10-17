import Carousel from "../Models/Carousel.js";
import fs from "fs";
import path from "path";

/**
 * ✅ Upload Carousel Images (Admin only)
 * - Upload multiple images to local storage
 * - Store file URLs in DB
 */
export const uploadCarouselImages = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: "No images uploaded" });
    }

    const imageUrls = req.files.map(
      (file) => `${process.env.BASE_URL || "http://localhost:3001"}/${file.path.replace(/\\/g, "/")}`
    );

    // Find existing carousel (we keep only one document)
    let carousel = await Carousel.findOne();

    if (!carousel) {
      // create new carousel
      carousel = new Carousel({ images: imageUrls });
    } else {
      // append new images
      carousel.images.push(...imageUrls);
    }

    await carousel.save();

    return res.status(201).json({
      message: "Images uploaded successfully",
      data: carousel,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

/**
 * ✅ Get All Carousel Images (Public)
 */
export const getCarouselImages = async (req, res) => {
  try {
    const carousel = await Carousel.findOne();
    if (!carousel || carousel.images.length === 0) {
      return res.status(404).json({ message: "No images found" });
    }
    res.status(200).json({ data: carousel.images });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * ✅ Delete a Carousel Image (Admin only)
 * - Removes from DB and deletes from folder
 */
export const deleteCarouselImage = async (req, res) => {
  try {
    const { imageUrl } = req.body;
    if (!imageUrl) {
      return res.status(400).json({ message: "Image URL is required" });
    }

    const carousel = await Carousel.findOne();
    if (!carousel) {
      return res.status(404).json({ message: "Carousel not found" });
    }

    // Remove from DB
    carousel.images = carousel.images.filter((img) => img !== imageUrl);
    await carousel.save();

    // Delete local file if exists
    const filePath = path.join(
      process.cwd(),
      imageUrl.replace(`${process.env.BASE_URL || "http://localhost:3001"}/`, "")
    );

    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

    res.status(200).json({ message: "Image deleted successfully", data: carousel });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
