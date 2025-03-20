let mongoose = require('mongoose');
let { User }= require('../model/user.model');
let jwt = require('jsonwebtoken');
let bcrypt = require('bcrypt');

require('dotenv').config();

const SECRET_KEY = process.env.SECRET_KEY;

let createToken = (id) => {
    return jwt.sign({ id },SECRET_KEY, {
        expiresIn: 86400 // 24 hours
    });
}



let registerUser =async (req,res)=>{
    let{name,username, email, password, role}=req.body;
    // console.log(req.body);
    let user =new User({
        name,
        username,
        email,
        password,
        role
    });
    await user.save().then((user)=>{
        let token = createToken(user._id);
        // console.log(token);
        res.cookie('jwt', token, { httpOnly: true, maxAge: 86400000 });
        res.status(201).json({message: "User registered successfully"});
        res.redirect('/api/user/login');
    }).catch((error)=>{
        res.status(500).json({message: error.message});
    });

}



let loginUser = async (req, res) => {
    let { email, password } = req.body;
    try{
        let userFind = await User.findOne({ email: email }).select('+password');

        if (!userFind) {
            return res.status(404).json({ message: "User not registered" });
        }
        
        // Compare hashed password
        const isMatch = await bcrypt.compare(password, userFind.password);
        if (!isMatch) {
            return res.status(401).json({ message: "Invalid password" });
        }
        
        // console.log(userFind); 
        let token = createToken(userFind._id);
        // console.log(token);
       return res.cookie('jwt', token, { httpOnly: true, maxAge: 86400000 })  
        .status(200).json({ message: "User logged in" ,redirectUrl: "/api/user/userhome"});
    }
    catch(error){
        res.status(500).json({message: error.message});
    }
   

};

const logoutUser = (req,res)=>{
    //code for logout
    try{
        res.cookie('jwt', '', { maxAge: 1 });
        res.status(200).redirect('/api/user/dashboard');

    }catch(error){
        res.status(501).json({message:"Error in logging out"}); 
        console.log(error);
    }
}







module.exports = { registerUser,loginUser, createToken,logoutUser};

