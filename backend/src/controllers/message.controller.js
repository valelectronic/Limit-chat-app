import User from "../models/user.model.js";
import Message from "../models/message.model.js";
import {getReceiverSocketId,io} from "../lib/socket.js"
import cloudinary from "../lib/cloudinary.js";


export const getUsersForSidebar = async (req, res) => {
  try {
    const loggedInUserId = req.user._id;
    const filteredUsers = await User.find({ _id: { $ne: loggedInUserId } }).select("-password");

    res.status(200).json(filteredUsers);
  } catch (error) {
    console.error("Error in getUsersForSidebar: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getMessages = async (req, res) => {
  try {
    const { id: userToChatId } = req.params;
    const myId = req.user._id;

    const messages = await Message.find({
      $or: [
        { senderId: myId, receiverId: userToChatId },
        { senderId: userToChatId, receiverId: myId },
      ],
    });

    res.status(200).json(messages);
  } catch (error) {
    console.log("Error in getMessages controller: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};



export const sendMessage = async (req, res) => {
  try {
    const { text, image, video, audio, file } = req.body;
    const { id: receiverId } = req.params;
    const senderId = req.user._id;

    // Check if there's at least some content
    if (!text && !image && !video && !audio && !file) {
      return res.status(400).json({ error: "Message cannot be empty" });
    }

    // Max size: 2MB in bytes
    const MAX_SIZE = 2 * 1024 * 1024;

    // Helper to upload and limit size
    const uploadToCloudinary = async (base64, type) => {
      const sizeInBytes = Buffer.byteLength(base64, "base64");
      if (sizeInBytes > MAX_SIZE) {
        throw new Error(`${type} size exceeds 2MB`);
      }

      const uploadResponse = await cloudinary.uploader.upload(base64, {
        resource_type: type === "file" ? "raw" : type === "audio" ? "video" : type,
      });

      return uploadResponse.secure_url;
    };

    let imageUrl, videoUrl, audioUrl, fileUrl;

    if (image) imageUrl = await uploadToCloudinary(image, "image");
    if (video) videoUrl = await uploadToCloudinary(video, "video");
    if (audio) audioUrl = await uploadToCloudinary(audio, "audio");
    if (file) fileUrl = await uploadToCloudinary(file, "file");

    const newMessage = new Message({
      senderId,
      receiverId,
      text,
      image: imageUrl,
      video: videoUrl,
      audio: audioUrl,
      file: fileUrl,
    });

    await newMessage.save();

   io.to(receiverId).emit("newMessage", newMessage);
console.log("📤 Sent newMessage to receiver room:", receiverId);



    res.status(201).json(newMessage);
  } catch (error) {
    console.error("Error in sendMessage:", error.message);
    res.status(400).json({ error: error.message || "Internal server error" });
  }
};
