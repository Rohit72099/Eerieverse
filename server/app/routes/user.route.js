let express = require('express');
let router = express.Router();

const { registerUser, loginUser} = require('../controller/user.controller');
const { checkExitedUser } = require('../middleware/checkExitedUser');









router.post('/register',checkExitedUser, registerUser);
router.post('/login', loginUser);








module.exports = router;