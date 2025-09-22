import express from "express";
import { logoutUser, registerUser, requestOTP, verifyOTP } from "../controllers/web_authController.js";
import { authMiddleware } from "../middleware/web_authMiddleware.js";


const router = express.Router();

router.post("/register", registerUser);
router.post("/request-otp", requestOTP);
router.post("/verify-otp",verifyOTP);
router.post("/logout", authMiddleware, logoutUser);

export default router;
