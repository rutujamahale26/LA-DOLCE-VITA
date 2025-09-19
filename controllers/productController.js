import { Product } from "../models/productModel.js";


// create product 
export const createProduct = async (req, res) => {
  try {
    const {
      product_name,
      product_id,
      price,
      tiktok_session_id,
      gender,
      color,
      size,
      stock,
      category,
    } = req.body;

    if (!product_name || !product_id || !price || !gender || !size) {
      return res.status(400).json({ message: "Required fields missing!" });
    }

      // ✅ Image validation (at least 1 required, max 5 handled by multer)
    if (!req.files || req.files.length < 1) {
      return res.status(400).json({ message: "At least 1 image is required" });
    }

    const images = req.files.map((f) => `/uploads/products/${f.filename}`);

    const product = await Product.create({
      product_name,
      product_id,
      price,
      tiktok_session_id,
      gender,
      color,
      size,
      stock,
      category,
      images,
    });

    res.status(201).json({
      success : true,
      message:'Product created successfully',
      product});
  } catch (error) {
    console.log('Error in creating product:', error.message)
    res.status(500).json({ 
      success: false,
      message: error.message });
  }
};

// get product listing / get all products
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
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// delete product by id 
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
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

