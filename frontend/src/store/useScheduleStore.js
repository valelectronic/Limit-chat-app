import { create } from "zustand";
import toast from "react-hot-toast";
import { axiosInstance } from "../lib/axios"; // adjust path if needed

export const useScheduleStore = create((set, get) => ({
  tasks: [],
  isLoading: false,
  hasTaskToday: false,
  isCheckingTasks: false,

  fetchTodayTasks: async () => {
    set({ isLoading: true });
    try {
      const res = await axiosInstance.get("/tasks/todayTask");
      set({
        tasks: res.data.tasks || [],
        isLoading: false,
      });
    } catch (err) {
      console.error("Fetch today tasks error:", err);
      set({ tasks: [], isLoading: false });
    }
  },

  clearTodayTasks: async () => {
    try {
      // ✅ correct endpoint for clearing today's task
      await axiosInstance.delete("/tasks/today"); 
      set({ tasks: [] });
      await get().checkHasTaskToday(); // refresh the flag
    } catch (error) {
      console.error("Failed to clear today's schedule", error);
      toast.error("Error clearing today's schedule");
    }
  },

  createTask: async (taskData) => {
    try {
      const res = await axiosInstance.post("/tasks", taskData);
      set((state) => ({ tasks: [...state.tasks, res.data] }));
      await get().checkHasTaskToday();
    } catch (error) {
      console.error("Create task error:", error);
      toast.error(error.response?.data?.error || "Failed to create task");
    }
  },

  deleteTask: async (taskId) => {
    try {
      await axiosInstance.delete(`/tasks/${taskId}`);
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
      const res = await axiosInstance.get("/tasks/todayTask");
      set({ hasTaskToday: res.data.hasTask, isCheckingTasks: false });
    } catch (error) {
      console.error("Check has task error:", error);
      set({ hasTaskToday: false, isCheckingTasks: false });
      toast.error("Failed to check tasks for today");
    }
  },
}));
