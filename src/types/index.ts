export interface Brief {
  id: string;
  companyName: string;
  companyDescription: string;
  jobDescription: string;
  deadline: Date;
  deadlineDays: string;
  createdAt: Date;
  channelId: string;
  messageId?: string;
  status: 'active' | 'completed' | 'cancelled';
}

export interface BotConfig {
  discord: {
    token: string;
    clientId: string;
    guildId: string;
  };
  openai: {
    apiKey: string;
    model: string;
  };
  briefs: {
    defaultChannelId?: string;
    defaultDurationHours: number;
    autoGenerate: boolean;
  };
}

export interface ServerSettings {
  guildId: string;
  briefChannelId?: string;
  briefDurationHours: number;
  autoGenerateBriefs: boolean;
  language: 'fr' | 'en';
}