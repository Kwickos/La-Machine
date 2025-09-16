import { Client, TextChannel, EmbedBuilder } from 'discord.js';
import { Brief } from '../../types/index.js';
import { generateBrief } from '../ai/BriefGenerator.js';
import { logger } from '../../utils/logger.js';
import { sendAdminAlert } from '../../utils/alerts.js';
import * as fs from 'fs';
import * as path from 'path';

export class BriefManager {
  private activeBriefs: Map<string, Brief> = new Map();
  private client: Client;
  private readonly briefsFilePath: string = path.join(process.cwd(), 'data', 'active-briefs.json');

  constructor(client: Client) {
    this.client = client;
    this.ensureDataDirectory();
    this.loadActiveBriefs();
  }

  private ensureDataDirectory(): void {
    const dataDir = path.dirname(this.briefsFilePath);
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
      logger.info('Created data directory');
    }
  }

  private loadActiveBriefs(): void {
    try {
      if (fs.existsSync(this.briefsFilePath)) {
        const data = fs.readFileSync(this.briefsFilePath, 'utf8');
        const briefsData = JSON.parse(data);
        
        for (const briefData of briefsData) {
          // Convert date strings back to Date objects
          const brief: Brief = {
            ...briefData,
            deadline: new Date(briefData.deadline),
            createdAt: new Date(briefData.createdAt)
          };
          this.activeBriefs.set(brief.id, brief);
        }
        
        logger.info(`Loaded ${briefsData.length} active briefs from storage`);
      }
    } catch (error) {
      logger.error('Error loading active briefs:', error);
    }
  }

  private saveActiveBriefs(): void {
    try {
      const briefsArray = Array.from(this.activeBriefs.values());
      fs.writeFileSync(this.briefsFilePath, JSON.stringify(briefsArray, null, 2));
      logger.debug(`Saved ${briefsArray.length} active briefs to storage`);
    } catch (error) {
      logger.error('Error saving active briefs:', error);
    }
  }

  async createBrief(channelId: string, durationHours: number = 48): Promise<Brief | null> {
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
      this.saveActiveBriefs();
      logger.info(`Brief created: ${brief.id}`);
      
      return brief;
    } catch (error) {
      logger.error('Error creating brief:', error);
      
      // Send alert to admin instead of using fallback
      await sendAdminAlert(
        this.client,
        `Erreur lors de la génération d'un brief pour le channel <#${channelId}>.\n\nLe bot n'a pas pu créer de brief automatique. Vérifiez la configuration OpenAI.`,
        error
      );
      
      return null;
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
    this.saveActiveBriefs();
    logger.info(`Brief completed: ${briefId}`);
  }

  getActiveBriefs(): Brief[] {
    return Array.from(this.activeBriefs.values());
  }

  getExpiredBriefs(): Brief[] {
    const now = new Date();
    return this.getActiveBriefs().filter(brief => brief.deadline < now);
  }

  async cancelBrief(briefId: string): Promise<void> {
    const brief = this.activeBriefs.get(briefId);
    if (!brief) {
      throw new Error(`Brief ${briefId} not found`);
    }

    brief.status = 'cancelled';
    this.activeBriefs.delete(briefId);
    this.saveActiveBriefs();
    logger.info(`Brief cancelled: ${briefId}`);
  }

  getBriefById(briefId: string): Brief | undefined {
    return this.activeBriefs.get(briefId);
  }

  getAllBriefs(): Brief[] {
    return Array.from(this.activeBriefs.values());
  }
}