import { Client, GatewayIntentBits, Collection, REST, Routes } from 'discord.js';
import dotenv from 'dotenv';
import { BriefManager } from './modules/briefs/BriefManager.js';
import { ConfigManager } from './modules/config/ConfigManager.js';
import { BriefScheduler } from './modules/scheduler/BriefScheduler.js';
import { initializeOpenAI } from './modules/ai/BriefGenerator.js';
import { logger } from './utils/logger.js';
import * as briefCommand from './commands/brief.js';
import * as configCommand from './commands/config.js';
import { startFullServer } from './web/fullServer.js';
import { setDiscordClient } from './web/services/discordService.js';

dotenv.config();

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds
  ]
});

const briefManager = new BriefManager(client);
const configManager = new ConfigManager();
let briefScheduler: BriefScheduler;

const commands = new Collection<string, any>();
commands.set('brief', briefCommand);
commands.set('config', configCommand);

async function deployCommands() {
  const token = process.env.DISCORD_TOKEN;
  const clientId = process.env.DISCORD_CLIENT_ID;
  
  if (!token || !clientId) {
    logger.error('Missing DISCORD_TOKEN or DISCORD_CLIENT_ID in environment variables');
    return;
  }

  const rest = new REST({ version: '10' }).setToken(token);
  
  try {
    logger.info('Started refreshing application (/) commands.');
    
    const commandData = [
      briefCommand.data.toJSON(),
      configCommand.data.toJSON()
    ];
    
    await rest.put(
      Routes.applicationCommands(clientId),
      { body: commandData }
    );
    
    logger.info('Successfully reloaded application (/) commands.');
  } catch (error) {
    logger.error('Error deploying commands:', error);
  }
}

client.once('ready', async () => {
  logger.info(`Bot logged in as ${client.user?.tag}`);
  
  // Initialize OpenAI if API key is provided
  if (process.env.OPENAI_API_KEY) {
    initializeOpenAI(process.env.OPENAI_API_KEY);
  } else {
    logger.warn('No OpenAI API key provided. AI features will use fallback responses.');
  }
  
  // Load server configurations
  await configManager.loadSettings();
  
  // Log restored briefs count
  const activeBriefs = briefManager.getActiveBriefs();
  if (activeBriefs.length > 0) {
    logger.info(`Restored ${activeBriefs.length} active briefs from previous session`);
    
    // Check for any briefs that might have expired during downtime
    const expiredBriefs = briefManager.getExpiredBriefs();
    if (expiredBriefs.length > 0) {
      logger.info(`Found ${expiredBriefs.length} briefs that expired during downtime`);
    }
  }
  
  // Start the scheduler
  briefScheduler = new BriefScheduler(briefManager, configManager);
  briefScheduler.start();
  
  // Deploy slash commands
  await deployCommands();
  
  // Start web dashboard if enabled
  if (process.env.ENABLE_WEB_DASHBOARD === 'true') {
    try {
      // Set Discord client BEFORE starting web server
      setDiscordClient(client);
      await startFullServer();
      logger.info('Web dashboard started and connected to Discord bot');
    } catch (error) {
      logger.error('Failed to start web dashboard:', error);
    }
  }
});

client.on('interactionCreate', async interaction => {
  if (!interaction.isChatInputCommand()) return;
  
  const command = commands.get(interaction.commandName);
  if (!command) return;
  
  try {
    switch (interaction.commandName) {
      case 'brief':
        await briefCommand.execute(interaction, briefManager, configManager);
        break;
      case 'config':
        await configCommand.execute(interaction, configManager);
        break;
    }
  } catch (error) {
    logger.error(`Error executing command ${interaction.commandName}:`, error);
    
    const errorMessage = '❌ An error occurred while executing this command.';
    
    if (interaction.replied || interaction.deferred) {
      await interaction.followUp({ content: errorMessage, ephemeral: true });
    } else {
      await interaction.reply({ content: errorMessage, ephemeral: true });
    }
  }
});

process.on('SIGINT', () => {
  logger.info('Shutting down...');
  if (briefScheduler) {
    briefScheduler.stop();
  }
  
  // Save current state before shutdown
  const activeBriefs = briefManager.getActiveBriefs();
  if (activeBriefs.length > 0) {
    logger.info(`Saving ${activeBriefs.length} active briefs before shutdown`);
  }
  
  client.destroy();
  process.exit(0);
});

const token = process.env.DISCORD_TOKEN;
if (!token) {
  logger.error('No Discord token provided in environment variables');
  process.exit(1);
}

client.login(token).catch(error => {
  logger.error('Failed to login:', error);
  process.exit(1);
});