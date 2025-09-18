import { Router } from 'express';
import { Brief } from '../models/Brief.js';
import { ServerConfig } from '../models/ServerConfig.js';
import { requireGuildAccess, AuthRequest } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/errorHandler.js';

const router = Router();

// Get comprehensive statistics for a guild
router.get('/guild/:guildId', requireGuildAccess(), asyncHandler(async (req: AuthRequest, res) => {
  const { guildId } = req.params;
  const { startDate, endDate } = req.query;
  
  const dateFilter: any = {};
  if (startDate) dateFilter.$gte = new Date(startDate as string);
  if (endDate) dateFilter.$lte = new Date(endDate as string);
  
  const matchStage: any = { guildId };
  if (Object.keys(dateFilter).length > 0) {
    matchStage.createdAt = dateFilter;
  }
  
  // Brief statistics
  const briefStats = await Brief.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: null,
        total: { $sum: 1 },
        published: {
          $sum: { $cond: [{ $eq: ['$status', 'published'] }, 1, 0] }
        },
        totalSubmissions: { $sum: { $size: '$submissions' } },
        totalReactions: { $sum: { $size: '$reactions' } },
        avgSubmissionsPerBrief: { $avg: { $size: '$submissions' } },
        avgReactionsPerBrief: { $avg: { $size: '$reactions' } },
      }
    }
  ]);
  
  // Category distribution
  const categoryDistribution = await Brief.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: '$category',
        count: { $sum: 1 },
        submissions: { $sum: { $size: '$submissions' } },
      }
    },
    { $sort: { count: -1 } }
  ]);
  
  // Difficulty distribution
  const difficultyDistribution = await Brief.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: '$difficulty',
        count: { $sum: 1 },
        submissions: { $sum: { $size: '$submissions' } },
      }
    },
    { $sort: { _id: 1 } }
  ]);
  
  // Time series data (last 30 days)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  
  const timeSeriesData = await Brief.aggregate([
    {
      $match: {
        guildId,
        createdAt: { $gte: thirtyDaysAgo }
      }
    },
    {
      $group: {
        _id: {
          day: { $dayOfMonth: '$createdAt' },
          month: { $month: '$createdAt' },
          year: { $year: '$createdAt' }
        },
        briefs: { $sum: 1 },
        submissions: { $sum: { $size: '$submissions' } },
      }
    },
    { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } }
  ]);
  
  // Top performers (users with most submissions)
  const topPerformers = await Brief.aggregate([
    { $match: { guildId, status: 'published' } },
    { $unwind: '$submissions' },
    {
      $group: {
        _id: '$submissions.userId',
        username: { $first: '$submissions.username' },
        count: { $sum: 1 },
        approved: {
          $sum: {
            $cond: [{ $eq: ['$submissions.status', 'approved'] }, 1, 0]
          }
        }
      }
    },
    { $sort: { count: -1 } },
    { $limit: 10 }
  ]);
  
  // Most popular tags
  const popularTags = await Brief.aggregate([
    { $match: matchStage },
    { $unwind: '$tags' },
    {
      $group: {
        _id: '$tags',
        count: { $sum: 1 }
      }
    },
    { $sort: { count: -1 } },
    { $limit: 20 }
  ]);
  
  // Engagement metrics
  const engagementMetrics = await Brief.aggregate([
    { $match: { guildId, status: 'published' } },
    {
      $project: {
        hasSubmissions: { $gt: [{ $size: '$submissions' }, 0] },
        hasReactions: { $gt: [{ $size: '$reactions' }, 0] },
        submissionCount: { $size: '$submissions' },
        reactionCount: { $size: '$reactions' },
      }
    },
    {
      $group: {
        _id: null,
        totalPublished: { $sum: 1 },
        withSubmissions: {
          $sum: { $cond: ['$hasSubmissions', 1, 0] }
        },
        withReactions: {
          $sum: { $cond: ['$hasReactions', 1, 0] }
        },
        totalSubmissions: { $sum: '$submissionCount' },
        totalReactions: { $sum: '$reactionCount' },
      }
    },
    {
      $project: {
        _id: 0,
        totalPublished: 1,
        submissionRate: {
          $multiply: [
            { $divide: ['$withSubmissions', '$totalPublished'] },
            100
          ]
        },
        reactionRate: {
          $multiply: [
            { $divide: ['$withReactions', '$totalPublished'] },
            100
          ]
        },
        avgSubmissions: {
          $divide: ['$totalSubmissions', '$totalPublished']
        },
        avgReactions: {
          $divide: ['$totalReactions', '$totalPublished']
        },
      }
    }
  ]);
  
  res.json({
    success: true,
    data: {
      overview: briefStats[0] || {},
      categoryDistribution,
      difficultyDistribution,
      timeSeriesData,
      topPerformers,
      popularTags,
      engagement: engagementMetrics[0] || {},
    },
  });
}));

// Get user statistics
router.get('/user/:userId', asyncHandler(async (req: AuthRequest, res) => {
  const { userId } = req.params;
  
  const userStats = await Brief.aggregate([
    { $unwind: '$submissions' },
    { $match: { 'submissions.userId': userId } },
    {
      $group: {
        _id: null,
        totalSubmissions: { $sum: 1 },
        approved: {
          $sum: {
            $cond: [{ $eq: ['$submissions.status', 'approved'] }, 1, 0]
          }
        },
        pending: {
          $sum: {
            $cond: [{ $eq: ['$submissions.status', 'pending'] }, 1, 0]
          }
        },
        rejected: {
          $sum: {
            $cond: [{ $eq: ['$submissions.status', 'rejected'] }, 1, 0]
          }
        },
      }
    }
  ]);
  
  const categoriesCompleted = await Brief.aggregate([
    { $unwind: '$submissions' },
    { $match: { 'submissions.userId': userId } },
    { $group: { _id: '$category' } },
    { $count: 'uniqueCategories' }
  ]);
  
  const difficultiesCompleted = await Brief.aggregate([
    { $unwind: '$submissions' },
    { $match: { 'submissions.userId': userId } },
    { $group: { _id: '$difficulty' } },
    { $sort: { _id: 1 } }
  ]);
  
  res.json({
    success: true,
    data: {
      overview: userStats[0] || {
        totalSubmissions: 0,
        approved: 0,
        pending: 0,
        rejected: 0,
      },
      categoriesCompleted: categoriesCompleted[0]?.uniqueCategories || 0,
      difficultiesCompleted: difficultiesCompleted.map(d => d._id),
    },
  });
}));

// Get leaderboard
router.get('/guild/:guildId/leaderboard', requireGuildAccess(), asyncHandler(async (req: AuthRequest, res) => {
  const { guildId } = req.params;
  const { period = 'all', limit = 10 } = req.query;
  
  let dateFilter = {};
  const now = new Date();
  
  switch (period) {
    case 'week':
      const weekAgo = new Date(now);
      weekAgo.setDate(weekAgo.getDate() - 7);
      dateFilter = { $gte: weekAgo };
      break;
    case 'month':
      const monthAgo = new Date(now);
      monthAgo.setMonth(monthAgo.getMonth() - 1);
      dateFilter = { $gte: monthAgo };
      break;
    case 'year':
      const yearAgo = new Date(now);
      yearAgo.setFullYear(yearAgo.getFullYear() - 1);
      dateFilter = { $gte: yearAgo };
      break;
  }
  
  const matchStage: any = { guildId, status: 'published' };
  if (Object.keys(dateFilter).length > 0) {
    matchStage['submissions.submittedAt'] = dateFilter;
  }
  
  const leaderboard = await Brief.aggregate([
    { $match: { guildId, status: 'published' } },
    { $unwind: '$submissions' },
    ...(Object.keys(dateFilter).length > 0 
      ? [{ $match: { 'submissions.submittedAt': dateFilter } }] 
      : []),
    {
      $group: {
        _id: '$submissions.userId',
        username: { $first: '$submissions.username' },
        totalSubmissions: { $sum: 1 },
        approvedSubmissions: {
          $sum: {
            $cond: [{ $eq: ['$submissions.status', 'approved'] }, 1, 0]
          }
        },
        score: {
          $sum: {
            $switch: {
              branches: [
                { case: { $eq: ['$submissions.status', 'approved'] }, then: 10 },
                { case: { $eq: ['$submissions.status', 'pending'] }, then: 5 },
              ],
              default: 0
            }
          }
        }
      }
    },
    { $sort: { score: -1, totalSubmissions: -1 } },
    { $limit: Number(limit) },
    {
      $project: {
        _id: 0,
        userId: '$_id',
        username: 1,
        totalSubmissions: 1,
        approvedSubmissions: 1,
        score: 1,
        rank: { $add: [{ $indexOfArray: ['$_id', '$_id'] }, 1] }
      }
    }
  ]);
  
  res.json({
    success: true,
    data: leaderboard,
    period,
  });
}));

export default router;