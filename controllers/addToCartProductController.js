import { Cart } from "../models/addToCartProductModel.js";
import { Product } from "../models/productModel.js";

// Helper: Calculate total price
const calculateTotalPrice = async (items) => {
  let total = 0;
  for (let item of items) {
    const product = await Product.findById(item.product);
    if (product) total += product.price * item.quantity;
  }
  return total;
};

// Helper: Calculate total items in cart
const calculateTotalItems = (items) => items.reduce((acc, i) => acc + i.quantity, 0);

// --------------------------- ADD TO CART ---------------------------
export const addToCart = async (req, res) => {
  try {
    const userId = req.user.id;
    const { productId, quantity } = req.body;
    const qty = quantity || 1; // default 1 if not provided

    if (qty <= 0)
      return res.status(400).json({ success: false, message: "Quantity must be at least 1" });

    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ success: false, message: "Product not found" });

    if (qty > product.stock)
      return res.status(400).json({ success: false, message: `Only ${product.stock} items available` });

    let cart = await Cart.findOne({ user: userId });

    if (!cart) {
      cart = new Cart({
        user: userId,
        items: [{ product: productId, quantity: qty }],
        totalPrice: product.price * qty,
      });
    } else {
      const itemIndex = cart.items.findIndex(i => i.product.toString() === productId);

      if (itemIndex > -1) {
        const newQuantity = cart.items[itemIndex].quantity + qty;
        if (newQuantity > product.stock)
          return res.status(400).json({ success: false, message: `Cannot add ${qty}. Only ${product.stock} in stock.` });

        cart.items[itemIndex].quantity = newQuantity;
      } else {
        cart.items.push({ product: productId, quantity: qty });
      }

      cart.totalPrice = await calculateTotalPrice(cart.items);
    }

    await cart.save();

    res.status(200).json({
      success: true,
      message: "Product added to cart",
      cart,
      totalItems: calculateTotalItems(cart.items),
    });
  } catch (error) {
    console.error("Add to cart error:", error);
    res.status(500).json({ success: false, message: "Server error. Please try again." });
  }
};

// --------------------------- GET CART ---------------------------
export const getCart = async (req, res) => {
  try {
    const userId = req.user.id;
    const cart = await Cart.findOne({ user: userId }).populate("items.product");

    if (!cart || cart.items.length === 0)
      return res.status(404).json({ success: false, message: "Cart is empty" });

    res.status(200).json({
      success: true,
      cart,
      totalItems: calculateTotalItems(cart.items),
    });
  } catch (error) {
    console.error("Get cart error:", error);
    res.status(500).json({ success: false, message: "Server error. Please try again." });
  }
};

// --------------------------- UPDATE QUANTITY ---------------------------
export const updateQuantity = async (req, res) => {
  try {
    const userId = req.user.id;
    const { productId, quantity } = req.body;

    if (quantity <= 0)
      return res.status(400).json({ success: false, message: "Quantity must be at least 1" });

    const cart = await Cart.findOne({ user: userId });
    if (!cart) return res.status(404).json({ success: false, message: "Cart not found" });

    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ success: false, message: "Product not found" });

    if (quantity > product.stock)
      return res.status(400).json({ success: false, message: `Only ${product.stock} items available` });

    const item = cart.items.find(i => i.product.toString() === productId);
    if (!item) return res.status(404).json({ success: false, message: "Product not in cart" });

    item.quantity = quantity;
    cart.totalPrice = await calculateTotalPrice(cart.items);

    await cart.save();

    res.status(200).json({
      success: true,
      message: "Quantity updated",
      cart,
      totalItems: calculateTotalItems(cart.items),
    });
  } catch (error) {
    console.error("Update quantity error:", error);
    res.status(500).json({ success: false, message: "Server error. Please try again." });
  }
};

// --------------------------- REMOVE FROM CART ---------------------------
export const removeFromCart = async (req, res) => {
  try {
    const userId = req.user.id;
    const { productId } = req.body;

    const cart = await Cart.findOne({ user: userId });
    if (!cart) return res.status(404).json({ success: false, message: "Cart not found" });

    const itemExists = cart.items.some(i => i.product.toString() === productId);
    if (!itemExists) return res.status(404).json({ success: false, message: "Product not in cart" });

    cart.items = cart.items.filter(i => i.product.toString() !== productId);
    cart.totalPrice = await calculateTotalPrice(cart.items);

    await cart.save();

    res.status(200).json({
      success: true,
      message: "Product removed",
      cart,
      totalItems: calculateTotalItems(cart.items),
    });
  } catch (error) {
    console.error("Remove from cart error:", error);
    res.status(500).json({ success: false, message: "Server error. Please try again." });
  }
};
