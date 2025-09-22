import mongoose from "mongoose";

const TikTokEventSchema = new mongoose.Schema(
  {
    eventDetails: {
      eventName: {
        type: String,
        required: [true, "Event name is required"],
        trim: true,
        minlength: [3, "Event name must be at least 3 characters long"],
        maxlength: [100, "Event name cannot exceed 100 characters"],
      },
      eventDescription: {
        type: String,
        message: "Event description is required",
        trim: true,
        minlength: [10, "Description should be at least 10 characters"],
        maxlength: [1000, "Description cannot exceed 1000 characters"],
      },
      sessionID: {
        type: String,
        trim: true,
      },
      status: {
        type: String,
        enum: ["active", "inactive"],
        default: "inactive",
      },
      startDateTime: {
        type: Date,
        message: "Start date and time is required",
      },
      endDateTime: {
        type: Date,
        message: "End date and time is required",
      },
      eventLink: {
        type: String,
        message: "TikTok Live Event link is required",
        match: [
          /^https?:\/\/(www\.)?tiktok\.com\/.+/,
          "Please provide a valid TikTok event link",
        ],
      },
    },
    hostInformation: {
      hostName: {
        type: String,
        required: true,
        message: "Host name is required",
        trim: true,
        minlength: [3, "Host name must be at least 3 characters long"],
        maxlength: [100, "Host name cannot exceed 100 characters"],
      },
      hostEmailAddress: {
        type: String,
        message: "Provide Host email is required",
        trim: true,
        lowercase: true,
        match: [/^\S+@\S+\.\S+$/, "Please provide a valid email address"],
      },
      hostPhoneNumber: {
        type: String,
        message: "Host phone number is required",
        minlength: [9, "Phone number must be at least 9 digits"],
        maxlength: [15, "Phone number must not exceed 15 digits"],
        match: [/^\d{9,15}$/, "Phone number must be between 9–15 digits"],
      },
    },
  },
  {
    timestamps: true, // Adds createdAt & updatedAt fields
  }
);

export const TikTokEvent = mongoose.model("TikTokEvent", TikTokEventSchema);
