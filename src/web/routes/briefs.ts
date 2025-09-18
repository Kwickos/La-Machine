import { Router } from 'express';
import { Brief } from '../models/Brief.js';
import { ServerConfig } from '../models/ServerConfig.js';
import { requireRole, requireGuildAccess, AuthRequest } from '../middleware/auth.js';
import { asyncHandler, NotFoundError, ValidationError } from '../middleware/errorHandler.js';
import { logger } from '../../utils/logger.js';

const router = Router();

// Get all briefs for a guild
router.get('/guild/:guildId', requireGuildAccess(), asyncHandler(async (req: AuthRequest, res) => {
  const { guildId } = req.params;
  const { page = 1, limit = 20, status, category, difficulty, tags } = req.query;
  
  const query: any = { guildId };
  
  if (status) query.status = status;
  if (category) query.category = category;
  if (difficulty) query.difficulty = difficulty;
  if (tags) query.tags = { $in: Array.isArray(tags) ? tags : [tags] };
  
  const briefs = await Brief.find(query)
    .sort({ createdAt: -1 })
    .limit(Number(limit))
    .skip((Number(page) - 1) * Number(limit));
  
  const total = await Brief.countDocuments(query);
  
  res.json({
    success: true,
    data: briefs,
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total,
      pages: Math.ceil(total / Number(limit)),
    },
  });
}));

// Get single brief
router.get('/:id', asyncHandler(async (req: AuthRequest, res) => {
  const brief = await Brief.findById(req.params.id);
  
  if (!brief) {
    throw new NotFoundError('Brief not found');
  }
  
  // Check guild access
  if (req.user?.role !== 'admin' && !req.user?.guilds.includes(brief.guildId)) {
    throw new NotFoundError('Brief not found');
  }
  
  res.json({
    success: true,
    data: brief,
  });
}));

// Create new brief
router.post('/', requireGuildAccess(), asyncHandler(async (req: AuthRequest, res) => {
  const {
    guildId,
    title,
    content,
    category,
    difficulty,
    objectives,
    constraints,
    deliverables,
    tags,
  } = req.body;
  
  // Validate required fields
  if (!guildId || !title || !content || !category || !difficulty) {
    throw new ValidationError('Missing required fields');
  }
  
  // Get guild config
  const config = await ServerConfig.findOne({ guildId });
  if (!config) {
    throw new ValidationError('Guild not configured');
  }
  
  // Create brief
  const brief = new Brief({
    guildId,
    guildName: config.guildName,
    channelId: config.briefChannel,
    title,
    content,
    category,
    difficulty,
    objectives: objectives || [],
    constraints: constraints || [],
    deliverables: deliverables || [],
    tags: tags || [],
    generatedBy: 'manual',
    createdBy: req.user?._id,
    status: 'draft',
  });
  
  await brief.save();
  
  // Update statistics
  config.statistics.totalBriefs += 1;
  await config.save();
  
  logger.info(`New brief created: ${title} in guild ${guildId}`);
  
  res.status(201).json({
    success: true,
    data: brief,
  });
}));

// Update brief
router.put('/:id', asyncHandler(async (req: AuthRequest, res) => {
  const brief = await Brief.findById(req.params.id);
  
  if (!brief) {
    throw new NotFoundError('Brief not found');
  }
  
  // Check permissions
  if (req.user?.role !== 'admin' && !req.user?.guilds.includes(brief.guildId)) {
    throw new NotFoundError('Brief not found');
  }
  
  // Update allowed fields
  const allowedFields = [
    'title', 'content', 'category', 'difficulty',
    'objectives', 'constraints', 'deliverables', 'tags', 'status'
  ];
  
  for (const field of allowedFields) {
    if (req.body[field] !== undefined) {
      (brief as any)[field] = req.body[field];
    }
  }
  
  await brief.save();
  
  logger.info(`Brief updated: ${brief._id}`);
  
  res.json({
    success: true,
    data: brief,
  });
}));

// Delete brief
router.delete('/:id', requireRole('admin', 'moderator'), asyncHandler(async (req: AuthRequest, res) => {
  const brief = await Brief.findById(req.params.id);
  
  if (!brief) {
    throw new NotFoundError('Brief not found');
  }
  
  // Check permissions
  if (req.user?.role !== 'admin' && !req.user?.guilds.includes(brief.guildId)) {
    throw new NotFoundError('Brief not found');
  }
  
  await brief.deleteOne();
  
  logger.info(`Brief deleted: ${req.params.id}`);
  
  res.json({
    success: true,
    message: 'Brief deleted successfully',
  });
}));

// Publish brief to Discord
router.post('/:id/publish', requireGuildAccess(), asyncHandler(async (req: AuthRequest, res) => {
  const brief = await Brief.findById(req.params.id);
  
  if (!brief) {
    throw new NotFoundError('Brief not found');
  }
  
  if (brief.status === 'published') {
    throw new ValidationError('Brief already published');
  }
  
  // TODO: Integrate with Discord bot to actually post the brief
  
  brief.status = 'published';
  brief.publishedAt = new Date();
  await brief.save();
  
  logger.info(`Brief published: ${brief._id}`);
  
  res.json({
    success: true,
    data: brief,
    message: 'Brief published successfully',
  });
}));

// Get brief statistics
router.get('/guild/:guildId/stats', requireGuildAccess(), asyncHandler(async (req: AuthRequest, res) => {
  const { guildId } = req.params;
  
  const stats = await Brief.aggregate([
    { $match: { guildId } },
    {
      $group: {
        _id: null,
        total: { $sum: 1 },
        published: {
          $sum: { $cond: [{ $eq: ['$status', 'published'] }, 1, 0] }
        },
        draft: {
          $sum: { $cond: [{ $eq: ['$status', 'draft'] }, 1, 0] }
        },
        archived: {
          $sum: { $cond: [{ $eq: ['$status', 'archived'] }, 1, 0] }
        },
        totalSubmissions: { $sum: { $size: '$submissions' } },
        avgReactions: { $avg: { $size: '$reactions' } },
      }
    },
    {
      $project: {
        _id: 0,
        total: 1,
        published: 1,
        draft: 1,
        archived: 1,
        totalSubmissions: 1,
        avgReactions: { $round: ['$avgReactions', 1] },
      }
    }
  ]);
  
  const categoryStats = await Brief.aggregate([
    { $match: { guildId } },
    { $group: { _id: '$category', count: { $sum: 1 } } },
    { $sort: { count: -1 } },
  ]);
  
  const difficultyStats = await Brief.aggregate([
    { $match: { guildId } },
    { $group: { _id: '$difficulty', count: { $sum: 1 } } },
    { $sort: { _id: 1 } },
  ]);
  
  res.json({
    success: true,
    data: {
      overview: stats[0] || {},
      byCategory: categoryStats,
      byDifficulty: difficultyStats,
    },
  });
}));

export default router;