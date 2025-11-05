# 🚀 Quick Start Guide

**Version:** 1.0.0 | **Milestone 0:** ✅ Complete

---

## ⚡ Get Running in 5 Minutes

### 1. Prerequisites Check
```bash
node --version    # Should be >= 22.0.0
npm --version     # Should be >= 10.0.0
docker --version  # Required for database
```

### 2. Install & Setup
```bash
# Clone repository
git clone <repository-url>
cd calling

# Install dependencies
npm install

# Copy environment files
cp .env.example .env.local
cp packages/backend/.env.example packages/backend/.env.local
```

### 3. Start Services
```bash
# Option A: Start everything with Docker
docker-compose up -d

# Option B: Start infrastructure only
docker-compose up -d postgres redis
npm run start:dev
```

### 4. Verify
```bash
# Check backend health
curl http://localhost:3000/health
# Expected: {"status":"OK",...}

# Open admin panel
open http://localhost:3001
```

---

## 📚 Essential Commands

### Development
```bash
npm run start:dev      # Start backend + admin
npm run dev:backend    # Backend only
npm run dev:admin      # Admin only
npm run dev:mobile     # Mobile app (Expo)
```

### Docker
```bash
docker-compose up -d         # Start all services
docker-compose down          # Stop all services
docker-compose logs -f       # View logs
docker ps                    # Check running containers
```

### Database
```bash
npm run prisma:generate      # Generate Prisma client
npm run prisma:migrate       # Run migrations
npm run prisma:studio        # Open Prisma Studio GUI
npm run prisma:seed          # Seed database
```

### Testing & Quality
```bash
npm test                     # Run all tests
npm run lint                 # Check code style
npm run lint:fix             # Fix code style
npm run build                # Build all packages
```

---

## 📁 Key Files

| File | Purpose |
|------|---------|
| `README.md` | Main documentation |
| `CHANGELOG.md` | Version history |
| `MILESTONE_0_SUMMARY.md` | Completion report |
| `TEST_RESULTS.md` | Test documentation |
| `GIT_RELEASE_COMMANDS.md` | Release instructions |
| `RELEASE.md` | Version management |
| `.env.example` | Environment template |

---

## 🔗 Quick Links

### Endpoints
- Backend API: http://localhost:3000
- Admin Panel: http://localhost:3001
- Prisma Studio: http://localhost:5555 (after `npm run prisma:studio`)

### Services
- PostgreSQL: localhost:5432
- Redis: localhost:6379
- WebSocket: localhost:3001

---

## 🎯 Next Steps

### For Development
1. Configure external services in `.env.local`:
   - Firebase credentials
   - ZegoCloud API keys
   - Razorpay keys

2. Run database migrations:
   ```bash
   npm run prisma:migrate
   ```

3. Start Milestone 1 development:
   - Review `MILESTONE_0_SUMMARY.md`
   - Check planned features
   - Begin authentication implementation

### For Release
1. Review all changes
2. Follow `GIT_RELEASE_COMMANDS.md`
3. Create git tag v1.0.0
4. Push to repository
5. Create GitHub release

---

## 🐛 Troubleshooting

### Port Already in Use
```bash
# Find and kill process using port 3000
npx kill-port 3000

# Or use different port in .env.local
PORT=3001
```

### Docker Issues
```bash
# Reset Docker containers
docker-compose down -v
docker-compose up -d --build

# Check Docker logs
docker-compose logs -f backend
```

### Database Connection Failed
```bash
# Check PostgreSQL is running
docker ps | grep postgres

# Restart PostgreSQL
docker-compose restart postgres

# Check connection string in .env.local
DATABASE_URL=postgresql://postgres:password@localhost:5432/livevideo_dev
```

### Prisma Client Not Found
```bash
# Regenerate Prisma client
npm run prisma:generate
```

---

## 📦 Project Structure

```
live-video-app/
├── packages/
│   ├── backend/       # API server (Node.js + Express)
│   ├── mobile/        # Mobile app (React Native)
│   └── admin/         # Admin panel (React + Vite)
├── .github/           # CI/CD workflows
├── docker-compose.yml # Infrastructure
├── package.json       # Root package
└── docs/             # Documentation
```

---

## 💡 Tips

1. **Use Makefile for common tasks:**
   ```bash
   make dev          # Start development
   make up           # Start Docker
   make down         # Stop Docker
   make logs         # View logs
   make clean        # Clean up
   ```

2. **Check health regularly:**
   ```bash
   curl http://localhost:3000/health
   ```

3. **Monitor Docker resources:**
   ```bash
   docker stats
   ```

4. **Use Prisma Studio for database:**
   ```bash
   npm run prisma:studio
   ```

---

## 🎓 Learning Resources

- **Prisma:** https://prisma.io/docs
- **Express:** https://expressjs.com
- **React Native:** https://reactnative.dev
- **Expo:** https://docs.expo.dev
- **Socket.io:** https://socket.io/docs
- **Docker:** https://docs.docker.com

---

## ✅ Milestone 0 Status

**Status:** ✅ COMPLETE  
**Version:** 1.0.0  
**Date:** 2025-11-06  
**Acceptance:** 7/7 Passed

**What's Working:**
- ✅ Backend API server
- ✅ Health check endpoints
- ✅ Database connection
- ✅ Redis connection
- ✅ WebSocket server
- ✅ Docker infrastructure
- ✅ Development scripts
- ✅ Testing framework
- ✅ Code quality tools

**Ready for:**
- Milestone 1 - Authentication & Users
- Production deployment
- Team development

---

## 🤝 Need Help?

1. Check documentation in `/docs`
2. Review test results in `TEST_RESULTS.md`
3. Check Docker logs: `docker-compose logs -f`
4. Verify environment: `cat .env.local`
5. Run health check: `curl localhost:3000/health`

---

**Happy Coding! 🎉**

*Last Updated: 2025-11-06*  
*Version: 1.0.0*  
*Milestone: 0 - Project Scaffold*
