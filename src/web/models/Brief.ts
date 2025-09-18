import mongoose, { Document, Schema } from 'mongoose';

export interface IBrief extends Document {
  guildId: string;
  guildName: string;
  channelId: string;
  channelName: string;
  messageId: string;
  title: string;
  content: string;
  category: string;
  difficulty: 'Débutant' | 'Intermédiaire' | 'Avancé';
  objectives: string[];
  constraints: string[];
  deliverables: string[];
  tags: string[];
  generatedBy: 'ai' | 'manual' | 'scheduled';
  createdBy?: string;
  status: 'draft' | 'published' | 'archived';
  publishedAt?: Date;
  reactions: {
    emoji: string;
    count: number;
    users: string[];
  }[];
  submissions: {
    userId: string;
    username: string;
    messageUrl: string;
    submittedAt: Date;
    status: 'pending' | 'approved' | 'rejected';
  }[];
  metadata: {
    aiModel?: string;
    temperature?: number;
    promptVersion?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

const BriefSchema = new Schema<IBrief>({
  guildId: {
    type: String,
    required: true,
    index: true,
  },
  guildName: String,
  channelId: {
    type: String,
    required: true,
  },
  channelName: String,
  messageId: {
    type: String,
    sparse: true,
  },
  title: {
    type: String,
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    required: true,
  },
  difficulty: {
    type: String,
    enum: ['Débutant', 'Intermédiaire', 'Avancé'],
    required: true,
  },
  objectives: [String],
  constraints: [String],
  deliverables: [String],
  tags: [String],
  generatedBy: {
    type: String,
    enum: ['ai', 'manual', 'scheduled'],
    default: 'ai',
  },
  createdBy: String,
  status: {
    type: String,
    enum: ['draft', 'published', 'archived'],
    default: 'draft',
  },
  publishedAt: Date,
  reactions: [{
    emoji: String,
    count: Number,
    users: [String],
  }],
  submissions: [{
    userId: String,
    username: String,
    messageUrl: String,
    submittedAt: Date,
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },
  }],
  metadata: {
    aiModel: String,
    temperature: Number,
    promptVersion: String,
  },
}, {
  timestamps: true,
});

// Indexes for better query performance
BriefSchema.index({ guildId: 1, createdAt: -1 });
BriefSchema.index({ status: 1, publishedAt: -1 });
BriefSchema.index({ tags: 1 });
BriefSchema.index({ category: 1, difficulty: 1 });

export const Brief = mongoose.model<IBrief>('Brief', BriefSchema);