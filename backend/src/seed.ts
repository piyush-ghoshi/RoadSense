import prisma from './lib/prisma';

async function seed() {
  console.log('🌱 Seeding database...');

  // Clear existing data
  await prisma.alert.deleteMany();
  await prisma.congestionSnapshot.deleteMany();
  await prisma.trafficReport.deleteMany();
  await prisma.user.deleteMany();

  // Create sample users
  const user1 = await prisma.user.create({
    data: {
      email: 'john@example.com',
      name: 'John Doe',
      role: 'user'
    }
  });

  const user2 = await prisma.user.create({
    data: {
      email: 'priya@example.com',
      name: 'Priya Sharma',
      role: 'user'
    }
  });

  await prisma.user.create({
    data: {
      email: 'admin@traffic.gov.in',
      name: 'Traffic Authority',
      role: 'authority'
    }
  });

  console.log('✅ Created users');

  // Create traffic reports — Indore, India
  await Promise.all([
    prisma.trafficReport.create({
      data: {
        userId: user1.id,
        type: 'accident',
        severity: 'high',
        location: 'Vijay Nagar Square, Indore',
        latitude: 22.7533,
        longitude: 75.8937,
        description: 'Two-vehicle collision near AB Road. One lane blocked.',
        status: 'pending'
      }
    }),
    prisma.trafficReport.create({
      data: {
        userId: user1.id,
        type: 'roadblock',
        severity: 'critical',
        location: 'Palasia Square, Indore',
        latitude: 22.7249,
        longitude: 75.8855,
        description: 'Road construction ongoing. Expect 20-min delays.',
        status: 'verified'
      }
    }),
    prisma.trafficReport.create({
      data: {
        userId: user2.id,
        type: 'congestion',
        severity: 'medium',
        location: 'Rajwada, Indore',
        latitude: 22.7196,
        longitude: 75.8577,
        description: 'Heavy traffic near market area during evening rush.',
        status: 'resolved'
      }
    }),
    prisma.trafficReport.create({
      data: {
        userId: user2.id,
        type: 'diversion',
        severity: 'low',
        location: 'Annapurna Road, Indore',
        latitude: 22.7010,
        longitude: 75.8579,
        description: 'Traffic diverted due to VIP movement. Use Ring Road.',
        status: 'verified'
      }
    }),
    // Mumbai reports
    prisma.trafficReport.create({
      data: {
        userId: user1.id,
        type: 'accident',
        severity: 'critical',
        location: 'Western Express Highway, Mumbai',
        latitude: 19.1136,
        longitude: 72.8697,
        description: 'Major accident on WEH. Both carriageways affected.',
        status: 'pending'
      }
    }),
    prisma.trafficReport.create({
      data: {
        userId: user2.id,
        type: 'congestion',
        severity: 'high',
        location: 'Andheri East, Mumbai',
        latitude: 19.1136,
        longitude: 72.8686,
        description: 'Severe congestion near Andheri metro station.',
        status: 'verified'
      }
    }),
    // Delhi reports
    prisma.trafficReport.create({
      data: {
        userId: user1.id,
        type: 'roadblock',
        severity: 'high',
        location: 'Connaught Place, Delhi',
        latitude: 28.6315,
        longitude: 77.2167,
        description: 'Road closure for repair work near CP inner circle.',
        status: 'pending'
      }
    }),
    // Bangalore reports
    prisma.trafficReport.create({
      data: {
        userId: user2.id,
        type: 'congestion',
        severity: 'high',
        location: 'Silk Board Junction, Bangalore',
        latitude: 12.9170,
        longitude: 77.6226,
        description: 'Notorious Silk Board traffic. Avoid during peak hours.',
        status: 'verified'
      }
    }),
  ]);

  console.log('✅ Created traffic reports');

  // Create congestion snapshots — Indore
  await Promise.all([
    prisma.congestionSnapshot.create({
      data: {
        location: 'Vijay Nagar Square, Indore',
        latitude: 22.7533,
        longitude: 75.8937,
        congestionLevel: 'heavy',
        trafficSpeed: 18.5
      }
    }),
    prisma.congestionSnapshot.create({
      data: {
        location: 'Palasia Square, Indore',
        latitude: 22.7249,
        longitude: 75.8855,
        congestionLevel: 'severe',
        trafficSpeed: 8.2
      }
    }),
    prisma.congestionSnapshot.create({
      data: {
        location: 'Rajwada Chowk, Indore',
        latitude: 22.7196,
        longitude: 75.8577,
        congestionLevel: 'moderate',
        trafficSpeed: 28.0
      }
    }),
    prisma.congestionSnapshot.create({
      data: {
        location: 'Bhawarkua Square, Indore',
        latitude: 22.6892,
        longitude: 75.8606,
        congestionLevel: 'light',
        trafficSpeed: 52.0
      }
    }),
    prisma.congestionSnapshot.create({
      data: {
        location: 'LIG Square, Indore',
        latitude: 22.7302,
        longitude: 75.8750,
        congestionLevel: 'heavy',
        trafficSpeed: 14.0
      }
    }),
    // Mumbai snapshots
    prisma.congestionSnapshot.create({
      data: {
        location: 'Western Express Highway, Mumbai',
        latitude: 19.1136,
        longitude: 72.8697,
        congestionLevel: 'severe',
        trafficSpeed: 9.5
      }
    }),
    prisma.congestionSnapshot.create({
      data: {
        location: 'Bandra Kurla Complex, Mumbai',
        latitude: 19.0645,
        longitude: 72.8652,
        congestionLevel: 'heavy',
        trafficSpeed: 20.0
      }
    }),
    // Delhi snapshots
    prisma.congestionSnapshot.create({
      data: {
        location: 'Connaught Place, Delhi',
        latitude: 28.6315,
        longitude: 77.2167,
        congestionLevel: 'moderate',
        trafficSpeed: 32.0
      }
    }),
    prisma.congestionSnapshot.create({
      data: {
        location: 'India Gate, Delhi',
        latitude: 28.6129,
        longitude: 77.2295,
        congestionLevel: 'light',
        trafficSpeed: 48.0
      }
    }),
    // Bangalore snapshots
    prisma.congestionSnapshot.create({
      data: {
        location: 'Silk Board Junction, Bangalore',
        latitude: 12.9170,
        longitude: 77.6226,
        congestionLevel: 'severe',
        trafficSpeed: 6.0
      }
    }),
    prisma.congestionSnapshot.create({
      data: {
        location: 'Marathahalli Bridge, Bangalore',
        latitude: 12.9591,
        longitude: 77.6974,
        congestionLevel: 'heavy',
        trafficSpeed: 16.0
      }
    }),
  ]);

  console.log('✅ Created congestion snapshots');

  // Create alerts
  await Promise.all([
    prisma.alert.create({
      data: {
        type: 'incident',
        title: 'Major Accident — Palasia Square, Indore',
        message: 'Avoid Palasia area. Multi-vehicle collision blocking main road. Use Vijay Nagar bypass.',
        severity: 'critical',
        location: 'Palasia Square, Indore',
        latitude: 22.7249,
        longitude: 75.8855,
        isActive: true,
        expiresAt: new Date(Date.now() + 3 * 60 * 60 * 1000)
      }
    }),
    prisma.alert.create({
      data: {
        type: 'traffic',
        title: 'Evening Rush — Vijay Nagar, Indore',
        message: 'Heavy congestion near Vijay Nagar Square. Expect 20-min delays. Consider AB Road alternate.',
        severity: 'warning',
        location: 'Vijay Nagar, Indore',
        latitude: 22.7533,
        longitude: 75.8937,
        isActive: true
      }
    }),
    prisma.alert.create({
      data: {
        type: 'incident',
        title: 'Silk Board Gridlock — Bangalore',
        message: 'Silk Board Junction at standstill. Use Hosur Road or Bannerghatta Road as alternate.',
        severity: 'critical',
        location: 'Silk Board, Bangalore',
        latitude: 12.9170,
        longitude: 77.6226,
        isActive: true,
        expiresAt: new Date(Date.now() + 2 * 60 * 60 * 1000)
      }
    }),
    prisma.alert.create({
      data: {
        type: 'system',
        title: 'Road Work — WEH Mumbai',
        message: 'Night road repair work on Western Express Highway between Andheri and Borivali. Expect lane closures.',
        severity: 'info',
        location: 'Western Express Highway, Mumbai',
        latitude: 19.1136,
        longitude: 72.8697,
        isActive: true,
        expiresAt: new Date(Date.now() + 6 * 60 * 60 * 1000)
      }
    }),
  ]);

  console.log('✅ Created alerts');
  console.log('🎉 Seeding completed successfully!');
  console.log('🗺️  Seed data covers: Indore, Mumbai, Delhi, Bangalore');
}

seed()
  .catch((error) => {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
