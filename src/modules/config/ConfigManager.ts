import { ServerSettings } from '../../types/index.js';
import { logger } from '../../utils/logger.js';
import fs from 'fs/promises';
import path from 'path';

export class ConfigManager {
  private settings: Map<string, ServerSettings> = new Map();
  private configPath: string;

  constructor(configPath: string = './config/servers.json') {
    this.configPath = configPath;
  }

  async loadSettings(): Promise<void> {
    try {
      const data = await fs.readFile(this.configPath, 'utf-8');
      const settings = JSON.parse(data);
      
      for (const [guildId, config] of Object.entries(settings)) {
        this.settings.set(guildId, config as ServerSettings);
      }
      
      logger.info('Settings loaded successfully');
    } catch (error: any) {
      if (error.code === 'ENOENT') {
        logger.info('No settings file found, using defaults');
        await this.saveSettings();
      } else {
        logger.error('Error loading settings:', error);
      }
    }
  }

  async saveSettings(): Promise<void> {
    try {
      const dir = path.dirname(this.configPath);
      await fs.mkdir(dir, { recursive: true });
      
      const settings: Record<string, ServerSettings> = {};
      for (const [guildId, config] of this.settings.entries()) {
        settings[guildId] = config;
      }
      
      await fs.writeFile(this.configPath, JSON.stringify(settings, null, 2));
      logger.info('Settings saved successfully');
    } catch (error) {
      logger.error('Error saving settings:', error);
      throw error;
    }
  }

  getServerSettings(guildId: string): ServerSettings {
    if (!this.settings.has(guildId)) {
      const defaultSettings: ServerSettings = {
        guildId,
        briefDurationHours: 48,
        autoGenerateBriefs: false,
        language: 'fr'
      };
      this.settings.set(guildId, defaultSettings);
    }
    
    return this.settings.get(guildId)!;
  }

  async updateServerSettings(guildId: string, updates: Partial<ServerSettings>): Promise<void> {
    const current = this.getServerSettings(guildId);
    const updated = { ...current, ...updates };
    this.settings.set(guildId, updated);
    await this.saveSettings();
  }

  getAllSettings(): ServerSettings[] {
    return Array.from(this.settings.values());
  }
}