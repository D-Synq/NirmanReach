import { useState, useRef, useCallback } from 'react';
import {
  Upload,
  FileSpreadsheet,
  X,
  Loader2,
  AlertCircle,
  CheckCircle2,
  ArrowRight,
  FileText,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { parseFile } from '@/lib/excel';
import type { PayoutRow } from '@/lib/types';

interface Step1UploadProps {
  onParsed: (rows: PayoutRow[], fileName: string) => void;
  onNext: () => void;
}

export function Step1Upload({ onParsed, onNext }: Step1UploadProps) {
  const [dragging, setDragging] = useState(false);
  const [parsing, setParsing] = useState(false);
  const [error, setError] = useState('');
  const [missingColumns, setMissingColumns] = useState<string[]>([]);
  const [fileName, setFileName] = useState('');
  const [rowCount, setRowCount] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(
    async (file: File) => {
      setError('');
      setMissingColumns([]);
      setParsing(true);
      setFileName(file.name);

      const result = await parseFile(file);

      if (!result.ok) {
        setError(result.error);
        if (result.missingColumns) {
          setMissingColumns(result.missingColumns);
        }
        setParsing(false);
        return;
      }

      setRowCount(result.rows.length);
      setParsing(false);
      onParsed(result.rows, file.name);
    },
    [onParsed],
  );

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  }

  return (
    <div className="mx-auto max-w-2xl animate-slide-up">
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={`
          relative flex cursor-pointer flex-col items-center justify-center
          rounded-xl border-2 border-dashed p-12 text-center transition-all
          ${
            dragging
              ? 'glass-dropzone glass-dropzone-glow border-[#00A887] scale-[1.01]'
              : 'glass-dropzone border-[#00A887]/40 hover:border-[#00A887] hover:glass-dropzone-glow'
          }
        `}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".xlsx,.xls,.csv"
          onChange={handleInputChange}
          className="hidden"
        />

        <img
          src="/logo.png"
          alt=""
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 m-auto h-80 w-auto max-h-[80%] object-contain opacity-[0.06]"
        />

        {parsing ? (
          <>
            <Loader2 className="mb-4 h-12 w-12 animate-spin text-[#00A887]" />
            <p className="text-lg font-semibold text-[#0D322B]">Parsing {fileName}...</p>
            <p className="mt-1 text-sm text-[#526B63]">
              Reading and validating columns
            </p>
          </>
        ) : (
          <>
            <div
              className={`mb-4 flex h-16 w-16 items-center justify-center rounded-2xl transition-all ${
                dragging
                  ? 'bg-[#00A887] text-white'
                  : 'bg-[#E6F7F3] text-[#00A887]'
              }`}
            >
              <Upload className="h-8 w-8" />
            </div>
            <p className="text-lg font-semibold text-[#0D322B]">
              Drop your Excel or CSV file here
            </p>
            <p className="mt-1 text-sm text-[#526B63]">
              or click to browse — supports .xlsx, .xls, and .csv
            </p>
            <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
              <Badge variant="outline" className="gap-1.5">
                <FileSpreadsheet className="h-3 w-3" />
                .xlsx / .xls
              </Badge>
              <Badge variant="outline" className="gap-1.5">
                <FileText className="h-3 w-3" />
                .csv
              </Badge>
            </div>
          </>
        )}
      </div>

      {error && (
        <Card className="mt-4 animate-in-fade border-[#FEE4E2] bg-[#FEE4E2]">
          <CardContent className="flex items-start gap-3 p-4">
            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-[#B42318]" />
            <div className="flex-1">
              <p className="font-semibold text-[#B42318]">{error}</p>
              {missingColumns.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {missingColumns.map((col) => (
                    <Badge
                      key={col}
                      variant="destructive"
                      className="gap-1"
                    >
                      <X className="h-3 w-3" />
                      {col}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {rowCount > 0 && !error && (
        <Card className="mt-4 animate-in-fade border-[#E6F7F3] bg-[#E6F7F3]">
          <CardContent className="flex items-center justify-between p-4">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="h-5 w-5 text-[#0A6A4E]" />
              <div>
                <p className="font-semibold text-[#0D322B]">
                  Successfully parsed {rowCount} rows
                </p>
                <p className="text-sm text-[#526B63]">
                  All required columns found — ready to preview
                </p>
              </div>
            </div>
            <Button onClick={onNext} className="gap-1.5">
              Continue to Preview
              <ArrowRight className="h-4 w-4" />
            </Button>
          </CardContent>
        </Card>
      )}

      <div className="mt-6">
        <p className="mb-3 text-sm font-medium text-[#526B63]">
          Expected Excel structure:
        </p>
        <div className="flex flex-wrap gap-2">
          {['Sr No', 'GN Name', 'Amount', 'Payout', 'Acc No', 'Number', 'Mail'].map(
            (col, i) => {
              const required = col !== 'Sr No' && col !== 'Number';
              return (
                <Badge
                  key={col}
                  variant={required ? 'default' : 'secondary'}
                  className="text-xs"
                >
                  {col}
                  {required && <span className="ml-1 text-primary-foreground/70">*</span>}
                </Badge>
              );
            },
          )}
        </div>
        <p className="mt-2 text-xs text-[#526B63]">
          <span className="text-[#00A887]">*</span> = required column
        </p>
      </div>
    </div>
  );
}
