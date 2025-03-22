const jwt = require("jsonwebtoken");
const {User } = require("../model/user.model");
require("dotenv").config();
const SECRET_KEY = process.env.SECRET_KEY;



const requireAuth = (req, res, next) => {
    let token = req.cookies.jwt || req.header("Authorization")?.split(" ")[1];
    
    try {
        if(token){
            jwt.verify(token, SECRET_KEY, async (err, decoded) => {
                if (err) {
                    res.status(401).json({ message: "Unauthorized: Invalid token" },redirectUrl="/api/user/login");
                } else {
                         // Fetch the user from the database to include username
                        const user = await User.findById(decoded.id).select("username");

                        if (!user) {
                            return res.status(401).json({ message: "Unauthorized: User not found" });
                        }

                        // Attach user data (id & username) to `req.user`
                         req.user = { id: decoded.id, username: user.username };



                    // req.user = decoded; // Store user data in request
                    // console.log(req.user);
                    next(); // Allow access to the route
                }
            });

        }
        else{
            res.json({message:"u dont have token"},redirectUrl="/api/user/login");
            
        }

    } catch (error) {
        res.status(401).json({ message: "Unauthorized: Invalid token" });
    }
};

module.exports = { requireAuth };