import { TikTokEvent } from "../models/tiktokEventModel.js";


// Create TikTok event
export const addEvent = async (req, res) => {
  try {
    const { eventDetails, hostInformation } = req.body;

    let missingFields = [];


    // ✅ Required field checks
    if (
      !eventDetails?.eventName || '',
      !eventDetails?.eventDescription ||'',
      !eventDetails?.startDateTime ||'',
      !eventDetails?.endDateTime ||'',
      !eventDetails?.eventLink ||'',
      !hostInformation?.hostName ||'',
      !hostInformation?.hostEmailAddress ||'',
      !hostInformation?.hostPhoneNumber||''
    ) {
      return res.status(400).json({
        success: false,
        message: "Required fields are missing!",
      });
    }

    // ✅ Create event
    const event = await TikTokEvent.create({
      eventDetails,
      hostInformation,
    });

    res.status(201).json({
      success: true,
      message: "TikTok Event created successfully",
      event,
    });
  } catch (error) {
    console.error("Error in creating TikTok Event:", error.message);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get all TikTok events
export const getEvents = async (req, res) => {
  try {
    const events = await TikTokEvent.find();

    res.status(200).json({
      success: true,
      message: "TikTok Events fetched successfully",
      count: events.length,
      data: events,
    });
  } catch (error) {
    console.error("Error fetching TikTok Events:", error.message);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Delete event by ID
export const deleteEvent = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedEvent = await TikTokEvent.findByIdAndDelete(id);

    if (!deletedEvent) {
      return res.status(404).json({
        success: false,
        message: "Event not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Event deleted successfully",
      deletedEvent,
    });
  } catch (error) {
    console.error("Error deleting event:", error.message);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// update event by ID
// export const updateEvent = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const updates = req.body;

//     if (!updates || Object.keys(updates).length === 0) {
//       return res.status(400).json({
//         success: false,
//         message: "No fields provided to update",
//       });
//     }

//     // ✅ Update and return the clean updated document
//     const updatedEvent = await TikTokEvent.findByIdAndUpdate(
//       id,
//       { $set: updates },
//       { new: true, runValidators: true }
//     ).lean(); // convert to plain JS object (removes mongoose metadata)

//     if (!updatedEvent) {
//       return res.status(404).json({
//         success: false,
//         message: "Event not found",
//       });
//     }

//     res.status(200).json({
//       success: true,
//       message: "Event updated successfully",
//       data: updatedEvent, // 👈 only the final updated doc here
//     });
//   } catch (error) {
//     console.error("Error updating TikTok Event:", error.message);
//     res.status(500).json({
//       success: false,
//       message: error.message,
//     });
//   }
// };
export const updateEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    if (!updates || Object.keys(updates).length === 0) {
      return res.status(400).json({
        success: false,
        message: "No fields provided to update",
      });
    }

    // 🔎 Fetch existing event
    const event = await TikTokEvent.findById(id);
    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found",
      });
    }

    // ✅ Merge updates into existing nested objects
    if (updates.eventDetails) {
      Object.assign(event.eventDetails, updates.eventDetails);
    }
    if (updates.hostInformation) {
      Object.assign(event.hostInformation, updates.hostInformation);
    }

    // ✅ Save with validation
    const updatedEvent = await event.save();

    res.status(200).json({
      success: true,
      message: "Event updated successfully",
      data: updatedEvent,
    });
  } catch (error) {
    console.error("Error updating TikTok Event:", error.message);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ✅ Get TikTok event by ID
export const getEventById = async (req, res) => {
  try {
    const { id } = req.params;

    // Find event by ID
    const event = await TikTokEvent.findById(id);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Event fetched successfully",
      data: event,
    });
  } catch (error) {
    console.error("Error fetching TikTok Event:", error.message);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

