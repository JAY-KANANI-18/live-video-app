# Live Video Social App

[![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)](./VERSION)
[![Milestone](https://img.shields.io/badge/milestone-0%20complete-success.svg)](./MILESTONE_0_SUMMARY.md)
[![Node](https://img.shields.io/badge/node-%3E%3D22.0.0-brightgreen.svg)](https://nodejs.org/)
[![License](https://img.shields.io/badge/license-proprietary-red.svg)]()

A cross-platform social video & chat application similar to Mico or Bling, featuring 1-to-1 and party video calls, real-time chat, virtual currency system, and gamification.

> **📌 Current Version:** 1.0.0 | **Milestone 0:** ✅ Complete | **Last Updated:** 2025-11-06

## 🚀 Features

- **User & Host Profiles** - Comprehensive user profiles with host capabilities
- **Video Calls** - 1-to-1 and party video calls using ZegoCloud SDK
- **Real-time Chat** - WebSocket-based instant messaging
- **Virtual Currency** - Diamond system for gifts and rewards
- **Host Wallet** - Earnings tracking and withdrawal system
- **Agency Referral** - Multi-level referral system for agencies
- **Gamification** - Level and tier system with experience points
- **Party Games** - Interactive games like Ludo, Truth or Dare, Emoji race
- **Admin Panel** - Comprehensive management dashboard
- **Payment Integration** - Razorpay integration for payments
- **Secure KYC** - Host verification system

## 🏗️ Architecture

### Tech Stack

**Frontend:**
- React Native + NativeWind (Mobile)
- React + Vite + TailwindCSS (Admin Panel)

**Backend:**
- Node.js + Express + TypeScript
- Prisma ORM + PostgreSQL
- Redis for caching
- WebSocket (Socket.io) for real-time features

**Authentication:**
- Firebase Auth

**Video SDK:**
- ZegoCloud SDK

**Payments:**
- Razorpay

**Storage:**
- Firebase Storage / AWS S3

**Hosting:**
- Render (Backend)
- Docker + Docker Compose

## 📁 Project Structure

```
live-video-app/
├── packages/
│   ├── backend/          # Node.js API server
│   │   ├── src/
│   │   │   ├── config/   # Configuration files
│   │   │   ├── routes/   # API routes
│   │   │   ├── middleware/
│   │   │   └── index.ts
│   │   ├── prisma/
│   │   │   └── schema.prisma
│   │   ├── Dockerfile
│   │   └── package.json
│   ├── mobile/           # React Native app
│   │   ├── src/
│   │   ├── App.tsx
│   │   └── package.json
│   └── admin/            # Admin dashboard
│       ├── src/
│       ├── index.html
│       └── package.json
├── .github/
│   └── workflows/        # CI/CD pipelines
├── docker-compose.yml
├── package.json          # Root package.json
└── README.md
```

## 🚦 Getting Started

### Prerequisites

- **Node.js >= 22.0.0** (Tested on 22.11.0) ✅
- **npm >= 10.0.0** ✅
- Docker & Docker Compose
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd calling
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Setup environment variables**
   ```bash
   cp .env.example .env.local
   ```
   Edit `.env.local` with your configuration values.

4. **Start services with Docker Compose**
   ```bash
   docker-compose up -d
   ```
   This will start:
   - PostgreSQL (port 5432)
   - Redis (port 6379)
   - Backend API (port 3000)
   - WebSocket server (port 3001)

5. **Run database migrations**
   ```bash
   npm run prisma:migrate
   ```

6. **Seed the database (optional)**
   ```bash
   npm run prisma:seed
   ```

### Development

**Start all services:**
```bash
npm run start:dev
```

**Start individual packages:**
```bash
# Backend only
npm run dev:backend

# Admin panel only
npm run dev:admin

# Mobile app
npm run dev:mobile
```

### Verify Installation

1. Check backend health:
   ```bash
   curl http://localhost:3000/health
   ```
   Expected response:
   ```json
   {
     "status": "OK",
     "timestamp": "2024-01-01T00:00:00.000Z",
     "environment": "development",
     "uptime": 123.456
   }
   ```

2. Check API status:
   ```bash
   curl http://localhost:3000/api/health
   ```

3. Open admin panel:
   ```
   http://localhost:3001
   ```

## 🧪 Testing

Run all tests:
```bash
npm test
```

Run tests for specific package:
```bash
# Backend tests
npm test --workspace=@live-video-app/backend

# Admin tests
npm test --workspace=@live-video-app/admin
```

## 🔍 Linting

```bash
# Run linter
npm run lint

# Fix linting issues
npm run lint:fix
```

## 🐳 Docker Commands

```bash
# Start all services
docker-compose up -d

# Stop all services
docker-compose down

# View logs
docker-compose logs -f

# View specific service logs
docker-compose logs -f backend

# Rebuild services
docker-compose up -d --build

# Clean up (removes volumes)
docker-compose down -v
```

## 📊 Database Management

```bash
# Generate Prisma Client
npm run prisma:generate

# Create a migration
npm run prisma:migrate

# Apply migrations
cd packages/backend && npx prisma migrate deploy

# Open Prisma Studio (GUI)
npm run prisma:studio
```

## 🔐 Environment Variables

See `.env.example` for all required environment variables. Key variables include:

- `DATABASE_URL` - PostgreSQL connection string
- `REDIS_HOST` - Redis host
- `JWT_SECRET` - Secret for JWT tokens
- `FIREBASE_*` - Firebase configuration
- `ZEGO_APP_ID` - ZegoCloud App ID
- `RAZORPAY_KEY_ID` - Razorpay API key

**⚠️ Important:** Never commit `.env` or `.env.local` files to version control.

## 🚀 Deployment

### Backend Deployment (Render)

1. Create a new Web Service on Render
2. Connect your GitHub repository
3. Set build command: `npm install && npm run build --workspace=@live-video-app/backend`
4. Set start command: `npm start --workspace=@live-video-app/backend`
5. Add environment variables from `.env.example`

### Database (Render PostgreSQL)

1. Create a PostgreSQL database on Render
2. Copy the connection string to `DATABASE_URL` environment variable

### Admin Panel Deployment

Deploy to Vercel, Netlify, or any static hosting service:
```bash
cd packages/admin
npm run build
# Deploy the 'dist' folder
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 Acceptance Criteria ✅

- [x] Monorepo scaffold with npm workspaces
- [x] `npm run start:dev` starts backend and admin
- [x] Docker Compose creates Postgres + Redis + backend
- [x] Backend returns OK from `/health` endpoint
- [x] Lint and unit test runners configured
- [x] Environment examples provided
- [x] Secrets kept out of repo

## 🗺️ Roadmap

### Milestone 0 - Project Scaffold ✅
- [x] Monorepo structure
- [x] Backend with Express, Prisma, WebSocket
- [x] Mobile app scaffold
- [x] Admin panel scaffold
- [x] Docker setup
- [x] CI/CD pipelines

### Milestone 1 - Authentication & Users (Next)
- [ ] Firebase Auth integration
- [ ] User registration & login
- [ ] Profile management
- [ ] Host profile system

### Milestone 2 - Video Calling
- [ ] ZegoCloud integration
- [ ] 1-to-1 video calls
- [ ] Party video calls
- [ ] Call history

### Milestone 3 - Chat & Messaging
- [ ] Real-time chat
- [ ] Message history
- [ ] Media sharing
- [ ] Typing indicators

### Milestone 4 - Virtual Economy
- [ ] Diamond purchase system
- [ ] Gift sending
- [ ] Host earnings
- [ ] Withdrawal system

### Milestone 5 - Gamification & Games
- [ ] Level/XP system
- [ ] Party games
- [ ] Achievements
- [ ] Leaderboards

### Milestone 6 - Admin & Analytics
- [ ] User management
- [ ] Content moderation
- [ ] Analytics dashboard
- [ ] Revenue reports

## 📄 License

This project is private and proprietary.

## 📧 Contact

For questions or support, please contact the development team.

---

**Built with ❤️ for the live video social experience**
