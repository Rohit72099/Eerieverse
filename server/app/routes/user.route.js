let express = require('express');
let router = express.Router();
let { Story } = require('../model/story.model');
let { User } = require('../model/user.model');



const { registerUser, loginUser, logoutUser} = require('../controller/user.controller');
const { checkExitedUser } = require('../middleware/checkExitedUser');
const { requireAuth } = require('../middleware/auth.middleware');
const { createStory, userSpecificStory, likeStory, unlikeStory} = require('../controller/story.controller');




function getTimeSince(date) {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    const intervals = [
      { label: 'year', seconds: 31536000 },
      { label: 'month', seconds: 2592000 },
      { label: 'week', seconds: 604800 },
      { label: 'day', seconds: 86400 },
      { label: 'hour', seconds: 3600 },
      { label: 'minute', seconds: 60 },
      { label: 'second', seconds: 1 }
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
  



// user routes
router.post('/register',checkExitedUser, registerUser);
router.post('/login', loginUser);
router.post('/logout',requireAuth,logoutUser);

//protected routes
//story route
router.post('/save-story',requireAuth,createStory);
// router.get('/get-all-story',requireAuth,getAllStory);
router.get('/user-story',requireAuth,userSpecificStory);


router.put('/:id/like', requireAuth, likeStory);
router.put('/:id/unlike', requireAuth, unlikeStory);



// UnProtected routes
router.get('/dashboard', (req, res) => {
    res.render('dashboard', { user: req.user });
});

router.get("/register", (req, res) => {
    res.render("register" ,{ error: null }); // Shows the registration form
});

router.get("/login", (req, res) => {
    res.render("login", { error: null }); // Shows the login form
});

//protected routes
router.get("/userhome" ,requireAuth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id); // Fetch user from DB
    
        if (!user) {
            return res.redirect('/api/user/login'); // Redirect if user not found
        }
        // const stories = await Story.find().sort({ createdAt: -1 }).limit(10);
        const stories = await Story.find()
            .sort({ createdAt: -1 })
            .limit(10)
            .populate({
                path: 'writer',
                select: '+username name email'
              });

        console.log(stories);
        res.render('userhome', { user, stories, getTimeSince }); // Pass user object to EJS
    } catch (error) {
        console.error(error);
        res.status(500).send("Server error");
    }
});

router.get('/proceed-to-post',requireAuth,(req,res)=>{
    res.render('postStory');
})
    






module.exports = router;