📱💬 Chat App (React Native + Node.js + MongoDB)

A real-time 1:1 chat app built with:

Backend: Node.js (Express, Socket.IO, JWT Auth, MongoDB Atlas via Mongoose)

Frontend (mobile): React Native (Expo + React Navigation + Socket.IO client)

Database: MongoDB Atlas

🚀 Features

JWT-based authentication (register/login)

User list with online/offline status

Start conversation (creates if not exists)

Real-time messaging with Socket.IO

Message persistence (MongoDB)

Delivery/read receipts ✅

Typing indicators ✍️

Clean React Native UI

📂 Project Structure
chat-app/
├── server/              # Node.js backend
│   ├── controllers/     # route handlers
│   ├── models/          # mongoose schemas
│   ├── routes/          # express routers
│   ├── utils/           # auth middleware, helpers
│   ├── server.js        # entry point
│   └── .env             # backend env variables
│
└── mobile/ChatApp/      # React Native frontend (Expo)
    ├── app/             # screens (login, register, home, chat/[id].js)
    ├── src/api/         # axios + socket helpers
    ├── src/utils/       # auth helpers
    └── app.json         # expo config

🛠️ Setup
1. Clone the repo
git clone <your-repo-url> chat-app
cd chat-app

2. Backend (server)
cd server
npm install


Create a .env file in server/:

PORT=5000
MONGO_URI=mongodb+srv://<your-atlas-user>:<your-password>@<cluster-url>/<db-name>?retryWrites=true&w=majority
JWT_SECRET=jwtsecret123
CLIENT_URL=http://localhost:19006   # or Expo LAN URL


Run backend:

npm run dev


If successful:

Server running on port 5000
MongoDB connected ✅

3. Database (MongoDB Atlas)

Create an Atlas cluster

Whitelist your IP (or 0.0.0.0/0 for dev)

Create a Database User (username + password)

Copy your connection string into .env → MONGO_URI

4. Frontend (mobile)
cd ../mobile/ChatApp
npm install


Edit src/api/api.js → replace API_BASE with your IPv4 LAN and port:

export const API_BASE = 'http://192.168.1.100:5000';


Start Expo:

npm run start


Scan the QR with Expo Go app (Android/iOS).

Or press a to open Android emulator.

🔑 Sample Users

If you want to seed quickly:

[
  { "name": "Lohith", "email": "lohith@example.com", "password": "mypassword123" },
  { "name": "Test User", "email": "test@example.com", "password": "123456" }
]


Register via Thunder Client/Postman:

POST http://<IP>:5000/auth/register
{
  "name": "Lohith",
  "email": "lohith@example.com",
  "password": "mypassword123"
}

▶️ Run Flow

Start backend:

cd server && npm run dev


Start frontend:

cd mobile/ChatApp && npm run start
Register a user → Login → See users list → Start a chat → Send/receive live messages.