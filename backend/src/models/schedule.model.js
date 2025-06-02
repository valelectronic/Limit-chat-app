import mongoose from "mongoose";

const taskSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User", 
    required: true 
  },

  title: { 
    type: String, 
    required: true 
  },

  type: { 
    type: String, 
    enum: ["chatting", "reading", "break", "other activities"], 
    required: true 
  },

  startTime: { 
    type: String, 
    required: true 
  }, // Format: "HH:mm"

  endTime: { 
    type: String, 
    required: true 
  }, // Format: "HH:mm"

  date: {
    type: Date,
    default: () => {
      const today = new Date();
      today.setHours(0, 0, 0, 0); // normalize to midnight
      return today;
    }
  }
});

export default mongoose.model("Schedule", taskSchema);
