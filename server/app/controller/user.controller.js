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
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const { sendVerificationEmail, sendPasswordResetEmail } = require('../mail.service');
require('dotenv').config();

const SECRET_KEY = process.env.SECRET_KEY;

const verificationTokenLifetime = 24 * 60 * 60 * 1000;
const passwordResetTokenLifetime = 60 * 60 * 1000;

const createOneTimeToken = () => crypto.randomBytes(32).toString('hex');
const hashToken = (token) => crypto.createHash('sha256').update(token).digest('hex');

const setAuthCookie = (res, token) => {
  const isProduction = process.env.NODE_ENV === 'production';

  res.cookie('jwt', token, {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'none' : 'lax',
    maxAge: 24 * 60 * 60 * 1000,
  });
};

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

    const verificationToken = createOneTimeToken();
    const user = await User.create({
      name,
      username,
      email: email.toLowerCase().trim(),
      password,
      role,
      isEmailVerified: false,
      emailVerificationTokenHash: hashToken(verificationToken),
      emailVerificationExpires: new Date(Date.now() + verificationTokenLifetime),
    });

    try {
      await sendVerificationEmail(user.email, verificationToken);
    } catch (emailError) {
      // Do not leave an account that cannot receive a verification link.
      await User.deleteOne({ _id: user._id });
      throw emailError;
    }

    res.status(201).json({
      message: 'Account created. Check your email to verify your account.',
      email: user.email,
      verificationEmailSent: true,
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

    const userFind = await User.findOne({ email: email.toLowerCase().trim() }).select('+password');
    if (!userFind) {
      return res.status(404).json({ message: "User not registered" });
    }

    const isMatch = await bcrypt.compare(password, userFind.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid password" });
    }

    if (!userFind.isEmailVerified) {
      return res.status(403).json({
        message: 'Verify your email address before signing in.',
        requiresEmailVerification: true,
        email: userFind.email,
      });
    }

    const token = createToken(userFind._id);
    setAuthCookie(res, token);

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

// Verify a one-time email verification token.
const verifyEmail = async (req, res) => {
  try {
    const { token } = req.body;
    if (!token) {
      return res.status(400).json({ message: 'Verification token is required.' });
    }

    const user = await User.findOne({
      emailVerificationTokenHash: hashToken(token),
      emailVerificationExpires: { $gt: new Date() },
    });

    if (!user) {
      return res.status(400).json({ message: 'This verification link is invalid or has expired.' });
    }

    user.isEmailVerified = true;
    user.emailVerificationTokenHash = undefined;
    user.emailVerificationExpires = undefined;
    await user.save();

    res.status(200).json({ message: 'Email verified. You can now sign in.' });
  } catch (error) {
    console.error('Email verification error:', error);
    res.status(500).json({ message: 'Unable to verify email. Please try again.' });
  }
};

// Send a new verification message without revealing whether the account exists.
const resendVerificationEmail = async (req, res) => {
  try {
    const email = req.body.email?.toLowerCase().trim();
    const response = { message: 'If that account needs verification, a new email has been sent.' };

    if (!email) {
      return res.status(400).json({ message: 'Email is required.' });
    }

    const user = await User.findOne({ email });
    if (!user || user.isEmailVerified) {
      return res.status(200).json(response);
    }

    const verificationToken = createOneTimeToken();
    user.emailVerificationTokenHash = hashToken(verificationToken);
    user.emailVerificationExpires = new Date(Date.now() + verificationTokenLifetime);
    await user.save();
    await sendVerificationEmail(user.email, verificationToken);

    res.status(200).json(response);
  } catch (error) {
    console.error('Resend verification error:', error);
    res.status(503).json({ message: 'Unable to send verification email. Please try again later.' });
  }
};

// Start password recovery. The response is deliberately identical for unknown emails.
const requestPasswordReset = async (req, res) => {
  try {
    const email = req.body.email?.toLowerCase().trim();
    const response = { message: 'If an account exists for that email, a password reset link has been sent.' };

    if (!email) {
      return res.status(400).json({ message: 'Email is required.' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(200).json(response);
    }

    const resetToken = createOneTimeToken();
    user.passwordResetTokenHash = hashToken(resetToken);
    user.passwordResetExpires = new Date(Date.now() + passwordResetTokenLifetime);
    await user.save();

    try {
      await sendPasswordResetEmail(user.email, resetToken);
    } catch (emailError) {
      user.passwordResetTokenHash = undefined;
      user.passwordResetExpires = undefined;
      await user.save();
      throw emailError;
    }

    res.status(200).json(response);
  } catch (error) {
    console.error('Password reset request error:', error);
    res.status(503).json({ message: 'Unable to send password reset email. Please try again later.' });
  }
};

// Consume a valid reset token and update the password. The schema hashes it before saving.
const resetPassword = async (req, res) => {
  try {
    const { token, password } = req.body;
    if (!token || !password) {
      return res.status(400).json({ message: 'Token and password are required.' });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters.' });
    }

    const user = await User.findOne({
      passwordResetTokenHash: hashToken(token),
      passwordResetExpires: { $gt: new Date() },
    }).select('+password');

    if (!user) {
      return res.status(400).json({ message: 'This password reset link is invalid or has expired.' });
    }

    user.password = password;
    user.passwordResetTokenHash = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    res.status(200).json({ message: 'Password updated. You can now sign in.' });
  } catch (error) {
    console.error('Password reset error:', error);
    res.status(500).json({ message: 'Unable to reset password. Please try again.' });
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
  verifyEmail,
  resendVerificationEmail,
  requestPasswordReset,
  resetPassword,
  createToken,
  followUser,
  unfollowUser,
  getUserProfile,
  getFollowers,
  getFollowing,
  searchUsers
};
