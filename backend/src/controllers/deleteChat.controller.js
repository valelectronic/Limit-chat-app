import Message from "../models/message.model.js";
import cloudinary from "cloudinary";
import { io, getReceiverSocketId } from "../lib/socket.js";

export const deleteChat = async (req, res) => {
  const { messageId } = req.params;
  const userId = req.user._id;

  try {
    const message = await Message.findById(messageId);

    if (!message) return res.status(404).json({ message: "Message not found" });

    const isSender = message.senderId.toString() === userId.toString();
    const isReceiver = message.receiverId.toString() === userId.toString();

    if (!isSender && !isReceiver) {
      return res.status(403).json({ message: "Unauthorized - Not sender or receiver" });
    }

    // Optional: Delete attached image from Cloudinary if exists
    if (message.image && message.image.public_id) {
      await cloudinary.v2.uploader.destroy(message.image.public_id);
    }

    await message.deleteOne();

    // Emit to both users in the conversation
    const receiverSocketId = getReceiverSocketId(message.receiverId.toString());
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("messageDeleted", messageId);
    }

    const senderSocketId = getReceiverSocketId(message.senderId.toString());
    if (senderSocketId) {
      io.to(senderSocketId).emit("messageDeleted", messageId);
    }

    res.status(200).json({ message: "Message deleted" });
  } catch (error) {
    console.error("Delete error:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
