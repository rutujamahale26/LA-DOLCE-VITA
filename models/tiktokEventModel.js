// models/TikTokEvent.js
import mongoose from "mongoose";

const TikTokEventSchema = new mongoose.Schema(
  {
    EventDetails: {
      EventName: {
        type: String,
        required: [true, "Event name is required"],
        trim: true,
        minlength: [3, "Event name must be at least 3 characters long"],
        maxlength: [100, "Event name cannot exceed 100 characters"],
      },
      EventDescription: {
        type: String,
        required: [true, "Event description is required"],
        trim: true,
        minlength: [10, "Description should be at least 10 characters"],
        maxlength: [1000, "Description cannot exceed 1000 characters"],
      },
      SessionID: {
        type: String,
        unique: true,
        trim: true,
      },
      Status: {
        type: Boolean,
        default: "inactive",
      },
      StartDateTime: {
        type: Date,
        required: [true, "Start date and time is required"],
      },
      EndDateTime: {
        type: Date,
        required: [true, "End date and time is required"],
      },
      TikTokLiveEventLink: {
        type: String,
        required: [true, "TikTok Live Event link is required"],
        match: [
          /^https?:\/\/(www\.)?tiktok\.com\/.+/,
          "Please provide a valid TikTok event link",
        ],
      },
    },
    HostInformation: {
      HostName: {
        type: String,
        required: [true, "Host name is required"],
        trim: true,
        minlength: [3, "Host name must be at least 3 characters long"],
        maxlength: [100, "Host name cannot exceed 100 characters"],
      },
      HostEmailAddress: {
        type: String,
        required: [true, "Host email is required"],
        trim: true,
        lowercase: true,
        match: [/^\S+@\S+\.\S+$/, "Please provide a valid email address"],
      },
      HostPhoneNumber: {
        type: String,
        required: [true, "Host phone number is required"],
        minlength: [9, "Phone number must be at least 9 digits"],
        maxlength: [15, "Phone number must not more than 15 digits"],
        match: [/^\d{9,15}$/, "Phone number must be between 9–15 digits"],
      },
    },
  },
  {
    timestamps: true, // Adds createdAt & updatedAt fields
  }
);

export const TikTokEvent = mongoose.model("TikTokEvent", TikTokEventSchema);
