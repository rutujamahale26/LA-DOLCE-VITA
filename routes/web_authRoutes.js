import express from "express";
import { registerUser } from "../controllers/web_authController.js";


const router = express.Router();

router.post("/register", registerUser);

export default router;
