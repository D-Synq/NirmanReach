import { useState } from 'react';
import {
  Send,
  ArrowLeft,
  AlertTriangle,
  CheckCircle2,
  Loader2,
  Mail,
  Settings,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { fillTemplate } from '@/lib/excel';
import { sendEmail } from '@/lib/brevo';
import type { BrevoSettings, PayoutRow, DispatchResult } from '@/lib/types';

interface Step3DispatchProps {
  rows: PayoutRow[];
  template: string;
  subject: string;
  settings: BrevoSettings;
  onComplete: (results: DispatchResult[]) => void;
  onBack: () => void;
  onOpenSettings: () => void;
}

export function Step3Dispatch({
  rows,
  template,
  subject,
  settings,
  onComplete,
  onBack,
  onOpenSettings,
}: Step3DispatchProps) {
  const [confirmed, setConfirmed] = useState(false);
  const [sending, setSending] = useState(false);
  const [progress, setProgress] = useState(0);
  const [sentCount, setSentCount] = useState(0);
  const [currentRecipient, setCurrentRecipient] = useState('');

  const settingsReady =
    settings.apiKey && settings.senderName && settings.senderEmail;

  async function handleSend() {
    setSending(true);
    setProgress(0);
    setSentCount(0);

    const results: DispatchResult[] = [];

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      setCurrentRecipient(`${row['GN Name']} <${row.Mail}>`);

      const body = fillTemplate(template, row);
      const result = await sendEmail(row, settings, subject, body);

      results.push({
        row,
        status: result.success ? 'success' : 'failed',
        error: result.error,
        timestamp: Date.now(),
      });

      setSentCount(i + 1);
      setProgress(Math.round(((i + 1) / rows.length) * 100));

      if (i < rows.length - 1) {
        await new Promise((r) => setTimeout(r, 300));
      }
    }

    setSending(false);
    setCurrentRecipient('');
    onComplete(results);
  }

  return (
    <div className="mx-auto max-w-2xl animate-slide-up">
      {/* Summary Banner */}
      <Card className="border-[#E6F7F3] bg-[#E6F7F3]/60 dark:border-[#184239] dark:bg-[#143830]/40">
        <CardContent className="flex items-center gap-4 p-6">
          <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-[#00A887] text-white">
            <Send className="h-7 w-7" />
          </div>
          <div>
            <p className="text-2xl font-bold text-[#0D322B] dark:text-[#F4F9F6]">
              Ready to send {rows.length} emails via Brevo
            </p>
            <p className="text-sm text-[#526B63] dark:text-[#8FAEA6]">
              Using sender: {settings.senderName || '—'}{' '}
              {settings.senderEmail && `(${settings.senderEmail})`}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Settings Warning */}
      {!settingsReady && (
        <Card className="mt-4 border-[#FEE4E2] bg-[#FEE4E2] dark:border-[#5C1A14] dark:bg-[#2A0F0C]">
          <CardContent className="flex items-start gap-3 p-4">
            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-[#B42318] dark:text-[#FF6B5A]" />
            <div className="flex-1">
              <p className="font-semibold text-[#B42318] dark:text-[#FF6B5A]">
                Brevo settings incomplete
              </p>
              <p className="mt-1 text-sm text-[#526B63] dark:text-[#8FAEA6]">
                You need to configure your API key, sender name, and sender
                email before dispatching. Click the button below to open
                Settings.
              </p>
              <Button
                variant="outline"
                size="sm"
                className="mt-3 gap-1.5"
                onClick={onOpenSettings}
              >
                <Settings className="h-4 w-4" />
                Open Settings
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Details */}
      <Card className="mt-4">
        <CardHeader>
          <CardTitle>Dispatch Summary</CardTitle>
          <CardDescription>
            Please review the details below before sending
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between rounded-lg border border-[#DDE5E0] bg-[#FBFCFA]/50 dark:border-[#184239] dark:bg-[#0A201B]/50 px-4 py-3">
            <span className="text-sm text-[#526B63] dark:text-[#8FAEA6]">Recipients</span>
            <span className="font-semibold tabular-nums text-[#0D322B] dark:text-[#F4F9F6]">{rows.length}</span>
          </div>
          <div className="flex items-center justify-between rounded-lg border border-[#DDE5E0] bg-[#FBFCFA]/50 dark:border-[#184239] dark:bg-[#0A201B]/50 px-4 py-3">
            <span className="text-sm text-[#526B63] dark:text-[#8FAEA6]">Subject</span>
            <span className="max-w-[60%] truncate font-semibold text-[#0D322B] dark:text-[#F4F9F6]">{subject}</span>
          </div>
          <div className="flex items-center justify-between rounded-lg border border-[#DDE5E0] bg-[#FBFCFA]/50 dark:border-[#184239] dark:bg-[#0A201B]/50 px-4 py-3">
            <span className="text-sm text-[#526B63] dark:text-[#8FAEA6]">Sender</span>
            <span className="max-w-[60%] truncate font-semibold text-[#0D322B] dark:text-[#F4F9F6]">
              {settings.senderName
                ? `${settings.senderName} <${settings.senderEmail}>`
                : 'Not configured'}
            </span>
          </div>
          <div className="flex items-center justify-between rounded-lg border border-[#DDE5E0] bg-[#FBFCFA]/50 dark:border-[#184239] dark:bg-[#0A201B]/50 px-4 py-3">
            <span className="text-sm text-[#526B63] dark:text-[#8FAEA6]">Rate limit</span>
            <span className="font-semibold text-[#0D322B] dark:text-[#F4F9F6]">300ms between sends</span>
          </div>
        </CardContent>
      </Card>

      {/* Sending Progress */}
      {sending && (
        <Card className="mt-4 animate-in-fade">
          <CardContent className="p-6">
            <div className="mb-3 flex items-center gap-2">
              <Loader2 className="h-5 w-5 animate-spin text-[#00A887]" />
              <span className="font-semibold">Dispatching emails...</span>
            </div>
            <Progress value={progress} className="h-3" />
            <div className="mt-3 flex items-center justify-between text-sm">
              <span className="text-[#526B63] dark:text-[#8FAEA6]">
                {currentRecipient
                  ? `Sending to: ${currentRecipient}`
                  : 'Processing...'}
              </span>
              <span className="font-semibold tabular-nums">
                {sentCount} / {rows.length} ({progress}%)
              </span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Confirmation & Send */}
      {!sending && (
        <Card className="mt-4">
          <CardContent className="space-y-4 p-6">
            <div className="flex items-start gap-3 rounded-lg border border-[#DDE5E0] bg-[#FBFCFA]/50 dark:border-[#184239] dark:bg-[#0A201B]/50 p-4">
              <Checkbox
                id="confirm"
                checked={confirmed}
                onCheckedChange={(v) => setConfirmed(v === true)}
                className="mt-0.5"
              />
              <div>
                <Label
                  htmlFor="confirm"
                  className="cursor-pointer font-medium"
                >
                  I have verified the recipient list and confirm sending.
                </Label>
                <p className="mt-1 text-sm text-[#526B63] dark:text-[#8FAEA6]">
                  By checking this box, you acknowledge that {rows.length}{' '}
                  emails will be sent through your Brevo account.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <Button variant="outline" onClick={onBack} className="gap-1.5">
                <ArrowLeft className="h-4 w-4" />
                Back to Preview
              </Button>
              <Button
                onClick={handleSend}
                disabled={!confirmed || !settingsReady}
                className="gap-2"
                size="lg"
              >
                <Send className="h-4 w-4" />
                Send All Emails
              </Button>
            </div>

            {!confirmed && settingsReady && (
              <p className="text-center text-xs text-[#526B63] dark:text-[#8FAEA6]">
                <Mail className="mr-1 inline h-3 w-3" />
                Check the confirmation box to enable sending
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Quick stats */}
      <div className="mt-4 flex gap-3">
        <div className="flex-1 rounded-lg border bg-card p-3 text-center">
          <CheckCircle2 className="mx-auto mb-1 h-5 w-5 text-[#0A6A4E] dark:text-[#00A887]" />
          <p className="text-xs text-[#526B63] dark:text-[#8FAEA6]">Ready</p>
          <p className="font-semibold text-[#0D322B] dark:text-[#F4F9F6]">{settingsReady ? 'Yes' : 'No'}</p>
        </div>
        <div className="flex-1 rounded-lg border border-[#DDE5E0] bg-white/50 dark:border-[#184239] dark:bg-[#0D2721]/50 p-3 text-center">
          <Mail className="mx-auto mb-1 h-5 w-5 text-[#00A887]" />
          <p className="text-xs text-[#526B63] dark:text-[#8FAEA6]">Recipients</p>
          <p className="font-semibold tabular-nums text-[#0D322B] dark:text-[#F4F9F6]">{rows.length}</p>
        </div>
        <div className="flex-1 rounded-lg border border-[#DDE5E0] bg-white/50 dark:border-[#184239] dark:bg-[#0D2721]/50 p-3 text-center">
          <Badge variant="outline" className="mx-auto mb-1 w-fit">API</Badge>
          <p className="text-xs text-[#526B63] dark:text-[#8FAEA6]">Brevo</p>
          <p className="font-semibold text-[#0D322B] dark:text-[#F4F9F6]">{settings.apiKey ? 'Connected' : 'No key'}</p>
        </div>
      </div>
    </div>
  );
}
