import mongoose, { Document, Schema } from 'mongoose';

export interface IServerConfig extends Document {
  guildId: string;
  guildName: string;
  briefChannel: string;
  scheduleEnabled: boolean;
  scheduleTime: string;
  scheduleFrequency: 'daily' | 'weekly' | 'biweekly' | 'monthly';
  scheduleDays: number[];
  categories: string[];
  difficulties: string[];
  autoReactions: string[];
  adminRoles: string[];
  moderatorRoles: string[];
  notificationChannel?: string;
  language: string;
  timezone: string;
  features: {
    aiGeneration: boolean;
    submissions: boolean;
    reactions: boolean;
    notifications: boolean;
    analytics: boolean;
  };
  aiSettings: {
    model: string;
    temperature: number;
    maxTokens: number;
    customPrompt?: string;
  };
  templates: {
    name: string;
    content: string;
    category: string;
    difficulty: string;
  }[];
  statistics: {
    totalBriefs: number;
    totalSubmissions: number;
    averageEngagement: number;
    lastBriefDate?: Date;
  };
  createdAt: Date;
  updatedAt: Date;
}

const ServerConfigSchema = new Schema<IServerConfig>({
  guildId: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  guildName: String,
  briefChannel: {
    type: String,
    required: true,
  },
  scheduleEnabled: {
    type: Boolean,
    default: false,
  },
  scheduleTime: {
    type: String,
    default: '10:00',
  },
  scheduleFrequency: {
    type: String,
    enum: ['daily', 'weekly', 'biweekly', 'monthly'],
    default: 'weekly',
  },
  scheduleDays: {
    type: [Number],
    default: [1], // Monday
  },
  categories: {
    type: [String],
    default: ['Design Graphique', 'Développement Web', 'Marketing Digital', 'Création de Contenu'],
  },
  difficulties: {
    type: [String],
    default: ['Débutant', 'Intermédiaire', 'Avancé'],
  },
  autoReactions: {
    type: [String],
    default: ['✅', '🔥', '💡', '🎯'],
  },
  adminRoles: [String],
  moderatorRoles: [String],
  notificationChannel: String,
  language: {
    type: String,
    default: 'fr',
  },
  timezone: {
    type: String,
    default: 'Europe/Paris',
  },
  features: {
    aiGeneration: {
      type: Boolean,
      default: true,
    },
    submissions: {
      type: Boolean,
      default: true,
    },
    reactions: {
      type: Boolean,
      default: true,
    },
    notifications: {
      type: Boolean,
      default: true,
    },
    analytics: {
      type: Boolean,
      default: true,
    },
  },
  aiSettings: {
    model: {
      type: String,
      default: 'gpt-4',
    },
    temperature: {
      type: Number,
      default: 0.8,
      min: 0,
      max: 2,
    },
    maxTokens: {
      type: Number,
      default: 2000,
    },
    customPrompt: String,
  },
  templates: [{
    name: String,
    content: String,
    category: String,
    difficulty: String,
  }],
  statistics: {
    totalBriefs: {
      type: Number,
      default: 0,
    },
    totalSubmissions: {
      type: Number,
      default: 0,
    },
    averageEngagement: {
      type: Number,
      default: 0,
    },
    lastBriefDate: Date,
  },
}, {
  timestamps: true,
});

export const ServerConfig = mongoose.model<IServerConfig>('ServerConfig', ServerConfigSchema);