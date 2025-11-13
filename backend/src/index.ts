import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { Server } from 'socket.io';
import reportsRouter from './routes/reports';
import trafficRouter from './routes/traffic';
import analyticsRouter from './routes/analytics';
import alertsRouter from './routes/alerts';
import congestionRouter from './routes/congestion';
import routesRouter from './routes/routes';

dotenv.config();

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    methods: ['GET', 'POST']
  }
});

const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Make io accessible to routes
app.set('io', io);

// Health check route
app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', message: 'Smart Traffic Management System API is running' });
});

// API routes
app.get('/api', (req: Request, res: Response) => {
  res.json({ message: 'Welcome to Smart Traffic Management System API' });
});

app.use('/api/reports', reportsRouter);
app.use('/api/traffic', trafficRouter);
app.use('/api/analytics', analyticsRouter);
app.use('/api/alerts', alertsRouter);
app.use('/api/congestion', congestionRouter);
app.use('/api/routes', routesRouter);

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);
  
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// Start server
httpServer.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`🔌 Socket.IO ready for connections`);
});

