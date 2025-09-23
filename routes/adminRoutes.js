import express from "express";
import {  getAdminProfile, loginAdmin, logoutAdmin } from "../controllers/adminController.js";
import {authMiddleware } from "../middleware/web_authMiddleware.js";


const router = express.Router();

// router.post("/create-default", createDefaultAdmin);
router.post("/login", loginAdmin);
router.get("/profile", authMiddleware, getAdminProfile);
router.post("/logout", authMiddleware, logoutAdmin);

export default router;
