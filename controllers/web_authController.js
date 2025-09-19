import bcrypt from "bcryptjs";
import { User } from "../models/userModel.js";

// REGISTER USER
export const registerUser = async (req, res) => {
  try {
    // console.log("Incoming Body:", req.body);  // Debug log 
    const { name, email, phoneno, password, address } = req.body;

    // 1. Check required fields
    if (!name || !email || !phoneno || !password || !address) {
      return res.status(400).json({ message: "All required fields must be filled" });
    }

    // 2. Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists with this email" });
    }

    // 3. Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // 4. Create new user
    const newUser = new User({
      name,
      email: email.toLowerCase(),
      phoneno,
      password: hashedPassword,
      address: {
        street: address.street || "",
        city: address.city || "",
        state: address.state || "",
        zipcode: address.zipcode || "",
        country: address.country || "",
      },
    });

    // 5. Save user in DB
    await newUser.save();

    // 6. Response (don’t send password back)
    return res.status(201).json({
      message: "User registered successfully",
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        phoneno: newUser.phoneno,
        address: newUser.address,
      },
    });

  } catch (error) {
    console.error("Register Error:", error);
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};
