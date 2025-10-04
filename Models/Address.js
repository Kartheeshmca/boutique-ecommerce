import mongoose from "mongoose";

const addressSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    city: {
      type: String,
      trim: true,
    },
    state: {
      type: String,
      trim: true,
    },
    pincode: {
      type: String,
      trim: true,
    },
    country: {
      type: String,
      trim: true,
    },
    phone: {
      type: String,
      required: true,
      trim: true,
      match: [/^[0-9]{10,15}$/, "Please enter a valid phone number"], // allows 10–15 digits
    },
    is_default: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Address", addressSchema);
