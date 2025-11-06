# 🚀 Chat Quick Start Guide

## Prerequisites

- Docker & Docker Compose installed
- Node.js 22+ installed
- PostgreSQL running OR use Docker Compose

---

## Quick Start (3 Steps)

### **Step 1: Database Migration**

```bash
cd packages/backend

# Generate Prisma client (creates Room & Message models)
npx prisma generate

# Run migration
npx prisma migrate dev --name add-chat-models
```

This creates:
- `Room` table (chat rooms)
- `Message` table (with sequence IDs)

### **Step 2: Start Services**

**Option A: Docker Compose (Recommended)**
```bash
# Start Redis + PostgreSQL + 2 Backend Instances
docker-compose -f docker-compose.chat.yml up -d

# View logs
docker-compose -f docker-compose.chat.yml logs -f
```

**Option B: Manual (Single Instance)**
```bash
# Start Redis
docker run -d -p 6379:6379 redis:7-alpine

# Start backend
cd packages/backend
npm run dev
```

### **Step 3: Test WebSocket**

Install wscat:
```bash
npm install -g wscat
```

**Get JWT Token:**
```bash
# Login first
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "otp": "123456"
  }'

# Save the accessToken
```

**Connect to WebSocket:**
```bash
wscat -c "ws://localhost:3000/ws?token=YOUR_JWT_TOKEN"
```

**Send Messages:**
```json
# Join a room
> {"type":"joinRoom","payload":{"targetUserId":"another_user_id"}}

# Send message
> {"type":"sendMessage","payload":{"roomId":"room_id_from_response","content":"Hello!"}}

# Start typing
> {"type":"typing","payload":{"roomId":"room_id","isTyping":true}}
```

---

## Test Multi-Instance

### **Terminal 1: Start 2 instances**
```bash
docker-compose -f docker-compose.chat.yml up
```

### **Terminal 2: Client A (connects to Instance 1)**
```bash
wscat -c "ws://localhost:3000/ws?token=TOKEN_USER_A"
> {"type":"joinRoom","payload":{"targetUserId":"user_b"}}
> {"type":"sendMessage","payload":{"roomId":"shared_room_id","content":"From Instance 1"}}
```

### **Terminal 3: Client B (connects to Instance 2)**
```bash
wscat -c "ws://localhost:3001/ws?token=TOKEN_USER_B"
> {"type":"joinRoom","payload":{"targetUserId":"user_a"}}
# Should receive message from Client A! 🎉
```

**How it works:**
- Client A → Backend Instance 1 → Redis Pub → All Instances → Client B
- Messages broadcast across instances via Redis

---

## REST API Examples

```bash
# Get your chat rooms
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:3000/api/v1/chat/rooms

# Get messages
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:3000/api/v1/chat/rooms/ROOM_ID/messages

# Get unread count
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:3000/api/v1/chat/rooms/ROOM_ID/unread

# Create direct chat
curl -X POST \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"targetUserId":"user_456"}' \
  http://localhost:3000/api/v1/chat/direct
```

---

## Troubleshooting

### **"Connection refused"**
- Make sure backend is running: `npm run dev`
- Check Redis is running: `docker ps | grep redis`

### **"Invalid token"**
- Get fresh JWT token from login endpoint
- Token format: `ws://localhost:3000/ws?token=eyJhbG...`

### **Messages not received**
- Check both clients joined same room
- Verify `roomId` matches
- Check Redis connection in logs

### **Database errors**
- Run `npx prisma generate`
- Run `npx prisma migrate dev`
- Check `DATABASE_URL` in `.env`

---

## Environment Variables

```env
# .env in packages/backend
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/livevideo
REDIS_HOST=localhost
REDIS_PORT=6379
JWT_SECRET=your-secret
PORT=3000
```

---

## What's Next?

1. ✅ Chat works? → Test with 2+ users
2. ✅ Multi-instance works? → Add load balancer
3. ✅ Ready for mobile? → Connect React Native WebSocket
4. ✅ Production? → Use AWS ElastiCache for Redis

---

**Need Help?** See `MILESTONE_3_CHAT_COMPLETE.md` for full documentation.
