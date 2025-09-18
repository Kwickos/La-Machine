import { Router } from 'express';
import { Client, GuildBasedChannel } from 'discord.js';
import { requireGuildAccess, requireRole, AuthRequest } from '../middleware/auth.js';
import { asyncHandler, NotFoundError, ValidationError } from '../middleware/errorHandler.js';
import { logger } from '../../utils/logger.js';

const router = Router();

// Get Discord bot instance (will be injected from main app)
let discordClient: Client | null = null;

export function setDiscordClient(client: Client) {
  discordClient = client;
}

// Get guild information
router.get('/guild/:guildId/info', requireGuildAccess(), asyncHandler(async (req: AuthRequest, res) => {
  const { guildId } = req.params;
  
  if (!discordClient) {
    throw new ValidationError('Discord bot not connected');
  }
  
  const guild = discordClient.guilds.cache.get(guildId);
  
  if (!guild) {
    throw new NotFoundError('Guild not found or bot not in guild');
  }
  
  res.json({
    success: true,
    data: {
      id: guild.id,
      name: guild.name,
      icon: guild.iconURL(),
      memberCount: guild.memberCount,
      owner: {
        id: guild.ownerId,
        username: guild.members.cache.get(guild.ownerId)?.user.username,
      },
      channels: guild.channels.cache
        .filter(channel => channel.type === 0) // Text channels only
        .map(channel => ({
          id: channel.id,
          name: channel.name,
          type: channel.type,
        })),
      roles: guild.roles.cache
        .filter(role => !role.managed && role.name !== '@everyone')
        .map(role => ({
          id: role.id,
          name: role.name,
          color: role.hexColor,
          position: role.position,
        }))
        .sort((a, b) => b.position - a.position),
    },
  });
}));

// Get guild members
router.get('/guild/:guildId/members', requireGuildAccess(), asyncHandler(async (req: AuthRequest, res) => {
  const { guildId } = req.params;
  const { role, limit = 100 } = req.query;
  
  if (!discordClient) {
    throw new ValidationError('Discord bot not connected');
  }
  
  const guild = discordClient.guilds.cache.get(guildId);
  
  if (!guild) {
    throw new NotFoundError('Guild not found or bot not in guild');
  }
  
  let members = guild.members.cache;
  
  if (role) {
    members = members.filter(member => 
      member.roles.cache.has(role as string)
    );
  }
  
  const memberList = members
    .first(Number(limit))
    .map(member => ({
      id: member.id,
      username: member.user.username,
      displayName: member.displayName,
      avatar: member.user.avatarURL(),
      roles: member.roles.cache
        .filter(role => role.name !== '@everyone')
        .map(role => ({
          id: role.id,
          name: role.name,
          color: role.hexColor,
        })),
      joinedAt: member.joinedAt,
    }));
  
  res.json({
    success: true,
    data: memberList,
    total: members.size,
  });
}));

// Send message to channel
router.post('/guild/:guildId/message', requireGuildAccess(), requireRole('admin', 'moderator'), asyncHandler(async (req: AuthRequest, res) => {
  const { guildId } = req.params;
  const { channelId, content, embed } = req.body;
  
  if (!channelId || (!content && !embed)) {
    throw new ValidationError('Channel ID and message content or embed required');
  }
  
  if (!discordClient) {
    throw new ValidationError('Discord bot not connected');
  }
  
  const guild = discordClient.guilds.cache.get(guildId);
  
  if (!guild) {
    throw new NotFoundError('Guild not found or bot not in guild');
  }
  
  const channel = guild.channels.cache.get(channelId);
  
  if (!channel || !channel.isTextBased()) {
    throw new NotFoundError('Channel not found or not a text channel');
  }
  
  const messageOptions: any = {};
  
  if (content) messageOptions.content = content;
  
  if (embed) {
    messageOptions.embeds = [{
      title: embed.title,
      description: embed.description,
      color: embed.color || 0x5865F2,
      fields: embed.fields || [],
      footer: embed.footer,
      timestamp: embed.timestamp ? new Date().toISOString() : undefined,
    }];
  }
  
  const message = await (channel as any).send(messageOptions);
  
  logger.info(`Message sent to channel ${channelId} in guild ${guildId}`);
  
  res.json({
    success: true,
    data: {
      messageId: message.id,
      channelId: message.channelId,
      content: message.content,
    },
  });
}));

// Get bot status
router.get('/bot/status', asyncHandler(async (req: AuthRequest, res) => {
  if (!discordClient) {
    return res.json({
      success: true,
      data: {
        connected: false,
        uptime: 0,
      },
    });
  }
  
  res.json({
    success: true,
    data: {
      connected: discordClient.isReady(),
      uptime: discordClient.uptime,
      user: discordClient.user ? {
        id: discordClient.user.id,
        username: discordClient.user.username,
        avatar: discordClient.user.avatarURL(),
      } : null,
      guilds: discordClient.guilds.cache.size,
      users: discordClient.users.cache.size,
      ping: discordClient.ws.ping,
    },
  });
}));

// Get available guilds
router.get('/bot/guilds', requireRole('admin'), asyncHandler(async (req: AuthRequest, res) => {
  if (!discordClient) {
    throw new ValidationError('Discord bot not connected');
  }
  
  const guilds = discordClient.guilds.cache.map(guild => ({
    id: guild.id,
    name: guild.name,
    icon: guild.iconURL(),
    memberCount: guild.memberCount,
    joinedAt: guild.joinedAt,
    owner: {
      id: guild.ownerId,
    },
  }));
  
  res.json({
    success: true,
    data: guilds,
  });
}));

// Leave guild
router.post('/bot/leave/:guildId', requireRole('admin'), asyncHandler(async (req: AuthRequest, res) => {
  const { guildId } = req.params;
  
  if (!discordClient) {
    throw new ValidationError('Discord bot not connected');
  }
  
  const guild = discordClient.guilds.cache.get(guildId);
  
  if (!guild) {
    throw new NotFoundError('Guild not found');
  }
  
  await guild.leave();
  
  logger.info(`Bot left guild: ${guildId}`);
  
  res.json({
    success: true,
    message: 'Successfully left guild',
  });
}));

export default router;