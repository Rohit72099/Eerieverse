# 📚 EerieVerse – Social Storytelling Platform

> ✨ A full-stack MERN web app where writers can share their stories, readers can interact, like, comment, and follow their favorite authors — a creative social network for storytelling.

---

## 🌐 Live Demo

🚀 **Frontend:** [https://eerieverse-vqsx.vercel.app](https://eerieverse-vqsx.vercel.app)  
⚙️ **Backend API:** [https://eerieverse.vercel.app](https://eerieverse.vercel.app)  

---

## 🧠 Overview

**EerieVerse** is a modern storytelling social media platform built using the **MERN stack** (MongoDB, Express.js, React, Node.js).  
It allows users to:
- 🧑‍💻 Create an account & log in securely with JWT cookies  
- ✍️ Write and publish stories  
- ❤️ Like, comment, and save favorite stories  
- 🔄 Follow authors and view personalized feeds  
- 🔍 Explore stories & authors using smart search  

---

## 🧩 Tech Stack

| Layer | Technology |
|--------|-------------|
| **Frontend** | React + Vite, TypeScript, Axios, Lucide Icons, TailwindCSS |
| **Backend** | Node.js, Express.js, Mongoose |
| **Database** | MongoDB Atlas |
| **Authentication** | JWT + HttpOnly Cookies + bcrypt |
| **Deployment** | Vercel (Frontend & Backend) |
| **Dev Tools** | ESLint, Prettier, VS Code |

---

## 🏗️ System Architecture

```
📦 EerieVerse
├── eerie-ink-reimagined/      # Frontend (Vite + React)
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── lib/api.ts         # Axios API configuration
│   │   └── hooks/
│   └── vite.config.js
│
├── server/                    # Backend (Express)
│   ├── app/
│   │   ├── routes/
│   │   ├── controllers/
│   │   └── models/
│   ├── index.js               # Main server entry
│   ├── auth.middleware.js
│   └── vercel.json
│
└── README.md
```

---

## 🔐 Authentication Flow

- Passwords are hashed using **bcrypt** before saving to MongoDB.  
- On login, the backend issues a **JWT token** stored in a **HttpOnly cookie** (`jwt`).  
- Authenticated routes (like `like`, `save`, `follow`) use middleware to verify JWTs.  
- Secure CORS policy + `sameSite: none` + `secure: true` ensures cross-domain cookie safety on Vercel.

---

## ⚙️ Setup Instructions

### 1️⃣ Clone the repository
```bash
git clone https://github.com/Rohit72099/Eerieverse.git
cd Eerieverse
```

---

### 2️⃣ Backend Setup
```bash
cd server
npm install
```

Create a `.env` file in the `server` folder:
```bash
MONGO_URI=your_mongodb_connection_string
SECRET_KEY=your_jwt_secret
CLIENT_URL=http://localhost:5173   # or your deployed frontend URL
PORT=5000
NODE_ENV=development
```

Run backend locally:
```bash
npm start
```
✅ Server runs on `http://localhost:5000`

---

### 3️⃣ Frontend Setup
```bash
cd ../eerie-ink-reimagined
npm install
```

Create `.env` file:
```bash
VITE_API_URL=http://localhost:5000
```

Run frontend:
```bash
npm run dev
```
✅ Frontend runs on `http://localhost:5173`

---

## 🚀 Deployment on Vercel

### 🧱 Backend
- Root Directory: `server`
- Build Command: `None`
- Output Directory: `N/A`
- Environment Variables:
  ```
  MONGO_URI=your_mongo_uri
  SECRET_KEY=your_jwt_secret
  CLIENT_URL=https://eerieverse-vqsx.vercel.app
  NODE_ENV=production
  ```

### 💻 Frontend
- Root Directory: `eerie-ink-reimagined`
- Build Command: `vite build`
- Output Directory: `dist`
- Environment Variable:
  ```
  VITE_API_URL=https://eerieverse.vercel.app
  ```

---

## ✨ Key Features

| Feature | Description |
|----------|-------------|
| 🔐 Authentication | Secure JWT-based login with HttpOnly cookies |
| ✍️ Story Publishing | Create, edit, and share stories |
| ❤️ Likes & Comments | Real-time engagement features |
| 🧑‍🤝‍🧑 Follow System | Follow other users and view their stories |
| 💾 Save Stories | Save stories for later reading |
| 🔎 Search | Full-text search on stories & users |
| 🎨 UI | Clean, responsive UI with TailwindCSS and Lucide icons |
| ☁️ Cloud Deployed | Fully deployed on Vercel (Frontend + Backend) |

---

## 📸 Screenshots

| Home Page | Story Page |
|------------|-------------|
| ![Home](https://via.placeholder.com/800x400?text=Home+Page) | ![Story](https://via.placeholder.com/800x400?text=Story+Page) |

*(Replace these with your actual screenshots from `/public` or captured from your live site.)*

---

## 🧠 Lessons Learned
- Secure cookie-based authentication across Vercel subdomains.
- Handling CORS + credentials for MERN deployments.
- Structuring reusable Axios API layers.
- Managing environment variables for frontend + backend separately.
- Designing scalable user and story schemas in MongoDB.

---

## 🤝 Contributing
Contributions are always welcome!

1. Fork the repository  
2. Create a new branch  
   ```bash
   git checkout -b feature/your-feature-name
   ```
3. Commit changes  
   ```bash
   git commit -m "Add your feature"
   ```
4. Push to branch and open a Pull Request

---

## 🧩 Future Improvements
- 🗨️ Real-time comments (Socket.io)
- 🖼️ Story cover images upload (Cloudinary)
- 🧾 Pagination & infinite scroll
- 🌓 Dark/Light theme toggle
- 📱 Progressive Web App (PWA) support

---

## 🧑‍💻 Author

👤 **Rohit Kumar**  
📧 [rohit72099@gmail.com](mailto:rohit72099@gmail.com)  
🌐 [LinkedIn](https://www.linkedin.com/in/rohit72099) | [GitHub](https://github.com/Rohit72099)

---

## 🪄 License
This project is licensed under the **MIT License** – you’re free to use, modify, and distribute it.

---

## ⭐ Support
If you find this project helpful, please consider giving it a ⭐ on GitHub — it helps others discover it and keeps me motivated to improve it!
