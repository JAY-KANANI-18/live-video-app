# Installation Guide

Complete guide to setting up the Live Video App monorepo with Node.js 22.11.0.

## ✅ Prerequisites Check

Before starting, ensure you have:

```powershell
# Check Node.js version (should be 22.11.0)
node -v

# Check npm version (should be >= 10.0.0)
npm -v

# Check Docker
docker --version
docker-compose --version
```

## 📦 Step-by-Step Installation

### 1. Install Dependencies

From the root of the project:

```powershell
# Install all workspace dependencies
npm install
```

**Note:** If you encounter peer dependency conflicts, use:
```powershell
npm install --legacy-peer-deps
```

This will install dependencies for:
- Root workspace
- Backend package
- Mobile package  
- Admin package

### 2. Setup Environment Variables

```powershell
# Copy environment example
copy .env.example .env.local

# Also copy for backend
copy packages\backend\.env.example packages\backend\.env.local
```

Edit `.env.local` and `packages/backend/.env.local` with your actual values:
- Database credentials
- Firebase configuration
- ZegoCloud API keys
- Razorpay keys
- etc.

### 3. Start Docker Services

```powershell
# Start PostgreSQL and Redis
docker-compose up -d postgres redis

# View logs
docker-compose logs -f
```

Wait for services to be healthy (check with `docker-compose ps`)

### 4. Setup Database

```powershell
# Generate Prisma Client
cd packages\backend
npx prisma generate

# Run migrations
npx prisma migrate dev

# Seed database (optional)
npm run prisma:seed

# Go back to root
cd ..\..
```

### 5. Start Development Servers

#### Option A: Start All Services
```powershell
npm run start:dev
```

This starts:
- Backend API (port 3000)
- WebSocket server (port 3001)
- Admin panel (port 3001)

#### Option B: Start Individual Services

**Backend only:**
```powershell
npm run dev:backend
```

**Admin panel only:**
```powershell
npm run dev:admin
```

**Mobile app:**
```powershell
npm run dev:mobile
```

### 6. Verify Installation

Open another terminal and test:

```powershell
# Test backend health
curl http://localhost:3000/health

# Expected response:
# {"status":"OK","timestamp":"...","environment":"development","uptime":...}

# Test API health
curl http://localhost:3000/api/health

# Expected response:
# {"status":"OK","service":"API","timestamp":"..."}
```

**Admin Panel:**
Open http://localhost:3001 in your browser

**Mobile App:**
Scan QR code with Expo Go app or press:
- `a` for Android
- `i` for iOS
- `w` for web

## 🧪 Run Tests

```powershell
# Run all tests
npm test

# Run backend tests only
npm test --workspace=@live-video-app/backend

# Run tests in watch mode
cd packages\backend
npm run test:watch
```

## 🔍 Linting & Formatting

```powershell
# Run linter
npm run lint

# Fix linting issues
npm run lint:fix
```

## 🗄️ Database Management

```powershell
# Open Prisma Studio (Database GUI)
npm run prisma:studio

# Create a new migration
cd packages\backend
npx prisma migrate dev --name your_migration_name

# Reset database (⚠️ Caution: deletes all data)
npx prisma migrate reset
```

## 🐳 Docker Commands

```powershell
# Start all services (including backend)
docker-compose up -d

# Stop all services
docker-compose down

# View logs
docker-compose logs -f

# View specific service logs
docker-compose logs -f backend

# Rebuild and start
docker-compose up -d --build

# Clean up everything (including volumes)
docker-compose down -v
```

## 🚨 Troubleshooting

### Issue: "Cannot find module" errors

**Solution:** Install dependencies
```powershell
npm install
```

### Issue: Prisma Client errors

**Solution:** Regenerate Prisma Client
```powershell
cd packages\backend
npx prisma generate
```

### Issue: Database connection failed

**Solution:** Check if PostgreSQL is running
```powershell
docker-compose ps
docker-compose logs postgres
```

### Issue: Port already in use

**Solution:** Change port in .env.local or kill the process
```powershell
# Find process using port 3000
netstat -ano | findstr :3000

# Kill process (replace PID with actual process ID)
taskkill /PID <PID> /F
```

### Issue: ESLint errors with version 9

**Solution:** ESLint 9 uses flat config. Config is already set up, but if issues persist:
```powershell
# Clear cache
rm -r node_modules
npm install
```

### Issue: Expo/React Native not starting

**Solution:** Clear Expo cache
```powershell
cd packages\mobile
npm start -- --clear
```

## 📱 Mobile Development

### iOS (Mac only)
```powershell
cd packages\mobile
npm run ios
```

### Android
```powershell
cd packages\mobile
npm run android
```

### Web (for testing)
```powershell
cd packages\mobile
npm run web
```

## 🎯 What's Next?

After successful installation:

1. ✅ All services running
2. ✅ Database connected
3. ✅ Tests passing
4. ✅ No linting errors

**Next Steps:**
- Review `VERSIONS.md` for package details
- Check `CONTRIBUTING.md` for development workflow
- Start building features per roadmap
- Configure Firebase, ZegoCloud, and Razorpay

## 📚 Additional Resources

- [Prisma Documentation](https://www.prisma.io/docs)
- [Expo Documentation](https://docs.expo.dev)
- [React Navigation](https://reactnavigation.org)
- [Socket.io Documentation](https://socket.io/docs)
- [ZegoCloud SDK](https://www.zegocloud.com/docs)

## 💡 Tips

1. **Use VSCode:** Recommended with extensions:
   - ESLint
   - Prettier
   - Prisma
   - React Native Tools

2. **Hot Reload:** Both backend (tsx watch) and frontend (Vite HMR) support hot reload

3. **Database Changes:** Always create migrations for schema changes

4. **Environment Variables:** Never commit `.env.local` files

5. **Git Hooks:** Husky is configured to run linting before commits

---

**Need Help?** Check the main README.md or open an issue.
