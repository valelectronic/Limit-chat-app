import express from 'express';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.route.js';
import { connectDB } from './lib/db.js';
import cookieParser from 'cookie-parser';
import messageRoutes from './routes/message.route.js';
import cors from 'cors';
import scheduleRoutes from './routes/schedule.route.js';
import deleteChatRoutes from "../src/routes/deleteChat.route.js"
import {app,server } from "./lib/socket.js"
import deleteTodayTaskRoutes from "../src/routes/deleteTodayTask.route.js"

import path from 'path';

dotenv.config();


// Middleware to parse JSON requests
//this will allow us to get requests from the  body of the input 
app.use(express.json());
//used for allowing to pass the cookie from the database or any place and use it 
app.use(cookieParser()) 
// Middleware to enable CORS
app.use(cors({
  origin: "http://localhost:5173", // Allow requests from this origin
  credentials: true, // Allow cookies to be sent with requests
}));

//routes
app.use("/api/auth",authRoutes);
app.use("/api/messages",messageRoutes);
app.use("/api/deleteChat",deleteChatRoutes)
app.use("/api/schedule",deleteTodayTaskRoutes)
// for time management
app.use("/api/tasks",scheduleRoutes)

if (process.env.NODE_ENV === 'production') {
  // Serve static files from the React app
  app.use(express.static(path.join(__dirname, '../frontend/dist')));

  // Handle any requests that don't match the above routes
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, "../frontend", 'dist', 'index.html'));
  });
}

const PORT = process.env.PORT || 5001;


const __dirname = path.resolve();

server.listen(PORT, () => {
  console.log(`Server is running on http://localhost port ${PORT}`);
  connectDB()
})
