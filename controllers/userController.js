import { User } from "../models/userModel.js";


export const createUser = async (req, res) => {
  try {
    const { name, email, phoneno, dob, address, isActive,communicationMethod } = req.body;

    // Check if email already exists
    const existingUser = await User.findOne({ $or:[{email}, {phoneno}] });
    if (existingUser) {
      let conflictField = existingUser.email === email ? "email" : "phoneno";
      return res.status(400).json({
        success: false,
        message: `${conflictField} already exists`,
        field: conflictField
      });
    }

    // Create new user
    const user = new User({
      name,
      email,
      phoneno,
      dob,
      address,
      isActive : isActive !== undefined ? isActive : true,
      communicationMethod: communicationMethod || "email"
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
      error: error.message,
    });
  }
};

