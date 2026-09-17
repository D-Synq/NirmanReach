import { useState } from 'react';
import { Lock, Mail, Loader2, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ThemeToggle } from '@/components/ThemeToggle';

const ADMIN_ID = 'admin@mail';
const ADMIN_PASS = 'admin@mail';

interface LoginProps {
  onSuccess: () => void;
}

export function Login({ onSuccess }: LoginProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    setTimeout(() => {
      if (email.trim() === ADMIN_ID && password === ADMIN_PASS) {
        onSuccess();
      } else {
        setError('Invalid credentials. Please check your login ID and password.');
        setLoading(false);
      }
    }, 500);
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background px-4">
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="animate-orb-1 absolute -top-20 -right-20 h-[500px] w-[500px] rounded-full bg-[#00A887]/12 blur-[120px] dark:bg-[#00A887]/15" />
        <div className="animate-orb-2 absolute -bottom-32 -left-32 h-[500px] w-[500px] rounded-full bg-[#FAF7EE]/80 blur-[120px] dark:bg-[#081C18]/80" />
      </div>
      <div className="fixed top-4 right-4 z-50">
        <ThemeToggle />
      </div>

      <Card className="glass-card relative z-10 w-full max-w-md animate-scale-in">
        <CardHeader className="space-y-3 text-center">
          <img src="/logo.png" alt="NirmanReach Logo" className="h-20 w-auto object-contain mx-auto -mb-8" />
          <CardTitle className="text-2xl font-bold tracking-tight text-[#0D322B] dark:text-[#F4F9F6]">
            NirmanReach
          </CardTitle>
          <CardDescription className="text-[#526B63] dark:text-[#8FAEA6]">
            Sign in to NirmanReach to dispatch payout statements to your recipients
          </CardDescription>
          <div className="text-xs font-semibold text-[#526B63] dark:text-[#8FAEA6]">
            Powered by <span className="font-extrabold text-[#00A887]">DSynq</span>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="login-id">Login ID</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="login-id"
                  type="text"
                  placeholder="admin@mail"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-9"
                  autoComplete="username"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-9"
                  autoComplete="current-password"
                />
              </div>
            </div>

            {error && (
              <div className="animate-in-fade rounded-lg border border-[#FEE4E2] bg-[#FEE4E2] px-3 py-2 text-sm text-[#B42318] dark:border-[#5C1A14] dark:bg-[#2A0F0C] dark:text-[#FF6B5A]">
                {error}
              </div>
            )}

            <Button
              type="submit"
              className="w-full"
              disabled={loading || !email || !password}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                'Sign In')
              }
            </Button>

            <div className="flex items-center justify-center gap-2 pt-2 text-xs text-muted-foreground">
              <ShieldCheck className="h-3.5 w-3.5" />
              <span>Secure admin access only</span>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
