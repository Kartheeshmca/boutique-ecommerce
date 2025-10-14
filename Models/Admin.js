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

    status:{
    type: String,
    enum: ["Active", "Inactive"],
    default: "Active",
  },
  },
  
  { timestamps: true, versionKey: false }
);

export default mongoose.model("Admin", adminSchema);
