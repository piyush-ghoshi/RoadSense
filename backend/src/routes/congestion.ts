import { Router, Request, Response } from 'express';
import prisma from '../lib/prisma';

const router = Router();

// GET /congestion/detect - Detect congestion in specific area
router.get('/detect', async (req: Request, res: Response) => {
  try {
    const { latitude, longitude, radius = 5 } = req.query;

    if (!latitude || !longitude) {
      return res.status(400).json({
        success: false,
        error: 'Latitude and longitude are required'
      });
    }

    const lat = parseFloat(latitude as string);
    const lng = parseFloat(longitude as string);
    const rad = parseFloat(radius as string);

    // Get recent snapshots within radius (simplified calculation)
    const recentSnapshots = await prisma.congestionSnapshot.findMany({
      where: {
        timestamp: {
          gte: new Date(Date.now() - 30 * 60 * 1000) // Last 30 minutes
        }
      },
      orderBy: {
        timestamp: 'desc'
      }
    });

    // Filter by approximate distance and analyze congestion
    const nearbySnapshots = recentSnapshots.filter(snapshot => {
      const latDiff = Math.abs(snapshot.latitude - lat);
      const lngDiff = Math.abs(snapshot.longitude - lng);
      const distance = Math.sqrt(latDiff * latDiff + lngDiff * lngDiff);
      return distance <= rad / 111; // Rough conversion to degrees
    });

    // Calculate congestion metrics
    const congestionLevels = nearbySnapshots.map(s => s.congestionLevel);
    const severeCount = congestionLevels.filter(l => l === 'severe').length;
    const heavyCount = congestionLevels.filter(l => l === 'heavy').length;
    
    const avgSpeed = nearbySnapshots.reduce((sum, s) => sum + (s.trafficSpeed || 0), 0) / 
                     (nearbySnapshots.length || 1);

    const congestionDetected = severeCount > 0 || heavyCount >= 2 || avgSpeed < 20;

    // Get related incidents
    const incidents = await prisma.trafficReport.findMany({
      where: {
        status: { in: ['pending', 'verified'] },
        createdAt: {
          gte: new Date(Date.now() - 60 * 60 * 1000) // Last hour
        }
      },
      take: 10
    });

    res.json({
      success: true,
      data: {
        congestionDetected,
        severity: severeCount > 0 ? 'severe' : heavyCount >= 2 ? 'heavy' : 'moderate',
        metrics: {
          averageSpeed: avgSpeed.toFixed(1),
          snapshotsAnalyzed: nearbySnapshots.length,
          severeAreas: severeCount,
          heavyAreas: heavyCount
        },
        snapshots: nearbySnapshots,
        relatedIncidents: incidents
      }
    });
  } catch (error) {
    console.error('Error detecting congestion:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to detect congestion'
    });
  }
});

// GET /congestion/heatmap - Get heatmap data
router.get('/heatmap', async (req: Request, res: Response) => {
  try {
    const { timeRange = '60' } = req.query;
    const minutes = parseInt(timeRange as string);

    const snapshots = await prisma.congestionSnapshot.findMany({
      where: {
        timestamp: {
          gte: new Date(Date.now() - minutes * 60 * 1000)
        }
      },
      orderBy: {
        timestamp: 'desc'
      }
    });

    // Convert to heatmap format
    const heatmapData = snapshots.map(snapshot => ({
      lat: snapshot.latitude,
      lng: snapshot.longitude,
      intensity: getIntensityValue(snapshot.congestionLevel),
      location: snapshot.location,
      speed: snapshot.trafficSpeed,
      timestamp: snapshot.timestamp
    }));

    res.json({
      success: true,
      data: heatmapData,
      count: heatmapData.length
    });
  } catch (error) {
    console.error('Error fetching heatmap data:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch heatmap data'
    });
  }
});

// Helper function to convert congestion level to intensity
function getIntensityValue(level: string): number {
  switch (level) {
    case 'severe': return 1.0;
    case 'heavy': return 0.75;
    case 'moderate': return 0.5;
    case 'light': return 0.25;
    default: return 0.1;
  }
}

export default router;
