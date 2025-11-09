let  express = require('express')
let mongoose = require('mongoose');
const router = require('./app/routes/user.route');
const path = require('path');

let cors = require('cors');
let cookieParser = require('cookie-parser');

require('dotenv').config();
let app = express();

// app.use((req, res, next) => {
//   res.setHeader("Content-Security-Policy", 
//     "default-src 'self'; " +
//     "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.jsdelivr.net; " +
//     "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; " +
//     "font-src 'self' https://fonts.gstatic.com https://eerieverse2.vercel.app; " +
//     "img-src 'self' data:; " +
//     "connect-src 'self' https://eerieverse2.vercel.app; " +
//     "object-src 'none';"
//   );
//   next();
// });

app.use((req, res, next) => {
  res.setHeader("Content-Security-Policy", 
    "default-src 'self'; " +
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.jsdelivr.net; " +
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; " +
    "font-src 'self' https://fonts.gstatic.com https://eerieverse2.vercel.app; " +
    "img-src 'self' data:; " +
    "connect-src 'self' http://localhost:8000 https://eerieverse2.vercel.app; " +
    "object-src 'none';"
  );
  next();
});


app.use(cookieParser());

app.use(express.urlencoded({extended:true}));
// app.use(cors());
app.use(cors({
  origin: "http://localhost:8080",   // your frontend origin
  credentials: true,                 // allow credentials (cookies, auth)
}));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));



// app.set('views', path.join(__dirname, 'app', 'views'));
// app.set('view engine', 'ejs');



  


//import routes
app.use(router);




//http://localhost:8000/api/user/register
//http://localhost:8000/api/user/login



//connect to MongoDB   
mongoose.connect(process.env.DBURL).then(() => {
    console.log('Connected to MongoDB');
    app.listen(process.env.PORT || 3000, () => {
        console.log("Server is running on port "+process.env.PORT);
    });
});