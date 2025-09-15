import { SlashCommandBuilder, ChatInputCommandInteraction } from 'discord.js';
import { BriefManager } from '../modules/briefs/BriefManager.js';
import { ConfigManager } from '../modules/config/ConfigManager.js';

export const data = new SlashCommandBuilder()
  .setName('brief')
  .setDescription('Manage creative briefs')
  .addStringOption(option =>
    option
      .setName('action')
      .setDescription('Action to perform')
      .setRequired(true)
      .addChoices(
        { name: 'new', value: 'new' },
        { name: 'active', value: 'active' },
        { name: 'complete', value: 'complete' }
      )
  )
  .addIntegerOption(option =>
    option
      .setName('days')
      .setDescription('Brief duration in days (for new briefs)')
      .setMinValue(1)
      .setMaxValue(14)
  )
  .addChannelOption(option =>
    option
      .setName('channel')
      .setDescription('Channel to send the brief to (for new briefs)')
  )
  .addStringOption(option =>
    option
      .setName('id')
      .setDescription('Brief ID (for completing briefs)')
  );

export async function execute(
  interaction: ChatInputCommandInteraction,
  briefManager: BriefManager,
  configManager: ConfigManager
) {
  const action = interaction.options.getString('action', true);

  switch (action) {
    case 'new': {
      await interaction.deferReply();
      
      const guildId = interaction.guildId!;
      const settings = configManager.getServerSettings(guildId);
      
      const days = interaction.options.getInteger('days') || 2;
      const durationHours = days * 24;
      const channelId = interaction.options.getChannel('channel')?.id || 
                       settings.briefChannelId || 
                       interaction.channelId;

      try {
        const brief = await briefManager.createBrief(channelId, durationHours);
        await interaction.editReply(`✅ **New brief created!**\n\n**Company:** ${brief.companyName}\n**ID:** \`${brief.id}\``);
      } catch (error) {
        await interaction.editReply('❌ Error creating the brief.');
      }
      break;
    }

    case 'active': {
      const briefs = briefManager.getActiveBriefs();
      
      if (briefs.length === 0) {
        await interaction.reply({
          content: '📭 No active briefs at the moment.',
          ephemeral: true
        });
        return;
      }

      const briefList = briefs.map(b => 
        `**${b.companyName}**\n` +
        `├ ID: \`${b.id}\`\n` +
        `└ Deadline: <t:${Math.floor(b.deadline.getTime() / 1000)}:R>`
      ).join('\n\n');

      await interaction.reply({
        content: `## 📋 Active Briefs\n\n${briefList}`,
        ephemeral: true
      });
      break;
    }

    case 'complete': {
      const briefId = interaction.options.getString('id');
      
      if (!briefId) {
        await interaction.reply({
          content: '❌ Please provide a brief ID to complete.',
          ephemeral: true
        });
        return;
      }
      
      try {
        await briefManager.completeBrief(briefId);
        await interaction.reply(`✅ **Brief completed!**\nID: \`${briefId}\``);
      } catch (error) {
        await interaction.reply({
          content: `❌ Unable to complete brief \`${briefId}\`. Please check the ID.`,
          ephemeral: true
        });
      }
      break;
    }
  }
}