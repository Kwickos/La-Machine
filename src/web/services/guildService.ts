import axios from 'axios';
import { getDiscordClient } from './discordService.js';
import { logger } from '../../utils/logger.js';

// Permission flags in Discord
const ADMINISTRATOR = 0x8;
const MANAGE_GUILD = 0x20;

interface DiscordGuild {
    id: string;
    name: string;
    icon: string | null;
    owner: boolean;
    permissions: string;
}

interface UserGuild {
    id: string;
    name: string;
    icon: string | null;
    isAdmin: boolean;
    botPresent: boolean;
}

// Get user's guilds from Discord API and filter for admin + bot presence
export async function getUserAdminGuilds(accessToken: string): Promise<UserGuild[]> {
    try {
        // Get user's guilds from Discord API
        const response = await axios.get<DiscordGuild[]>('https://discord.com/api/users/@me/guilds', {
            headers: {
                Authorization: `Bearer ${accessToken}`
            }
        });
        
        const userGuilds = response.data;
        logger.info(`User has access to ${userGuilds.length} guilds`);
        
        // Get bot's guilds
        const discordClient = getDiscordClient();
        if (!discordClient) {
            logger.warn('Discord bot not connected, cannot filter guilds');
            return [];
        }
        
        const botGuildIds = discordClient.guilds.cache.map(g => g.id);
        logger.info(`Bot is present in ${botGuildIds.length} guilds`);
        
        // Filter guilds where:
        // 1. User is admin (owner or has admin/manage permissions)
        // 2. Bot is present in the guild
        const adminGuilds = userGuilds.filter(guild => {
            const permissions = BigInt(guild.permissions);
            const isAdmin = guild.owner || 
                           (permissions & BigInt(ADMINISTRATOR)) !== 0n ||
                           (permissions & BigInt(MANAGE_GUILD)) !== 0n;
            const botPresent = botGuildIds.includes(guild.id);
            
            if (isAdmin && botPresent) {
                logger.info(`User is admin in guild "${guild.name}" (${guild.id}) and bot is present`);
            }
            
            return isAdmin && botPresent;
        });
        
        logger.info(`User is admin in ${adminGuilds.length} guilds where bot is present`);
        
        // Map to our format with additional info
        return adminGuilds.map(guild => ({
            id: guild.id,
            name: guild.name,
            icon: guild.icon ? `https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.png` : null,
            isAdmin: true,
            botPresent: true
        }));
    } catch (error) {
        logger.error('Error fetching user guilds:', error);
        throw error;
    }
}

// Get detailed guild information (channels, roles, etc.)
export async function getGuildDetails(guildId: string) {
    const discordClient = getDiscordClient();
    if (!discordClient) {
        throw new Error('Discord bot not connected');
    }
    
    const guild = discordClient.guilds.cache.get(guildId);
    if (!guild) {
        throw new Error('Guild not found or bot not in guild');
    }
    
    // Fetch all members if not cached
    await guild.members.fetch();
    
    return {
        id: guild.id,
        name: guild.name,
        icon: guild.iconURL(),
        memberCount: guild.memberCount,
        channels: guild.channels.cache
            .filter(channel => channel.type === 0) // Text channels only
            .map(channel => ({
                id: channel.id,
                name: channel.name,
                type: 'text'
            }))
            .sort((a, b) => a.name.localeCompare(b.name)),
        roles: guild.roles.cache
            .filter(role => !role.managed && role.name !== '@everyone')
            .map(role => ({
                id: role.id,
                name: role.name,
                color: role.hexColor,
                position: role.position,
                permissions: role.permissions.bitfield.toString()
            }))
            .sort((a, b) => b.position - a.position),
        createdAt: guild.createdAt,
        ownerId: guild.ownerId
    };
}

// Check if user has admin permissions in a specific guild
export async function checkUserGuildPermission(userId: string, guildId: string): Promise<boolean> {
    const discordClient = getDiscordClient();
    if (!discordClient) {
        return false;
    }
    
    const guild = discordClient.guilds.cache.get(guildId);
    if (!guild) {
        return false;
    }
    
    try {
        const member = await guild.members.fetch(userId);
        if (!member) {
            return false;
        }
        
        // Check if user is owner or has admin permissions
        return guild.ownerId === userId || 
               member.permissions.has('Administrator') || 
               member.permissions.has('ManageGuild');
    } catch (error) {
        logger.error(`Error checking permissions for user ${userId} in guild ${guildId}:`, error);
        return false;
    }
}