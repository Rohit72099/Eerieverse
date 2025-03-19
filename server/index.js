let  express = require('express')
let mongoose = require('mongoose');
const router = require('./app/routes/user.route');

let cors = require('cors');
let cookieParser = require('cookie-parser');

require('dotenv').config();
let app = express();


app.use(cookieParser());
app.use(express.urlencoded({extended:true}));
app.use(express.json());
app.use(cors());

//import routes
app.use('/api/user',router);




//http://localhost:8000/api/user/register
//http://localhost:8000/api/user/login



//connect to MongoDB   
mongoose.connect(process.env.DBURL).then(() => {
    console.log('Connected to MongoDB');
    app.listen(process.env.PORT, () => {
        console.log("Server is running on port "+process.env.PORT);
    });
});