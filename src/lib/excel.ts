import * as XLSX from 'xlsx';
import type { PayoutRow } from './types';

const REQUIRED_COLUMNS = ['GN Name', 'Amount', 'Payout', 'Acc No', 'Mail'] as const;

export type ParseOutcome =
  | { ok: true; rows: PayoutRow[] }
  | { ok: false; error: string; missingColumns?: string[] };

export async function parseFile(file: File): Promise<ParseOutcome> {
  try {
    const buf = await file.arrayBuffer();
    const workbook = XLSX.read(buf, { type: 'array' });
    const sheetName = workbook.SheetNames[0];
    if (!sheetName) {
      return { ok: false, error: 'The file does not contain any sheets.' };
    }
    const sheet = workbook.Sheets[sheetName];
    const json = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, {
      defval: '',
    });

    if (json.length === 0) {
      return { ok: false, error: 'The sheet appears to be empty.' };
    }

    const presentColumns = Object.keys(json[0]);
    const missingColumns = REQUIRED_COLUMNS.filter(
      (col) => !presentColumns.includes(col),
    );

    if (missingColumns.length > 0) {
      return {
        ok: false,
        error: `Missing required columns: ${missingColumns.join(', ')}`,
        missingColumns: [...missingColumns],
      };
    }

    const rows: PayoutRow[] = json.map((row) => ({
      'Sr No': row['Sr No'] as string | number | undefined,
      'GN Name': String(row['GN Name'] ?? '').trim(),
      'Amount': row['Amount'] as string | number,
      'Payout': row['Payout'] as string | number,
      'Acc No': row['Acc No'] as string | number,
      'Number': row['Number'] as string | number | undefined,
      'Mail': String(row['Mail'] ?? '').trim(),
    }));

    return { ok: true, rows };
  } catch (err) {
    return {
      ok: false,
      error: `Failed to parse file: ${err instanceof Error ? err.message : 'Unknown error'}`,
    };
  }
}

export function fillTemplate(
  template: string,
  row: PayoutRow,
): string {
  return template
    .replace(/\{GN Name\}/g, String(row['GN Name'] ?? ''))
    .replace(/\{Amount\}/g, String(row['Amount'] ?? ''))
    .replace(/\{Payout\}/g, String(row['Payout'] ?? ''))
    .replace(/\{Acc No\}/g, String(row['Acc No'] ?? ''));
}

export const DEFAULT_TEMPLATE = `Dear {GN Name},

Here are your payout details:
• Account No: {Acc No}
• Total Amount: {Amount}
• Net Payout: {Payout}

Thank you.`;
