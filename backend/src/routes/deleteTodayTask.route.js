import express from "express";
import { deleteTodayTask } from "../controllers/deleteTodayTask.controller.js";

import { protectRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

router.delete("/today", protectRoute, deleteTodayTask);

export default router;
