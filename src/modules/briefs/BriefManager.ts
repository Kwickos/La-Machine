import { Client, TextChannel, EmbedBuilder } from 'discord.js';
import { Brief } from '../../types/index.js';
import { generateBrief } from '../ai/BriefGenerator.js';
import { logger } from '../../utils/logger.js';

export class BriefManager {
  private activeBriefs: Map<string, Brief> = new Map();
  private client: Client;

  constructor(client: Client) {
    this.client = client;
  }

  async createBrief(channelId: string, durationHours: number = 48): Promise<Brief> {
    try {
      const briefData = await generateBrief();
      
      // Parse deadline days from string (e.g. "5 jours" -> 5)
      const deadlineDays = parseInt(briefData.deadline) || durationHours / 24;
      const deadlineMs = deadlineDays * 24 * 60 * 60 * 1000;
      
      const brief: Brief = {
        id: Date.now().toString(),
        companyName: briefData.companyName,
        companyDescription: briefData.companyDescription,
        jobDescription: briefData.jobDescription,
        deadlineDays: briefData.deadline,
        deadline: new Date(Date.now() + deadlineMs),
        createdAt: new Date(),
        channelId,
        status: 'active'
      };

      const message = await this.sendBriefToChannel(brief);
      if (message) {
        brief.messageId = message.id;
      }

      this.activeBriefs.set(brief.id, brief);
      logger.info(`Brief created: ${brief.id}`);
      
      return brief;
    } catch (error) {
      logger.error('Error creating brief:', error);
      throw error;
    }
  }

  private async sendBriefToChannel(brief: Brief) {
    const channel = await this.client.channels.fetch(brief.channelId);
    
    if (!channel || !(channel instanceof TextChannel)) {
      logger.error(`Channel ${brief.channelId} not found or not a text channel`);
      return null;
    }

    const embed = new EmbedBuilder()
      .setTitle(`📋 NOUVEAU BRIEF CRÉATIF`)
      .setColor(0x5865F2)
      .addFields(
        {
          name: 'Nom de l\'entreprise',
          value: `**${brief.companyName}**`,
          inline: false
        },
        {
          name: 'Description de l\'entreprise',
          value: brief.companyDescription,
          inline: false
        },
        {
          name: 'Description du travail',
          value: brief.jobDescription,
          inline: false
        },
        {
          name: 'Deadline',
          value: `<t:${Math.floor(brief.deadline.getTime() / 1000)}:R>`,
          inline: true
        }
      )
      .setFooter({ text: `Brief ID: ${brief.id}` })
      .setTimestamp();

    return await channel.send({ embeds: [embed] });
  }

  async completeBrief(briefId: string): Promise<void> {
    const brief = this.activeBriefs.get(briefId);
    if (!brief) {
      throw new Error(`Brief ${briefId} not found`);
    }

    brief.status = 'completed';
    this.activeBriefs.delete(briefId);
    logger.info(`Brief completed: ${briefId}`);
  }

  getActiveBriefs(): Brief[] {
    return Array.from(this.activeBriefs.values());
  }

  getExpiredBriefs(): Brief[] {
    const now = new Date();
    return this.getActiveBriefs().filter(brief => brief.deadline < now);
  }
}