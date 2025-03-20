let express = require('express');
let router = express.Router();
let { Story } = require('../model/story.model');
let { User } = require('../model/user.model');



const { registerUser, loginUser, logoutUser} = require('../controller/user.controller');
const { checkExitedUser } = require('../middleware/checkExitedUser');
const { requireAuth } = require('../middleware/auth.middleware');
const { createStory, getAllStory, userSpecificStory, likeStory, unlikeStory} = require('../controller/story.controller');





// user routes
router.post('/register',checkExitedUser, registerUser);
router.post('/login', loginUser);
router.post('/logout',requireAuth,logoutUser);

//protected routes
//story route
router.post('/save-story',requireAuth,createStory);
router.get('/get-all-story',requireAuth,getAllStory);
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
router.get("/userhome",requireAuth ,async (req, res) => {
    try {
        const user = await User.findById(req.user.id); // Fetch user from DB
        if (!user) {
            return res.redirect('/api/user/login'); // Redirect if user not found
        }
        const stories = await Story.find().sort({ createdAt: -1 }).limit(10);
        res.render('userhome', { user, stories }); // Pass user object to EJS
    } catch (error) {
        console.error(error);
        res.status(500).send("Server error");
    }
});
    






module.exports = router;