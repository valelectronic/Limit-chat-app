import { create } from "zustand";
import toast from "react-hot-toast";
import { axiosInstance } from "../lib/axios";
import { useAuthStore } from "./useAuthStore";

// Track socket state & handlers
let isSubscribedToSocket = false;
let newMessageHandler = null;
let messageDeletedHandler = null;

export const useChatStore = create((set, get) => ({
  messages: [],
  users: [],
  selectedUser: null,
  isUsersLoading: false,
  isMessagesLoading: false,
  newMessages: {},

  markMessagesAsRead: (userId) => {
    const newMessages = { ...get().newMessages };
    delete newMessages[userId];
    set({ newMessages });
  },

  getUsers: async () => {
    set({ isUsersLoading: true });
    try {
      const res = await axiosInstance.get("/messages/users");
      set({ users: res.data });
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to fetch users");
    } finally {
      set({ isUsersLoading: false });
    }
  },

  getMessages: async (userId) => {
    set({ isMessagesLoading: true });
    try {
      const res = await axiosInstance.get(`/messages/${userId}`);
      set({ messages: res.data });
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to fetch messages");
    } finally {
      set({ isMessagesLoading: false });
    }
  },

  sendMessage: async (messageData) => {
    const { selectedUser, messages } = get();
    try {
      const res = await axiosInstance.post(`/messages/send/${selectedUser._id}`, messageData);
      set({ messages: [...messages, res.data] });
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to send message");
    }
  },

  deleteChat: async (messageId) => {
    try {
      await axiosInstance.delete(`/deleteChat/${messageId}`);
      const updatedMessages = get().messages.filter((msg) => msg._id !== messageId);
      set({ messages: updatedMessages });
      toast.success("Message deleted");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete message");
    }
  },

  subscribeToMessages: () => {
    const socket = useAuthStore.getState().socket;

    if (!socket || typeof socket.on !== "function") {
      console.warn("⚠️ Socket not initialized yet");
      return;
    }

    if (isSubscribedToSocket) {
      console.log("⚠️ Already subscribed to socket events");
      return;
    }

    isSubscribedToSocket = true;

    // Define handler references
    newMessageHandler = (newMessage) => {
      console.log("📨 New message received", newMessage);
      set((state) => {
        const isFromSelectedUser =
          state.selectedUser && newMessage.senderId === state.selectedUser._id;

        if (isFromSelectedUser) {
          return { messages: [...state.messages, newMessage] };
        } else {
          const currentCount = state.newMessages[newMessage.senderId] || 0;
          toast(`${newMessage.senderName || "Someone"} sent a message`);
          return {
            newMessages: {
              ...state.newMessages,
              [newMessage.senderId]: currentCount + 1,
            },
          };
        }
      });
    };

    messageDeletedHandler = (deletedMessageId) => {
      console.log("🗑️ Message deleted:", deletedMessageId);
      set((state) => ({
        messages: state.messages.filter((msg) => msg._id !== deletedMessageId),
      }));
    };

    // Subscribe using named handlers
    socket.on("newMessage", newMessageHandler);
    socket.on("messageDeleted", messageDeletedHandler);
    console.log("✅ Subscribed to socket events");
  },

  unsubscribeFromMessages: () => {
    const socket = useAuthStore.getState().socket;
    if (!socket) return;

    if (newMessageHandler) {
      socket.off("newMessage", newMessageHandler);
      newMessageHandler = null;
      console.log("✅ Removed newMessage handler");
    }

    if (messageDeletedHandler) {
      socket.off("messageDeleted", messageDeletedHandler);
      messageDeletedHandler = null;
      console.log("✅ Removed messageDeleted handler");
    }

    isSubscribedToSocket = false;
    console.log("❌ Unsubscribed from socket events");
  },

  setSelectedUser: (selectedUser) => set({ selectedUser }),
}));
