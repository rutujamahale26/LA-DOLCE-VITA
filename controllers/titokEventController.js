// controllers/tikTokEventController.js

import { TikTokEvent } from "../models/tiktokEventModel.js";


export const addEvent = async (req, res) => {
  try {
    const { EventDetails, HostInformation } = req.body;

    // ✅ Required field checks
    if (
      !EventDetails?.EventName ||
      !EventDetails?.EventDescription ||
      !EventDetails?.StartDateTime ||
      !EventDetails?.EndDateTime ||
      !EventDetails?.TikTokLiveEventLink ||
      !HostInformation?.HostName ||
      !HostInformation?.HostEmailAddress ||
      !HostInformation?.HostPhoneNumber
    ) {
      return res.status(400).json({
        success: false,
        message: "Required fields are missing!",
      });
    }

    // ✅ Create Event (schema will validate dates, link, phone, etc.)
    const event = await TikTokEvent.create({
      EventDetails,
      HostInformation,
    });

    res.status(201).json({
      success: true,
      message: "TikTok Event created successfully",
      event,
    });
  } catch (error) {
    console.log("Error in creating TikTok Event:", error.message);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
