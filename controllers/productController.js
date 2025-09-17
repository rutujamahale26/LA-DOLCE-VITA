import { Product } from "../models/productModel.js";


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

    const images = req.files.map((f) => f.path);

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

    res.status(201).json(product);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
