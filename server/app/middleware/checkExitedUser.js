let mongoose = require('mongoose');
let { User } = require('../model/user.model');

let checkExitedUser = async (req,res,next) => {
    let { email } = req.body;
    let user = await User.findOne({email: email});
    if(user){
        return res.status(400).json({message: 'User already existed'});
    }   
    
    next();
}


module.exports = { checkExitedUser };
