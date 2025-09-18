import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Name is required"],
    trim: true,
    minlength: [2, "Name must be at least 2 characters long"]
  },

  email: {
    type: String,
    required: [true, "Email is required"],
    unique: true,
    lowercase: true,
    match: [/^\S+@\S+\.\S+$/, "Please enter a valid email address"]
  },

  phoneno: {
    type: String,
    required: [true, "Phone number is required"],
    minlength: [9, "Phone number must be at least 9 digits"],
    maxlength: [15, "Phone number must not more than 15 digits"],
    match: [/^\d{9,15}$/, "Phone number must be between 9–15 digits"]
  },

  dob: {
    type: Date, //required: [true, "Date of Birth is required"]
  },

  address: {
    street: { type: String  }, //required: [true, "Street is required"]
    city: { type: String},  //required: [true, "City is required"] 
    state: { type: String}, //required: [true, "State is required"] 
    zipcode: { 
      type: String,  //required: [true, "Zip code is required"],
      match: [/^\d{5,6}$/, "Zip code must be 5 or 6 digits"]
    },
    country: { type: String } //, required: [true, "Country is required"]
  },

  isActive: {
    type: Boolean,
    default: true
  },
  communicationMethod: {
      type: String,
      default: "email"
    },

}, { timestamps: true });

export const User = mongoose.model("User", userSchema);
