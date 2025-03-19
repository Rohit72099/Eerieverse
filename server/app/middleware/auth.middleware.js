const jwt = require("jsonwebtoken");
require("dotenv").config();
const SECRET_KEY = process.env.SECRET_KEY;



const requireAuth = (req, res, next) => {
    let token = req.cookies.jwt || req.header("Authorization")?.split(" ")[1];
    
    try {
        if(token){
            jwt.verify(token, SECRET_KEY, (err, decoded) => {
                if (err) {
                    res.status(401).json({ message: "Unauthorized: Invalid token" });
                } else {
                    req.user = decoded; // Store user data in request
                    next(); // Allow access to the route
                }
            });

        }
        else{
            res.json({message:"u dont have token"});
            
        }

    } catch (error) {
        res.status(401).json({ message: "Unauthorized: Invalid token" });
    }
};

module.exports = { requireAuth };