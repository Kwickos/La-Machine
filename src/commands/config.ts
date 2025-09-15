import { SlashCommandBuilder, ChatInputCommandInteraction, PermissionFlagsBits, ChannelType } from 'discord.js';
import { ConfigManager } from '../modules/config/ConfigManager.js';

export const data = new SlashCommandBuilder()
  .setName('config')
  .setDescription('Configure bot settings')
  .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
  .addStringOption(option =>
    option
      .setName('setting')
      .setDescription('Setting to configure')
      .setRequired(true)
      .addChoices(
        { name: 'brief', value: 'brief' }
      )
  )
  .addChannelOption(option =>
    option
      .setName('channel')
      .setDescription('Default channel for briefs')
      .addChannelTypes(ChannelType.GuildText)
  )
  .addIntegerOption(option =>
    option
      .setName('defaultdays')
      .setDescription('Default brief duration in days')
      .setMinValue(1)
      .setMaxValue(14)
  )
  .addBooleanOption(option =>
    option
      .setName('autogenerate')
      .setDescription('Enable automatic brief generation')
  );

export async function execute(
  interaction: ChatInputCommandInteraction,
  configManager: ConfigManager
) {
  const setting = interaction.options.getString('setting', true);
  const guildId = interaction.guildId!;

  if (setting === 'brief') {
    const channel = interaction.options.getChannel('channel');
    const defaultDays = interaction.options.getInteger('defaultdays');
    const autoGenerate = interaction.options.getBoolean('autogenerate');

    const updates: any = {};
    let responseLines = ['## ⚙️ Brief Configuration\n'];

    if (channel) {
      updates.briefChannelId = channel.id;
      responseLines.push(`**Channel:** <#${channel.id}>`);
    }

    if (defaultDays !== null) {
      updates.briefDurationHours = defaultDays * 24;
      responseLines.push(`**Default Duration:** ${defaultDays} days`);
    }

    if (autoGenerate !== null) {
      updates.autoGenerateBriefs = autoGenerate;
      responseLines.push(`**Auto-generate:** ${autoGenerate ? 'Enabled ✅' : 'Disabled ❌'}`);
    }

    if (Object.keys(updates).length === 0) {
      const settings = configManager.getServerSettings(guildId);
      await interaction.reply({
        content: `## ⚙️ Current Brief Configuration\n\n` +
          `**Channel:** ${settings.briefChannelId ? `<#${settings.briefChannelId}>` : 'Not set'}\n` +
          `**Default Duration:** ${settings.briefDurationHours / 24} days\n` +
          `**Auto-generate:** ${settings.autoGenerateBriefs ? 'Enabled ✅' : 'Disabled ❌'}`,
        ephemeral: true
      });
      return;
    }

    await configManager.updateServerSettings(guildId, updates);
    await interaction.reply(responseLines.join('\n'));
  }
}