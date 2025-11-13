import prisma from './lib/prisma';

async function addTrafficData() {
  console.log('📊 Adding traffic snapshots...');

  // Add current traffic snapshots
  const snapshots = await Promise.all([
    prisma.congestionSnapshot.create({
      data: {
        location: 'Main Street & 5th Avenue',
        latitude: 40.7589,
        longitude: -73.9851,
        congestionLevel: 'heavy',
        trafficSpeed: 15.5,
        timestamp: new Date()
      }
    }),
    prisma.congestionSnapshot.create({
      data: {
        location: 'Highway 101 North',
        latitude: 40.7614,
        longitude: -73.9776,
        congestionLevel: 'severe',
        trafficSpeed: 8.2,
        timestamp: new Date()
      }
    }),
    prisma.congestionSnapshot.create({
      data: {
        location: 'Park Avenue',
        latitude: 40.7580,
        longitude: -73.9855,
        congestionLevel: 'moderate',
        trafficSpeed: 35.0,
        timestamp: new Date()
      }
    }),
    prisma.congestionSnapshot.create({
      data: {
        location: 'Riverside Drive',
        latitude: 40.7650,
        longitude: -73.9820,
        congestionLevel: 'light',
        trafficSpeed: 55.0,
        timestamp: new Date()
      }
    }),
    prisma.congestionSnapshot.create({
      data: {
        location: 'Downtown Business District',
        latitude: 40.7560,
        longitude: -73.9870,
        congestionLevel: 'heavy',
        trafficSpeed: 12.0,
        timestamp: new Date()
      }
    }),
    prisma.congestionSnapshot.create({
      data: {
        location: 'Brooklyn Bridge',
        latitude: 40.7061,
        longitude: -73.9969,
        congestionLevel: 'moderate',
        trafficSpeed: 28.0,
        timestamp: new Date()
      }
    })
  ]);

  console.log(`✅ Added ${snapshots.length} traffic snapshots`);
  console.log('🎉 Traffic data added successfully!');
}

addTrafficData()
  .catch((error) => {
    console.error('❌ Failed to add traffic data:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
