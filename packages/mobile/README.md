# Mobile App - Live Video Social Platform

React Native mobile application with Expo for a live video social platform featuring OTP authentication, agency management, and profile system.

## 🎉 Milestone 1 - Authentication & Agency ✅

**Version:** 1.1.0  
**Status:** Complete

### Implemented Features

#### Authentication System
- ✅ **OTP-based Login** - Email/phone OTP verification
- ✅ **User Registration** - Age validation (18+), username uniqueness
- ✅ **JWT Token Management** - Access & refresh tokens with auto-refresh
- ✅ **Secure Storage** - AsyncStorage for tokens
- ✅ **Profile Management** - View/edit user profile

#### Agency Management
- ✅ **Join Agency** - Enter agency code or browse list
- ✅ **View Agency Details** - Commission rate, host count, earnings
- ✅ **Leave Agency** - Exit agency with confirmation
- ✅ **Host Status** - Automatic host status on agency join

#### State Management
- ✅ **Zustand Store** - Global auth state management
- ✅ **Persistent Auth** - Auto-login on app restart
- ✅ **Token Refresh** - Automatic token renewal

## Tech Stack

- **React Native** 0.75.4
- **Expo** ~51.0
- **TypeScript** 5.6
- **React Navigation** 6.x
- **Zustand** 5.0 (State management)
- **Axios** (API client with interceptors)
- **AsyncStorage** (Secure storage)
- **React Hook Form** (Form validation)

## Project Structure

```
src/
├── config/
│   └── api.ts              # Axios instance with interceptors
├── services/
│   ├── authService.ts      # Auth API calls
│   └── agencyService.ts    # Agency API calls
├── store/
│   └── authStore.ts        # Zustand auth store
├── screens/
│   ├── auth/
│   │   ├── LoginScreen.tsx
│   │   └── SignupScreen.tsx
│   ├── profile/
│   │   └── ProfileScreen.tsx
│   └── agency/
│       ├── JoinAgencyScreen.tsx
│       └── AgencyScreen.tsx
```

## Setup

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment
```bash
cp .env.example .env.local
```

Edit `.env.local`:
```env
# For iOS Simulator
API_URL=http://localhost:3000/api/v1

# For Android Emulator
API_URL=http://10.0.2.2:3000/api/v1

# For Physical Device (use your computer's IP)
API_URL=http://192.168.x.x:3000/api/v1
```

### 3. Start Backend Server
Make sure the backend is running on port 3000:
```bash
# In root directory
npm run dev:backend
```

### 4. Start Expo
```bash
npm start
```

## Run on Device

### iOS Simulator
```bash
npm run ios
```

### Android Emulator
```bash
npm run android
```

**Note:** For Android emulator, backend should be accessible at `http://10.0.2.2:3000`

### Physical Device
1. Connect to same WiFi as development machine
2. Update `API_URL` in `.env.local` with your computer's local IP
3. Scan QR code from Expo Dev Tools

## Features Guide

### Authentication Flow

#### 1. Sign Up
```
Open App → Sign Up
↓
Enter: email, username, displayName, dateOfBirth
↓
Submit → User created
↓
Go to Login
```

#### 2. Login with OTP
```
Login Screen
↓
Enter email or phone
↓
Send OTP → Check console (dev: always 123456)
↓
Enter OTP: 123456
↓
Login → Main App
```

#### 3. Profile Management
```
Profile Screen
↓
View: username, email, level, diamonds, XP
↓
Edit Profile → Update display name, bio, country, gender
↓
Save → Profile updated
```

### Agency Management

#### Join Agency
```
Profile Screen → "Join an Agency"
↓
Enter agency code OR select from list
↓
Join → Becomes HOST
↓
New JWT with agencyId claim issued
```

#### View Agency Details
```
Profile Screen → Tap agency card
↓
View: name, code, commission rate, total hosts
↓
See benefits and contact info
↓
Option to leave agency
```

## Development Notes

### OTP in Development
- OTP is always **123456** in development mode
- Check console for OTP codes
- No actual email/SMS sending in dev

### API Endpoints Used
```
POST /api/v1/auth/send-otp       - Send OTP
POST /api/v1/auth/signup         - Register user
POST /api/v1/auth/login          - Login with OTP
POST /api/v1/auth/refresh        - Refresh token
GET  /api/v1/auth/profile        - Get profile
PUT  /api/v1/auth/profile        - Update profile
POST /api/v1/agency/join         - Join agency
GET  /api/v1/agency/info         - Get agency info
GET  /api/v1/agency/list         - List agencies
POST /api/v1/agency/leave        - Leave agency
```

### Token Management
- **Access Token:** Stored in AsyncStorage, auto-attached to requests
- **Refresh Token:** Used to renew access token when expired
- **Auto-refresh:** Axios interceptor handles 401 errors automatically

## Testing

### Manual Testing Checklist
- [ ] Sign up with valid data
- [ ] Login with OTP (123456)
- [ ] View profile
- [ ] Edit profile
- [ ] Browse agencies
- [ ] Join agency with code
- [ ] View agency details
- [ ] Leave agency
- [ ] Logout
- [ ] Login again (persistent auth)

### Test User Creation
```bash
# Backend should be running with database
# Create test agency via Prisma Studio:
npx prisma studio

# Create Agency:
code: TEST123
name: Test Agency
email: test@agency.com
commissionRate: 10.0
```

## Common Issues

### Cannot Connect to Backend
**Problem:** Network request failed

**Solutions:**
1. Check backend is running: `curl http://localhost:3000/health`
2. For Android emulator, use `10.0.2.2` instead of `localhost`
3. For physical device, use computer's local IP
4. Check firewall allows port 3000

### OTP Not Working
**Problem:** Invalid OTP error

**Solution:** In development, OTP is always `123456`. Check console logs.

### Token Expired
**Problem:** 401 Unauthorized errors

**Solution:** Automatic token refresh should handle this. If not, logout and login again.

## Scripts

```bash
npm start          # Start Expo dev server
npm run android    # Run on Android
npm run ios        # Run on iOS
npm run web        # Run on web
npm test           # Run tests
npm run lint       # Lint code
```

## Next Steps - Milestone 2

### Planned Features
- **Video Calling** - ZegoCloud integration
- **Call History** - Track past calls
- **Gifts System** - Send virtual gifts during calls
- **Wallet** - View diamond balance
- **Host Dashboard** - Earnings and stats

## Contributing

See main [CONTRIBUTING.md](../../CONTRIBUTING.md) for guidelines.

## License

Proprietary - All rights reserved

---

**Version:** 1.1.0  
**Last Updated:** 2025-11-06  
**Status:** ✅ Milestone 1 Complete
