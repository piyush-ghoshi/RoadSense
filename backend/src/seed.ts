import prisma from './lib/prisma';

async function seed() {
  console.log('🌱 Seeding database...');

  // Create sample users
  const user1 = await prisma.user.create({
    data: {
      email: 'john@example.com',
      name: 'John Doe',
      role: 'user'
    }
  });

  const authority = await prisma.user.create({
    data: {
      email: 'admin@traffic.gov',
      name: 'Traffic Authority',
      role: 'authority'
    }
  });

  console.log('✅ Created users');

  // Create sample traffic reports
  const reports = await Promise.all([
    prisma.trafficReport.create({
      data: {
        userId: user1.id,
        type: 'accident',
        severity: 'high',
        location: 'Main Street & 5th Avenue',
        latitude: 40.7589,
        longitude: -73.9851,
        description: 'Two-car collision blocking left lane',
        status: 'pending'
      }
    }),
    prisma.trafficReport.create({
      data: {
        userId: user1.id,
        type: 'roadblock',
        severity: 'critical',
        location: 'Highway 101 North',
        latitude: 40.7614,
        longitude: -73.9776,
        description: 'Road construction, expect delays',
        status: 'verified'
      }
    }),
    prisma.trafficReport.create({
      data: {
        userId: user1.id,
        type: 'congestion',
        severity: 'medium',
        location: 'Downtown Business District',
        latitude: 40.7580,
        longitude: -73.9855,
        description: 'Heavy traffic during rush hour',
        status: 'resolved'
      }
    })
  ]);

  console.log('✅ Created traffic reports');

  // Create congestion snapshots
  const snapshots = await Promise.all([
    prisma.congestionSnapshot.create({
      data: {
        location: 'Main Street',
        latitude: 40.7589,
        longitude: -73.9851,
        congestionLevel: 'heavy',
        trafficSpeed: 15.5
      }
    }),
    prisma.congestionSnapshot.create({
      data: {
        location: 'Highway 101',
        latitude: 40.7614,
        longitude: -73.9776,
        congestionLevel: 'severe',
        trafficSpeed: 8.2
      }
    }),
    prisma.congestionSnapshot.create({
      data: {
        location: 'Park Avenue',
        latitude: 40.7580,
        longitude: -73.9855,
        congestionLevel: 'moderate',
        trafficSpeed: 35.0
      }
    }),
    prisma.congestionSnapshot.create({
      data: {
        location: 'Riverside Drive',
        latitude: 40.7650,
        longitude: -73.9820,
        congestionLevel: 'light',
        trafficSpeed: 55.0
      }
    })
  ]);

  console.log('✅ Created congestion snapshots');

  // Create alerts
  const alerts = await Promise.all([
    prisma.alert.create({
      data: {
        type: 'incident',
        title: 'Major Accident on Highway 101',
        message: 'Avoid Highway 101 North. Expect 30-minute delays.',
        severity: 'critical',
        location: 'Highway 101 North',
        latitude: 40.7614,
        longitude: -73.9776,
        isActive: true,
        expiresAt: new Date(Date.now() + 2 * 60 * 60 * 1000) // 2 hours from now
      }
    }),
    prisma.alert.create({
      data: {
        type: 'traffic',
        title: 'Heavy Traffic Downtown',
        message: 'Rush hour congestion in downtown area. Consider alternate routes.',
        severity: 'warning',
        location: 'Downtown',
        latitude: 40.7580,
        longitude: -73.9855,
        isActive: true
      }
    })
  ]);

  console.log('✅ Created alerts');
  console.log('🎉 Seeding completed successfully!');
}

seed()
  .catch((error) => {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
