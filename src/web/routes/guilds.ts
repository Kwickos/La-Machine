import { Router } from 'express';
import { authenticate, AuthRequest } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { getUserAdminGuilds, getGuildDetails } from '../services/guildService.js';
import { logger } from '../../utils/logger.js';

const router = Router();

// Get user's admin guilds where bot is present
router.get('/my-guilds', authenticate, asyncHandler(async (req: AuthRequest, res) => {
    const user = req.user as any;
    
    logger.info(`Fetching guilds for user: ${user.username} (${user.discordId})`);
    
    if (!user.discordAccessToken) {
        logger.warn(`User ${user.username} has no Discord access token`);
        // Need to re-authenticate with Discord
        return res.status(401).json({
            error: 'Discord authentication required',
            message: 'Please login again with Discord'
        });
    }
    
    const guilds = await getUserAdminGuilds(user.discordAccessToken);
    logger.info(`Found ${guilds.length} admin guilds for user ${user.username}`);
    
    res.json({
        success: true,
        data: guilds,
        count: guilds.length
    });
}));

// Get detailed guild information
router.get('/:guildId/details', authenticate, asyncHandler(async (req: AuthRequest, res) => {
    const { guildId } = req.params;
    const user = req.user as any;
    
    // Check if user has access to this guild
    if (!user.discordAccessToken) {
        return res.status(401).json({
            error: 'Discord authentication required'
        });
    }
    
    const userGuilds = await getUserAdminGuilds(user.discordAccessToken);
    const hasAccess = userGuilds.some(g => g.id === guildId);
    
    if (!hasAccess) {
        return res.status(403).json({
            error: 'Access denied',
            message: 'You do not have admin access to this guild'
        });
    }
    
    const guildDetails = await getGuildDetails(guildId);
    
    res.json({
        success: true,
        data: guildDetails
    });
}));

export default router;