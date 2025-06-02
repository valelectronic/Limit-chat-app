import express from 'express';
import {
    login,
    logout,
    register,
    updateProfile,
    checkAuth
  
} from '../controllers/auth.controller.js';
import { protectRoute} from '../middleware/auth.middleware.js';

const router = express.Router();

router.post('/login', login);
router.post('/logout', logout);
router.post('/register', register);
router.put("/update-profile",protectRoute, updateProfile); // Assuming the same controller handles profile updates
router.get("/check", protectRoute, checkAuth);

export default router;