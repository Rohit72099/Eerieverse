// let mongoose = require('mongoose');
// let { User }= require('../model/user.model');
// let jwt = require('jsonwebtoken');
// let bcrypt = require('bcrypt');

// require('dotenv').config();

// const SECRET_KEY = process.env.SECRET_KEY;

// let createToken = (id) => {
//     return jwt.sign({ id },SECRET_KEY, {
//         expiresIn: 86400 // 24 hours
//     });
// }



// let registerUser =async (req,res)=>{
//     let{name,username, email, password, role}=req.body;
//     // console.log(req.body);
//     let user =new User({
//         name,
//         username,
//         email,
//         password,
//         role
//     });
//     await user.save().then((user)=>{
//         let token = createToken(user._id);
//         // console.log(token);
//         res.cookie('jwt', token, { httpOnly: true, maxAge: 86400000 });
//         // res.status(201).json({message: "User registered successfully"});
//         res.redirect('/login');
//     }).catch((error)=>{
//         res.status(500).json({message: error.message});
//     });

// }



// let loginUser = async (req, res) => {
//     let { email, password } = req.body;
//     try{
//         let userFind = await User.findOne({ email: email }).select('+password');

//         if (!userFind) {
//             return res.status(404).json({ message: "User not registered" });
//         }
        
//         // Compare hashed password
//         const isMatch = await bcrypt.compare(password, userFind.password);
//         if (!isMatch) {
//             return res.status(401).json({ message: "Invalid password" });
//         }
        
//         // console.log(userFind); 
//         let token = createToken(userFind._id);
//         // console.log(token);
//        return res.cookie('jwt', token, { httpOnly: true, maxAge: 86400000 })  
//         .status(200).json({ message: "User logged in" ,redirectUrl: "/userhome"});
//     }
//     catch(error){
//         res.status(500).json({message: error.message});
//     }
   

// };

// const logoutUser = (req,res)=>{
//     //code for logout
//     try{
//         res.cookie('jwt', '', { maxAge: 1 });
//         res.status(200).redirect('/');

//     }catch(error){
//         res.status(501).json({message:"Error in logging out"}); 
//         console.log(error);
//     }
// }







// module.exports = { registerUser,loginUser, createToken,logoutUser};

// -------------

const mongoose = require('mongoose');
const { User } = require('../model/user.model');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
require('dotenv').config();

const SECRET_KEY = process.env.SECRET_KEY;

// ✅ Create JWT Token
const createToken = (id) => {
  return jwt.sign({ id }, SECRET_KEY, { expiresIn: '1d' });
};

// ✅ Register User
const registerUser = async (req, res) => {
  try {
    const { name, username, email, password, role } = req.body;

    // Check if user already exists
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: "Email already registered" });
    }

    // Create new user
    const user = await User.create({ name, username, email, password, role });

    // Create JWT token
    const token = createToken(user._id);

    // Send token in HTTP-only cookie
    res.cookie('jwt', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 24 * 60 * 60 * 1000, // 1 day
    });

    // ✅ Return JSON (not redirect)
    res.status(201).json({
      message: "User registered successfully",
      user: {
        id: user._id,
        name: user.name,
        username: user.username,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ message: error.message });
  }
};

// ✅ Login User
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const userFind = await User.findOne({ email }).select('+password');
    if (!userFind) {
      return res.status(404).json({ message: "User not registered" });
    }

    const isMatch = await bcrypt.compare(password, userFind.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid password" });
    }

    const token = createToken(userFind._id);

    res.cookie('jwt', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 24 * 60 * 60 * 1000,
    });

    // ✅ Return JSON (React will handle redirect)
    res.status(200).json({
      message: "Login successful",
      user: {
        id: userFind._id,
        name: userFind.name,
        username: userFind.username,
        email: userFind.email,
        role: userFind.role,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Server error" });
  }
};


// ✅ Logout User
const logoutUser = (req, res) => {
  try {
    res.cookie('jwt', '', { maxAge: 1 });
    res.status(200).json({ message: "Logout successful" });
  } catch (error) {
    console.error("Logout error:", error);
    res.status(500).json({ message: "Error logging out" });
  }
};

// ✅ Follow User
const followUser = async (req, res) => {
  try {
    const { userId } = req.params; // User to follow
    const currentUserId = req.user.id; // Current logged-in user

    if (userId === currentUserId) {
      return res.status(400).json({ message: "You cannot follow yourself" });
    }

    const userToFollow = await User.findById(userId);
    const currentUser = await User.findById(currentUserId);

    if (!userToFollow || !currentUser) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if already following
    if (currentUser.following.includes(userId)) {
      return res.status(400).json({ message: "Already following this user" });
    }

    // Add to following and followers
    currentUser.following.push(userId);
    userToFollow.followers.push(currentUserId);

    await currentUser.save();
    await userToFollow.save();

    res.status(200).json({ 
      message: "Successfully followed user",
      following: currentUser.following.length,
      followers: userToFollow.followers.length
    });
  } catch (error) {
    console.error("Follow error:", error);
    res.status(500).json({ message: "Error following user" });
  }
};

// ✅ Unfollow User
const unfollowUser = async (req, res) => {
  try {
    const { userId } = req.params; // User to unfollow
    const currentUserId = req.user.id; // Current logged-in user

    if (userId === currentUserId) {
      return res.status(400).json({ message: "You cannot unfollow yourself" });
    }

    const userToUnfollow = await User.findById(userId);
    const currentUser = await User.findById(currentUserId);

    if (!userToUnfollow || !currentUser) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if following
    if (!currentUser.following.includes(userId)) {
      return res.status(400).json({ message: "Not following this user" });
    }

    // Remove from following and followers
    currentUser.following = currentUser.following.filter(
      id => id.toString() !== userId
    );
    userToUnfollow.followers = userToUnfollow.followers.filter(
      id => id.toString() !== currentUserId
    );

    await currentUser.save();
    await userToUnfollow.save();

    res.status(200).json({ 
      message: "Successfully unfollowed user",
      following: currentUser.following.length,
      followers: userToUnfollow.followers.length
    });
  } catch (error) {
    console.error("Unfollow error:", error);
    res.status(500).json({ message: "Error unfollowing user" });
  }
};

// ✅ Get User Profile by Username or ID
const getUserProfile = async (req, res) => {
  try {
    const { username } = req.params;
    const currentUserId = req.user?.id; // Optional: current user ID if authenticated

    const user = await User.findOne({ username })
      .select('-password -email')
      .populate('followers', 'username name')
      .populate('following', 'username name');

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if current user is following this user
    let isFollowing = false;
    if (currentUserId) {
      const currentUser = await User.findById(currentUserId);
      isFollowing = currentUser?.following.some(
        id => id.toString() === user._id.toString()
      ) || false;
    }

    res.status(200).json({
      user: {
        id: user._id,
        username: user.username,
        name: user.name,
        role: user.role,
        followers: user.followers,
        following: user.following,
        followersCount: user.followers.length,
        followingCount: user.following.length,
        isFollowing,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    console.error("Get profile error:", error);
    res.status(500).json({ message: "Error fetching user profile" });
  }
};

// ✅ Get Followers List
const getFollowers = async (req, res) => {
  try {
    const { username } = req.params;

    const user = await User.findOne({ username })
      .populate('followers', 'username name')
      .select('followers');

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      followers: user.followers,
      count: user.followers.length
    });
  } catch (error) {
    console.error("Get followers error:", error);
    res.status(500).json({ message: "Error fetching followers" });
  }
};

// ✅ Get Following List
const getFollowing = async (req, res) => {
  try {
    const { username } = req.params;

    const user = await User.findOne({ username })
      .populate('following', 'username name')
      .select('following');

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      following: user.following,
      count: user.following.length
    });
  } catch (error) {
    console.error("Get following error:", error);
    res.status(500).json({ message: "Error fetching following" });
  }
};

// ✅ Search Users
const searchUsers = async (req, res) => {
  try {
    const { q } = req.query; // Search query

    if (!q || q.trim().length === 0) {
      return res.status(400).json({ message: "Search query is required" });
    }

    // Search in username and name (case-insensitive)
    const searchRegex = new RegExp(q.trim(), 'i');
    
    const users = await User.find({
      $or: [
        { username: searchRegex },
        { name: searchRegex }
      ]
    })
      .select('-password -email')
      .limit(20) // Limit results
      .sort({ createdAt: -1 });

    res.json({
      message: "Users found successfully",
      users: users.map((user) => ({
        id: user._id,
        username: user.username,
        name: user.name,
        role: user.role,
        followersCount: user.followers ? user.followers.length : 0,
        followingCount: user.following ? user.following.length : 0,
        createdAt: user.createdAt
      })),
      count: users.length
    });
  } catch (error) {
    console.error("Error searching users:", error);
    res.status(500).json({ message: "Failed to search users" });
  }
};

module.exports = { 
  registerUser, 
  loginUser, 
  logoutUser, 
  createToken,
  followUser,
  unfollowUser,
  getUserProfile,
  getFollowers,
  getFollowing,
  searchUsers
};
