let express = require('express');
let router = express.Router();


const { registerUser, loginUser, logoutUser} = require('../controller/user.controller');
const { checkExitedUser } = require('../middleware/checkExitedUser');
const { requireAuth } = require('../middleware/auth.middleware');
const { createStory } = require('../controller/story.controller');





// user routes
router.post('/register',checkExitedUser, registerUser);
router.post('/login', loginUser);
router.post('/logout',requireAuth,logoutUser);

//protected routes
//story route
router.post('/save-story',requireAuth,createStory);
router.get('/get-All-story',requireAuth,);




// Protected routes
router.get("/dashboard", requireAuth, (req, res) => {
    res.json({ message: "Welcome to the dashboard", user: req.user });
    res.cookie();
});






module.exports = router;