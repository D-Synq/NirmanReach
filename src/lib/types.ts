export interface PayoutRow {
  'Sr No'?: string | number;
  'GN Name': string;
  'Amount': string | number;
  'Payout': string | number;
  'Acc No': string | number;
  'Number'?: string | number;
  'Mail': string;
}

export type DispatchStatus = 'pending' | 'sending' | 'success' | 'failed';

export interface DispatchResult {
  row: PayoutRow;
  status: DispatchStatus;
  error?: string;
  timestamp: number;
}

export interface BrevoSettings {
  apiKey: string;
  senderName: string;
  senderEmail: string;
  subject: string;
  emailTemplate: string;
}

export type StepId = 1 | 2 | 3 | 4;
