import { Client } from 'discord.js';
import { logger } from './logger.js';

export async function sendAdminAlert(client: Client, message: string, error?: any): Promise<void> {
  try {
    const adminUserId = process.env.ADMIN_USER_ID;
    
    if (!adminUserId) {
      logger.error('ADMIN_USER_ID not set in environment variables');
      return;
    }
    
    const admin = await client.users.fetch(adminUserId);
    if (admin) {
      const errorDetails = error ? `\n\n**Détails de l'erreur :**\n\`\`\`\n${error.message || error}\n\`\`\`` : '';
      const fullMessage = `🚨 **Alerte Bot La Machine** 🚨\n\n${message}${errorDetails}`;
      
      await admin.send(fullMessage);
      logger.info(`Alert sent to admin: ${message}`);
    } else {
      logger.error(`Could not fetch admin user with ID: ${adminUserId}`);
    }
  } catch (alertError) {
    logger.error('Failed to send admin alert:', alertError);
  }
}