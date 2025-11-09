// let express = require('express');
// let router = express.Router();
// let { Story } = require('../model/story.model');
// let { User } = require('../model/user.model');




// const { registerUser, loginUser, logoutUser} = require('../controller/user.controller');
// const { checkExitedUser } = require('../middleware/checkExitedUser');
// const { requireAuth } = require('../middleware/auth.middleware');
// const { createStory, userSpecificStory, likeStory, unlikeStory} = require('../controller/story.controller');




// function getTimeSince(date) {
//     const seconds = Math.floor((new Date() - new Date(date)) / 1000);
//     const intervals = [
//       { label: 'year', seconds: 31536000 },
//       { label: 'month', seconds: 2592000 },
//       { label: 'week', seconds: 604800 },
//       { label: 'day', seconds: 86400 },
//       { label: 'hour', seconds: 3600 },
//       { label: 'minute', seconds: 60 },
//       { label: 'second', seconds: 1 }
//     ];
//     for (let i = 0; i < intervals.length; i++) {
//       const interval = intervals[i];
//       const count = Math.floor(seconds / interval.seconds);
//       if (count > 0) {
//         return `${count} ${interval.label}${count !== 1 ? 's' : ''} ago`;
//       }
//     }
//     return 'just now';
//   }
  



// // user routes
// router.post('/register',checkExitedUser, registerUser);
// router.post('/login', loginUser);
// router.post('/logout',requireAuth,logoutUser);

// //protected routes
// //story route
// router.post('/save-story',requireAuth,createStory);
// // router.get('/get-all-story',requireAuth,getAllStory);
// router.get('/user-story',requireAuth,userSpecificStory);


// router.put('/:id/like', requireAuth, likeStory);
// router.put('/:id/unlike', requireAuth, unlikeStory);



// // UnProtected routes
// router.get('/', (req, res) => {
//     res.render('dashboard', { user: req.user });
// });

// router.get("/register", (req, res) => {
//     res.render("register" ,{ error: null }); // Shows the registration form
// });

// router.get("/login", (req, res) => {
//     res.render("login", { error: null }); // Shows the login form
// });

// //protected routes
// router.get("/userhome" ,requireAuth, async (req, res) => {
//     try {
//         const user = await User.findById(req.user.id); // Fetch user from DB
    
//         if (!user) {
//             return res.redirect('/login'); // Redirect if user not found
//         }
//         // const stories = await Story.find().sort({ createdAt: -1 }).limit(10);
//         const stories = await Story.find()
//             .sort({ createdAt: -1 })
//             .limit(10)
//             .populate({
//                 path: 'writer',
//                 select: '+username name email'
//               });

//         console.log(stories);
//         // res.render('userhome', { user, stories, getTimeSince }); // Pass user object to EJS
        
//     } catch (error) {
//         console.error(error);
//         res.status(500).send("Server error");
//     }
// });

// router.get('/proceed-to-post',requireAuth,(req,res)=>{
//     res.render('postStory');
// })
    






// module.exports = router;


// ------------------

const express = require('express');
const router = express.Router();
const { Story } = require('../model/story.model');
const { User } = require('../model/user.model');

// Controllers
const { registerUser, loginUser, logoutUser, followUser, unfollowUser, getUserProfile, getFollowers, getFollowing, searchUsers } = require('../controller/user.controller');
const { createStory, userSpecificStory, getAllStories, getStoryById, likeStory, unlikeStory, getLikedStories, saveStory, getSavedStories, getStoriesByUsername, searchStories } = require('../controller/story.controller');
const { createComment, getStoryComments, likeComment, dislikeComment, deleteComment } = require('../controller/comment.controller');

// Middlewares
const { checkExitedUser } = require('../middleware/checkExitedUser');
const { requireAuth, optionalAuth } = require('../middleware/auth.middleware');

/**
 * ✅ Utility: Returns human-readable "time ago"
 */
function getTimeSince(date) {
  const seconds = Math.floor((new Date() - new Date(date)) / 1000);
  const intervals = [
    { label: 'year', seconds: 31536000 },
    { label: 'month', seconds: 2592000 },
    { label: 'week', seconds: 604800 },
    { label: 'day', seconds: 86400 },
    { label: 'hour', seconds: 3600 },
    { label: 'minute', seconds: 60 },
    { label: 'second', seconds: 1 },
  ];
  for (let i = 0; i < intervals.length; i++) {
    const interval = intervals[i];
    const count = Math.floor(seconds / interval.seconds);
    if (count > 0) {
      return `${count} ${interval.label}${count !== 1 ? 's' : ''} ago`;
    }
  }
  return 'just now';
}

/* ============================
   ✅ AUTH ROUTES
============================ */

// Register new user
router.post('/register', checkExitedUser, registerUser);

// Login user
router.post('/login', loginUser);

// Logout user
router.post('/logout', requireAuth, logoutUser);

/* ============================
   ✅ STORY ROUTES
============================ */

// Create a new story (protected)
router.post('/save-story', requireAuth, createStory);

// Fetch all stories for logged-in user (protected)
router.get('/user-story', requireAuth, userSpecificStory);

// Fetch all published stories (public feed for homepage, optional auth to check if user liked)
router.get('/userhome', optionalAuth, getAllStories);

// Fetch a single story by ID (optional auth to check if user liked) - Must be before /:id/like
router.get('/story/:id', optionalAuth, getStoryById);

// Like / Unlike story (protected) - Must be after specific routes
router.put('/:id/like', requireAuth, likeStory);
router.put('/:id/unlike', requireAuth, unlikeStory);

// Save/Bookmark story (protected)
router.put('/:id/save', requireAuth, saveStory);

// Get user's liked stories (protected)
router.get('/liked-stories', requireAuth, getLikedStories);

// Get user's saved stories (protected)
router.get('/saved-stories', requireAuth, getSavedStories);

// Comment routes
// Get all comments for a story (public, optional auth to check if user liked/disliked)
router.get('/story/:storyId/comments', optionalAuth, getStoryComments);

// Create a comment (protected)
router.post('/story/:storyId/comment', requireAuth, createComment);

// Like a comment (protected)
router.put('/comment/:commentId/like', requireAuth, likeComment);

// Dislike a comment (protected)
router.put('/comment/:commentId/dislike', requireAuth, dislikeComment);

// Delete a comment (protected)
router.delete('/comment/:commentId', requireAuth, deleteComment);

/* ============================
   ✅ USER PROFILE ROUTES
============================ */

// Get user profile by username (optional auth to check if current user is following)
router.get('/user/:username', optionalAuth, getUserProfile);

// Follow a user (protected)
router.post('/user/:userId/follow', requireAuth, followUser);

// Unfollow a user (protected)
router.post('/user/:userId/unfollow', requireAuth, unfollowUser);

// Get followers list (public)
router.get('/user/:username/followers', getFollowers);

// Get following list (public)
router.get('/user/:username/following', getFollowing);

// Get stories by username (optional auth to check if user liked)
router.get('/user/:username/stories', optionalAuth, getStoriesByUsername);

/* ============================
   ✅ SEARCH ROUTES
============================ */

// Search stories (optional auth to check if user liked)
router.get('/search/stories', optionalAuth, searchStories);

// Search users (public)
router.get('/search/users', searchUsers);

module.exports = router;
