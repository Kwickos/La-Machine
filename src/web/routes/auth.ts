import { Router } from 'express';
import passport from 'passport';
import { User } from '../models/User.js';
import { generateToken } from '../middleware/auth.js';
import { asyncHandler, ValidationError, AuthenticationError } from '../middleware/errorHandler.js';
import { logger } from '../../utils/logger.js';
import '../auth/discordStrategy.js';

const router = Router();

// Register new user
router.post('/register', asyncHandler(async (req, res) => {
  const { username, email, password, discordId } = req.body;
  
  // Validate input
  if (!username || !email || !password) {
    throw new ValidationError('Username, email and password are required');
  }
  
  // Check if user exists
  const existingUser = await User.findOne({
    $or: [{ email }, { username }]
  });
  
  if (existingUser) {
    throw new ValidationError('User already exists with this email or username');
  }
  
  // Create new user
  const user = new User({
    username,
    email,
    password,
    discordId,
  });
  
  await user.save();
  
  // Generate token
  const token = generateToken(user._id.toString());
  
  // Update last login
  user.lastLogin = new Date();
  await user.save();
  
  logger.info(`New user registered: ${username}`);
  
  res.status(201).json({
    success: true,
    token,
    user: {
      id: user._id,
      username: user.username,
      email: user.email,
      role: user.role,
      guilds: user.guilds,
    },
  });
}));

// Login
router.post('/login', asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  
  if (!email || !password) {
    throw new ValidationError('Email and password are required');
  }
  
  // Find user
  const user = await User.findOne({ email });
  
  if (!user || !await user.comparePassword(password)) {
    throw new AuthenticationError('Invalid email or password');
  }
  
  if (!user.isActive) {
    throw new AuthenticationError('Account is inactive');
  }
  
  // Generate token
  const token = generateToken(user._id.toString());
  
  // Update last login
  user.lastLogin = new Date();
  await user.save();
  
  logger.info(`User logged in: ${user.username}`);
  
  res.json({
    success: true,
    token,
    user: {
      id: user._id,
      username: user.username,
      email: user.email,
      role: user.role,
      guilds: user.guilds,
      discordId: user.discordId,
      discordUsername: user.discordUsername,
    },
  });
}));

// Discord OAuth login
router.get('/discord', passport.authenticate('discord'));

// Discord OAuth callback
router.get('/discord/callback', 
  passport.authenticate('discord', { failureRedirect: '/login' }),
  asyncHandler(async (req, res) => {
    if (!req.user) {
      throw new AuthenticationError('Authentication failed');
    }
    
    const user = req.user as any;
    const token = generateToken(user._id.toString());
    
    // Update last login
    user.lastLogin = new Date();
    await user.save();
    
    logger.info(`User logged in via Discord: ${user.username}`);
    
    // Redirect to frontend with token
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3001';
    res.redirect(`${frontendUrl}/auth/callback?token=${token}`);
  })
);

// Logout
router.post('/logout', (req, res) => {
  if (req.session) {
    req.session.destroy((err) => {
      if (err) {
        logger.error('Session destruction error:', err);
      }
    });
  }
  
  res.json({
    success: true,
    message: 'Logged out successfully',
  });
});

// Refresh token
router.post('/refresh', asyncHandler(async (req, res) => {
  const { token } = req.body;
  
  if (!token) {
    throw new ValidationError('Token required');
  }
  
  // TODO: Implement refresh token logic
  
  res.json({
    success: true,
    message: 'Token refresh implementation pending',
  });
}));

export default router;