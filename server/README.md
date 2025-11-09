# 👻 EerieVerse - Horror Story Reading Platform

EerieVerse is a horror-themed story reading platform where users can explore, like, and comment on stories from genres such as horror, mystery, and fantasy. Designed with a hauntingly elegant UI and built using modern web technologies, EerieVerse delivers a smooth and immersive reading experience.

## 🌐 Live Demo

https://eerieverse2.vercel.app/

## 🧰 Tech Stack

### 🖥 Frontend
- HTML5
- CSS3
- JavaScript (ES6+)
- Bootstrap 5
- EJS (Embedded JavaScript Templating)

### 🧪 Backend
- Node.js
- Express.js
- MongoDB (Mongoose)
- JWT (JSON Web Tokens) for Authentication
- Helmet.js + CSP headers for Security

### ⚙️ DevOps
- Git & GitHub
- Docker
- GitHub Actions (CI/CD pipeline)

---

## 📦 Features

### 🧑‍💻 Authentication & User
- Register and Login with secure password hashing
- Session-based login using JWT
- Profile page for user information and issued stories

### 📚 Stories
- Browse stories by categories: Horror, Mystery, Fantasy
- Like & Unlike system on story cards
- Commenting system with timestamp

### 🔍 Search
- Real-time story search functionality

### 🔐 Security
- Secured with HTTP headers using Helmet.js
- CSP (Content Security Policy) to prevent XSS & injection attacks

### 🚀 CI/CD + Docker
- Dockerized for easy containerization
- GitHub Actions for automated build and deployment

---

## 🚀 Getting Started (Local Development)

```bash
# Clone the repository
git clone https://github.com/Rohit72099/eerieverse.git

# Go into the project directory
cd eerieverse

# Install dependencies
npm install

# Run the server
npm start
