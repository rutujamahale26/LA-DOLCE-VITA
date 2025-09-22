// utils/sendSMS.js
import twilio from "twilio";

export const sendSMSOTP = async (phone, otp) => {
  try {
    const client = twilio(
      process.env.TWILIO_SID,
      process.env.TWILIO_AUTH_TOKEN
    );

    if (!process.env.TWILIO_PHONE) {
      throw new Error("TWILIO_PHONE is not set in .env");
    }

    if (!phone) {
      throw new Error("Phone number is required");
    }

    // ✅ If phone does not start with "+", automatically add +91
    let to = phone.trim();
    if (!to.startsWith("+")) {
      to = `+91${to.replace(/^0+/, "")}`; // removes leading 0s, prefixes with +91
    }

    const message = await client.messages.create({
      body: `Your OTP for login is: ${otp}. It is valid for 5 minutes.`,
      from: process.env.TWILIO_PHONE,
      to,
    });

    console.log("✅ SMS sent:", message.sid, "to", to);
    return { success: true, sid: message.sid, to };
  } catch (error) {
    console.error("❌ SMS sending failed:", {
      message: error.message,
      code: error.code,
      status: error.status,
      moreInfo: error.moreInfo,
    });
    throw new Error(
      `Failed to send OTP SMS${
        error.code ? ` (code ${error.code})` : ""
      }: ${error.message}`
    );
  }
};
