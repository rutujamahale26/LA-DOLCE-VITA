import jwt from "jsonwebtoken";
import { Admin } from "../models/adminModel.js";
import { tokenBlacklist } from "../middleware/web_authMiddleware.js";
import bcrypt from "bcryptjs";

// create default admin
// export const createDefaultAdmin = async (req, res) => {
//   try {
//     const existing = await Admin.findOne({ email: "admin@example.com" });

//     if (existing) {
//       return res.status(400).json({ message: "⚠️ Admin already exists" });
//     }

//     const hashedPassword = await bcrypt.hash("admin@123", 10);
//     const admin = await Admin.create({
//       name: "Super Admin",
//       email: "admin@example.com",
//       password: hashedPassword,
//     });

//     res.status(201).json({
//       message: "✅ Default admin created",
//       admin: {
//         id: admin._id,
//         name: admin.name,
//         email: admin.email,
//       },
//     });
//   } catch (err) {
//     res.status(500).json({ message: "Server error", error: err.message });
//   }
// };

// login api
export const loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;

    const admin = await Admin.findOne({ email });
    if (!admin) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Compare password directly in controller
    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Generate token directly here
    const token = jwt.sign(
      { id: admin._id, email: admin.email, role: "admin" },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.status(200).json({
      message: "Login successful",
      token,
      admin: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
      },
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// admin get profile
export const getAdminProfile = async (req, res) => {
  try {
    const admin = await Admin.findById(req.user.id).select("-password");

    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }

    res.status(200).json(admin);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// admin logout
export const logoutAdmin = async (req, res) => {
  try {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    if (token) {
      tokenBlacklist.add(token);
    }

    res.status(200).json({ message: "Logout successful" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};
