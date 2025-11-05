import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Create sample users
  const user1 = await prisma.user.upsert({
    where: { email: 'user@example.com' },
    update: {},
    create: {
      email: 'user@example.com',
      firebaseUid: 'firebase-uid-1',
      username: 'john_doe',
      displayName: 'John Doe',
      role: 'USER',
      diamonds: 1000,
    },
  });

  const host1 = await prisma.user.upsert({
    where: { email: 'host@example.com' },
    update: {},
    create: {
      email: 'host@example.com',
      firebaseUid: 'firebase-uid-2',
      username: 'jane_host',
      displayName: 'Jane Host',
      role: 'HOST',
      isHost: true,
      hostProfile: {
        create: {
          hourlyRate: 100,
          totalEarnings: 5000,
          availableBalance: 3000,
          rating: 4.8,
          totalReviews: 150,
        },
      },
    },
  });

  console.log('✓ Created users:', { user1, host1 });
  console.log('🎉 Database seed completed!');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
