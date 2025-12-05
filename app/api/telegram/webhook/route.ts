import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase/client";

/**
 * Telegram Webhook Handler
 *
 * When users start your bot or send messages, Telegram will POST to this endpoint.
 * We capture their chat_id and link it to their user account.
 *
 * Setup:
 * 1. Deploy your app to a public URL (e.g., Vercel)
 * 2. Set webhook: https://api.telegram.org/bot<YOUR_TOKEN>/setWebhook?url=https://yourapp.com/api/telegram/webhook
 * 3. Users start your bot with command: /start <user_wallet_address>
 */

interface TelegramUpdate {
  update_id: number;
  message?: {
    message_id: number;
    from: {
      id: number;
      is_bot: boolean;
      first_name: string;
      last_name?: string;
      username?: string;
      language_code?: string;
    };
    chat: {
      id: number;
      first_name: string;
      last_name?: string;
      username?: string;
      type: string;
    };
    date: number;
    text?: string;
  };
}

export async function POST(request: NextRequest) {
  try {
    const update: TelegramUpdate = await request.json();

    // Only process messages (not other update types)
    if (!update.message) {
      return NextResponse.json({ ok: true });
    }

    const message = update.message;
    const chatId = message.chat.id.toString();
    const username = message.from.username;
    const text = message.text || "";

    console.log("📱 Telegram message received:", {
      chatId,
      username,
      text,
    });

    // Handle /start command
    if (text.startsWith("/start")) {
      await handleStartCommand(message, chatId);
    }

    // Handle /register command with wallet address
    if (text.startsWith("/register")) {
      await handleRegisterCommand(message, chatId);
    }

    // Handle /help command
    if (text.startsWith("/help")) {
      await sendHelpMessage(chatId);
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Error processing Telegram webhook:", error);
    return NextResponse.json(
      { ok: false, error: "Internal error" },
      { status: 500 }
    );
  }
}

async function handleStartCommand(
  message: TelegramUpdate["message"],
  chatId: string
) {
  if (!message) return;

  const firstName = message.from.first_name;

  // Extract wallet address if provided: /start 0x123...
  const parts = message.text?.split(" ");
  const walletAddress = parts && parts.length > 1 ? parts[1] : null;

  if (walletAddress) {
    // Try to link chat_id to user by wallet address
    const { data, error } = await supabase
      .from("users")
      .update({ telegram_id: chatId })
      .eq("wallet_address", walletAddress)
      .select()
      .single();

    if (error || !data) {
      await sendTelegramMessage(
        chatId,
        `❌ Could not find an account with wallet ${walletAddress}.\n\n` +
          `Please make sure you're logged into BlockchainHQ Earn first, then use the link from your profile page.`
      );
      return;
    }

    await sendTelegramMessage(
      chatId,
      `✅ Success! Your Telegram account has been linked.\n\n` +
        `🎯 You'll now receive notifications about opportunities that match your skills!\n\n` +
        `Your profile: ${data.name || "User"}\n` +
        `Skills: ${
          data.skills?.join(", ") || "None yet - add skills to your profile!"
        }`
    );
  } else {
    // No wallet provided - send registration instructions
    await sendTelegramMessage(
      chatId,
      `👋 Welcome to BlockchainHQ Earn, ${firstName}!\n\n` +
        `🤖 I'm your AI job matching assistant. I'll notify you about opportunities that match your skills.\n\n` +
        `📝 To connect your account:\n` +
        `1. Go to blockchainhq-earn.com\n` +
        `2. Connect your wallet\n` +
        `3. Go to your profile settings\n` +
        `4. Click "Connect Telegram"\n\n` +
        `Or use: /register <your_wallet_address>\n\n` +
        `Need help? Use /help`
    );
  }
}

async function handleRegisterCommand(
  message: TelegramUpdate["message"],
  chatId: string
) {
  if (!message) return;

  const parts = message.text?.split(" ");
  const walletAddress = parts && parts.length > 1 ? parts[1] : null;

  if (!walletAddress) {
    await sendTelegramMessage(
      chatId,
      `❌ Please provide your wallet address:\n\n` + `/register 0x123...`
    );
    return;
  }

  // Update user with chat_id
  const { data, error } = await supabase
    .from("users")
    .update({ telegram_id: chatId })
    .eq("wallet_address", walletAddress)
    .select()
    .single();

  if (error || !data) {
    await sendTelegramMessage(
      chatId,
      `❌ No account found with wallet: ${walletAddress}\n\n` +
        `Please create an account at blockchainhq-earn.com first.`
    );
    return;
  }

  await sendTelegramMessage(
    chatId,
    `✅ Registration successful!\n\n` +
      `Your Telegram is now linked to your BlockchainHQ Earn account.\n\n` +
      `Profile: ${data.name || "User"}\n` +
      `Skills: ${
        data.skills?.join(", ") || "Add skills in your profile!"
      }\n\n` +
      `You'll receive AI-matched job notifications here! 🚀`
  );
}

async function sendHelpMessage(chatId: string) {
  await sendTelegramMessage(
    chatId,
    `🤖 <b>BlockchainHQ Earn Bot - Help</b>\n\n` +
      `<b>Commands:</b>\n` +
      `/start - Start the bot and get registration link\n` +
      `/register <wallet> - Link your wallet address\n` +
      `/help - Show this help message\n\n` +
      `<b>Features:</b>\n` +
      `• AI-powered job matching\n` +
      `• Personalized opportunity notifications\n` +
      `• Real-time alerts for new bounties/jobs\n\n` +
      `<b>How it works:</b>\n` +
      `1. Connect your account\n` +
      `2. Add skills to your profile\n` +
      `3. Receive notifications for matching opportunities\n\n` +
      `Visit: blockchainhq-earn.com`
  );
}

async function sendTelegramMessage(
  chatId: string,
  text: string
): Promise<void> {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;

  if (!botToken) {
    console.error("TELEGRAM_BOT_TOKEN not configured");
    return;
  }

  try {
    const response = await fetch(
      `https://api.telegram.org/bot${botToken}/sendMessage`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: chatId,
          text,
          parse_mode: "HTML",
        }),
      }
    );

    const data = await response.json();
    if (!data.ok) {
      console.error("Telegram API error:", data);
    }
  } catch (error) {
    console.error("Error sending Telegram message:", error);
  }
}
