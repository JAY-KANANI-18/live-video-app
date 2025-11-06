# Database Migration Guide

## Milestone 1 - Auth & Agency Models

### Prerequisites
- Backend server must be **stopped** (to release Prisma lock)
- PostgreSQL running on port 5432
- Redis running on port 6379

---

## Step-by-Step Migration

### 1. Stop Backend Server
```bash
# Press Ctrl+C in the terminal where backend is running
# Or find and kill the process:
npx kill-port 3000
npx kill-port 3001
```

### 2. Navigate to Backend Package
```bash
cd packages/backend
```

### 3. Generate Prisma Client
```bash
npx prisma generate
```

**Expected Output:**
```
✔ Generated Prisma Client (v5.22.0)
```

### 4. Create Migration
```bash
npx prisma migrate dev --name milestone-1-auth-agency
```

**This will:**
- Create migration SQL file
- Apply migration to database
- Regenerate Prisma client

**Expected Output:**
```
Prisma schema loaded from prisma\schema.prisma
Datasource "db": PostgreSQL database

Applying migration `20251106_milestone-1-auth-agency`

The following migration(s) have been created and applied from new schema changes:

migrations/
  └─ 20251106xxxxxx_milestone-1-auth-agency/
    └─ migration.sql

✔ Generated Prisma Client
```

### 5. Verify Migration
```bash
npx prisma migrate status
```

**Should show:**
```
✔ Migration milestone-1-auth-agency applied
```

### 6. (Optional) Seed Test Data
```bash
npm run prisma:seed
```

### 7. Start Backend
```bash
cd ../..
npm run dev:backend
```

---

## What Changed in the Database

### New Tables Created:
1. **Agency**
   - Stores agency information
   - Unique code for host enrollment
   - Commission rate settings

2. **Wallet**
   - User wallet for diamond balance
   - Tracks earnings and withdrawals
   - One-to-one with User

3. **RefreshToken**
   - Stores hashed refresh tokens
   - Tracks device/session info
   - Auto-cleanup on expiry

4. **OTPCode**
   - Temporary OTP storage
   - Tracks verification status
   - Expires after 10 minutes

### Modified Tables:
**User:**
- Added: `email`, `emailVerified`, `phoneNumber`, `phoneVerified`
- Added: `passwordHash` (optional)
- Added: `agencyId` (foreign key to Agency)
- Removed: `firebaseUid` (no longer using Firebase Auth)
- Made `email` and `phoneNumber` optional (at least one required)

---

## Rollback (If Needed)

If migration fails or you need to rollback:

```bash
# View migration history
npx prisma migrate status

# Rollback last migration
npx prisma migrate resolve --rolled-back 20251106xxxxxx_milestone-1-auth-agency

# Reset database (WARNING: Deletes all data)
npx prisma migrate reset
```

---

## Troubleshooting

### Error: "relation already exists"
**Solution:** Database has old tables. Either:
1. Drop the conflicting table manually, or
2. Reset database: `npx prisma migrate reset`

### Error: "permission denied" or "EPERM"
**Solution:** Backend server is still running. Stop it completely.

### Error: "Cannot connect to database"
**Solution:** Check PostgreSQL is running:
```bash
docker ps | grep postgres
# Or
docker-compose ps
```

### Migration Applied but Types Still Wrong
**Solution:** Regenerate Prisma client:
```bash
npx prisma generate
```

---

## Verification Checklist

After migration, verify:

- [ ] Backend starts without errors
- [ ] Health endpoint works: `curl http://localhost:3000/health`
- [ ] Can register user: `POST /api/v1/auth/signup`
- [ ] Can send OTP: `POST /api/v1/auth/send-otp`
- [ ] Can login: `POST /api/v1/auth/login` (OTP: 123456 in dev)
- [ ] Can get profile: `GET /api/v1/auth/profile` (with token)
- [ ] TypeScript errors resolved

---

## Post-Migration Setup

### Create Test Agency
```sql
-- Connect to PostgreSQL
INSERT INTO "Agency" (id, name, code, email, "commissionRate", "createdAt", "updatedAt")
VALUES (
  'test-agency-id',
  'Test Agency',
  'TEST123',
  'agency@test.com',
  10.0,
  NOW(),
  NOW()
);
```

Or use Prisma Studio:
```bash
npx prisma studio
```
Then create an Agency record manually.

### Test Agency Binding
1. Register/login as a user
2. Join agency: `POST /api/v1/agency/join` with code "TEST123"
3. Verify `agencyId` in JWT token
4. Check user.isHost = true

---

## Migration SQL (Reference)

The migration will execute SQL similar to:

```sql
-- Create Agency table
CREATE TABLE "Agency" (
  "id" TEXT PRIMARY KEY,
  "name" TEXT NOT NULL,
  "code" TEXT UNIQUE NOT NULL,
  "email" TEXT UNIQUE NOT NULL,
  "phoneNumber" TEXT,
  "commissionRate" DOUBLE PRECISION DEFAULT 10.0,
  "contactPerson" TEXT,
  "address" TEXT,
  "isActive" BOOLEAN DEFAULT true,
  "totalHosts" INTEGER DEFAULT 0,
  "totalEarnings" INTEGER DEFAULT 0,
  "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3)
);

-- Create Wallet table
CREATE TABLE "Wallet" (
  "id" TEXT PRIMARY KEY,
  "userId" TEXT UNIQUE NOT NULL,
  "availableBalance" INTEGER DEFAULT 0,
  "pendingBalance" INTEGER DEFAULT 0,
  "totalEarned" INTEGER DEFAULT 0,
  "totalWithdrawn" INTEGER DEFAULT 0,
  "bankDetails" JSONB,
  "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3),
  FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE
);

-- Create RefreshToken table
CREATE TABLE "RefreshToken" (
  "id" TEXT PRIMARY KEY,
  "userId" TEXT NOT NULL,
  "tokenHash" TEXT UNIQUE NOT NULL,
  "expiresAt" TIMESTAMP(3) NOT NULL,
  "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
  "userAgent" TEXT,
  "ipAddress" TEXT,
  FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE
);

-- Create OTPCode table
CREATE TABLE "OTPCode" (
  "id" TEXT PRIMARY KEY,
  "userId" TEXT,
  "email" TEXT,
  "phoneNumber" TEXT,
  "code" TEXT NOT NULL,
  "type" "OTPType" NOT NULL,
  "verified" BOOLEAN DEFAULT false,
  "attempts" INTEGER DEFAULT 0,
  "expiresAt" TIMESTAMP(3) NOT NULL,
  "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE
);

-- Modify User table
ALTER TABLE "User" 
  DROP COLUMN "firebaseUid",
  ADD COLUMN "email" TEXT UNIQUE,
  ADD COLUMN "emailVerified" BOOLEAN DEFAULT false,
  ADD COLUMN "phoneNumber" TEXT UNIQUE,
  ADD COLUMN "phoneVerified" BOOLEAN DEFAULT false,
  ADD COLUMN "passwordHash" TEXT,
  ADD COLUMN "agencyId" TEXT,
  ADD FOREIGN KEY ("agencyId") REFERENCES "Agency"("id");

-- Create indexes
CREATE INDEX "Agency_code_idx" ON "Agency"("code");
CREATE INDEX "RefreshToken_tokenHash_idx" ON "RefreshToken"("tokenHash");
CREATE INDEX "OTPCode_email_idx" ON "OTPCode"("email");
CREATE INDEX "OTPCode_phoneNumber_idx" ON "OTPCode"("phoneNumber");
```

---

## Next Steps After Migration

1. ✅ Verify all endpoints work
2. ✅ Run test suite: `npm test`
3. ✅ Test manual flows
4. ✅ Create test agencies
5. ✅ Update CHANGELOG.md
6. ✅ Tag release v1.1.0
7. Start Milestone 2 (Video Calling)

---

*Last Updated: 2025-11-06*  
*Milestone: 1 - Authentication & Agency Models*
