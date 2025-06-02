import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import { deleteChat } from "../controllers/deleteChat.controller.js";

const router = express.Router();

router.delete("/:messageId", protectRoute, deleteChat);

export default router;
