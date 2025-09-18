import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import session from 'express-session';
import rateLimit from 'express-rate-limit';
import { config } from 'dotenv';
import { logger } from '../utils/logger.js';
import { connectDatabase } from './database/connection.js';
import authRoutes from './routes/auth.js';
import briefRoutes from './routes/briefs.js';
import configRoutes from './routes/config.js';
import statsRoutes from './routes/stats.js';
import discordRoutes from './routes/discord.js';
import { errorHandler } from './middleware/errorHandler.js';
import { authenticate } from './middleware/auth.js';

config();

const app = express();
const PORT = process.env.WEB_PORT || 3000;

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));

// Compression
app.use(compression());

// CORS configuration
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3001',
  credentials: true,
}));

// Body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session configuration
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-secret-key-here',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
  },
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
});

app.use('/api/', limiter);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Public routes
app.use('/api/auth', authRoutes);

// Temporary: Allow stats without auth for testing
app.get('/api/stats/overview', (req, res) => {
  res.json({
    success: true,
    data: {
      briefs: { total: 42, published: 35 },
      submissions: { total: 128 },
      engagement: { average: 75 },
      topContributors: [
        { username: 'User1', submissions: 15 },
        { username: 'User2', submissions: 12 },
        { username: 'User3', submissions: 8 }
      ]
    }
  });
});

// Protected routes
app.use('/api/briefs', authenticate, briefRoutes);
app.use('/api/config', authenticate, configRoutes);
app.use('/api/stats', authenticate, statsRoutes);
app.use('/api/discord', authenticate, discordRoutes);

// Static files for dashboard
app.use(express.static('public'));

// Error handling
app.use(errorHandler);

// Start server
export async function startWebServer() {
  try {
    await connectDatabase();
    
    app.listen(PORT, () => {
      logger.info(`Web server running on port ${PORT}`);
      logger.info(`Dashboard available at http://localhost:${PORT}`);
    });
  } catch (error) {
    logger.error('Failed to start web server:', error);
    process.exit(1);
  }
}

export default app;