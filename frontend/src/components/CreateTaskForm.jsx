import React, { useState } from "react";
import { useScheduleStore } from "../store/useScheduleStore";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

const CreateTaskForm = () => {
  const { createTask, checkHasTaskToday ,fetchTodayTasks} = useScheduleStore();
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [type, setType] = useState("chatting");
  const [startTime, setStartTime] = useState("08:00");
  const [endTime, setEndTime] = useState("17:00");

 const handleSubmit = async (e) => {
  e.preventDefault();

  try {
    await createTask({ title, type, startTime, endTime });
    await fetchTodayTasks(); // ✅ Fetch updated tasks
    await checkHasTaskToday();
    toast.success("Task created successfully");
    navigate("/");
  } catch (err) {
    console.error(err);
    toast.error("Failed to create task");
  }
};

  return (
    <form onSubmit={handleSubmit} className="p-4 border rounded space-y-4">
      <div>
        <label>Title</label>
        <input
          type="text"
          placeholder="Task title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          className="input"
        />
      </div>

      <div>
        <label>Type</label>
        <select value={type} onChange={(e) => setType(e.target.value)} className="input">
          <option value="chatting">Chatting</option>
          <option value="reading">Reading</option>
          <option value="break">Break</option>
          <option value="other activities">Other Activities</option>
        </select>
      </div>

      <div>
        <label>Start Time</label>
        <input
          type="time"
          value={startTime}
          onChange={(e) => setStartTime(e.target.value)}
          className="input w-full"
          required
        />
      </div>

      <div>
        <label>End Time</label>
        <input
          type="time"
          value={endTime}
          onChange={(e) => setEndTime(e.target.value)}
          className="input w-full"
          required
        />
      </div>

      <button type="submit" className="btn btn-primary w-full">
        Create Task
      </button>
    </form>
  );
};

export default CreateTaskForm;
