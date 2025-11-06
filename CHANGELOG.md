# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.2.0] - 2025-11-06

### Added - Milestone 2: Wallet, Diamonds & Payment Integration

#### Backend
- **Payment Service Abstraction** - Support for Razorpay/Stripe/Mock providers
- **Mock Payment Provider** - Development mode with simulated payments
- **PaymentOrder Model** - Track payment orders with provider details
- **Transaction Ledger** - Complete audit trail with idempotency
- **Wallet Endpoints** - 6 new endpoints (topup, verify, send-gift, balance, transactions, payment-orders)
- **Admin Audit Endpoints** - 5 endpoints for transaction auditing and platform statistics
- **Diamond Conversion** - 1 INR = 10 diamonds conversion system
- **Idempotency Support** - Prevent duplicate transactions and payments
- **Agency Commission** - Automatic calculation on gift transfers
- **Balance Validation** - Insufficient funds checking
- **KYC Fields** - 14 fields in User model for compliance

#### Mobile App
- **Wallet Service** - Complete API client for wallet operations
- **WalletScreen** - Dashboard with balance, quick actions, host wallet stats
- **TopupScreen** - 6 predefined packages + custom amount input
- **SendGiftScreen** - 8-gift catalog with quantity selector
- **TransactionsScreen** - Transaction history with pagination
- **Gift Catalog** - Rose (10💎) to Mansion (50,000💎)
- **Auto-Refresh** - Profile and balance refresh on screen focus
- **Mock Payment Flow** - Auto-verify in development mode
- **Profile Integration** - Wallet card on profile screen

#### Database
- **PaymentOrder Table** - Payment tracking with provider integration
- **Payment Enums** - PaymentStatus, PaymentProvider
- **Transaction Idempotency** - Unique keys for duplicate prevention
- **KYC Compliance** - Full name, documents, address, status tracking

### Changed
- **Auth Responses** - Now include level, experience, diamonds in all responses
- **JWT Payload** - Fixed userId field access in wallet routes
- **Profile Stats** - Display defaults (0) when values undefined
- **API Version** - Updated to 1.2.0 with wallet features

### Fixed
- **Profile Display Bug** - Level, diamonds, XP now show correctly
- **Login Response** - Missing user stats fields added
- **Refresh Token** - Complete user data in token refresh
- **Wallet Balance Error** - Fixed userId vs id mismatch in routes
- **Auto-Refresh** - Screens now update on focus

### Security
- **Payment Verification** - HMAC SHA256 signature validation
- **Idempotency Keys** - Prevent duplicate charges
- **Balance Checks** - Atomic database transactions
- **Audit Trail** - Immutable transaction ledger

### Documentation
- **MILESTONE_2_SUMMARY.md** - Complete backend implementation guide
- **MILESTONE_2_MOBILE_COMPLETE.md** - Mobile app implementation guide
- **BUGFIX_PROFILE_STATS.md** - Profile display bug fix documentation

## [1.1.0] - 2025-11-06

### Added - Milestone 1: Authentication & Agency System

#### Backend
- **OTP-based Authentication** - Email/phone OTP verification system
- **JWT Token Management** - Access tokens (15min) + refresh tokens (7 days)
- **User Registration** - Age validation (18+), username uniqueness checks
- **Profile Management** - CRUD operations for user profiles
- **Agency System** - Join/leave agency with unique codes
- **Auth Middleware** - `requireAuth`, `requireRole`, `requireHost`, `requireAdmin`
- **Prisma Models** - Agency, Wallet, RefreshToken, OTPCode
- **Security** - bcrypt password hashing, JWT with agencyId claims
- **API Endpoints** - 11 new auth & agency endpoints
- **Tests** - Comprehensive test coverage for auth flows

#### Mobile App
- **Login/Signup Screens** - OTP-based authentication UI
- **Profile Screen** - View/edit user profile with stats
- **Agency Screens** - Join agency, view agency details
- **State Management** - Zustand store for auth state
- **API Integration** - Axios client with auto token refresh
- **Secure Storage** - AsyncStorage for JWT tokens
- **Navigation** - Auth vs Main stack routing
- **Error Handling** - User-friendly error messages

#### Infrastructure
- **Database Schema** - Updated with 4 new models
- **Migration System** - Prisma migrations ready
- **Docker Support** - Simplified development Dockerfile
- **Environment Config** - JWT secrets, token expiry settings

### Changed
- **User Model** - Removed `firebaseUid`, added email/phone auth fields
- **Token Expiry** - Access token now 15 minutes (was 7 days)
- **Expo Version** - Upgraded to Expo 54 with React 19
- **Prisma Version** - Locked to 5.22.0 for consistency

### Fixed
- **Prisma Version Mismatch** - Both CLI and client at 5.22.0
- **Mobile Dependencies** - Added react-native-worklets-core
- **Babel Config** - Removed NativeWind plugin temporarily
- **Docker Build** - Simplified Dockerfile for development

### Security
- **Password Hashing** - bcrypt with 10 salt rounds
- **Token Security** - Refresh tokens hashed in database
- **Age Verification** - Strict 18+ enforcement
- **Input Validation** - Email, phone, username format checks

### Documentation
- **MILESTONE_1_COMPLETE.md** - Complete feature documentation
- **MOBILE_APP_IMPLEMENTATION.md** - Mobile implementation guide
- **MIGRATION_GUIDE.md** - Database migration instructions
- **API Documentation** - All endpoints documented with examples

## [Unreleased]

### Planned for Milestone 1
- Firebase Auth integration
- User registration and login endpoints
- JWT token management
- User profile CRUD operations
- Host profile system

## [1.0.0] - 2025-11-06

### Milestone 0 - Project Scaffold ✅ COMPLETE

**Status:** Production Ready  
**Test Date:** 2025-11-06  
**Acceptance Criteria:** 7/7 Passed

#### Added

**Monorepo Infrastructure**
- ✅ npm workspaces configuration with 3 packages
- ✅ Root package.json with workspace scripts
- ✅ Centralized dependency management
- ✅ Cross-package script execution
- ✅ Makefile for common operations

**Backend Package (`@live-video-app/backend`)**
- ✅ Express.js REST API server (TypeScript)
- ✅ WebSocket server with Socket.io for real-time features
- ✅ Prisma ORM with PostgreSQL integration
- ✅ Redis client for caching and sessions
- ✅ JWT authentication infrastructure
- ✅ Health check endpoints (`/health`, `/api/health`)
- ✅ Winston logger configuration
- ✅ Helmet security middleware
- ✅ CORS and rate limiting
- ✅ Error handling middleware
- ✅ Jest test framework with coverage
- ✅ Database seeding script

**Mobile Package (`@live-video-app/mobile`)**
- ✅ React Native 0.75.4 with Expo ~51.0
- ✅ TypeScript configuration
- ✅ NativeWind (TailwindCSS) setup
- ✅ React Navigation structure
- ✅ Environment configuration
- ✅ iOS and Android platform support
- ✅ Basic app scaffold

**Admin Package (`@live-video-app/admin`)**
- ✅ React 18.3 with TypeScript
- ✅ Vite 6 build system
- ✅ TailwindCSS styling
- ✅ React Router v6
- ✅ Radix UI component library
- ✅ React Query for data fetching
- ✅ Zustand state management
- ✅ Recharts for analytics
- ✅ Vitest test framework

**Database Schema**
- ✅ User model with role-based access (USER, HOST, ADMIN)
- ✅ HostProfile with KYC and earnings tracking
- ✅ Call system (1-to-1 and party calls)
- ✅ CallParticipant for multi-user calls
- ✅ Gift system with virtual currency (diamonds)
- ✅ Transaction management (Razorpay integration ready)
- ✅ Withdrawal system for hosts
- ✅ AgencyReferral for commission tracking
- ✅ Proper indexes and relationships
- ✅ Timestamps and status enums

**Docker & DevOps**
- ✅ docker-compose.yml with PostgreSQL 16 + Redis 7
- ✅ Backend Dockerfile with multi-stage build
- ✅ Health checks for all services
- ✅ Volume persistence for data
- ✅ Network isolation
- ✅ Development and production configurations

**CI/CD Pipeline**
- ✅ GitHub Actions workflows
- ✅ Automated testing on push/PR
- ✅ Multi-version Node.js testing (18.x, 20.x)
- ✅ Docker image building
- ✅ Deployment workflow for Render
- ✅ Pull request template
- ✅ Code quality checks (ESLint, Prettier)

**Code Quality & Tooling**
- ✅ ESLint 9 flat config (modern format)
- ✅ Prettier code formatting
- ✅ TypeScript strict mode
- ✅ Pre-commit hooks ready (husky, lint-staged)
- ✅ Test coverage reporting
- ✅ Type-safe API contracts

**Documentation**
- ✅ Comprehensive README.md with quick start guide
- ✅ CONTRIBUTING.md with development workflow
- ✅ CHANGELOG.md (this file)
- ✅ TEST_RESULTS.md with detailed test report
- ✅ Package-specific README files
- ✅ Environment variable documentation
- ✅ API endpoint documentation structure
- ✅ Docker commands reference
- ✅ Database management guide

**Configuration**
- ✅ .env.example files at all levels (root, backend, mobile, admin)
- ✅ .gitignore with proper exclusions
- ✅ TypeScript configuration
- ✅ ESLint and Prettier configuration
- ✅ Jest and Vitest configuration
- ✅ Babel configuration for React Native
- ✅ Tailwind configuration for all packages

#### Changed
- Migrated from ESLint 8 to ESLint 9 flat config format
- Updated Node.js requirement to >= 22.0.0
- Updated npm requirement to >= 10.0.0
- Updated all packages to latest stable versions
- Simplified React Native App.tsx (removed NativeWind dependency issues)

#### Technical Specifications
- **Node.js:** 22.11.0 (tested)
- **npm:** 10.x
- **TypeScript:** 5.6.3
- **React:** 18.3.1
- **React Native:** 0.75.4
- **Expo:** ~51.0.39
- **Prisma:** 5.22.0
- **PostgreSQL:** 16 (Alpine)
- **Redis:** 7 (Alpine)
- **Docker:** 28.0.4
- **Docker Compose:** 2.34.0

#### Testing
- ✅ Backend server starts successfully
- ✅ Health endpoints return 200 OK
- ✅ Docker services start correctly
- ✅ Prisma client generation works
- ✅ Database connection established
- ✅ Redis connection established
- ✅ TypeScript compilation successful
- ✅ All workspace scripts functional

#### Deliverables Met
- [x] Monorepo scaffold with working npm workspaces
- [x] `npm run start:dev` script launches backend + admin
- [x] Docker Compose creates Postgres + Redis + backend
- [x] Backend returns OK from health endpoints
- [x] Lint + unit test runners configured
- [x] Basic README and environment examples
- [x] Secrets excluded from repository

#### Known Issues & Notes
1. **Port Conflicts:** PostgreSQL port 5432 may conflict with local installations (non-blocking)
2. **Database Migrations:** Need to be run manually with `npm run prisma:migrate`
3. **External Services:** Firebase, ZegoCloud, Razorpay credentials need to be configured

#### Next Steps - Milestone 1
- Implement Firebase Auth integration
- Create user authentication endpoints
- Implement JWT token generation/validation
- Build user profile management
- Develop host profile system
- Create role-based access control

---

## Version History

### [1.0.0] - 2025-11-06
- Initial release with complete project scaffold
- All Milestone 0 acceptance criteria met
- Production-ready monorepo structure

---

**Git Tag:** `v1.0.0`  
**Branch:** `main`  
**Milestone:** 0 (Project Scaffold)  
**Status:** ✅ Complete
