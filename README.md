# 📱💬 ChatApp — React Native (Expo) + Node.js (Express + Socket.IO) + MongoDB

A minimal real-time 1:1 chat app with JWT auth, Socket.IO live messaging, message persistence, typing indicator, online/offline status, and delivery/read receipts.

---

## 📂 Project Structure

```
chat-app/
├── README.md
├── server/              # Backend (Node.js + Express + Socket.IO)
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   ├── utils/
│   ├── server.js
│   ├── package.json
│   └── .env
└── mobile/ChatApp/      # Frontend (Expo + React Native)
    ├── app/
    ├── src/
    │   ├── api/
    │   └── utils/
    ├── assets/
    ├── app.json
    └── package.json
```

---

## 🛠️ Prerequisites

- Node.js **>=18** (tested on v22)  
- npm **>=8**  
- MongoDB Atlas account (or local MongoDB)  
- Expo Go app (Android/iOS) or emulator  

---

## ⚙️ Environment Variables

Create `server/.env`:

```env
PORT=5000
MONGO_URI=mongodb+srv://<USER>:<PASS>@<CLUSTER>.mongodb.net/<DBNAME>?retryWrites=true&w=majority
JWT_SECRET=jwtsecret123
CLIENT_URL=http://localhost:19006   # or Expo LAN URL
```

➡️ In `mobile/ChatApp/src/api/api.js`, update:

```js
export const API_BASE = 'http://<YOUR_LAN_IP>:5000';
```

(replace `<YOUR_LAN_IP>` with your computer’s IPv4 address).

---

## 🚀 Setup & Run

### 1. Clone repo
```bash
git clone <your-repo-url> chat-app
cd chat-app
```

### 2. Backend (server)
```bash
cd server
npm install
npm run dev
```

Expected log:
```
Server running on port 5000
MongoDB connected ✅
```

### 3. Mobile (frontend)
```bash
cd ../mobile/ChatApp
npm install
npm run start
```

- Scan QR with Expo Go app  
- Or press `a` to open Android emulator  

---

## 🔑 Sample Users

You can register new users via the app or API.  
For testing, create users like:

```json
{
  "name": "Lohith",
  "email": "lohith@example.com",
  "password": "mypassword123"
}
```

---

## 📡 API Reference (REST)

**Auth**
- `POST /auth/register` → `{ name, email, password }`
- `POST /auth/login` → `{ email, password }`

**Users**
- `GET /users` (requires `Authorization: Bearer <token>`)

**Conversations**
- `POST /conversations` → `{ senderId, receiverId }`
- `GET /conversations/:id/messages`
- `POST /conversations/:id/messages` → `{ senderId, text }`

---

## 🔌 Socket.IO Events

- `message:send` → `{ conversationId, to, text }`  
- `message:new` → receive new message  
- `typing:start` / `typing:stop` → notify recipient  
- `message:delivered` → update ticks  
- `message:read` → update read receipts  
- `user:online` → broadcast online/offline status  

---

## 🧪 Testing with Thunder Client / curl

**Register**
```bash
curl -X POST http://<IP>:5000/auth/register  -H "Content-Type: application/json"  -d '{"name":"Alice","email":"alice@example.com","password":"mypassword123"}'
```

**Login**
```bash
curl -X POST http://<IP>:5000/auth/login  -H "Content-Type: application/json"  -d '{"email":"alice@example.com","password":"mypassword123"}'
```

**Create conversation**
```bash
curl -X POST http://<IP>:5000/conversations  -H "Authorization: Bearer <token>"  -H "Content-Type: application/json"  -d '{"senderId":"<user1Id>","receiverId":"<user2Id>"}'
```

---

## ⚠️ Common Issues

- **Invalid credentials** → Old users may have hashed passwords. Drop `users` collection in MongoDB and re-register.  
- **Cannot POST /conversations** → Check `routes/conversations.js` + controller exports.  
- **Expo error: missing icon** → Ensure `app.json` references real files in `assets/`.  
- **Socket not working** → Use `io(API_BASE, { auth: { token } })` and check IPv4.  

---

## ✅ Demo Flow

1. Register → Login  
2. View user list (online/offline status)  
3. Start chat → Send/receive messages in real-time  
4. See typing indicator, delivery/read ticks  

---

## 📄 License

MIT — use freely for learning and portfolio projects.  

---

## 🙏 Credits

- Backend: Node.js, Express, Socket.IO, Mongoose  
- Mobile: Expo (React Native), React Navigation  
- Database: MongoDB Atlas  
