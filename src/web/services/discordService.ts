import { Client } from 'discord.js';
import axios from 'axios';
import { logger } from '../../utils/logger.js';

let discordClient: Client | null = null;

export function setDiscordClient(client: Client) {
    discordClient = client;
    // Also set it globally for other services
    (global as any).discordClient = client;
    logger.info('Discord client reference stored in web service and global scope');
}

export function getDiscordClient(): Client | null {
    // Try to get from local reference first, then from global
    return discordClient || (global as any).discordClient || null;
}

// Get real guild data from Discord bot
export async function getGuildData(guildId: string) {
    if (!discordClient) {
        throw new Error('Discord client not initialized');
    }
    
    const guild = discordClient.guilds.cache.get(guildId);
    if (!guild) {
        throw new Error('Guild not found or bot not in guild');
    }
    
    return {
        id: guild.id,
        name: guild.name,
        icon: guild.iconURL(),
        memberCount: guild.memberCount,
        ownerId: guild.ownerId,
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
    };
}

// Get user's guilds from Discord API
export async function getUserGuilds(accessToken: string) {
    try {
        const response = await axios.get('https://discord.com/api/users/@me/guilds', {
            headers: {
                Authorization: `Bearer ${accessToken}`
            }
        });
        
        // Filter to only show guilds where the bot is present
        if (discordClient) {
            const botGuilds = discordClient.guilds.cache.map(g => g.id);
            return response.data.filter((guild: any) => botGuilds.includes(guild.id));
        }
        
        return response.data;
    } catch (error) {
        logger.error('Error fetching user guilds:', error);
        throw error;
    }
}

// Get real brief statistics from database
export async function getBriefStats(guildId: string) {
    const Brief = (await import('../models/Brief.js')).Brief;
    
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
                totalSubmissions: { $sum: { $size: '$submissions' } },
            }
        }
    ]);
    
    return stats[0] || { total: 0, published: 0, draft: 0, totalSubmissions: 0 };
}

// Send message to Discord channel
export async function sendMessageToChannel(guildId: string, channelId: string, message: any) {
    if (!discordClient) {
        throw new Error('Discord client not initialized');
    }
    
    const guild = discordClient.guilds.cache.get(guildId);
    if (!guild) {
        throw new Error('Guild not found');
    }
    
    const channel = guild.channels.cache.get(channelId);
    if (!channel || !channel.isTextBased()) {
        throw new Error('Channel not found or not a text channel');
    }
    
    return await (channel as any).send(message);
}

// Post brief to Discord
export async function postBriefToDiscord(brief: any) {
    if (!discordClient) {
        throw new Error('Discord client not initialized');
    }
    
    const guild = discordClient.guilds.cache.get(brief.guildId);
    if (!guild) {
        throw new Error('Guild not found');
    }
    
    const channel = guild.channels.cache.get(brief.channelId);
    if (!channel || !channel.isTextBased()) {
        throw new Error('Channel not found or not a text channel');
    }
    
    const embed = {
        color: 0x5865F2,
        title: `📋 ${brief.title}`,
        description: brief.content,
        fields: [
            {
                name: '📁 Catégorie',
                value: brief.category,
                inline: true
            },
            {
                name: '📊 Difficulté',
                value: brief.difficulty,
                inline: true
            },
            {
                name: '🎯 Objectifs',
                value: brief.objectives.join('\n• ') || 'Aucun objectif défini',
                inline: false
            }
        ],
        footer: {
            text: 'La Machine • Brief Créatif',
            icon_url: discordClient.user?.avatarURL() || undefined
        },
        timestamp: new Date().toISOString()
    };
    
    const message = await (channel as any).send({ embeds: [embed] });
    
    // Add reactions if configured
    const ServerConfig = (await import('../models/ServerConfig.js')).ServerConfig;
    const config = await ServerConfig.findOne({ guildId: brief.guildId });
    
    if (config?.autoReactions) {
        for (const emoji of config.autoReactions) {
            await message.react(emoji).catch(() => {});
        }
    }
    
    return message.id;
}