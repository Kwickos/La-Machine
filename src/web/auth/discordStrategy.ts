import passport from 'passport';
import { Strategy as DiscordStrategy } from 'passport-discord';
import { Strategy as JWTStrategy, ExtractJwt } from 'passport-jwt';
import { User } from '../models/User.js';
import { logger } from '../../utils/logger.js';
import { config } from 'dotenv';

// Load environment variables
config();

// Validate required environment variables
if (!process.env.DISCORD_CLIENT_ID || !process.env.DISCORD_CLIENT_SECRET) {
    logger.error('Missing Discord OAuth credentials!');
    logger.error('Please set DISCORD_CLIENT_ID and DISCORD_CLIENT_SECRET in .env file');
    logger.error('Get them from: https://discord.com/developers/applications');
    
    // Log what we have for debugging (without exposing secrets)
    logger.info('DISCORD_CLIENT_ID is', process.env.DISCORD_CLIENT_ID ? 'set' : 'NOT SET');
    logger.info('DISCORD_CLIENT_SECRET is', process.env.DISCORD_CLIENT_SECRET ? 'set' : 'NOT SET');
}

const DISCORD_CLIENT_ID = process.env.DISCORD_CLIENT_ID || '';
const DISCORD_CLIENT_SECRET = process.env.DISCORD_CLIENT_SECRET || '';
const CALLBACK_URL = process.env.DISCORD_CALLBACK_URL || 'http://localhost:3000/api/auth/discord/callback';
const JWT_SECRET = process.env.JWT_SECRET || 'your-jwt-secret-key';

// Log configuration (without secrets)
logger.info('Discord OAuth Configuration:');
logger.info(`Client ID: ${DISCORD_CLIENT_ID ? DISCORD_CLIENT_ID.substring(0, 8) + '...' : 'NOT SET'}`);
logger.info(`Callback URL: ${CALLBACK_URL}`);

// Only configure Discord strategy if credentials are available
if (DISCORD_CLIENT_ID && DISCORD_CLIENT_SECRET) {
    passport.use(new DiscordStrategy({
        clientID: DISCORD_CLIENT_ID,
        clientSecret: DISCORD_CLIENT_SECRET,
        callbackURL: CALLBACK_URL,
        scope: ['identify', 'email', 'guilds']
    }, async (accessToken: string, refreshToken: string, profile: any, done: any) => {
        try {
            logger.info(`Discord OAuth callback for user: ${profile.username}`);
            
            // Check if user exists (by Discord ID first, then username)
            let user = await User.findOne({ discordId: profile.id });
            
            if (!user) {
                // Check if username already exists
                const existingUser = await User.findOne({ username: profile.username });
                if (existingUser) {
                    // Update existing user with Discord info
                    user = existingUser;
                    user.discordId = profile.id;
                    user.discordUsername = profile.discriminator !== '0' 
                        ? `${profile.username}#${profile.discriminator}`
                        : profile.username;
                    user.guilds = profile.guilds ? profile.guilds.map((g: any) => g.id) : [];
                    user.discordAccessToken = accessToken;
                    user.discordRefreshToken = refreshToken;
                    await user.save();
                    logger.info(`Linked existing user to Discord: ${profile.username}`);
                } else {
                    // Create new user from Discord profile
                    // Add timestamp to username if it already exists
                    let uniqueUsername = profile.username;
                    let counter = 1;
                    while (await User.findOne({ username: uniqueUsername })) {
                        uniqueUsername = `${profile.username}_${counter}`;
                        counter++;
                    }
                    
                    user = new User({
                        discordId: profile.id,
                        username: uniqueUsername,
                        email: profile.email || `${profile.id}@discord.local`, // Discord doesn't always provide email
                        discordUsername: profile.discriminator !== '0' 
                            ? `${profile.username}#${profile.discriminator}`
                            : profile.username, // New Discord usernames don't have discriminators
                        password: `discord_${profile.id}_${Date.now()}`, // Random password for OAuth users
                        guilds: profile.guilds ? profile.guilds.map((g: any) => g.id) : [],
                        discordAccessToken: accessToken,
                        discordRefreshToken: refreshToken,
                        isActive: true,
                        role: 'user' // Default role
                    });
                    await user.save();
                    logger.info(`New user created from Discord: ${uniqueUsername} (Discord: ${profile.username})`);
                }
            } else {
                // Update existing user
                user.guilds = profile.guilds ? profile.guilds.map((g: any) => g.id) : [];
                user.lastLogin = new Date();
                user.discordUsername = profile.discriminator !== '0'
                    ? `${profile.username}#${profile.discriminator}`
                    : profile.username;
                user.discordAccessToken = accessToken;
                user.discordRefreshToken = refreshToken;
                await user.save();
                logger.info(`User logged in: ${profile.username}`);
            }
            
            return done(null, user);
        } catch (error) {
            logger.error('Discord OAuth error:', error);
            return done(error, null);
        }
    }));
} else {
    logger.warn('Discord OAuth strategy not configured due to missing credentials');
    
    // Create a dummy strategy that always fails
    passport.use('discord', new DiscordStrategy({
        clientID: 'dummy',
        clientSecret: 'dummy',
        callbackURL: CALLBACK_URL
    }, (accessToken, refreshToken, profile, done) => {
        done(new Error('Discord OAuth not configured. Please set DISCORD_CLIENT_ID and DISCORD_CLIENT_SECRET in .env'));
    }));
}

// JWT Strategy for API authentication
passport.use(new JWTStrategy({
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: JWT_SECRET
}, async (payload: any, done: any) => {
    try {
        const user = await User.findById(payload.userId);
        if (user) {
            return done(null, user);
        }
        return done(null, false);
    } catch (error) {
        return done(error, false);
    }
}));

passport.serializeUser((user: any, done) => {
    done(null, user._id);
});

passport.deserializeUser(async (id: string, done) => {
    try {
        const user = await User.findById(id);
        done(null, user);
    } catch (error) {
        done(error, null);
    }
});

export default passport;