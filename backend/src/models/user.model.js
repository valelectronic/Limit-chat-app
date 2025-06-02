import mongoose from "mongoose";


const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: [true, "Email is required"],
        unique: true,
        lowercase: true,
        trim:true,
       match: [
  /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
  "Please enter a valid email address"
],
    },
  fullName: {
    type: String,
    required: true,
  },
       password: {
        type: String,
        required: [true, "Password is required"],
        minlength: [8, "Password must be at least 8 characters long"],
    },

    profilePic: {
        type: String,
        default: ""
    },
}, {
  timestamps: true,
    
})

const User = mongoose.model("User", userSchema);
export default User;