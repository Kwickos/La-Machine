import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import session from 'express-session';
import rateLimit from 'express-rate-limit';
import mongoose from 'mongoose';
import passport from 'passport';
import { config } from 'dotenv';
import { logger } from '../utils/logger.js';
import authRoutes from './routes/auth.js';
import guildsRoutes from './routes/guilds.js';
import briefRoutes from './routes/briefs.js';
import configRoutes from './routes/config.js';
import statsRoutes from './routes/stats.js';
import discordRoutes from './routes/discord.js';
import { errorHandler } from './middleware/errorHandler.js';
import { authenticate } from './middleware/auth.js';
import './auth/discordStrategy.js';
import { getBriefStats } from './services/discordService.js';

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

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: 'Too many requests from this IP, please try again later.',
});

app.use('/api/', limiter);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  });
});

// Public routes
app.use('/api/auth', authRoutes);

// Protected routes that need authentication
app.use('/api/guilds', authenticate, guildsRoutes);

// Stats endpoint - returns real data only
app.get('/api/stats/overview', async (req, res) => {
  try {
    // Try to get real data from MongoDB
    if (mongoose.connection.readyState === 1) {
      const Brief = (await import('./models/Brief.js')).Brief;
      const User = (await import('./models/User.js')).User;
      
      const briefCount = await Brief.countDocuments();
      const publishedCount = await Brief.countDocuments({ status: 'published' });
      const userCount = await User.countDocuments();
      
      const topContributors = await Brief.aggregate([
        { $unwind: '$submissions' },
        {
          $group: {
            _id: '$submissions.username',
            submissions: { $sum: 1 }
          }
        },
        { $sort: { submissions: -1 } },
        { $limit: 3 },
        {
          $project: {
            _id: 0,
            username: '$_id',
            submissions: 1
          }
        }
      ]);
      
      res.json({
        success: true,
        data: {
          briefs: { 
            total: briefCount, 
            published: publishedCount 
          },
          submissions: { 
            total: topContributors.reduce((sum, c) => sum + c.submissions, 0) 
          },
          engagement: { 
            average: publishedCount > 0 ? Math.round((briefCount / publishedCount) * 100) : 0 
          },
          topContributors
        }
      });
    } else {
      // Return empty data if MongoDB not connected
      res.json({
        success: true,
        data: {
          briefs: { total: 0, published: 0 },
          submissions: { total: 0 },
          engagement: { average: 0 },
          topContributors: []
        }
      });
    }
  } catch (error) {
    logger.error('Error fetching stats:', error);
    // Return empty data on error
    res.json({
      success: true,
      data: {
        briefs: { total: 0, published: 0 },
        submissions: { total: 0 },
        engagement: { average: 0 },
        topContributors: []
      }
    });
  }
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

// Connect to MongoDB
async function connectDatabase() {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/la-machine';
    
    await mongoose.connect(mongoUri);
    
    logger.info('Connected to MongoDB');
    
    mongoose.connection.on('error', (err) => {
      logger.error('MongoDB connection error:', err);
    });
    
    mongoose.connection.on('disconnected', () => {
      logger.warn('MongoDB disconnected');
    });
    
    process.on('SIGINT', async () => {
      await mongoose.connection.close();
      logger.info('MongoDB connection closed through app termination');
      process.exit(0);
    });
  } catch (error) {
    logger.error('Failed to connect to MongoDB:', error);
    logger.info('Starting without database - some features will be limited');
  }
}

// Start server
export async function startFullServer() {
  try {
    await connectDatabase();
    
    const server = app.listen(PORT, () => {
      logger.info(`Web server running on port ${PORT}`);
      logger.info(`Dashboard available at http://localhost:${PORT}`);
      logger.info(`Frontend at http://localhost:3001`);
      
      // Log Discord OAuth URL for setup
      const discordOAuthUrl = `https://discord.com/api/oauth2/authorize?client_id=${process.env.DISCORD_CLIENT_ID}&redirect_uri=${encodeURIComponent(process.env.DISCORD_CALLBACK_URL || 'http://localhost:3000/api/auth/discord/callback')}&response_type=code&scope=identify%20email%20guilds`;
      logger.info(`Discord OAuth URL: ${discordOAuthUrl}`);
    });
    
    return server;
  } catch (error) {
    logger.error('Failed to start web server:', error);
    process.exit(1);
  }
}

// Start if run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  startFullServer();
}

export default app;