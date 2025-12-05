"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useUser } from "@/contexts/user-context";
import { Copy, Check, ExternalLink } from "lucide-react";
import { toast } from "sonner";

export function TelegramConnect() {
  const { user } = useUser();
  const [copied, setCopied] = useState(false);

  if (!user) return null;

  const botUsername =
    process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME || "YourBotUsername";
  const telegramBotUrl = `https://t.me/${botUsername}?start=${user.wallet_address}`;

  const handleCopyCommand = () => {
    const command = `/register ${user.wallet_address}`;
    navigator.clipboard.writeText(command);
    setCopied(true);
    toast.success("Command copied!");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleOpenTelegram = () => {
    window.open(telegramBotUrl, "_blank");
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <span className="text-2xl">📱</span>
          Connect Telegram
        </CardTitle>
        <CardDescription>
          Get AI-matched job notifications directly in Telegram
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {user.telegram_id ? (
          <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
            <p className="text-sm font-medium text-green-600 dark:text-green-400">
              ✅ Telegram Connected: {user.telegram_id}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              You&apos;ll receive notifications about matching opportunities
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
              <p className="text-sm font-medium text-blue-600 dark:text-blue-400 mb-2">
                🤖 How it works:
              </p>
              <ol className="text-xs text-muted-foreground space-y-1 ml-4 list-decimal">
                <li>Click the button below to open our Telegram bot</li>
                <li>Click &quot;Start&quot; or send /start in the chat</li>
                <li>Your account will be automatically linked!</li>
              </ol>
            </div>

            <Button onClick={handleOpenTelegram} className="w-full" size="lg">
              <ExternalLink className="h-4 w-4 mr-2" />
              Connect via Telegram Bot
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  Or manually
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                1. Open Telegram and search for{" "}
                <code className="text-xs bg-muted px-1 py-0.5 rounded">
                  @{botUsername}
                </code>
              </p>
              <p className="text-sm text-muted-foreground">
                2. Send this command:
              </p>
              <div className="flex items-center gap-2">
                <code className="flex-1 text-xs bg-muted px-3 py-2 rounded overflow-x-auto">
                  /register {user.wallet_address}
                </code>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleCopyCommand}
                >
                  {copied ? (
                    <Check className="h-4 w-4 text-green-500" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          </div>
        )}

        <div className="pt-4 border-t">
          <p className="text-xs text-muted-foreground">
            <strong>Why connect Telegram?</strong> Our AI will analyze your
            skills and notify you about opportunities that are a great match. No
            spam, just relevant opportunities!
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
