import express from 'express';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.route.js';
import { connectDB } from './lib/db.js';
import cookieParser from 'cookie-parser';
import messageRoutes from './routes/message.route.js';
import cors from 'cors';
import scheduleRoutes from './routes/schedule.route.js';
import deleteChatRoutes from "../src/routes/deleteChat.route.js";
import { app, server } from "./lib/socket.js";
import deleteTodayTaskRoutes from "../src/routes/deleteTodayTask.route.js";

import path from 'path';
import { fileURLToPath } from 'url'; // <-- import here

dotenv.config();

// ES module fix for __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middleware to parse JSON requests
app.use(express.json());
// cookie parser
app.use(cookieParser());
// cors
app.use(cors({
  origin: "http://localhost:5173",
  credentials: true,
}));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/deleteChat", deleteChatRoutes);
app.use("/api/deleteTodayTask", deleteTodayTaskRoutes);
app.use("/api/tasks", scheduleRoutes);

if (process.env.NODE_ENV === 'production') {
  // Serve React build static files
  app.use(express.static(path.join(__dirname, '../frontend/dist')));

  // Handle SPA routing, return index.html
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/dist/index.html'));
  });
}

const PORT = process.env.PORT || 5001;


server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
  connectDB();
});
