import { useScheduleStore } from "../store/useScheduleStore";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useNavigate, useLocation } from "react-router-dom";

const ChatAccessOverlay = () => {
  const location = useLocation();
  const publicRoutes = ["/login", "/register"];

  // Skip overlay on public routes (allow access freely)
  if (publicRoutes.includes(location.pathname)) {
    return null;
  }

  const tasks = useScheduleStore((state) => state.tasks);
  const fetchTasks = useScheduleStore((state) => state.fetchTodayTasks);
  const clearTodayTasks = useScheduleStore((state) => state.clearTodayTasks);
  const [isChatTime, setIsChatTime] = useState(false);
  const [showOverlay, setShowOverlay] = useState(true);
  const [nextChatTask, setNextChatTask] = useState(null);
  const [countdown, setCountdown] = useState("");
  const [dismissTimer, setDismissTimer] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!tasks || tasks.length === 0) {
      navigate("/schedule");
    }
  }, [tasks, navigate]);

  useEffect(() => {
    const checkChatTime = () => {
      const now = new Date();
      const nowMins = now.getHours() * 60 + now.getMinutes();
      let foundChatTime = false;
      let closestChatTask = null;

      tasks.forEach((task) => {
        if (task.type !== "chatting") return;

        const [startH, startM] = task.startTime.split(":").map(Number);
        const [endH, endM] = task.endTime.split(":").map(Number);
        const startMins = startH * 60 + startM;
        const endMins = endH * 60 + endM;

        if (nowMins >= startMins && nowMins < endMins) {
          foundChatTime = true;

          const timeLeft = endMins - nowMins;
          if (timeLeft === 5) {
            toast("🕔 5 minutes left to wrap up chatting!", {
              icon: "⚠️",
              duration: 4000,
              position: "top-center",
            });
          }
        }

        if (startMins > nowMins && (!closestChatTask || startMins < closestChatTask.startMins)) {
          closestChatTask = { ...task, startMins };
        }
      });

      setIsChatTime(foundChatTime);
      setShowOverlay(!foundChatTime);
      setNextChatTask(closestChatTask);

      if (dismissTimer) clearTimeout(dismissTimer);

      if (!foundChatTime && closestChatTask) {
        const minsUntilStart = closestChatTask.startMins - nowMins;
        const ms = minsUntilStart * 60 * 1000;
        const timer = setTimeout(() => setShowOverlay(false), ms);
        setDismissTimer(timer);
      }
    };

    checkChatTime();
    const interval = setInterval(checkChatTime, 60000);
    return () => {
      clearInterval(interval);
      if (dismissTimer) clearTimeout(dismissTimer);
    };
  }, [tasks]);

  useEffect(() => {
    if (!nextChatTask) {
      setCountdown("");
      return;
    }

    const interval = setInterval(() => {
      const [startH, startM] = nextChatTask.startTime.split(":").map(Number);
      const startMins = startH * 60 + startM;
      const now = new Date();
      const nowMins = now.getHours() * 60 + now.getMinutes();
      const minsLeft = startMins - nowMins;

      if (minsLeft > 0) {
        setCountdown(`${minsLeft} minute${minsLeft > 1 ? "s" : ""} remaining`);
      } else {
        setCountdown("");
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [nextChatTask]);

  const handleManualCheck = async () => {
    await fetchTasks();
    toast.success("Schedule refreshed!");
  };

  const handleConfirmReset = async () => {
    try {
      await clearTodayTasks();
      toast.success("Today's schedule has been reset!");
      navigate("/schedule");
    } catch (err) {
      console.error(err);
      toast.error("Failed to reset schedule");
    } finally {
      setShowConfirmModal(false);
    }
  };

  const handleCancelReset = () => {
    setShowConfirmModal(false);
  };

  if (!tasks || tasks.length === 0) {
    return null;
  }

  if (!showOverlay) return null;

  return (
    <>
      <div className="fixed inset-0 z-[9999] bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
        <div className="bg-base-100 text-base-content shadow-xl rounded-2xl max-w-md w-full p-6 space-y-5 text-center">
          <h2 className="text-2xl font-bold">🔒 Chat Access Locked</h2>
          <p className="text-base">
            According to your schedule, chatting is not allowed right now.
          </p>

          {nextChatTask && (
            <div className="bg-primary/10 border border-primary p-4 rounded-lg">
              <p className="font-medium text-primary">
                ⏰ Next chat session at{" "}
                <span className="font-bold">{nextChatTask.startTime}</span>
              </p>
              <p className="text-sm text-base-content/70 italic">
                Task: {nextChatTask.title}
              </p>
              {countdown && (
                <p className="text-xs mt-1 text-base-content/50">{countdown}</p>
              )}
            </div>
          )}

          <div className="flex flex-col gap-3 pt-2">
            <button onClick={handleManualCheck} className="btn btn-sm btn-primary">
              🔄 Refresh Schedule
            </button>
            <button
              onClick={() => setShowConfirmModal(true)}
              className="btn btn-sm btn-error"
            >
              🗑️ Reset Today's Schedule
            </button>
          </div>
        </div>
      </div>

      {showConfirmModal && (
        <div className="fixed inset-0 z-[99999] bg-black/60 flex items-center justify-center px-4">
          <div className="bg-white dark:bg-base-100 rounded-xl shadow-lg p-6 w-full max-w-sm text-center">
            <h3 className="text-xl font-semibold mb-2">⚠️ Confirm Reset</h3>
            <p className="mb-4">Are you sure you want to clear today’s schedule?</p>
            <div className="flex justify-center gap-4">
              <button onClick={handleConfirmReset} className="btn btn-error btn-sm">
                Yes, Reset
              </button>
              <button onClick={handleCancelReset} className="btn btn-ghost btn-sm">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ChatAccessOverlay;
