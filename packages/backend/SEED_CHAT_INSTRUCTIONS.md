# 🌱 Chat Data Seeding Instructions

## Run the Seed Script

```bash
cd packages/backend
npx tsx prisma/seed-chat.ts
```

---

## 📊 What Gets Created

### **4 Test Users** (password: `123456` for all)
1. **alice@test.com** - Alice Johnson
2. **bob@test.com** - Bob Smith  
3. **carol@test.com** - Carol Williams
4. **david@test.com** - David Brown

### **4 Chat Rooms**
1. **Alice ↔ Bob** - 5 messages (all read)
2. **Alice ↔ Carol** - 5 messages (all read)
3. **Alice ↔ David** - 3 messages (**2 UNREAD** for Alice) ⭐
4. **Bob ↔ Carol** - 2 messages (1 day old)

### **15 Messages Total**
- Mix of read and unread messages
- Various timestamps (recent to 1 day ago)
- Realistic conversation flow

---

## 🧪 How to Test

### **Step 1: Run the Seed**
```bash
npx tsx prisma/seed-chat.ts
```

### **Step 2: Login to Mobile App**
Login as **Alice**:
- Email: `alice@test.com`
- Password: `123456`
- OTP: `123456` (if using OTP login)

### **Step 3: Navigate to Messages**
1. Go to Profile
2. Tap **Messages** (💬)
3. You should see:
   - ✅ 3 chat rooms listed
   - ✅ David's room shows **2 unread** badge
   - ✅ Last messages displayed
   - ✅ Timestamps formatted correctly

### **Step 4: Open a Chat Room**
1. Tap on "Bob Smith" room
2. Should see:
   - ✅ 5 messages in conversation
   - ✅ Messages from both users
   - ✅ Proper message bubbles (left/right)
   - ✅ Timestamps

### **Step 5: Test Real-time**
1. Open another device/simulator
2. Login as **Bob** (`bob@test.com`)
3. Go to Messages → Alice
4. Send a message from Bob
5. Alice should receive it instantly! 🎉

---

## 🔄 Reset Data (Clean Slate)

If you want to reset and re-seed:

```bash
# Delete all chat data
npx prisma studio
# Manually delete Room and Message records

# OR truncate tables
npx prisma db execute --stdin <<< "TRUNCATE TABLE \"Message\", \"Room\" CASCADE;"

# Re-seed
npx tsx prisma/seed-chat.ts
```

---

## 📝 What to Expect

### **Chat List Screen**
```
┌─────────────────────────────────┐
│   Messages                      │
├─────────────────────────────────┤
│ ● Connected                     │
├─────────────────────────────────┤
│  👤  David Brown        2m ago  │
│      Are you free...?      [2]  │ ← Unread badge
├─────────────────────────────────┤
│  👤  Bob Smith          5m ago  │
│      See you tomorrow!          │
├─────────────────────────────────┤
│  👤  Carol Williams     1h ago  │
│      Thanks! Talk soon 🎉       │
└─────────────────────────────────┘
```

### **Chat Room Screen**
```
┌─────────────────────────────────┐
│  ← Bob Smith                    │
├─────────────────────────────────┤
│                                 │
│  👤 Hey Bob! How are you?       │
│     30m ago                     │
│                                 │
│              Hi Alice! Great! │ │
│                        28m ago  │
│                                 │
│  👤 Want to catch up tomorrow?  │
│     10m ago                     │
│                                 │
│              Sure! What time? │ │
│                         8m ago  │
└─────────────────────────────────┘
```

---

## ✅ Success Indicators

- [ ] Seed script runs without errors
- [ ] 4 users created in database
- [ ] 4 rooms created
- [ ] 15 messages created
- [ ] Login as Alice works
- [ ] Chat list shows 3 rooms
- [ ] David's room shows 2 unread messages
- [ ] Can open and view chat messages
- [ ] Messages display correctly

---

## 🐛 Troubleshooting

### **Error: User already exists**
This is okay! The script uses `upsert`, so it will update existing users.

### **No rooms showing in app**
1. Check database: `npx prisma studio`
2. Verify Room table has records
3. Check backend logs for errors
4. Ensure Alice's user ID matches room.user1Id or room.user2Id

### **WebSocket not connecting**
1. Backend must be running: `npm run dev`
2. Check token is stored: AsyncStorage has 'accessToken'
3. Check logs: Should see "WebSocket connected"

---

**Ready to seed!** Run: `npx tsx prisma/seed-chat.ts`
