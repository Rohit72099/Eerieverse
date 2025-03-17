
let mongoose = require('mongoose');
let { User }= require('../model/user.model');

let registerUser =async (req,res)=>{
    let{name, email, password, role}=req.body;
    // console.log(req.body);
    let user =await new User({
        name,
        email,
        password,
        role
    });
    user.save().then((user)=>{
        res.status(201).json(user);
    }).catch((error)=>{
        res.status(500).json(error);
    });

}



let loginUser = async (req, res) => {
    let { email, password } = req.body;

    // Find user by email and password
    let userFind = await User.findOne({ email: email, password: password });

    if (!userFind) {
        return res.status(404).json({ message: "Invalid email or password" });
    }

    res.status(200).json({ message: "User logged in successfully" });
    // console.log(userFind);
};







module.exports = { registerUser,loginUser};

