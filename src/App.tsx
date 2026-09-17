import { useState, useCallback, useEffect } from 'react';
import { Login } from '@/components/Login';
import { Header } from '@/components/Header';
import { Stepper } from '@/components/Stepper';
import { Step1Upload } from '@/components/Step1Upload';
import { Step2Preview } from '@/components/Step2Preview';
import { Step3Dispatch } from '@/components/Step3Dispatch';
import { Step4Results } from '@/components/Step4Results';
import { getAuth, setAuth, getSettings, loadCloudSettings } from '@/lib/storage';
import { DEFAULT_TEMPLATE } from '@/lib/excel';
import type { BrevoSettings, DispatchResult, PayoutRow, StepId } from '@/lib/types';

function App() {
  const [authed, setAuthed] = useState(getAuth());
  const [step, setStep] = useState<StepId>(1);
  const [maxReached, setMaxReached] = useState<StepId>(1);
  const [rows, setRows] = useState<PayoutRow[]>([]);
  const [fileName, setFileName] = useState('');
  const [template, setTemplate] = useState(getSettings().emailTemplate || DEFAULT_TEMPLATE);
  const [subject, setSubject] = useState(getSettings().subject);
  const [settings, setSettings] = useState<BrevoSettings>(getSettings());
  const [results, setResults] = useState<DispatchResult[]>([]);
  const [settingsTrigger, setSettingsTrigger] = useState(0);

  useEffect(() => {
    let active = true;

    loadCloudSettings().then((cloudSettings) => {
      if (!active) return;
      setSettings(cloudSettings);
      setTemplate(cloudSettings.emailTemplate || DEFAULT_TEMPLATE);
      setSubject(cloudSettings.subject);
    });

    return () => {
      active = false;
    };
  }, []);

  const handleLogin = useCallback(() => {
    setAuth(true);
    setAuthed(true);
  }, []);

  const handleLogout = useCallback(() => {
    setAuth(false);
    setAuthed(false);
    setStep(1);
    setMaxReached(1);
    setRows([]);
    setFileName('');
    setResults([]);
  }, []);

  const handleParsed = useCallback((parsedRows: PayoutRow[], name: string) => {
    setRows(parsedRows);
    setFileName(name);
  }, []);

  const goToStep = useCallback((s: StepId) => {
    setStep(s);
    setMaxReached((prev) => Math.max(prev, s) as StepId);
  }, []);

  const handleStep2Next = useCallback(() => {
    setSettings(getSettings());
    goToStep(3);
  }, [goToStep]);

  const handleDispatchComplete = useCallback((res: DispatchResult[]) => {
    setResults(res);
    goToStep(4);
  }, [goToStep]);

  const handleReset = useCallback(() => {
    setStep(1);
    setMaxReached(1);
    setRows([]);
    setFileName('');
    setResults([]);
    setTemplate(getSettings().emailTemplate || DEFAULT_TEMPLATE);
    setSettings(getSettings());
    setSubject(getSettings().subject);
  }, []);

  const handleSettingsSaved = useCallback((s: BrevoSettings) => {
    setSettings(s);
    if (!subject || subject === getSettings().subject) {
      setSubject(s.subject);
    }
    setTemplate(s.emailTemplate || DEFAULT_TEMPLATE);
  }, [subject]);

  const openSettings = useCallback(() => {
    setSettingsTrigger((n) => n + 1);
  }, []);

  if (!authed) {
    return <Login onSuccess={handleLogin} />;
  }

  return (
    <div className="relative min-h-screen bg-background">
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="animate-orb-1 absolute -top-20 -right-20 h-[500px] w-[500px] rounded-full bg-[#00A887]/12 blur-[120px] dark:bg-[#00A887]/15" />
        <div className="animate-orb-2 absolute -bottom-32 -left-32 h-[500px] w-[500px] rounded-full bg-[#FAF7EE]/80 blur-[120px] dark:bg-[#081C18]/80" />
      </div>

      <Header
        onLogout={handleLogout}
        onSettingsSaved={handleSettingsSaved}
        externalOpenSignal={settingsTrigger}
      />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        {/* Step indicator and file name */}
        <div className="mb-8 space-y-4">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-[#0D322B] dark:text-[#F4F9F6]">
                {step === 1 && 'Upload Recipient Data'}
                {step === 2 && 'Preview & Customize'}
                {step === 3 && 'Confirm & Dispatch'}
                {step === 4 && 'Dispatch Results'}
              </h1>
              {fileName && step > 1 && step < 4 && (
                <p className="mt-0.5 text-sm text-[#526B63] dark:text-[#8FAEA6]">
                  File: {fileName} • {rows.length} rows
                </p>
              )}
            </div>
          </div>
          <Stepper current={step} onStepClick={goToStep} maxReached={maxReached} />
        </div>

        {/* Step content */}
        <div key={settingsTrigger}>
          {step === 1 && <Step1Upload onParsed={handleParsed} onNext={() => goToStep(2)} />}

          {step === 2 && (
            <Step2Preview
              rows={rows}
              template={template}
              subject={subject}
              onTemplateChange={setTemplate}
              onSubjectChange={setSubject}
              onNext={handleStep2Next}
              onBack={() => setStep(1)}
            />
          )}

          {step === 3 && (
            <Step3Dispatch
              rows={rows}
              template={template}
              subject={subject}
              settings={settings}
              onComplete={handleDispatchComplete}
              onBack={() => setStep(2)}
              onOpenSettings={openSettings}
            />
          )}

          {step === 4 && (
            <Step4Results results={results} onReset={handleReset} />
          )}
        </div>
      </main>
    </div>
  );
}

export default App;
