// controllers/scheduleController.js
import Schedule from "../models/schedule.model.js"; // make sure this path is correct

export const deleteTodayTask = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // normalize to midnight

    const deleted = await Schedule.deleteMany({
      userId: req.user._id,
      date: today,
    });

    res.json({
      message: "Today's schedule cleared successfully.",
      count: deleted.deletedCount,
    });
  } catch (error) {
    console.error("Error deleting today's schedule:", error);
    res.status(500).json({ error: "Failed to clear today's schedule" });
  }
};
