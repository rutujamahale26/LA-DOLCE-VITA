import { User } from "../models/userModel.js";


export const createUser = async (req, res) => {
  try {
    const { name, email, phoneno, dob, address, accountDetails } = req.body;

    // Check if email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: "Email already exists" });
    }

    // Create new user
    const user = new User({
      name,
      email,
      phoneno,
      dob,
      address,
      accountDetails,
    });

    const savedUser = await user.save();

    res.status(201).json({
      success: true,
      message: "User created successfully",
      data: savedUser,
    });
  } catch (error) {
    console.error("Error creating user:", error.message);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

