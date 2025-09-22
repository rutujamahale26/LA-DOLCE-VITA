import bcrypt from "bcryptjs";
import { User } from "../models/userModel.js";
import { OTP } from "../models/web_otpModel.js";
import { sendEmailOTP } from "../utils/sendEmail.js";
import { sendSMSOTP } from "../utils/sendSMS.js";
import jwt from 'jsonwebtoken'
import { tokenBlacklist } from "../middleware/web_authMiddleware.js";

// register user
export const registerUser = async (req, res) => {
  try {
    const { name, email, phoneno, password, address } = req.body;

    // 1. Check required fields
    if (!name || !email || !phoneno || !password || !address) {
      return res.status(400).json({ message: "All required fields must be filled" });
    }

    // 2. Check if user already exists with same email OR phone
    const existingUser = await User.findOne({
      $or: [{ email: email.toLowerCase() }, { phoneno }]
    });

    if (existingUser) {
      if (existingUser.email === email.toLowerCase()) {
        return res.status(400).json({ message: "User already exists with this email" });
      }
      if (existingUser.phoneno === phoneno) {
        return res.status(400).json({ message: "User already exists with this phone number" });
      }
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


// 2. Request OTP
export const requestOTP = async (req, res) => {
  try {
    const { email, phoneno } = req.body;

    if (!email && !phoneno) {
      return res.status(400).json({ message: "Provide either email or phone number" });
    }

    // Find user
    const user = await User.findOne(email ? { email } : { phoneno });
    if (!user) return res.status(404).json({ message: "User not found" });

    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Save OTP with expiry (5 minutes)
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    // Remove old OTPs for this user
    await OTP.deleteMany({ userId: user._id });

    // Save new OTP
    await OTP.create({ userId: user._id, otp, expiresAt });

    // Send OTP
    if (email) {
      await sendEmailOTP(email, otp);
    } else {
      await sendSMSOTP(phoneno, otp);
    }

    res.status(200).json({ message: "OTP sent successfully" });
  } catch (error) {
    console.error("Request OTP Error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Verify OTP and Login
export const verifyOTP = async (req, res) => {
  try {
    console.log("Incoming verify-otp body:", req.body);

    if (!req.body || Object.keys(req.body).length === 0) {
      return res.status(400).json({ message: "Request body is missing or empty" });
    }

    const { email, phoneno, otp } = req.body;
    if (!otp) return res.status(400).json({ message: "OTP is required" });

    // Find user
    const user = await User.findOne(email ? { email } : { phoneno });
    if (!user) return res.status(404).json({ message: "User not found" });

    // Find OTP record
    const otpRecord = await OTP.findOne({ userId: user._id, otp });
    if (!otpRecord) return res.status(400).json({ message: "Invalid OTP" });

    // Check expiry
    if (otpRecord.expiresAt < new Date()) {
      await OTP.deleteOne({ _id: otpRecord._id });
      return res.status(400).json({ message: "OTP expired" });
    }

    // OTP is valid → delete OTP record
    await OTP.deleteOne({ _id: otpRecord._id });

    // Generate JWT token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });

    return res.status(200).json({
      message: "OTP verified successfully",
      token,  // ✅ token included
      user: {
        id: user._id,
        email: user.email,
        phoneno: user.phoneno,
      },
    });
  } catch (error) {
    console.error("Verify OTP Error:", error);
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};


// logout controller
export const logoutUser = async (req, res) => {
  try {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) {
      return res.status(400).json({ message: "No token provided" });
    }

    // Add token to blacklist
    tokenBlacklist.add(token);

    return res.status(200).json({ message: "User logged out successfully" });
  } catch (error) {
    console.error("Logout Error:", error);
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

