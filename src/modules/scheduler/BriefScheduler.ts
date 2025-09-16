import * as cron from 'node-cron';
import { BriefManager } from '../briefs/BriefManager.js';
import { ConfigManager } from '../config/ConfigManager.js';
import { logger } from '../../utils/logger.js';

export class BriefScheduler {
  private briefManager: BriefManager;
  private configManager: ConfigManager;
  private scheduledTasks: Map<string, any> = new Map();

  constructor(briefManager: BriefManager, configManager: ConfigManager) {
    this.briefManager = briefManager;
    this.configManager = configManager;
  }

  start() {
    // Check for expired briefs every hour
    const checkExpiredTask = cron.schedule('0 * * * *', async () => {
      await this.checkAndRenewExpiredBriefs();
    });
    
    this.scheduledTasks.set('check-expired', checkExpiredTask);
    
    // Daily brief generation at 10 AM
    const dailyBriefTask = cron.schedule('0 10 * * *', async () => {
      await this.generateDailyBriefs();
    });
    
    this.scheduledTasks.set('daily-brief', dailyBriefTask);
    
    logger.info('Brief scheduler started');
  }

  stop() {
    for (const task of this.scheduledTasks.values()) {
      task.stop();
    }
    this.scheduledTasks.clear();
    logger.info('Brief scheduler stopped');
  }

  private async checkAndRenewExpiredBriefs() {
    try {
      const expiredBriefs = this.briefManager.getExpiredBriefs();
      
      for (const brief of expiredBriefs) {
        await this.briefManager.completeBrief(brief.id);
        
        // Check if auto-generate is enabled for this server
        const settings = this.configManager.getAllSettings()
          .find(s => s.briefChannelId === brief.channelId);
        
        if (settings?.autoGenerateBriefs) {
          const newBrief = await this.briefManager.createBrief(
            brief.channelId,
            settings.briefDurationHours
          );
          
          if (newBrief) {
            logger.info(`Auto-generated new brief for channel ${brief.channelId}`);
          } else {
            logger.error(`Failed to auto-generate brief for channel ${brief.channelId}`);
          }
        }
      }
    } catch (error) {
      logger.error('Error checking expired briefs:', error);
    }
  }

  private async generateDailyBriefs() {
    try {
      const settings = this.configManager.getAllSettings();
      
      for (const serverSettings of settings) {
        if (serverSettings.autoGenerateBriefs && serverSettings.briefChannelId) {
          // Check if there's already an active brief
          const activeBriefs = this.briefManager.getActiveBriefs()
            .filter(b => b.channelId === serverSettings.briefChannelId);
          
          if (activeBriefs.length === 0) {
            const newBrief = await this.briefManager.createBrief(
              serverSettings.briefChannelId,
              serverSettings.briefDurationHours
            );
            
            if (newBrief) {
              logger.info(`Daily brief generated for server ${serverSettings.guildId}`);
            } else {
              logger.error(`Failed to generate daily brief for server ${serverSettings.guildId}`);
            }
          }
        }
      }
    } catch (error) {
      logger.error('Error generating daily briefs:', error);
    }
  }

  async scheduleCustomBrief(channelId: string, cronExpression: string, durationHours: number) {
    const taskId = `custom-${channelId}`;
    
    // Remove existing task if any
    if (this.scheduledTasks.has(taskId)) {
      this.scheduledTasks.get(taskId)!.stop();
    }
    
    const task = cron.schedule(cronExpression, async () => {
      const newBrief = await this.briefManager.createBrief(channelId, durationHours);
      if (!newBrief) {
        logger.error(`Failed to create custom scheduled brief for channel ${channelId}`);
      }
    });
    
    this.scheduledTasks.set(taskId, task);
    logger.info(`Custom brief scheduled for channel ${channelId}`);
  }
}