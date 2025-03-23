let  express = require('express')
let mongoose = require('mongoose');
const router = require('./app/routes/user.route');
const path = require('path');

let cors = require('cors');
let cookieParser = require('cookie-parser');

require('dotenv').config();
let app = express();


app.use(cookieParser());
app.use(express.urlencoded({extended:true}));
app.use(express.json());
app.use(cors());
app.use(express.static(path.join(__dirname, 'public')));



app.set('views', path.join(__dirname, 'app', 'views'));
app.set('view engine', 'ejs');

//import routes
app.use('/api/user',router);




//http://localhost:8000/api/user/register
//http://localhost:8000/api/user/login



//connect to MongoDB   
mongoose.connect(process.env.DBURL).then(() => {
    console.log('Connected to MongoDB');
    app.listen(process.env.PORT || 3000, () => {
        console.log("Server is running on port "+process.env.PORT);
    });
});