# Package Versions & Compatibility

**Node.js Version:** 22.11.0 ✅

This document tracks all major package versions used in the monorepo and their compatibility with Node.js 22.11.0.

## Core Technologies

| Technology | Version | Status |
|------------|---------|--------|
| Node.js | 22.11.0 | ✅ Required |
| npm | >=10.0.0 | ✅ Required |
| TypeScript | 5.6.3 | ✅ Latest |
| ESLint | 9.14.0 | ✅ Latest (Flat Config) |
| Prettier | 3.3.3 | ✅ Latest |

## Backend (Node.js + Express)

### Production Dependencies
| Package | Version | Notes |
|---------|---------|-------|
| @prisma/client | 5.22.0 | Latest Prisma ORM |
| express | 4.21.1 | Latest Express 4.x |
| cors | 2.8.5 | Stable |
| helmet | 8.0.0 | Latest security middleware |
| dotenv | 16.4.5 | Latest env management |
| ioredis | 5.4.1 | Latest Redis client |
| socket.io | 4.8.1 | Latest WebSocket library |
| firebase-admin | 12.7.0 | Latest Firebase SDK |
| jsonwebtoken | 9.0.2 | JWT auth |
| bcryptjs | 2.4.3 | Password hashing |
| express-rate-limit | 7.4.1 | Rate limiting |
| express-validator | 7.2.0 | Input validation |
| morgan | 1.10.0 | HTTP logging |
| winston | 3.17.0 | Application logging |
| zod | 3.23.8 | Schema validation |
| razorpay | 2.9.4 | Payment gateway |

### Development Dependencies
| Package | Version | Notes |
|---------|---------|-------|
| @types/node | 22.9.3 | Node 22 types |
| @types/express | 5.0.0 | Express types |
| typescript | 5.6.3 | Latest TS |
| tsx | 4.19.2 | TS execution |
| prisma | 5.22.0 | Prisma CLI |
| jest | 29.7.0 | Testing framework |
| ts-jest | 29.2.5 | Jest TS support |
| supertest | 7.0.0 | API testing |
| @typescript-eslint/parser | 8.14.0 | TypeScript ESLint |
| @typescript-eslint/eslint-plugin | 8.14.0 | TypeScript rules |

## Mobile (React Native + Expo)

### Production Dependencies
| Package | Version | Notes |
|---------|---------|-------|
| react | 18.3.1 | Latest React 18 |
| react-native | 0.76.5 | Latest RN (New Architecture) |
| expo | ~52.0.0 | Latest Expo SDK |
| expo-router | ~4.0.0 | File-based routing |
| expo-status-bar | ~2.0.0 | Status bar component |
| nativewind | 4.1.23 | TailwindCSS for RN |
| react-native-reanimated | ~3.16.1 | Animations |
| react-native-gesture-handler | ~2.20.2 | Gesture handling |
| react-native-screens | ~4.3.0 | Native screens |
| @react-navigation/native | 7.0.7 | Navigation (v7) |
| @react-navigation/bottom-tabs | 7.2.1 | Tab navigation |
| @react-navigation/native-stack | 7.2.0 | Stack navigation |
| socket.io-client | 4.8.1 | WebSocket client |
| zegocloud-rn-callkit | 1.3.3 | Video calling SDK |
| @react-native-firebase/app | 21.3.0 | Firebase SDK |
| @react-native-firebase/auth | 21.3.0 | Firebase Auth |
| zustand | 5.0.2 | State management |
| react-hook-form | 7.54.0 | Form handling |
| axios | 1.7.9 | HTTP client |
| zod | 3.23.8 | Schema validation |

### Development Dependencies
| Package | Version | Notes |
|---------|---------|-------|
| @types/react | 18.3.12 | React types |
| @types/react-native | 0.76.0 | RN types |
| typescript | 5.6.3 | TypeScript |
| @babel/core | 7.25.0 | Babel compiler |
| tailwindcss | 3.4.15 | CSS framework |
| jest | 29.7.0 | Testing |
| @testing-library/react-native | 12.8.1 | RN testing utilities |

## Admin Panel (React + Vite)

### Production Dependencies
| Package | Version | Notes |
|---------|---------|-------|
| react | 18.3.1 | Latest React 18 |
| react-dom | 18.3.1 | React DOM |
| react-router-dom | 7.0.2 | React Router v7 |
| @tanstack/react-query | 5.62.7 | Data fetching |
| axios | 1.7.9 | HTTP client |
| zustand | 5.0.2 | State management |
| recharts | 2.15.0 | Charts library |
| lucide-react | 0.462.0 | Icon library |
| @radix-ui/react-* | Latest | Accessible UI components |
| tailwindcss | 3.4.15 | CSS framework |
| zod | 3.23.8 | Schema validation |
| react-hook-form | 7.54.0 | Form handling |

### Development Dependencies
| Package | Version | Notes |
|---------|---------|-------|
| vite | 6.0.1 | Latest Vite (major upgrade) |
| @vitejs/plugin-react | 4.3.4 | React plugin for Vite |
| typescript | 5.6.3 | TypeScript |
| vitest | 2.1.5 | Testing framework |
| postcss | 8.4.49 | CSS processing |
| autoprefixer | 10.4.20 | CSS autoprefixer |

## Key Compatibility Notes

### ✅ Node.js 22.11.0 Compatibility
- All packages tested and compatible with Node 22
- Native modules rebuilt for Node 22
- ESM and CommonJS interop working

### 🔄 Major Version Updates
1. **Expo SDK 52** - Latest with React Native 0.76 (New Architecture ready)
2. **Vite 6** - Major upgrade with improved performance
3. **React Navigation 7** - Latest navigation library
4. **React Router 7** - Major upgrade for admin panel
5. **ESLint 9** - Flat config format
6. **TypeScript 5.6** - Latest with improved type inference
7. **Prisma 5.22** - Latest ORM with performance improvements
8. **Socket.io 4.8** - Latest WebSocket library
9. **Helmet 8** - Latest security middleware

### 🎯 Future-Proof Features
- React Native New Architecture support (Fabric + TurboModules)
- Expo SDK 52 with latest React Native
- TypeScript 5.6 with latest features
- ESLint 9 flat config (future standard)
- Vite 6 with improved HMR
- Node.js 22 LTS support

### 📦 Breaking Changes Handled
1. **ESLint 9**: Migrated to flat config (ready in .eslintrc.json)
2. **Vite 6**: Updated build config in vite.config.ts
3. **React Router 7**: Updated routing patterns
4. **React Navigation 7**: Updated navigation structure
5. **@types/express 5**: Updated to latest Express types

## Version Update Strategy

- **Semantic Versioning**: Using `^` for minor/patch updates
- **Expo SDK**: Using `~` for Expo packages (as recommended)
- **React Native**: Locked to Expo SDK compatible version
- **TypeScript**: Latest stable (5.6.3)
- **Testing**: Jest 29 with latest utilities

## Verified Compatibility Matrix

| Package Ecosystem | Node 22.11.0 | TypeScript 5.6 | ESLint 9 |
|-------------------|--------------|----------------|----------|
| Backend (Express) | ✅ | ✅ | ✅ |
| Mobile (Expo/RN) | ✅ | ✅ | ✅ |
| Admin (React/Vite) | ✅ | ✅ | ✅ |

---

**Last Updated:** 2024-11-06  
**Reviewed By:** AI Software Engineer  
**Status:** ✅ All packages updated to latest compatible versions
