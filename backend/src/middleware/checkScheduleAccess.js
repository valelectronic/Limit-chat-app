// middlewares/checkScheduleAccess.js
import Schedule from "../models/schedule.model.js";

export const checkScheduleAccess = async (req, res, next) => {
  const userId = req.user._id;
  const now = new Date();

  try {
    const todayTasks = await Schedule.find({
      userId,
      date: new Date().toDateString(),
    });

    if (!todayTasks.length) {
      return res.status(403).json({ message: "No task scheduled for today." });
    }

    // Convert current time to "HH:mm"
    const currentTime = now.toTimeString().slice(0, 5);

    const isWithinAnyTask = todayTasks.some(task => {
      return task.startTime <= currentTime && currentTime < task.endTime;
    });

    if (!isWithinAnyTask) {
      return res.status(403).json({ message: "Outside scheduled time. Access denied." });
    }

    next();
  } catch (err) {
    console.error("Schedule access check failed:", err);
    res.status(500).json({ message: "Schedule check failed." });
  }
};
