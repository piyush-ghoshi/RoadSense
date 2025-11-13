import { Router, Request, Response } from 'express';
import prisma from '../lib/prisma';

const router = Router();

interface RoutePoint {
  lat: number;
  lng: number;
}

// POST /routes/suggest - Get alternate route suggestions
router.post('/suggest', async (req: Request, res: Response) => {
  try {
    const { origin, destination, avoidCongestion = true } = req.body;

    if (!origin || !destination) {
      return res.status(400).json({
        success: false,
        error: 'Origin and destination are required'
      });
    }

    // Get current traffic conditions
    const recentSnapshots = await prisma.congestionSnapshot.findMany({
      where: {
        timestamp: {
          gte: new Date(Date.now() - 15 * 60 * 1000) // Last 15 minutes
        }
      }
    });

    // Get active incidents
    const activeIncidents = await prisma.trafficReport.findMany({
      where: {
        status: { in: ['pending', 'verified'] },
        createdAt: {
          gte: new Date(Date.now() - 60 * 60 * 1000)
        }
      }
    });

    // Calculate route suggestions (simplified algorithm)
    const routes = generateRoutes(origin, destination, recentSnapshots, activeIncidents, avoidCongestion);

    res.json({
      success: true,
      data: {
        routes,
        trafficConditions: {
          totalSnapshots: recentSnapshots.length,
          activeIncidents: activeIncidents.length,
          congestionAreas: recentSnapshots.filter(s => 
            s.congestionLevel === 'heavy' || s.congestionLevel === 'severe'
          ).length
        }
      }
    });
  } catch (error) {
    console.error('Error suggesting routes:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to suggest routes'
    });
  }
});

// Helper function to generate route suggestions
function generateRoutes(
  origin: RoutePoint,
  destination: RoutePoint,
  snapshots: any[],
  incidents: any[],
  avoidCongestion: boolean
) {
  const routes = [];

  // Calculate direct distance
  const directDistance = calculateDistance(origin, destination);

  // Route 1: Fastest (considering current traffic)
  const fastestRoute = {
    id: 'route-1',
    name: 'Fastest Route',
    type: 'fastest',
    distance: directDistance,
    duration: calculateDuration(directDistance, snapshots, 'fastest'),
    congestionLevel: 'moderate',
    incidents: incidents.length,
    waypoints: [origin, destination],
    description: 'Recommended route based on current traffic conditions'
  };

  // Route 2: Shortest
  const shortestRoute = {
    id: 'route-2',
    name: 'Shortest Route',
    type: 'shortest',
    distance: directDistance * 0.95,
    duration: calculateDuration(directDistance * 0.95, snapshots, 'shortest'),
    congestionLevel: 'heavy',
    incidents: Math.floor(incidents.length * 0.6),
    waypoints: [origin, destination],
    description: 'Shortest distance but may have more traffic'
  };

  // Route 3: Avoid congestion
  if (avoidCongestion) {
    const alternateRoute = {
      id: 'route-3',
      name: 'Avoid Congestion',
      type: 'alternate',
      distance: directDistance * 1.15,
      duration: calculateDuration(directDistance * 1.15, snapshots, 'alternate'),
      congestionLevel: 'light',
      incidents: Math.floor(incidents.length * 0.2),
      waypoints: [origin, destination],
      description: 'Longer route but avoids heavy traffic areas'
    };
    routes.push(alternateRoute);
  }

  routes.unshift(fastestRoute, shortestRoute);

  return routes;
}

function calculateDistance(point1: RoutePoint, point2: RoutePoint): number {
  const R = 6371; // Earth's radius in km
  const dLat = toRad(point2.lat - point1.lat);
  const dLon = toRad(point2.lng - point1.lng);
  
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(toRad(point1.lat)) * Math.cos(toRad(point2.lat)) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(degrees: number): number {
  return degrees * (Math.PI / 180);
}

function calculateDuration(distance: number, snapshots: any[], routeType: string): number {
  // Base speed assumptions
  let avgSpeed = 40; // km/h
  
  if (routeType === 'fastest') {
    avgSpeed = 45;
  } else if (routeType === 'shortest') {
    avgSpeed = 30;
  } else if (routeType === 'alternate') {
    avgSpeed = 50;
  }

  // Adjust based on traffic conditions
  const congestionFactor = snapshots.length > 0 ? 0.8 : 1.0;
  
  return (distance / (avgSpeed * congestionFactor)) * 60; // minutes
}

export default router;
