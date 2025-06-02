import { create } from "zustand";
import toast from "react-hot-toast";
import { axiosInstance } from "../lib/axios"; // adjust path if needed


export const useScheduleStore = create((set,get) => ({
  tasks: [],
  isLoading: false,
  hasTaskToday: false,       // new flag
  isCheckingTasks: false,    // new loading flag for this specific check

  fetchTodayTasks: async () => {
  set({ isLoading: true });
  try {
    const res = await axiosInstance.get("/tasks/today");
    set({
      tasks: res.data.tasks || [], // ✅ correctly assign the array
      isLoading: false,
    });
  } catch (err) {
    console.error("Fetch today tasks error:", err);
    set({ tasks: [], isLoading: false });
  }
},
clearTodayTasks: async () => {
  try {
    await axiosInstance.delete("/schedule/today");
    set({ tasks: [] });
    toast.success("Today's schedule cleared!");
  } catch (error) {
    console.error("Failed to clear today's schedule", error);
    toast.error("Error clearing today's schedule");
  }
},


  createTask: async (taskData) => {
    try {
      const res = await axiosInstance.post("/tasks", taskData);
      set((state) => ({ tasks: [...state.tasks, res.data] }));
      toast.success("Task created successfully");
      await get().checkHasTaskToday();  // refresh flag after creation
       console.log("After checkHasTaskToday, hasTaskToday is:", get().hasTaskToday);

    } catch (error) {
      console.error("Create task error:", error);
      toast.error(error.response?.data?.error || "Failed to create task");
    }
  },
deleteTask: async (taskId) => {
  try {
    await axiosInstance.delete(`/tasks/${taskId}`, { withCredentials: true });

    set((state) => ({
      tasks: state.tasks.filter((task) => task._id !== taskId),
    }));

    toast.success("Task deleted successfully");
  } catch (err) {
    console.error("Failed to delete task:", err);
    toast.error("Failed to delete task");
  }
},


  checkHasTaskToday: async () => {
  set({ isCheckingTasks: true });
  try {
    const res = await axiosInstance.get("/tasks/today");
    set({ hasTaskToday: res.data.hasTask, isCheckingTasks: false });
    console.log("✅ After checkHasTaskToday, hasTaskToday is:", res.data.hasTask);
  } catch (error) {
    console.error("Check has task error:", error);
    set({ hasTaskToday: false, isCheckingTasks: false });
    toast.error("Failed to check tasks for today");
  }
},

}));
