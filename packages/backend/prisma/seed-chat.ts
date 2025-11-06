import { PrismaClient } from '@prisma/client';
import { hashPassword } from '../src/utils/password';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding chat data...');

  // Create test users
  const users = [];
  
  // User 1
  const user1 = await prisma.user.upsert({
    where: { email: 'alice@test.com' },
    update: {},
    create: {
      email: 'alice@test.com',
      emailVerified: true,
      username: 'alice',
      displayName: 'Alice Johnson',
      passwordHash: await hashPassword('123456'),
      avatar: 'https://i.pravatar.cc/150?img=1',
      bio: 'Love to chat and connect!',
      gender: 'FEMALE',
      country: 'USA',
      role: 'USER',
      status: 'ACTIVE',
      diamonds: 1000,
    },
  });
  users.push(user1);
  console.log('✓ Created user: Alice');

  // User 2
  const user2 = await prisma.user.upsert({
    where: { email: 'bob@test.com' },
    update: {},
    create: {
      email: 'bob@test.com',
      emailVerified: true,
      username: 'bob',
      displayName: 'Bob Smith',
      passwordHash: await hashPassword('123456'),
      avatar: 'https://i.pravatar.cc/150?img=2',
      bio: 'Tech enthusiast',
      gender: 'MALE',
      country: 'UK',
      role: 'USER',
      status: 'ACTIVE',
      diamonds: 500,
    },
  });
  users.push(user2);
  console.log('✓ Created user: Bob');

  // User 3
  const user3 = await prisma.user.upsert({
    where: { email: 'carol@test.com' },
    update: {},
    create: {
      email: 'carol@test.com',
      emailVerified: true,
      username: 'carol',
      displayName: 'Carol Williams',
      passwordHash: await hashPassword('123456'),
      avatar: 'https://i.pravatar.cc/150?img=3',
      bio: 'Always online!',
      gender: 'FEMALE',
      country: 'Canada',
      role: 'USER',
      status: 'ACTIVE',
      diamonds: 750,
    },
  });
  users.push(user3);
  console.log('✓ Created user: Carol');

  // User 4
  const user4 = await prisma.user.upsert({
    where: { email: 'david@test.com' },
    update: {},
    create: {
      email: 'david@test.com',
      emailVerified: true,
      username: 'david',
      displayName: 'David Brown',
      passwordHash: await hashPassword('123456'),
      avatar: 'https://i.pravatar.cc/150?img=4',
      bio: 'Night owl 🦉',
      gender: 'MALE',
      country: 'Australia',
      role: 'USER',
      status: 'ACTIVE',
      diamonds: 2000,
    },
  });
  users.push(user4);
  console.log('✓ Created user: David');

  // Create chat rooms and messages
  // Room 1: Alice <-> Bob
  const room1 = await prisma.room.create({
    data: {
      id: `room_alice_bob_${Date.now()}`,
      type: 'DIRECT',
      user1Id: user1.id,
      user2Id: user2.id,
      lastMessageAt: new Date(Date.now() - 1000 * 60 * 5), // 5 minutes ago
      lastMessageText: 'See you tomorrow!',
    },
  });
  console.log('✓ Created room: Alice <-> Bob');

  // Messages for Room 1
  await prisma.message.createMany({
    data: [
      {
        id: `msg_${room1.id}_1`,
        roomId: room1.id,
        senderId: user1.id,
        content: 'Hey Bob! How are you?',
        type: 'text',
        sequenceId: 1,
        readBy: [user1.id, user2.id],
        createdAt: new Date(Date.now() - 1000 * 60 * 30), // 30 min ago
      },
      {
        id: `msg_${room1.id}_2`,
        roomId: room1.id,
        senderId: user2.id,
        content: "Hi Alice! I'm doing great, thanks!",
        type: 'text',
        sequenceId: 2,
        readBy: [user1.id, user2.id],
        createdAt: new Date(Date.now() - 1000 * 60 * 28),
      },
      {
        id: `msg_${room1.id}_3`,
        roomId: room1.id,
        senderId: user1.id,
        content: 'Want to catch up tomorrow?',
        type: 'text',
        sequenceId: 3,
        readBy: [user1.id, user2.id],
        createdAt: new Date(Date.now() - 1000 * 60 * 10),
      },
      {
        id: `msg_${room1.id}_4`,
        roomId: room1.id,
        senderId: user2.id,
        content: 'Sure! What time works for you?',
        type: 'text',
        sequenceId: 4,
        readBy: [user1.id, user2.id],
        createdAt: new Date(Date.now() - 1000 * 60 * 8),
      },
      {
        id: `msg_${room1.id}_5`,
        roomId: room1.id,
        senderId: user1.id,
        content: 'See you tomorrow!',
        type: 'text',
        sequenceId: 5,
        readBy: [user1.id, user2.id],
        createdAt: new Date(Date.now() - 1000 * 60 * 5),
      },
    ],
  });
  console.log('✓ Created 5 messages in Alice <-> Bob room');

  // Room 2: Alice <-> Carol
  const room2 = await prisma.room.create({
    data: {
      id: `room_alice_carol_${Date.now()}`,
      type: 'DIRECT',
      user1Id: user1.id,
      user2Id: user3.id,
      lastMessageAt: new Date(Date.now() - 1000 * 60 * 60), // 1 hour ago
      lastMessageText: 'Thanks! Talk soon 🎉',
    },
  });
  console.log('✓ Created room: Alice <-> Carol');

  // Messages for Room 2
  await prisma.message.createMany({
    data: [
      {
        id: `msg_${room2.id}_1`,
        roomId: room2.id,
        senderId: user3.id,
        content: 'Hi Alice! Long time no see!',
        type: 'text',
        sequenceId: 1,
        readBy: [user1.id, user3.id],
        createdAt: new Date(Date.now() - 1000 * 60 * 90),
      },
      {
        id: `msg_${room2.id}_2`,
        roomId: room2.id,
        senderId: user1.id,
        content: 'Hey Carol! How have you been?',
        type: 'text',
        sequenceId: 2,
        readBy: [user1.id, user3.id],
        createdAt: new Date(Date.now() - 1000 * 60 * 85),
      },
      {
        id: `msg_${room2.id}_3`,
        roomId: room2.id,
        senderId: user3.id,
        content: 'Great! Just started a new project',
        type: 'text',
        sequenceId: 3,
        readBy: [user1.id, user3.id],
        createdAt: new Date(Date.now() - 1000 * 60 * 70),
      },
      {
        id: `msg_${room2.id}_4`,
        roomId: room2.id,
        senderId: user1.id,
        content: 'That sounds exciting! Tell me more',
        type: 'text',
        sequenceId: 4,
        readBy: [user1.id, user3.id],
        createdAt: new Date(Date.now() - 1000 * 60 * 65),
      },
      {
        id: `msg_${room2.id}_5`,
        roomId: room2.id,
        senderId: user3.id,
        content: 'Thanks! Talk soon 🎉',
        type: 'text',
        sequenceId: 5,
        readBy: [user1.id, user3.id],
        createdAt: new Date(Date.now() - 1000 * 60 * 60),
      },
    ],
  });
  console.log('✓ Created 5 messages in Alice <-> Carol room');

  // Room 3: Alice <-> David (with unread messages)
  const room3 = await prisma.room.create({
    data: {
      id: `room_alice_david_${Date.now()}`,
      type: 'DIRECT',
      user1Id: user1.id,
      user2Id: user4.id,
      lastMessageAt: new Date(Date.now() - 1000 * 60 * 2), // 2 minutes ago
      lastMessageText: 'Are you free this weekend?',
    },
  });
  console.log('✓ Created room: Alice <-> David');

  // Messages for Room 3 (with unread)
  await prisma.message.createMany({
    data: [
      {
        id: `msg_${room3.id}_1`,
        roomId: room3.id,
        senderId: user4.id,
        content: 'Hey Alice!',
        type: 'text',
        sequenceId: 1,
        readBy: [user1.id, user4.id],
        createdAt: new Date(Date.now() - 1000 * 60 * 15),
      },
      {
        id: `msg_${room3.id}_2`,
        roomId: room3.id,
        senderId: user4.id,
        content: 'I have a question about the project',
        type: 'text',
        sequenceId: 2,
        readBy: [user4.id], // Unread by Alice
        createdAt: new Date(Date.now() - 1000 * 60 * 10),
      },
      {
        id: `msg_${room3.id}_3`,
        roomId: room3.id,
        senderId: user4.id,
        content: 'Are you free this weekend?',
        type: 'text',
        sequenceId: 3,
        readBy: [user4.id], // Unread by Alice
        createdAt: new Date(Date.now() - 1000 * 60 * 2),
      },
    ],
  });
  console.log('✓ Created 3 messages in Alice <-> David room (2 unread)');

  // Room 4: Bob <-> Carol
  const room4 = await prisma.room.create({
    data: {
      id: `room_bob_carol_${Date.now()}`,
      type: 'DIRECT',
      user1Id: user2.id,
      user2Id: user3.id,
      lastMessageAt: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
      lastMessageText: 'Sounds good!',
    },
  });
  console.log('✓ Created room: Bob <-> Carol');

  await prisma.message.createMany({
    data: [
      {
        id: `msg_${room4.id}_1`,
        roomId: room4.id,
        senderId: user2.id,
        content: "Hey Carol, want to collaborate on something?",
        type: 'text',
        sequenceId: 1,
        readBy: [user2.id, user3.id],
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 - 1000 * 60 * 30),
      },
      {
        id: `msg_${room4.id}_2`,
        roomId: room4.id,
        senderId: user3.id,
        content: 'Sounds good!',
        type: 'text',
        sequenceId: 2,
        readBy: [user2.id, user3.id],
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24),
      },
    ],
  });
  console.log('✓ Created 2 messages in Bob <-> Carol room');

  console.log('\n🎉 Seed completed successfully!');
  console.log('\n📊 Summary:');
  console.log('- 4 test users created');
  console.log('- 4 chat rooms created');
  console.log('- 15 messages created');
  console.log('\n👤 Test Users (all with password: 123456):');
  console.log('1. alice@test.com - Alice Johnson');
  console.log('2. bob@test.com - Bob Smith');
  console.log('3. carol@test.com - Carol Williams');
  console.log('4. david@test.com - David Brown');
  console.log('\n💬 Chat Rooms:');
  console.log('1. Alice <-> Bob (5 messages, all read)');
  console.log('2. Alice <-> Carol (5 messages, all read)');
  console.log('3. Alice <-> David (3 messages, 2 UNREAD for Alice)');
  console.log('4. Bob <-> Carol (2 messages, 1 day old)');
  console.log('\n🧪 To test:');
  console.log('1. Login as alice@test.com');
  console.log('2. Go to Messages');
  console.log('3. You should see 3 rooms with David showing 2 unread messages');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding data:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
