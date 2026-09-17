import type { BrevoSettings } from './types';
import { DEFAULT_TEMPLATE } from './excel';
import { supabase } from './supabase';

const AUTH_KEY = 'bmd_auth';
const SETTINGS_KEY = 'bmd_settings';

export const DEFAULT_SETTINGS: BrevoSettings = {
  apiKey: '',
  senderName: '',
  senderEmail: '',
  subject: 'Payout Statement Update',
  emailTemplate: DEFAULT_TEMPLATE,
};

export function getAuth(): boolean {
  try {
    return localStorage.getItem(AUTH_KEY) === 'true';
  } catch {
    return false;
  }
}

export function setAuth(value: boolean) {
  try {
    if (value) localStorage.setItem(AUTH_KEY, 'true');
    else localStorage.removeItem(AUTH_KEY);
  } catch {
    /* ignore */
  }
}

export function getSettings(): BrevoSettings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) return { ...DEFAULT_SETTINGS };
    return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch {
    return { ...DEFAULT_SETTINGS };
  }
}

export function saveSettings(settings: BrevoSettings) {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch {
    /* ignore */
  }
}

export async function loadCloudSettings(): Promise<BrevoSettings> {
  const { data, error } = await supabase
    .from('app_settings')
    .select('api_key, sender_name, sender_email, subject, email_template')
    .eq('id', 1)
    .maybeSingle();

  if (error || !data) {
    return getSettings();
  }

  const settings = {
    ...DEFAULT_SETTINGS,
    apiKey: data.api_key,
    senderName: data.sender_name,
    senderEmail: data.sender_email,
    subject: data.subject,
    emailTemplate: data.email_template || DEFAULT_TEMPLATE,
  };

  saveSettings(settings);
  return settings;
}

export async function saveCloudSettings(settings: BrevoSettings): Promise<boolean> {
  saveSettings(settings);

  const { error } = await supabase.from('app_settings').upsert({
    id: 1,
    api_key: settings.apiKey,
    sender_name: settings.senderName,
    sender_email: settings.senderEmail,
    subject: settings.subject,
    email_template: settings.emailTemplate,
  });

  return !error;
}
