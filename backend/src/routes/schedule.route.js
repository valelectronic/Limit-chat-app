import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import {
  createTask,
  getTasksForToday,
  getNextAccessTime,
  deleteTask
} from "../controllers/schedule.controller.js";

const router = express.Router();

router.post("/", protectRoute, createTask);
router.get("/today", protectRoute, getTasksForToday);
router.get("/next-access", protectRoute, getNextAccessTime);
router.delete("/:taskId", protectRoute, deleteTask);

export default router;
