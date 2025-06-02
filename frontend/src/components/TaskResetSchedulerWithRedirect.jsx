import { useEffect } from "react";
import { useScheduleStore } from "../store/useScheduleStore";
import { differenceInMilliseconds, endOfDay } from "date-fns";
import { useNavigate, useLocation } from "react-router-dom";

const TaskResetSchedulerWithRedirect = () => {
  const { tasks, fetchTodayTasks, clearTasks } = useScheduleStore();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    fetchTodayTasks(); // always fetch latest tasks when component mounts
  }, []);

  useEffect(() => {
    if (tasks.length === 0 && location.pathname !== "/schedule") {
      navigate("/schedule");
    }
  }, [tasks]);

  useEffect(() => {
    const now = new Date();
    const midnight = endOfDay(now);
    const msUntilMidnight = differenceInMilliseconds(midnight, now);

    const timer = setTimeout(() => {
      clearTasks();          // Clear tasks from store
      navigate("/schedule"); // Redirect to scheduling page
    }, msUntilMidnight);

    return () => clearTimeout(timer);
  }, []);

  return null;
};

export default TaskResetSchedulerWithRedirect;
