import type { BrevoSettings, PayoutRow } from './types';

export interface SendResult {
  success: boolean;
  error?: string;
}

export async function sendEmail(
  row: PayoutRow,
  settings: BrevoSettings,
  subject: string,
  textContent: string,
): Promise<SendResult> {
  try {
    const res = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'api-key': settings.apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        sender: {
          name: settings.senderName,
          email: settings.senderEmail,
        },
        to: [{ email: row.Mail, name: row['GN Name'] }],
        subject,
        textContent,
      }),
    });

    if (!res.ok) {
      let errorBody = '';
      try {
        const body = await res.json();
        errorBody = body.message || body.error || JSON.stringify(body);
      } catch {
        errorBody = await res.text().catch(() => `HTTP ${res.status}`);
      }
      return { success: false, error: errorBody || `HTTP ${res.status}` };
    }

    return { success: true };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Network error',
    };
  }
}

export function downloadCsv(filename: string, rows: string[][]) {
  const csv = rows
    .map((row) =>
      row
        .map((cell) => {
          const escaped = String(cell).replace(/"/g, '""');
          return `"${escaped}"`;
        })
        .join(','),
    )
    .join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
