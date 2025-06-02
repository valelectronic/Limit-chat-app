import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import {
  createTask,
  getTasksForToday,
  getNextAccessTime,
  deleteTask,
  deleteTodayTask,
} from "../controllers/schedule.controller.js";

const router = express.Router();

router.post("/", protectRoute, createTask);
router.get("/todayTask", protectRoute, getTasksForToday);
router.get("/today", protectRoute, getTasksForToday); // alias for todayTask
router.get("/next-access", protectRoute, getNextAccessTime);
router.delete("/today", protectRoute, deleteTodayTask);
router.delete("/:taskId", protectRoute, deleteTask);


export default router;
