import { useState, useMemo } from 'react';
import {
  Search,
  ChevronLeft,
  ChevronRight,
  Mail,
  Eye,
  Edit3,
  FileText,
  ArrowRight,
  ArrowLeft,
  RotateCcw,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { fillTemplate, DEFAULT_TEMPLATE } from '@/lib/excel';
import type { PayoutRow } from '@/lib/types';

const PAGE_SIZE = 8;

interface Step2PreviewProps {
  rows: PayoutRow[];
  template: string;
  subject: string;
  onTemplateChange: (template: string) => void;
  onSubjectChange: (subject: string) => void;
  onNext: () => void;
  onBack: () => void;
}

export function Step2Preview({
  rows,
  template,
  subject,
  onTemplateChange,
  onSubjectChange,
  onNext,
  onBack,
}: Step2PreviewProps) {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [mode, setMode] = useState<'preview' | 'edit'>('preview');

  const filtered = useMemo(() => {
    if (!search.trim()) return rows;
    const q = search.toLowerCase();
    return rows.filter(
      (r) =>
        String(r['GN Name'] ?? '').toLowerCase().includes(q) ||
        String(r.Mail ?? '').toLowerCase().includes(q) ||
        String(r['Acc No'] ?? '').toLowerCase().includes(q),
    );
  }, [rows, search]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const pageRows = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);
  const previewRow = rows[0];

  const renderedBody = previewRow
    ? fillTemplate(template, previewRow)
    : '';

  return (
    <div className="mx-auto max-w-7xl animate-slide-up">
      <div className="grid gap-6 lg:grid-cols-5">
        {/* Data Table */}
        <div className="lg:col-span-3">
          <Card>
            <CardHeader>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <CardTitle>Recipient Data</CardTitle>
                  <CardDescription>
                    {rows.length} rows loaded — searchable and paginated
                  </CardDescription>
                </div>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#526B63] dark:text-[#8FAEA6]" />
                  <Input
                    placeholder="Search name, email, account..."
                    value={search}
                    onChange={(e) => {
                      setSearch(e.target.value);
                      setPage(0);
                    }}
                    className="w-full pl-9 sm:w-64"
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="rounded-lg border border-[#DDE5E0] dark:border-[#184239] overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">Sr</TableHead>
                      <TableHead>GN Name</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                      <TableHead className="text-right">Payout</TableHead>
                      <TableHead>Acc No</TableHead>
                      <TableHead>Mail</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pageRows.length === 0 ? (
                      <TableRow>
                        <TableCell className="h-24 text-center text-[#526B63] dark:text-[#8FAEA6]">
                          No matching rows found.
                        </TableCell>
                      </TableRow>
                    ) : (
                      pageRows.map((row, i) => (
                        <TableRow key={page * PAGE_SIZE + i} className="hover:bg-[#FBFCFA] dark:hover:bg-[#143830]/50">
                          <TableCell className="text-[#526B63] dark:text-[#8FAEA6]">
                            {row['Sr No'] ?? page * PAGE_SIZE + i + 1}
                          </TableCell>
                          <TableCell className="font-medium">
                            {row['GN Name']}
                          </TableCell>
                          <TableCell className="text-right tabular-nums font-semibold text-[#0A6A4E] dark:text-[#00A887]">
                            {String(row['Amount'])}
                          </TableCell>
                          <TableCell className="text-right tabular-nums font-semibold text-[#0A6A4E] dark:text-[#00A887]">
                            {String(row['Payout'])}
                          </TableCell>
                          <TableCell className="font-mono text-xs">
                            {String(row['Acc No'])}
                          </TableCell>
                          <TableCell className="text-sm text-[#526B63] dark:text-[#8FAEA6]">
                            {row.Mail}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              <div className="mt-4 flex items-center justify-between">
                <p className="text-sm text-[#526B63] dark:text-[#8FAEA6]">
                  Page {page + 1} of {totalPages || 1} • {filtered.length} rows
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page === 0}
                    onClick={() => setPage(page - 1)}
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Prev
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page >= totalPages - 1}
                    onClick={() => setPage(page + 1)}
                  >
                    Next
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Email Preview & Template Editor */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Mail className="h-5 w-5 text-[#00A887]" />
                    Live Email Preview
                  </CardTitle>
                  <CardDescription>
                    Based on row #1 — {previewRow?.Mail}
                  </CardDescription>
                </div>
                <div className="flex rounded-lg border p-0.5">
                  <button
                    onClick={() => setMode('preview')}
                    className={`flex items-center gap-1 rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                      mode === 'preview'
                        ? 'bg-[#00A887] text-white'
                        : 'text-[#526B63] hover:text-[#0D322B] dark:text-[#8FAEA6] dark:hover:text-[#F4F9F6]'
                    }`}
                  >
                    <Eye className="h-3.5 w-3.5" />
                    Preview
                  </button>
                  <button
                    onClick={() => setMode('edit')}
                    className={`flex items-center gap-1 rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                      mode === 'edit'
                        ? 'bg-[#00A887] text-white'
                        : 'text-[#526B63] hover:text-[#0D322B] dark:text-[#8FAEA6] dark:hover:text-[#F4F9F6]'
                    }`}
                  >
                    <Edit3 className="h-3.5 w-3.5" />
                    Edit
                  </button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {mode === 'preview' ? (
                <div className="space-y-3">
                  <div className="rounded-lg border border-[#DDE5E0] bg-[#FBFCFA]/50 dark:border-[#184239] dark:bg-[#0A201B]/50 p-3">
                    <div className="mb-1 text-xs font-medium text-[#526B63] dark:text-[#8FAEA6]">
                      To
                    </div>
                    <div className="text-sm font-medium text-[#0D322B] dark:text-[#F4F9F6]">
                      {previewRow?.['GN Name']}{' '}
                      <span className="text-[#526B63] dark:text-[#8FAEA6]">
                        &lt;{previewRow?.Mail}&gt;
                      </span>
                    </div>
                  </div>
                  <div className="rounded-lg border border-[#DDE5E0] bg-[#FBFCFA]/50 dark:border-[#184239] dark:bg-[#0A201B]/50 p-3">
                    <div className="mb-1 text-xs font-medium text-[#526B63] dark:text-[#8FAEA6]">
                      Subject
                    </div>
                    <div className="text-sm font-semibold text-[#0D322B] dark:text-[#F4F9F6]">{subject}</div>
                  </div>
                  <div className="rounded-lg border border-[#DDE5E0] dark:border-[#184239] bg-white/50 dark:bg-[#0D2721]/50 p-4">
                    <div className="mb-1 flex items-center gap-1.5 text-xs font-medium text-[#526B63] dark:text-[#8FAEA6]">
                      <FileText className="h-3.5 w-3.5" />
                      Message Body
                    </div>
                    <pre className="whitespace-pre-wrap break-words font-sans text-sm leading-relaxed text-[#0D322B] dark:text-[#F4F9F6]">
                      {renderedBody}
                    </pre>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="subject-edit">Subject Line</Label>
                    <Input
                      id="subject-edit"
                      value={subject}
                      onChange={(e) => onSubjectChange(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="template-edit">Email Template</Label>
                    <Textarea
                      id="template-edit"
                      value={template}
                      onChange={(e) => onTemplateChange(e.target.value)}
                      className="min-h-[200px] font-mono text-xs"
                    />
                  </div>
                  <div>
                    <p className="mb-2 text-xs font-medium text-[#526B63] dark:text-[#8FAEA6]">
                      Available variable tags:
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {['{GN Name}', '{Amount}', '{Payout}', '{Acc No}'].map(
                        (tag) => (
                          <Badge
                            key={tag}
                            variant="secondary"
                            className="cursor-pointer font-mono text-xs transition-colors hover:bg-[#00A887] hover:text-white"
                            onClick={() =>
                              onTemplateChange(template + tag)
                            }
                          >
                            {tag}
                          </Badge>
                        ),
                      )}
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full gap-1.5"
                    onClick={() => {
                      onTemplateChange(DEFAULT_TEMPLATE);
                    }}
                  >
                    <RotateCcw className="h-3.5 w-3.5" />
                    Reset to default template
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Navigation */}
      <div className="mt-6 flex items-center justify-between">
        <Button variant="outline" onClick={onBack} className="gap-1.5">
          <ArrowLeft className="h-4 w-4" />
          Back to Upload
        </Button>
        <Button onClick={onNext} className="gap-1.5">
          Proceed to Dispatch
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
