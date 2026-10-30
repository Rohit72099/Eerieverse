let  express = require('express')
let mongoose = require('mongoose');
const router = require('./app/routes/user.route');
const path = require('path');

let cors = require('cors');
let cookieParser = require('cookie-parser');

require('dotenv').config();
let app = express();

// Vercel invokes the exported Express app as a serverless function.  Keep the
// database connection reusable across warm invocations instead of starting an
// HTTP server when this file is imported.
const databaseUrl = process.env.DBURL || process.env.MONGO_URI;
let databaseConnection;

function connectToDatabase() {
  if (mongoose.connection.readyState === 1) {
    return Promise.resolve();
  }

  if (!databaseUrl) {
    return Promise.reject(new Error('Missing DBURL (or MONGO_URI) environment variable.'));
  }

  if (!databaseConnection) {
    databaseConnection = mongoose.connect(databaseUrl)
      .then(() => {
        console.log('Connected to MongoDB');
      })
      .catch((error) => {
        // Allow a later request to retry if the initial connection failed.
        databaseConnection = undefined;
        throw error;
      });
  }

  return databaseConnection;
}

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

// app.use((req, res, next) => {
//   res.setHeader("Content-Security-Policy", 
//     "default-src 'self'; " +
//     "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.jsdelivr.net; " +
//     "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; " +
//     "font-src 'self' https://fonts.gstatic.com https://eerieverse2.vercel.app; " +
//     "img-src 'self' data:; " +
//     "connect-src 'self' http://localhost:8000 https://eerieverse2.vercel.app; " +
//     "object-src 'none';"
//   );
//   next();
// });


app.use((req, res, next) => {
  res.setHeader("Content-Security-Policy", 
    "default-src 'self'; " +
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.jsdelivr.net; " +
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; " +
    "font-src 'self' https://fonts.gstatic.com; " +
    "img-src 'self' data:; " +
    "connect-src 'self' https://eerieverse-vqsx.vercel.app https://eerieverse.vercel.app; " +
    "object-src 'none';"
  );
  next();
});


app.use(cookieParser());

app.use(express.urlencoded({extended:true}));
// app.use(cors());
// app.use(cors({
//   origin: process.env.CLIENT_URL,   // your frontend origin
//   credentials: true,                 // allow credentials (cookies, auth)
// }));


const allowedOrigins = [
  process.env.CLIENT_URL,
  "https://eerieverse-vqsx.vercel.app", // production frontend
  "https://eerieverse.vercel.app",
  "http://localhost:5173",              // Vite local dev
  "http://localhost:8080"
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
    methods: ['GET', 'HEAD', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    optionsSuccessStatus: 204,
  })
);

// Do this after CORS: preflight requests are answered immediately, even while
// the database is reconnecting.
app.use(async (req, res, next) => {
  try {
    await connectToDatabase();
    next();
  } catch (error) {
    console.error('MongoDB connection error:', error);
    res.status(503).json({ message: 'Database connection unavailable' });
  }
});


app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));



// app.set('views', path.join(__dirname, 'app', 'views'));
// app.set('view engine', 'ejs');



  


//import routes
app.use(router);




//http://localhost:8000/api/user/register
//http://localhost:8000/api/user/login



// Start an HTTP listener only when running this file directly (local Docker / npm
// start). Vercel imports this module and uses the exported Express app instead.
if (require.main === module) {
  connectToDatabase()
    .then(() => {
      const port = process.env.PORT || 3000;
      app.listen(port, () => {
        console.log(`Server is running on port ${port}`);
      });
    })
    .catch((error) => {
      console.error('Unable to start server:', error);
      process.exitCode = 1;
    });
}

module.exports = app;
