import type { TelegramNotificationPayload } from "./types";

/**
 * Telegram Bot API Service
 * Sends notifications to candidates about matching opportunities
 */

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_API_URL = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}`;

/**
 * Send a message via Telegram Bot API
 */
async function sendTelegramMessage(
  chatId: string,
  message: string,
  parseMode: "HTML" | "Markdown" | "MarkdownV2" = "HTML"
): Promise<boolean> {
  try {
    if (!TELEGRAM_BOT_TOKEN) {
      console.warn("TELEGRAM_BOT_TOKEN not set. Skipping notification.");
      return false;
    }

    const response = await fetch(`${TELEGRAM_API_URL}/sendMessage`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
        parse_mode: parseMode,
        disable_web_page_preview: false,
      }),
    });

    const data = await response.json();

    if (!data.ok) {
      console.error("Telegram API error:", data);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Error sending Telegram message:", error);
    return false;
  }
}

/**
 * Format opportunity details as a rich message
 */
function formatOpportunityMessage(
  payload: TelegramNotificationPayload
): string {
  const { opportunity, matchScore, personalizedMessage } = payload;

  const emoji = getOpportunityEmoji(opportunity.type);
  const matchEmoji = getMatchScoreEmoji(matchScore);

  // Format deadline
  const deadline = new Date(opportunity.deadline);
  const deadlineStr = deadline.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  // Calculate days remaining
  const now = new Date();
  const daysRemaining = Math.ceil(
    (deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
  );
  const urgency = daysRemaining <= 7 ? "⚡ URGENT" : "";

  const message = `
${emoji} <b>New Opportunity Match!</b> ${matchEmoji}

<b>${opportunity.title}</b>
${opportunity.organization}

${personalizedMessage}

💰 <b>Reward:</b> ${opportunity.amount} ${opportunity.currency}
📊 <b>Match Score:</b> ${matchScore}%
📅 <b>Deadline:</b> ${deadlineStr} (${daysRemaining} days) ${urgency}
🏷️ <b>Type:</b> ${
    opportunity.type.charAt(0).toUpperCase() + opportunity.type.slice(1)
  }

<i>${truncateText(opportunity.description, 200)}</i>

🔗 <b>View & Apply:</b> ${getOpportunityUrl(opportunity.id)}

<i>This opportunity was matched to your skills using AI. Good luck! 🚀</i>
  `.trim();

  return message;
}

/**
 * Get emoji based on opportunity type
 */
function getOpportunityEmoji(type: string): string {
  const emojiMap: { [key: string]: string } = {
    bounty: "🎯",
    job: "💼",
    project: "🚀",
    grant: "💎",
    hackathon: "🏆",
  };
  return emojiMap[type] || "📢";
}

/**
 * Get emoji based on match score
 */
function getMatchScoreEmoji(score: number): string {
  if (score >= 90) return "🔥";
  if (score >= 80) return "⭐";
  if (score >= 70) return "✨";
  return "💫";
}

/**
 * Truncate text to specified length
 */
function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength).trim() + "...";
}

/**
 * Get the full URL to the opportunity page
 */
function getOpportunityUrl(opportunityId: string): string {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  return `${baseUrl}/opportunities/${opportunityId}`;
}

/**
 * Main function: Send opportunity notification to a candidate via Telegram
 */
export async function sendTelegramNotification(
  payload: TelegramNotificationPayload
): Promise<boolean> {
  try {
    const message = formatOpportunityMessage(payload);
    const success = await sendTelegramMessage(
      payload.telegramId,
      message,
      "HTML"
    );

    if (success) {
      console.log(
        `✅ Sent Telegram notification for opportunity ${payload.opportunity.id} to user ${payload.telegramId}`
      );
    } else {
      console.warn(
        `⚠️ Failed to send Telegram notification for opportunity ${payload.opportunity.id}`
      );
    }

    return success;
  } catch (error) {
    console.error("Error in sendTelegramNotification:", error);
    return false;
  }
}

/**
 * Send a simple text notification (for testing or other purposes)
 */
export async function sendSimpleTelegramMessage(
  telegramId: string,
  message: string
): Promise<boolean> {
  return sendTelegramMessage(telegramId, message, "HTML");
}

/**
 * Verify that the Telegram bot is configured correctly
 */
export async function verifyTelegramBot(): Promise<{
  success: boolean;
  botInfo?: any;
  error?: string;
}> {
  try {
    if (!TELEGRAM_BOT_TOKEN) {
      return {
        success: false,
        error: "TELEGRAM_BOT_TOKEN not configured",
      };
    }

    const response = await fetch(`${TELEGRAM_API_URL}/getMe`);
    const data = await response.json();

    if (data.ok) {
      return {
        success: true,
        botInfo: data.result,
      };
    } else {
      return {
        success: false,
        error: data.description || "Unknown error",
      };
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
