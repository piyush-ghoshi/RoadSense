import { Router, Request, Response } from 'express';
import prisma from '../lib/prisma';
import { z } from 'zod';

const router = Router();

const createAlertSchema = z.object({
  type: z.enum(['traffic', 'incident', 'system']),
  title: z.string().min(1),
  message: z.string().min(1),
  severity: z.enum(['info', 'warning', 'critical']).optional(),
  location: z.string().optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  expiresAt: z.string().optional()
});

// GET /alerts - Get active alerts
router.get('/', async (req: Request, res: Response) => {
  try {
    const alerts = await prisma.alert.findMany({
      where: {
        isActive: true,
        OR: [
          { expiresAt: null },
          { expiresAt: { gte: new Date() } }
        ]
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    res.json({
      success: true,
      data: alerts,
      count: alerts.length
    });
  } catch (error) {
    console.error('Error fetching alerts:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch alerts'
    });
  }
});

// POST /alerts - Create a new alert
router.post('/', async (req: Request, res: Response) => {
  try {
    const validatedData = createAlertSchema.parse(req.body);
    
    const alert = await prisma.alert.create({
      data: {
        ...validatedData,
        severity: validatedData.severity || 'info',
        expiresAt: validatedData.expiresAt ? new Date(validatedData.expiresAt) : null
      }
    });

    // Broadcast alert to all connected clients
    const io = req.app.get('io');
    io.emit('alert:new', alert);

    res.status(201).json({
      success: true,
      data: alert
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: 'Validation error',
        details: error.errors
      });
    }
    
    console.error('Error creating alert:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create alert'
    });
  }
});

// PATCH /alerts/:id/deactivate - Deactivate an alert
router.patch('/:id/deactivate', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const alert = await prisma.alert.update({
      where: { id },
      data: { isActive: false }
    });

    res.json({
      success: true,
      data: alert
    });
  } catch (error) {
    console.error('Error deactivating alert:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to deactivate alert'
    });
  }
});

export default router;
