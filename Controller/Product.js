import Category from "../Models/Category.js";
import Product from "../Models/Product.js";
import multer from "multer";
import path from "path";
import fs from "fs";

// ------------------- Multer Setup -------------------

export const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = "uploads/products";
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
  limits: { fileSize: 500 * 1024 * 1024 },
});

// ------------------- Controllers -------------------

// Upload product image
export const uploadProductImage = async (req, res) => {
  try {
    if (!req.file)
      return res.status(400).json({ success: false, message: "No file uploaded" });

    const imageUrl = `${req.protocol}://${req.get("host")}/uploads/products/${req.file.filename}`;

    res.status(200).json({
      success: true,
      message: "Image uploaded successfully",
      data: { imageUrl },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Create Product
export const createProduct = async (req, res) => {
  try {
    const { category, name, description, images, status, variants } = req.body;

    const cat = await Category.findById(category);
    if (!cat) return res.status(404).json({ success: false, message: "Category not found" });

    const existingProduct = await Product.findOne({ name: name.trim() });
    if (existingProduct)
      return res.status(400).json({ success: false, message: "Product name already exists" });

    if (variants && variants.length > 0) {
      for (let v of variants) {
        const existingSku = await Product.findOne({ "variants.sku": v.sku });
        if (existingSku)
          return res.status(400).json({ success: false, message: `SKU ${v.sku} already exists` });
      }
    }

    const product = await Product.create({
      category,
      name,
      description,
      images: images || [],
      status: status || "active",
      variants: variants || [],
    });

    res.status(201).json({ success: true, message: "Product created successfully", data: product });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
export const getAllProducts = async (req, res) => {
  try {
    const {
      search,
      page = 1,
      limit = 10,
      sortBy = "createdAt", // default sort field
      order = "desc" // default order
    } = req.query;

    const skip = (page - 1) * limit;
    let query = {};

    // Users see only active products
    if (req.user.role.toLowerCase() === "user") {
      query.status = "active";
    }

    // Search filter
    if (search) {
      const regex = { $regex: search, $options: "i" };
      query.$and = [
        query,
        {
          $or: [
            { name: regex },
            { description: regex },
            { "variants.sku": regex },
            { "variants.color": regex },
            { "variants.size": regex },
            { "variants.price": isNaN(search) ? -1 : Number(search) }
          ]
        }
      ];
      if (!isNaN(search)) {
        query.$or.push({ "variants.price": Number(search) });
  }
    }

    // Sorting
    const sortOrder = order.toLowerCase() === "asc" ? 1 : -1;
    const sortQuery = {};
    sortQuery[sortBy] = sortOrder;

    const total = await Product.countDocuments(query);

    const products = await Product.find(query)
      .populate("category", "name")
      .sort(sortQuery)
      .skip(skip)
      .limit(Number(limit))
      .lean();

    if (!products.length) {
      return res.status(404).json({ success: false, message: "No products found" });
    }

    res.json({
      success: true,
      total,
      page: Number(page),
      pages: Math.ceil(total / limit),
      data: products
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Get product by ID with role-based access
export const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate("category", "name");

    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    // Users can only see active products
    if (req.user.role.toLowerCase() === "user" && product.status !== "active") {
      return res.status(403).json({ success: false, message: "Product is inactive" });
    }

    res.json({ success: true, data: product });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


// Update product
export const updateProduct = async (req, res) => {
  try {
    const { category, name, description, images, status, variants } = req.body;

    if (category) {
      const cat = await Category.findById(category);
      if (!cat) return res.status(404).json({ success: false, message: "Category not found" });
    }

    if (variants && variants.length > 0) {
      for (let v of variants) {
        const existingProduct = await Product.findOne({
          "variants.sku": v.sku,
          _id: { $ne: req.params.id },
        });
        if (existingProduct)
          return res.status(400).json({ success: false, message: `SKU ${v.sku} already exists` });
      }
    }

    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { category, name, description, images, status, variants },
      { new: true, runValidators: true }
    ).populate("category", "name");

    if (!product) return res.status(404).json({ success: false, message: "Product not found" });

    res.json({ success: true, message: "Product updated successfully", data: product });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Delete product
export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return res.status(404).json({ success: false, message: "Product not found" });
    res.json({ success: true, message: "Product deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Decrease stock
export const decreaseStock = async (req, res) => {
  try {
    const { productId, variantSku, quantity } = req.body;

    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ success: false, message: "Product not found" });

    const variant = product.variants.find((v) => v.sku === variantSku);
    if (!variant) return res.status(404).json({ success: false, message: "Variant not found" });

    if (variant.stock < quantity)
      return res.status(400).json({ success: false, message: `Only ${variant.stock} items left in stock` });

    variant.stock -= quantity;
    await product.save();

    res.json({ success: true, message: `Stock decreased by ${quantity}`, data: product });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Increase stock
export const increaseStock = async (req, res) => {
  try {
    const { productId, variantSku, quantity } = req.body;

    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ success: false, message: "Product not found" });

    const variant = product.variants.find((v) => v.sku === variantSku);
    if (!variant) return res.status(404).json({ success: false, message: "Variant not found" });

    variant.stock += quantity;
    await product.save();

    res.json({ success: true, message: `Stock increased by ${quantity}`, data: product });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
