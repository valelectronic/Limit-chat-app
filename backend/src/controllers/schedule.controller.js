import Schedule from "../models/schedule.model.js";

export const createTask = async (req, res) => {
  const { title, type, startTime, endTime } = req.body;
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const task = new Schedule({
      userId: req.user._id,
      title,
      type,
      startTime,
      endTime,
      date: today, // important
    });

    await task.save();
    res.status(201).json(task);
  } catch (err) {
    res.status(500).json({ error: "Could not create task" });
  }
};
export const deleteTask = async (req, res) => {
  const { taskId } = req.params;

  try {
    const deleted = await Schedule.findOneAndDelete({
      _id: taskId,
      userId: req.user._id, // ensure user owns the task
    });

    if (!deleted) {
      return res.status(404).json({ error: "Task not found" });
    }

    res.status(200).json({ message: "Task deleted" });
  } catch (err) {
    console.error("Delete task error:", err);
    res.status(500).json({ error: "Could not delete task" });
  }
};



export const getTasksForToday = async (req, res) => {
  try {
    const start = new Date();
    start.setHours(0, 0, 0, 0);

    const end = new Date();
    end.setHours(23, 59, 59, 999);

    const tasks = await Schedule.find({
      userId: req.user._id,
      date: { $gte: start, $lte: end },
    });

    res.json({
      hasTask: tasks.length > 0,
      tasks, // optional: include if frontend needs the list too
    });
  } catch (err) {
    console.error("Fetch today tasks error:", err);
    res.status(500).json({ error: "Could not fetch tasks" });
  }
};

// At the bottom of the file

export const getNextAccessTime = async (req, res) => {
  const userId = req.user._id;
  const now = new Date();
  const nowMinutes = now.getHours() * 60 + now.getMinutes();

  try {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    const end = new Date();
    end.setHours(23, 59, 59, 999);

    const tasks = await Schedule.find({
      userId,
      date: { $gte: start, $lte: end },
    });

    const futureTasks = tasks.filter(task => {
      const [h, m] = task.startTime.split(":").map(Number);
      const taskMinutes = h * 60 + m;
      return taskMinutes > nowMinutes;
    });

    if (futureTasks.length === 0) {
      return res.status(200).json({ nextAccess: null });
    }

    const nextTask = futureTasks.sort((a, b) => a.startTime.localeCompare(b.startTime))[0];
    res.status(200).json({ nextAccess: nextTask.startTime });
  } catch (err) {
    console.error("Failed to get next access time:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};
 

export const deleteTodayTask = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const deletedTasks = await Schedule.deleteMany({
      userId: req.user._id,
      date: today,
    });

    if (deletedTasks.deletedCount === 0) {
      return res.status(404).json({ message: "No tasks found for today" });
    }

    res.status(200).json({ message: "Today's tasks deleted successfully" });
  } catch (err) {
    console.error("Error deleting today's tasks:", err);
    res.status(500).json({ error: "Could not delete today's tasks" });
  }
};