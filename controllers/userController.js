import { User } from "../models/userModel.js";


// create new customer
export const createUser = async (req, res) => {
  try {
    const { customerName, email, phoneNumber, dob, address, isActive, communicationMethod, password } = req.body;

    // Check if email or phone already exists
    const existingUser = await User.findOne({ $or: [{ email }, { phoneNumber }] });
    if (existingUser) {
      let conflictField = existingUser.email === email ? "email" : "phoneNumber";
      return res.status(400).json({
        success: false,
        message: `${conflictField} already exists`,
        field: conflictField
      });
    }

    // Create new user
    const user = new User({
      customerName,
      email,
      phoneNumber,
      dob,
      password, // ⚠️ you may want to hash this before saving
      address,
      isActive: isActive !== undefined ? isActive : true,
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

// Get all users
export const getUsers = async (req, res) => {
  try {
    const users = await User.find(); // Fetch all users

    res.status(200).json({
      success: true,
      message: "Users fetched successfully",
      count: users.length,
      data: users,
    });
  } catch (error) {
    console.error("Error fetching users:", error.message);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// delete user by id
export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedUser = await User.findByIdAndDelete(id);

    if (!deletedUser) {
      return res.status(404).json({
        success: false,
        message: "Customer not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Customer deleted successfully",
      deletedUser,
    });
  } catch (error) {
    console.error("Error deleting customer:", error.message);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


// ✅ Update user by ID
export const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    if (!updates || Object.keys(updates).length === 0) {
      return res.status(400).json({
        success: false,
        message: "No fields provided to update",
      });
    }

    // 🔎 Fetch existing user
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // ✅ Merge updates into existing nested objects
    if (updates.address) {
      Object.assign(user.address, updates.address);
    }
    if (updates.customerName) user.customerName = updates.customerName;
    if (updates.email) user.email = updates.email;
    if (updates.phoneNumber) user.phoneNumber = updates.phoneNumber;
    if (updates.dob) user.dob = updates.dob;
    if (updates.password) user.password = updates.password; // ⚠️ Hash if needed
    if (updates.isActive !== undefined) user.isActive = updates.isActive;
    if (updates.communicationMethod) user.communicationMethod = updates.communicationMethod;

    // ✅ Save with validation
    const updatedUser = await user.save();

    res.status(200).json({
      success: true,
      message: "User updated successfully",
      data: updatedUser,
    });
  } catch (error) {
    console.error("Error updating user:", error.message);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ✅ Get single user by ID
export const getUserById = async (req, res) => {
  try {
    const { id } = req.params;

    // find user by ID
    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "User fetched successfully",
      data: user,
    });
  } catch (error) {
    console.error("Error fetching user:", error.message);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

