import { Router, Request, Response } from 'express';
import prisma from '../lib/prisma';
import { z } from 'zod';

const router = Router();

// Validation schema for creating a report
const createReportSchema = z.object({
  type: z.enum(['accident', 'roadblock', 'diversion', 'congestion', 'other']),
  severity: z.enum(['low', 'medium', 'high', 'critical']).optional(),
  location: z.string().min(1),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  description: z.string().optional(),
  userId: z.string().optional(),
});

// POST /reports - Create a new traffic report
router.post('/', async (req: Request, res: Response) => {
  try {
    const validatedData = createReportSchema.parse(req.body);
    
    const report = await prisma.trafficReport.create({
      data: {
        ...validatedData,
        severity: validatedData.severity || 'medium',
      },
    });

    res.status(201).json({
      success: true,
      data: report,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: 'Validation error',
        details: error.errors,
      });
    }
    
    console.error('Error creating report:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create report',
    });
  }
});

// GET /reports - Get all reports with optional filters
router.get('/', async (req: Request, res: Response) => {
  try {
    const { status, severity, type, limit = '50' } = req.query;
    
    const where: any = {};
    if (status) where.status = status;
    if (severity) where.severity = severity;
    if (type) where.type = type;

    const reports = await prisma.trafficReport.findMany({
      where,
      take: parseInt(limit as string),
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    res.json({
      success: true,
      data: reports,
      count: reports.length,
    });
  } catch (error) {
    console.error('Error fetching reports:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch reports',
    });
  }
});

// GET /reports/:id - Get a specific report
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const report = await prisma.trafficReport.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    if (!report) {
      return res.status(404).json({
        success: false,
        error: 'Report not found',
      });
    }

    res.json({
      success: true,
      data: report,
    });
  } catch (error) {
    console.error('Error fetching report:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch report',
    });
  }
});

// PATCH /reports/:id - Update report status (for authorities)
router.patch('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status || !['pending', 'verified', 'resolved', 'false'].includes(status)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid status. Must be one of: pending, verified, resolved, false',
      });
    }

    const report = await prisma.trafficReport.update({
      where: { id },
      data: { status },
    });

    res.json({
      success: true,
      data: report,
    });
  } catch (error) {
    console.error('Error updating report:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update report',
    });
  }
});

export default router;

