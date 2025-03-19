let express = require('express');
let router = express.Router();


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



// Protected routes
router.get("/dashboard", requireAuth, (req, res) => {
    res.json({ message: "Welcome to the dashboard", user: req.user });
    res.cookie();
});






module.exports = router;