import React, { useState } from "react";
import { useScheduleStore } from "../store/useScheduleStore";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

const TASK_TYPES = [
  { value: "chatting", label: "💬 Chatting" },
  { value: "reading", label: "📖 Reading" },
  { value: "break", label: "☕ Break" },
  { value: "other activities", label: "🛠️ Other Activities" },
];

const CreateTaskForm = () => {
  const { createTask, checkHasTaskToday, fetchTodayTasks } = useScheduleStore();
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [type, setType] = useState("chatting");
  const [startTime, setStartTime] = useState("08:00");
  const [endTime, setEndTime] = useState("17:00");

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await createTask({ title, type, startTime, endTime });
      await fetchTodayTasks();
      await checkHasTaskToday();
      toast.success("Task created successfully");
      navigate("/");
    } catch (err) {
      console.error(err);
      toast.error("Failed to create task");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-6 max-w-lg mx-auto bg-base-100 rounded-xl shadow space-y-6">
      <h2 className="text-xl font-bold text-center text-base-content">Create a New Task</h2>

      {/* Task Title */}
      <div className="form-control">
        <label className="label font-medium text-base-content">Task Title</label>
        <input
          type="text"
          className="input input-bordered w-full"
          placeholder="Enter task title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
      </div>

      {/* Task Type */}
      <div className="form-control">
        <label className="label font-medium text-base-content">Task Type</label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {TASK_TYPES.map((t) => (
            <button
              key={t.value}
              type="button"
              onClick={() => setType(t.value)}
              className={`btn ${
                type === t.value ? "btn-primary" : "btn-outline"
              } w-full text-sm`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Start Time */}
      <div className="form-control">
        <label className="label font-medium text-base-content">Start Time</label>
        <input
          type="time"
          className="input input-bordered w-full"
          value={startTime}
          onChange={(e) => setStartTime(e.target.value)}
          required
        />
      </div>

      {/* End Time */}
      <div className="form-control">
        <label className="label font-medium text-base-content">End Time</label>
        <input
          type="time"
          className="input input-bordered w-full"
          value={endTime}
          onChange={(e) => setEndTime(e.target.value)}
          required
        />
      </div>

      {/* Submit */}
      <button type="submit" className="btn btn-primary w-full">
        Create Task
      </button>
    </form>
  );
};

export default CreateTaskForm;
