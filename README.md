# 💬 Nexchat — Real-time MERN Chat Application

A full-stack real-time chat app built with MongoDB, Express, React, Node.js and Socket.io.

## Features
- User registration & login with JWT authentication
- Create and browse chat rooms
- Real-time messaging with Socket.io
- Typing indicators ("Parthib is typing…")
- Chat history loaded from MongoDB
- Online user tracking
- Clean dark UI

## Tech Stack
- **Frontend:** React, React Router, Socket.io Client, Axios, Vite
- **Backend:** Node.js, Express, Socket.io, JWT, bcryptjs
- **Database:** MongoDB (Mongoose)

---

## Setup Instructions

### 1. Clone / unzip the project

### 2. Backend Setup
```bash
cd backend
npm install
cp .env.example .env
# Edit .env and add your MongoDB URI and a JWT secret
npm run dev
```

### 3. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

The app will be live at **http://localhost:5173**

---

## MongoDB Setup (Free)
1. Go to [mongodb.com/atlas](https://mongodb.com/atlas) and create a free account
2. Create a free cluster
3. Click "Connect" → "Connect your application"
4. Copy the connection string and paste it into `backend/.env` as `MONGO_URI`
5. Replace `<username>` and `<password>` with your DB credentials

---

## Deployment

### Backend → Render (free)
1. Push your code to GitHub
2. Go to [render.com](https://render.com) → New Web Service
3. Connect your GitHub repo, set root directory to `backend`
4. Add environment variables (MONGO_URI, JWT_SECRET, CLIENT_URL)
5. Deploy!

### Frontend → Vercel (free)
1. Go to [vercel.com](https://vercel.com) → Import Project
2. Connect your GitHub repo, set root directory to `frontend`
3. Add environment variable: `VITE_API_URL=https://your-render-url.onrender.com`
4. Deploy!

---

## Project Structure
```
chatapp/
├── backend/
│   ├── server.js          # Express + Socket.io server
│   ├── models/
│   │   ├── User.js        # User schema
│   │   ├── Room.js        # Chat room schema
│   │   └── Message.js     # Message schema
│   ├── routes/
│   │   ├── auth.js        # Register, Login, /me
│   │   ├── rooms.js       # CRUD for rooms
│   │   └── messages.js    # Fetch chat history
│   └── middleware/
│       └── auth.js        # JWT verification
└── frontend/
    └── src/
        ├── App.jsx
        ├── socket.js          # Socket.io singleton
        ├── context/
        │   └── AuthContext.jsx # Global auth state
        └── pages/
            ├── Login.jsx
            ├── Register.jsx
            ├── Rooms.jsx      # Room list + create
            └── Chat.jsx       # Real-time chat window
```

---

Built by Parthib Ghosh
