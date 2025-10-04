import mongoose from "mongoose";

const adminSchema = new mongoose.Schema(
  {
    name: { 
        type: String, 
        required: true 
    },
    email: { 
        type: String,
        required: true, 
        unique: true, 
        lowercase: true
     },
    password: { 
        type: String,
        required: true
     },
    role: { 
        type: String, 
        enum: ["super admin", "admin"], 
        default: "admin" },
  },
  { timestamps: true, versionKey: false }
);

export default mongoose.model("Admin", adminSchema);
