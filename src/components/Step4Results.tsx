import { useMemo } from 'react';
import {
  CheckCircle2,
  XCircle,
  Download,
  RotateCcw,
  Send,
  AlertCircle,
  Mail,
  Clock,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { downloadCsv } from '@/lib/brevo';
import type { DispatchResult } from '@/lib/types';

interface Step4ResultsProps {
  results: DispatchResult[];
  onReset: () => void;
}

export function Step4Results({ results, onReset }: Step4ResultsProps) {
  const succeeded = useMemo(
    () => results.filter((r) => r.status === 'success').length,
    [results],
  );
  const failed = useMemo(
    () => results.filter((r) => r.status === 'failed').length,
    [results],
  );
  const total = results.length;

  function handleDownload() {
    const header = [
      'Sr No',
      'GN Name',
      'Email',
      'Amount',
      'Payout',
      'Acc No',
      'Status',
      'Error',
      'Timestamp',
    ];
    const rows = results.map((r) => [
      String(r.row['Sr No'] ?? ''),
      r.row['GN Name'],
      r.row.Mail,
      String(r.row['Amount']),
      String(r.row['Payout']),
      String(r.row['Acc No']),
      r.status === 'success' ? 'Success' : 'Failed',
      r.error ?? '',
      new Date(r.timestamp).toISOString(),
    ]);
    downloadCsv(`nirmanreach-report-${Date.now()}.csv`, [header, ...rows]);
  }

  return (
    <div className="mx-auto max-w-5xl animate-slide-up">
      {/* Metric Cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="border-[#E6F7F3]/60 dark:border-[#184239]">
          <CardContent className="flex items-center gap-4 p-5">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#E6F7F3] text-[#00A887] dark:bg-[#143830] dark:text-[#00A887]">
              <Send className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm text-[#526B63] dark:text-[#8FAEA6]">Total Dispatched</p>
              <p className="text-2xl font-bold tabular-nums text-[#0D322B] dark:text-[#F4F9F6]">{total}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-[#E6F7F3]/60 dark:border-[#184239]">
          <CardContent className="flex items-center gap-4 p-5">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#E6F7F3] text-[#0A6A4E] dark:bg-[#143830] dark:text-[#00A887]">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm text-[#526B63] dark:text-[#8FAEA6]">Succeeded</p>
              <p className="text-2xl font-bold tabular-nums text-[#0A6A4E] dark:text-[#00A887]">
                {succeeded}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className={failed > 0 ? 'border-destructive/20' : ''}>
          <CardContent className="flex items-center gap-4 p-5">
            <div
              className={`flex h-12 w-12 items-center justify-center rounded-xl ${
                failed > 0
                  ? 'bg-destructive/10 text-destructive'
                  : 'bg-muted text-muted-foreground'
              }`}
            >
              <XCircle className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Failed</p>
              <p
                className={`text-2xl font-bold tabular-nums ${
                  failed > 0 ? 'text-destructive' : ''
                }`}
              >
                {failed}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Success Banner */}
      {failed === 0 && total > 0 && (
        <Card className="mt-4 animate-in-fade border-[#E6F7F3] bg-[#E6F7F3]/60 dark:border-[#184239] dark:bg-[#143830]/40">
          <CardContent className="flex items-center gap-3 p-4">
            <CheckCircle2 className="h-6 w-6 text-[#0A6A4E] dark:text-[#00A887]" />
            <div>
              <p className="font-semibold text-[#0A6A4E] dark:text-[#00A887]">
                All {total} emails dispatched successfully!
              </p>
              <p className="text-sm text-[#526B63] dark:text-[#8FAEA6]">
                Every recipient was sent their payout statement via Brevo.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Partial Failure Banner */}
      {failed > 0 && succeeded > 0 && (
        <Card className="mt-4 animate-in-fade border-[#FEE4E2] bg-[#FEE4E2] dark:border-[#5C1A14] dark:bg-[#2A0F0C]">
          <CardContent className="flex items-start gap-3 p-4">
            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-[#B42318] dark:text-[#FF6B5A]" />
            <div>
              <p className="font-semibold text-[#B42318] dark:text-[#FF6B5A]">
                {succeeded} succeeded, {failed} failed
              </p>
              <p className="text-sm text-[#526B63] dark:text-[#8FAEA6]">
                Some emails could not be delivered. Review the error details
                below and re-dispatch the failed entries if needed.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* All Failed Banner */}
      {failed > 0 && succeeded === 0 && (
        <Card className="mt-4 animate-in-fade border-[#FEE4E2] bg-[#FEE4E2] dark:border-[#5C1A14] dark:bg-[#2A0F0C]">
          <CardContent className="flex items-start gap-3 p-4">
            <XCircle className="mt-0.5 h-5 w-5 shrink-0 text-[#B42318] dark:text-[#FF6B5A]" />
            <div>
              <p className="font-semibold text-[#B42318] dark:text-[#FF6B5A]">
                All {total} emails failed to send
              </p>
              <p className="text-sm text-[#526B63] dark:text-[#8FAEA6]">
                Please check your Brevo API key, sender email verification, and
                network connection, then try again.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Results Table */}
      <Card className="mt-4">
        <CardHeader>
          <CardTitle>Dispatch Results</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border border-[#DDE5E0] dark:border-[#184239] overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-16">Status</TableHead>
                  <TableHead>GN Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead className="text-right">Payout</TableHead>
                  <TableHead>Error Details</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {results.map((r, i) => (
                  <TableRow key={i} className="hover:bg-muted/30">
                    <TableCell>
                      {r.status === 'success' ? (
                        <CheckCircle2 className="h-5 w-5 text-[#0A6A4E] dark:text-[#00A887]" />
                      ) : (
                        <Badge variant="destructive" className="gap-1">
                          <XCircle className="h-3 w-3" />
                          Failed
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="font-medium text-[#0D322B] dark:text-[#F4F9F6]">
                      {r.row['GN Name']}
                    </TableCell>
                    <TableCell className="text-sm text-[#526B63] dark:text-[#8FAEA6]">
                      {r.row.Mail}
                    </TableCell>
                    <TableCell className="text-right tabular-nums font-semibold text-[#0A6A4E] dark:text-[#00A887]">
                      {String(r.row['Amount'])}
                    </TableCell>
                    <TableCell className="text-right tabular-nums font-semibold text-[#0A6A4E] dark:text-[#00A887]">
                      {String(r.row['Payout'])}
                    </TableCell>
                    <TableCell className="max-w-xs">
                      {r.error ? (
                        <span className="text-xs text-[#B42318] dark:text-[#FF6B5A]">
                          {r.error}
                        </span>
                      ) : (
                        <span className="text-xs text-[#526B63] dark:text-[#8FAEA6]">
                          <Clock className="mr-1 inline h-3 w-3" />
                          {new Date(r.timestamp).toLocaleTimeString()}
                        </span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-between">
        <Button variant="outline" onClick={handleDownload} className="gap-2">
          <Download className="h-4 w-4" />
          Download Report (.csv)
        </Button>
        <Button onClick={onReset} className="gap-2" size="lg">
          <RotateCcw className="h-4 w-4" />
          Start New Batch
        </Button>
      </div>

      {/* Footer note */}
      <p className="mt-4 flex items-center justify-center gap-1.5 text-center text-xs text-[#526B63] dark:text-[#8FAEA6]">
        <Mail className="h-3 w-3" />
        Dispatch completed. Download the report for your records or start a new
        batch.
      </p>
    </div>
  );
}
