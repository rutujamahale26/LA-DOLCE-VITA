import { Product } from "../models/productModel.js";
import cloudinary from "../config/cloudinary.js";

// 🔹 Helper to upload buffer to Cloudinary
const uploadToCloudinary = (fileBuffer, folder) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder },
      (err, result) => {
        if (err) reject(err);
        else resolve(result.secure_url); // ✅ Save only URL in DB
      }
    );
    stream.end(fileBuffer);
  });
};

// ✅ Create Product
export const createProduct = async (req, res) => {
  try {
    const {
      productName,
      productCode,
      price,
      tiktok_session_id,
      gender,
      color,
      size,
      stock,
      category,
    } = req.body;

    if (!productName || !productCode || !price || !gender || !size) {
      return res.status(400).json({ message: "Required fields missing!" });
    }

    // ✅ Image validation
    if (!req.files || req.files.length < 1) {
      return res.status(400).json({ message: "At least 1 image is required" });
    }
    if (req.files.length > 5) {
      return res.status(400).json({ message: "Max 5 images allowed" });
    }

    // ✅ Upload images to Cloudinary
    const images = await Promise.all(
      req.files.map((file) => uploadToCloudinary(file.buffer, "products"))
    );

    const product = await Product.create({
      productName,
      productCode,
      price,
      tiktok_session_id,
      gender,
      color,
      size,
      stock,
      category,
      images, // ✅ Cloudinary URLs stored here
    });

    res.status(201).json({
      success: true,
      message: "Product created successfully",
      product,
    });
  } catch (error) {
    console.error("Error in creating product:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ✅ Get all Products
export const getProducts = async (req, res) => {
  try {
    const products = await Product.find();

    res.status(200).json({
      success: true,
      message: "Products fetched successfully",
      count: products.length,
      data: products,
    });
  } catch (error) {
    console.error("Error fetching products:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ✅ Get single Product by ID
export const getProductById = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Product fetched successfully",
      data: product,
    });
  } catch (error) {
    console.error("Error fetching product:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ✅ Get Product by Code for frontend
export const getProductByCode = async (req, res) => {
  try {
    const { code } = req.params;

    const product = await Product.findOne({
      productCode: { $regex: new RegExp(`^${code}$`, "i") },
    });

    if (!product) {
      return res.status(404).json({ message: "❌ Product not found" });
    }

    res.status(200).json({
      success: true,
      data: product,
    });
  } catch (error) {
    console.error("Error fetching product by code:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ✅ Update Product
export const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    // ✅ Merge updates
    Object.assign(product, updates);

    // ✅ Replace images if new ones uploaded
    if (req.files && req.files.length > 0) {
      if (req.files.length > 5) {
        return res.status(400).json({ message: "Max 5 images allowed" });
      }

      product.images = await Promise.all(
        req.files.map((file) => uploadToCloudinary(file.buffer, "products"))
      );
    }

    const updatedProduct = await product.save();

    res.status(200).json({
      success: true,
      message: "Product updated successfully",
      data: updatedProduct,
    });
  } catch (error) {
    console.error("Error updating product:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ✅ Delete Product
export const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedProduct = await Product.findByIdAndDelete(id);

    if (!deletedProduct) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Product deleted successfully",
      deletedProduct,
    });
  } catch (error) {
    console.error("Error deleting product:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};
