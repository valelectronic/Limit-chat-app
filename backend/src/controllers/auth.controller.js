
import { generateToken } from '../lib/utilis.js';
import User from '../models/user.model.js';
import bcrypt from 'bcryptjs';
import cloudinary from '../lib/cloudinary.js';


//function to handle user registration
export const register = async (req, res) => {

  const { email, fullName, password } = req.body;

  try {
    if (!email || !fullName || !password) {
      return res.status(400).json({ message: 'All fields are required' });
    }


    // ✅ Strong password validation
const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
if (!passwordRegex.test(password)) {
  return res.status(400).json({
    message: "Password must be at least 8 characters long and include one uppercase letter, one number, and one special character (@$!%*?&).",
  });
}

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
      email,
      fullName,
      password: hashedPassword,
    });

    await newUser.save();

    const token = generateToken(newUser._id, res);

    res.status(201).json({
      _id: newUser._id,
      email: newUser.email,
      fullName: newUser.fullName,
      profilePic: newUser.profilePic,
      token,
    });

    console.log('User registered successfully');

  } catch (error) {
    console.error('Error registering user:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

//function to handle user login

export const login = async(req, res) => {
  
  const { email, password } = req.body;

 try {
  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }
 

  const user = await User.findOne({ email });
  if (!user) {
    return res.status(400).json({ message: 'Invalid email or password' });
  }
   // ✅ Strong password validation
     // 🔄 Compare passwords
    const isMatch = await bcrypt.compare(password.trim(), user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid email or password" });
    }
 
    generateToken(user._id, res);
    res.status(200).json({
      _id: user._id,
      email: user.email,
      fullName: user.fullName,
      profilePic: user.profilePic,
      
    });

  
 } catch (error) {
  console.error('Error logging in user:', error);
  res.status(500).json({ message: 'Internal server error' });
  
  
 }


}

//function to handle user logout
export const logout = (req, res) => {
  try {
    res.cookie("jwt", "", {
      maxAge: 0, // Set cookie to expire immediately
      httpOnly: true,
      sameSite: "strict",
      secure: process.env.NODE_ENV !== "development",
    });
    res.status(200).json({ message: 'User logged out successfully' });
    
  } catch (error) {
    console.log("Error logging out user:", error);
    res.status(500).json({ message: 'Internal server error' });
    
  }
};


export const updateProfile = async (req, res) => {
  try {
    const { profilePic } = req.body;
    const userId = req.user._id;

    if (!profilePic) {
      return res.status(400).json({ message: "Profile pic is required" });
    }

    const uploadResponse = await cloudinary.uploader.upload(profilePic);
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { profilePic: uploadResponse.secure_url },
      { new: true }
    );

    res.status(200).json(updatedUser);
  } catch (error) {
    console.log("error in update profile:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const checkAuth = (req, res) => {
  try {
    res.status(200).json(req.user);
  } catch (error) {
    console.log("Error in checkAuth controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};