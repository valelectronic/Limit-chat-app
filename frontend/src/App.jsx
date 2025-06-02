import { useAuthStore } from "./store/useAuthStore";
import { useChatStore } from "./store/useChatStore";
import { useEffect } from "react";
import { Loader } from "lucide-react";
import { Toaster } from "react-hot-toast";
import { useThemeStore } from "./store/useThemeStore";
import Navbar from "./components/Navbar";
import HomePage from "./pages/HomePage";
import SignUpPage from "./pages/SignUpPage";
import LoginPage from "./pages/LoginPage";
import ProfilePage from "./pages/ProfilePage";
import SettingsPage from "./pages/SettingsPage";
import { Navigate, Route, Routes } from "react-router-dom";
import SchedulePage from "./pages/SchedulePage";
import { useScheduleStore } from "./store/useScheduleStore";
import AccessOverlay from "./components/AccessOverlay";
import TaskResetSchedulerWithRedirect from "./components/TaskResetSchedulerWithRedirect";

export default function App() {
  const { authUser, checkAuth, isCheckingAuth, socket } = useAuthStore();
  const { theme } = useThemeStore();

  const hasTaskToday = useScheduleStore((state) => state.hasTaskToday);
  const isCheckingTasks = useScheduleStore((state) => state.isCheckingTasks);
  const checkHasTaskToday = useScheduleStore((state) => state.checkHasTaskToday);

  // ✅ Get socket message handlers as stable references
  const { subscribeToMessages, unsubscribeFromMessages } = useChatStore.getState();

  // Check for user task availability after login
  useEffect(() => {
    if (authUser) {
      checkHasTaskToday();
    }
  }, [authUser, checkHasTaskToday]);

  // Auth check on app load
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  // ✅ Manage socket subscriptions
  useEffect(() => {
    const hasSocket = socket && typeof socket.on === "function";

    if (authUser && hasSocket) {
      subscribeToMessages();
      console.log("✅ Subscribed to socket events");

      return () => {
        unsubscribeFromMessages();
        console.log("❌ Unsubscribed from socket events");
      };
    }
  }, [authUser, socket]); // ✅ only stable values in dependencies

  if (isCheckingAuth && !authUser)
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader className="size-10 animate-spin" />
      </div>
    );

  return (
    <div data-theme={theme}>
      <Navbar />
      <AccessOverlay />
      <TaskResetSchedulerWithRedirect />
      <Routes>
        <Route
          path="/"
          element={
            authUser ? (
              isCheckingTasks ? (
                <div className="h-screen flex items-center justify-center">
                  <Loader className="animate-spin size-10" />
                </div>
              ) : hasTaskToday ? (
                <HomePage />
              ) : (
                <Navigate to="/schedule" />
              )
            ) : (
              <Navigate to="/login" />
            )
          }
        />
        <Route path="/signup" element={!authUser ? <SignUpPage /> : <Navigate to="/" />} />
        <Route path="/login" element={!authUser ? <LoginPage /> : <Navigate to="/" />} />
        <Route path="/profile" element={authUser ? <ProfilePage /> : <Navigate to="/login" />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/schedule" element={<SchedulePage />} />
      </Routes>
      <Toaster />
    </div>
  );
}
