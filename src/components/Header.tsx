import { useState, useEffect } from 'react';
import { Settings, LogOut, Eye, EyeOff, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { ThemeToggle } from '@/components/ThemeToggle';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { getSettings, loadCloudSettings, saveCloudSettings } from '@/lib/storage';
import { Textarea } from '@/components/ui/textarea';
import type { BrevoSettings } from '@/lib/types';

interface HeaderProps {
  onLogout: () => void;
  onSettingsSaved?: (settings: BrevoSettings) => void;
  externalOpenSignal?: number;
}

export function Header({
  onLogout,
  onSettingsSaved,
  externalOpenSignal = 0,
}: HeaderProps) {
  const [open, setOpen] = useState(false);
  const [settings, setSettings] = useState<BrevoSettings>(getSettings());
  const [showKey, setShowKey] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');

  useEffect(() => {
    if (externalOpenSignal > 0) {
      setOpen(true);
    }
  }, [externalOpenSignal]);

  useEffect(() => {
    if (open) {
      setShowKey(false);
      loadCloudSettings().then(setSettings);
    }
  }, [open]);

  async function handleSave() {
    setSaveError('');
    setSaving(true);
    const saved = await saveCloudSettings(settings);
    setSaving(false);

    if (saved) {
      onSettingsSaved?.(settings);
      setOpen(false);
    } else {
      setSaveError('Could not save settings. Please try again.');
    }
  }

  return (
    <header className="glass-header sticky top-0 z-40">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-[3px]">
          <img src="/logo.png" alt="NirmanReach Logo" className="h-12 w-auto object-contain" />
          <div className="flex flex-col">
            <span className="text-base font-bold tracking-tight text-[#0D322B] dark:text-[#F4F9F6]">
              NirmanReach
            </span>
            <span className="text-xs font-semibold text-[#526B63] dark:text-[#8FAEA6]">
              Powered by <span className="font-extrabold text-[#00A887]">DSynq</span>
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <ThemeToggle />
          <Badge
            variant="secondary"
            className="hidden gap-1.5 px-3 py-1.5 font-normal sm:flex"
          >
            <span className="h-2 w-2 rounded-full bg-[#00A887]" />
            Logged in as admin@mail
          </Badge>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setOpen(true)}
            className="gap-1.5"
          >
            <Settings className="h-4 w-4" />
            <span className="hidden sm:inline">Settings</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onLogout}
            className="gap-1.5 text-destructive hover:bg-destructive/5 hover:text-destructive"
          >
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline">Logout</span>
          </Button>
        </div>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5 text-primary" />
              Brevo Settings
            </DialogTitle>
            <DialogDescription>
              Configure your Brevo API credentials and sender details. These
              are saved securely for reuse across sessions.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="api-key">Brevo API Key</Label>
              <div className="relative">
                <Input
                  id="api-key"
                  type={showKey ? 'text' : 'password'}
                  placeholder="xkeysib-..."
                  value={settings.apiKey}
                  onChange={(e) =>
                    setSettings({ ...settings, apiKey: e.target.value })
                  }
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowKey(!showKey)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
                >
                  {showKey ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="sender-name">Sender Name</Label>
              <Input
                id="sender-name"
                type="text"
                placeholder="Accounts Department"
                value={settings.senderName}
                onChange={(e) =>
                  setSettings({ ...settings, senderName: e.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="sender-email">Sender Email</Label>
              <Input
                id="sender-email"
                type="email"
                placeholder="accounts@company.com"
                value={settings.senderEmail}
                onChange={(e) =>
                  setSettings({ ...settings, senderEmail: e.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="subject">Default Email Subject</Label>
              <Input
                id="subject"
                type="text"
                placeholder="Payout Statement Update"
                value={settings.subject}
                onChange={(e) =>
                  setSettings({ ...settings, subject: e.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email-template">Default Email Template</Label>
              <Textarea
                id="email-template"
                value={settings.emailTemplate}
                onChange={(e) =>
                  setSettings({ ...settings, emailTemplate: e.target.value })
                }
                className="min-h-[160px] font-mono text-xs"
                placeholder="Dear {GN Name},&#10;&#10;Here are your payout details:&#10;• Account No: {Acc No}&#10;• Total Amount: {Amount}&#10;• Net Payout: {Payout}&#10;&#10;Thank you."
              />
              <p className="text-xs text-[#526B63]">
                Use {'{GN Name}'}, {'{Amount}'}, {'{Payout}'}, {'{Acc No}'} as variable tags.
              </p>
            </div>
          </div>

          {saveError && (
            <p className="text-sm text-[#B42318] dark:text-[#FF6B5A]">{saveError}</p>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={saving} className="gap-1.5">
              <Save className="h-4 w-4" />
              {saving ? 'Saving...' : 'Save Settings'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </header>
  );
}
