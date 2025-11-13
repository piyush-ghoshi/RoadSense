import { Router, Request, Response } from 'express';
import prisma from '../lib/prisma';

const router = Router();

// GET /analytics/historical - Get historical traffic data
router.get('/historical', async (req: Request, res: Response) => {
  try {
    const { startDate, endDate, location } = req.query;
    
    const where: any = {};
    
    if (startDate || endDate) {
      where.timestamp = {};
      if (startDate) where.timestamp.gte = new Date(startDate as string);
      if (endDate) where.timestamp.lte = new Date(endDate as string);
    }
    
    if (location) {
      where.location = {
        contains: location as string
      };
    }

    const snapshots = await prisma.congestionSnapshot.findMany({
      where,
      orderBy: {
        timestamp: 'desc'
      },
      take: 1000
    });

    // Calculate statistics
    const stats = {
      totalSnapshots: snapshots.length,
      avgSpeed: snapshots.reduce((sum, s) => sum + (s.trafficSpeed || 0), 0) / snapshots.length,
      congestionDistribution: snapshots.reduce((acc: any, s) => {
        acc[s.congestionLevel] = (acc[s.congestionLevel] || 0) + 1;
        return acc;
      }, {})
    };

    res.json({
      success: true,
      data: snapshots,
      stats
    });
  } catch (error) {
    console.error('Error fetching historical data:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch historical data'
    });
  }
});

// GET /analytics/reports-summary - Get reports summary
router.get('/reports-summary', async (req: Request, res: Response) => {
  try {
    const totalReports = await prisma.trafficReport.count();
    const pendingReports = await prisma.trafficReport.count({
      where: { status: 'pending' }
    });
    const resolvedReports = await prisma.trafficReport.count({
      where: { status: 'resolved' }
    });

    const reportsByType = await prisma.trafficReport.groupBy({
      by: ['type'],
      _count: true
    });

    const reportsBySeverity = await prisma.trafficReport.groupBy({
      by: ['severity'],
      _count: true
    });

    res.json({
      success: true,
      data: {
        total: totalReports,
        pending: pendingReports,
        resolved: resolvedReports,
        byType: reportsByType,
        bySeverity: reportsBySeverity
      }
    });
  } catch (error) {
    console.error('Error fetching reports summary:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch reports summary'
    });
  }
});

export default router;
