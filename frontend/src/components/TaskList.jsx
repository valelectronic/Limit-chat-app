import React, { useEffect, useState } from "react";
import { useScheduleStore } from "../store/useScheduleStore";
import { Trash2 } from "lucide-react";

const TaskList = () => {
  const tasks = useScheduleStore((state) => state.tasks);
  const isLoading = useScheduleStore((state) => state.isLoading);
  const fetchTodayTasks = useScheduleStore((state) => state.fetchTodayTasks);
  const deleteTask = useScheduleStore((state) => state.deleteTask);

  const [selectedTaskId, setSelectedTaskId] = useState(null);

  useEffect(() => {
    fetchTodayTasks();
  }, [fetchTodayTasks]);

  const handleDelete = async () => {
    await deleteTask(selectedTaskId);
    setSelectedTaskId(null);
    fetchTodayTasks();
  };

  if (isLoading) return <p>Loading tasks...</p>;
  if (tasks.length === 0) return <p>No tasks scheduled for today.</p>;

  return (
    <>
      <div className="space-y-3">
        {tasks.map(({ _id, title, type, startTime, endTime }) => (
          <div key={_id} className="p-3 border rounded flex justify-between items-start">
            <div>
              <h4 className="font-semibold">{title}</h4>
              <p>Type: {type}</p>
              <p>Time: {startTime} - {endTime}</p>
            </div>
            <button
              onClick={() => setSelectedTaskId(_id)}
              className="text-red-500 hover:text-red-700"
              title="Delete Task"
            >
              <Trash2 size={18} />
            </button>
          </div>
        ))}
      </div>

      {/* Modal */}
      {selectedTaskId && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div className="modal-box bg-base-100 text-base-content rounded-box shadow-xl max-w-sm w-full">
      <h3 className="font-bold text-lg">Confirm Delete</h3>
      <p className="py-4">Are you sure you want to delete this task?</p>
      <div className="modal-action">
        <button
          onClick={() => setSelectedTaskId(null)}
          className="btn btn-ghost"
        >
          Cancel
        </button>
        <button
          onClick={handleDelete}
          className="btn btn-error"
        >
          Delete
        </button>
      </div>
    </div>
  </div>
)}

    </>
  );
};

export default TaskList;
