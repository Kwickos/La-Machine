import { Router } from 'express';
import { ServerConfig } from '../models/ServerConfig.js';
import { requireRole, requireGuildAccess, AuthRequest } from '../middleware/auth.js';
import { asyncHandler, NotFoundError, ValidationError } from '../middleware/errorHandler.js';
import { logger } from '../../utils/logger.js';

const router = Router();

// Get server configuration
router.get('/guild/:guildId', requireGuildAccess(), asyncHandler(async (req: AuthRequest, res) => {
  const { guildId } = req.params;
  
  let config = await ServerConfig.findOne({ guildId });
  
  if (!config) {
    // Create default config
    config = new ServerConfig({
      guildId,
      briefChannel: '',
    });
    await config.save();
  }
  
  res.json({
    success: true,
    data: config,
  });
}));

// Update server configuration
router.put('/guild/:guildId', requireGuildAccess(), requireRole('admin', 'moderator'), asyncHandler(async (req: AuthRequest, res) => {
  const { guildId } = req.params;
  
  let config = await ServerConfig.findOne({ guildId });
  
  if (!config) {
    config = new ServerConfig({ guildId });
  }
  
  // Update allowed fields
  const allowedFields = [
    'guildName', 'briefChannel', 'scheduleEnabled', 'scheduleTime',
    'scheduleFrequency', 'scheduleDays', 'categories', 'difficulties',
    'autoReactions', 'adminRoles', 'moderatorRoles', 'notificationChannel',
    'language', 'timezone', 'features', 'aiSettings'
  ];
  
  for (const field of allowedFields) {
    if (req.body[field] !== undefined) {
      (config as any)[field] = req.body[field];
    }
  }
  
  await config.save();
  
  logger.info(`Server config updated for guild: ${guildId}`);
  
  res.json({
    success: true,
    data: config,
  });
}));

// Add template
router.post('/guild/:guildId/templates', requireGuildAccess(), requireRole('admin', 'moderator'), asyncHandler(async (req: AuthRequest, res) => {
  const { guildId } = req.params;
  const { name, content, category, difficulty } = req.body;
  
  if (!name || !content || !category || !difficulty) {
    throw new ValidationError('All template fields are required');
  }
  
  const config = await ServerConfig.findOne({ guildId });
  
  if (!config) {
    throw new NotFoundError('Server configuration not found');
  }
  
  config.templates.push({
    name,
    content,
    category,
    difficulty,
  });
  
  await config.save();
  
  logger.info(`Template added for guild: ${guildId}`);
  
  res.json({
    success: true,
    data: config.templates,
  });
}));

// Delete template
router.delete('/guild/:guildId/templates/:templateIndex', requireGuildAccess(), requireRole('admin', 'moderator'), asyncHandler(async (req: AuthRequest, res) => {
  const { guildId, templateIndex } = req.params;
  
  const config = await ServerConfig.findOne({ guildId });
  
  if (!config) {
    throw new NotFoundError('Server configuration not found');
  }
  
  const index = parseInt(templateIndex);
  if (index < 0 || index >= config.templates.length) {
    throw new ValidationError('Invalid template index');
  }
  
  config.templates.splice(index, 1);
  await config.save();
  
  logger.info(`Template deleted for guild: ${guildId}`);
  
  res.json({
    success: true,
    message: 'Template deleted successfully',
  });
}));

// Test AI settings
router.post('/guild/:guildId/test-ai', requireGuildAccess(), requireRole('admin'), asyncHandler(async (req: AuthRequest, res) => {
  const { guildId } = req.params;
  const { prompt } = req.body;
  
  const config = await ServerConfig.findOne({ guildId });
  
  if (!config) {
    throw new NotFoundError('Server configuration not found');
  }
  
  // TODO: Implement actual AI test using the configured settings
  
  res.json({
    success: true,
    message: 'AI test functionality pending implementation',
    settings: config.aiSettings,
  });
}));

// Get all managed guilds for user
router.get('/my-guilds', asyncHandler(async (req: AuthRequest, res) => {
  if (!req.user) {
    throw new ValidationError('User not found');
  }
  
  const configs = await ServerConfig.find({
    guildId: { $in: req.user.guilds }
  }).select('guildId guildName briefChannel statistics');
  
  res.json({
    success: true,
    data: configs,
  });
}));

export default router;