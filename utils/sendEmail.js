import nodemailer from "nodemailer";
import fs from "fs";
import path from "path";
import handlebars from "handlebars";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Send OTP email using Handlebars template
 * @param {string} email - recipient email
 * @param {string} otp - OTP code
 */
export const sendEmailOTP = async (email, otp) => {
  try {
    // 1. Setup transporter (Gmail / SMTP)
    const transporter = nodemailer.createTransport({
      service: process.env.EMAIL_SERVICE || "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // 2. Load Handlebars template
    const templatePath = path.join(__dirname, "..", "emails", "otpEmail.hbs");
    const source = fs.readFileSync(templatePath, "utf8");
    const template = handlebars.compile(source);

    // 3. Generate HTML with dynamic data
    const html = template({
      company: process.env.COMPANY_NAME || "MyApp",
      otp,
      expiresIn: "5 minutes",
    });

    // 4. Email options
    const mailOptions = {
      from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
      to: email,
      subject: `${process.env.COMPANY_NAME || "MyApp"} - Your OTP Code`,
      text: `Your OTP is ${otp}. It will expire in 5 minutes.`,
      html,
    };

    // 5. Send email
    const info = await transporter.sendMail(mailOptions);
    console.log("OTP email sent:", info.messageId);
    return info;
  } catch (error) {
    console.error("OTP email sending failed:", error.message);
    throw new Error("Failed to send OTP email");
  }
};

export const sendWelcomeEmail = async (email, customerName) => {
  try {
    const transporter = nodemailer.createTransport({
      service: process.env.EMAIL_SERVICE || "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // Load Handlebars template
    const templatePath = path.join(__dirname, "..", "emails", "welcomeEmail.hbs");
    const source = fs.readFileSync(templatePath, "utf8");
    const template = handlebars.compile(source);

    // Generate HTML with dynamic data
    const html = template({
      company: process.env.COMPANY_NAME || "MyApp",
      customerName,
    });

    // Email options
    const mailOptions = {
      from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
      to: email,
      subject: `Welcome to ${process.env.COMPANY_NAME || "MyApp"}!`,
      html,
      text: `Hi ${customerName},\n\nWelcome to ${process.env.COMPANY_NAME || "MyApp"}! We're excited to have you on board.`,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("✅ Welcome email sent:", info.messageId);
    return info;
  } catch (error) {
    console.error("❌ Welcome email sending failed:", error.message);
    throw new Error("Failed to send Welcome email");
  }
};

