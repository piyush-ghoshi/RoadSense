import { Router, Request, Response } from 'express';
import prisma from '../lib/prisma';

const router = Router();

// GET /traffic/live - Get live traffic data
router.get('/live', async (req: Request, res: Response) => {
  try {
    const { bounds } = req.query;
    
    // Get recent congestion snapshots (last 15 minutes)
    const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000);
    
    const snapshots = await prisma.congestionSnapshot.findMany({
      where: {
        timestamp: {
          gte: fifteenMinutesAgo
        }
      },
      orderBy: {
        timestamp: 'desc'
      }
    });

    res.json({
      success: true,
      data: snapshots,
      count: snapshots.length
    });
  } catch (error) {
    console.error('Error fetching live traffic:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch live traffic data'
    });
  }
});

// POST /traffic/snapshot - Create a new congestion snapshot
router.post('/snapshot', async (req: Request, res: Response) => {
  try {
    const { location, latitude, longitude, congestionLevel, trafficSpeed } = req.body;

    const snapshot = await prisma.congestionSnapshot.create({
      data: {
        location,
        latitude,
        longitude,
        congestionLevel,
        trafficSpeed
      }
    });

    // Broadcast to connected clients
    const io = req.app.get('io');
    io.emit('traffic:update', snapshot);

    res.status(201).json({
      success: true,
      data: snapshot
    });
  } catch (error) {
    console.error('Error creating snapshot:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create traffic snapshot'
    });
  }
});

export default router;
