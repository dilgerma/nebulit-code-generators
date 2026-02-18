import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { LogOut } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

const Auth = () => {
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [magicLinkEmail, setMagicLinkEmail] = useState('');
  const [resetEmail, setResetEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [magicLinkSent, setMagicLinkSent] = useState(false);
  const [resetEmailSent, setResetEmailSent] = useState(false);
  const [showResetForm, setShowResetForm] = useState(false);
  const [isPasswordUpdateMode, setIsPasswordUpdateMode] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, session, tenantId, setTenantId } = useAuth();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const checkPasswordReset = async () => {
      const isReset = searchParams.get('reset') === 'true';
      if (isReset) {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          setIsPasswordUpdateMode(true);
        }
      }
    };
    checkPasswordReset();
  }, [searchParams]);


  const handleLogout = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'Signed out',
        description: 'You have been signed out successfully.',
      });
    }
    setLoading(false);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email: loginEmail,
      password: loginPassword,
    });

    if (error) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } else {
      navigate('/');
    }
    setLoading(false);
  };

  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase.auth.signInWithOtp({
      email: magicLinkEmail,
      options: {
        emailRedirectTo: `${window.location.origin}/`,
      },
    });

    if (error) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } else {
      setMagicLinkSent(true);
      toast({
        title: 'Login link sent',
        description: 'Please check your email and click the link to sign in.',
      });
    }
    setLoading(false);
  };

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase.auth.resetPasswordForEmail(resetEmail, {
      redirectTo: `${window.location.origin}/auth?reset=true`,
    });

    if (error) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } else {
      setResetEmailSent(true);
      toast({
        title: 'Email sent',
        description: 'Please check your email for the password reset link.',
      });
    }
    setLoading(false);
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      toast({
        title: 'Error',
        description: 'Passwords do not match.',
        variant: 'destructive',
      });
      return;
    }

    if (newPassword.length < 6) {
      toast({
        title: 'Error',
        description: 'Password must be at least 6 characters long.',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);

    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (error) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'Password updated',
        description: 'Your password has been changed successfully. You will be redirected to the home page.',
      });
      setIsPasswordUpdateMode(false);
      navigate('/');
    }
    setLoading(false);
  };


  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-[var(--shadow-medium)]">
        <CardHeader className="space-y-4">
          <div className="flex justify-center">
            <img
              src="/logo.png"
              alt="App Logo"
              className=" w-auto object-contain"
            />
          </div>
          <div className="text-center">
            <CardTitle>{isPasswordUpdateMode ? 'Set New Password' : ''}</CardTitle>
          </div>
          {user && !isPasswordUpdateMode && (
            <div className="flex flex-col items-center gap-3 pt-2 border-t">
              <p className="text-sm text-muted-foreground">
                Signed in as: <strong>{user.email}</strong>
              </p>
              <div className="flex gap-2">
                <Button
                  variant="default"
                  size="sm"
                  onClick={() => navigate('/')}
                  className="gap-2"
                >
                  Start
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleLogout}
                  disabled={loading}
                  className="gap-2"
                >
                  <LogOut className="h-4 w-4" />
                  {loading ? 'Logging out...' : 'Logout'}
                </Button>
              </div>
            </div>
          )}
        </CardHeader>
        <CardContent>
          {isPasswordUpdateMode ? (
            <form onSubmit={handleUpdatePassword} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="new-password">New Password</Label>
                <Input
                  id="new-password"
                  type="password"
                  placeholder="At least 6 characters"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm-password">Confirm password</Label>
                <Input
                  id="confirm-password"
                  type="password"
                  placeholder="Confirm password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Saving...' : 'Save Password'}
              </Button>
            </form>
          ) : (
            <Tabs defaultValue="login" className="w-full" onValueChange={(value) => {
              if (value === 'signup') {
                navigate('/register');
              }
              setMagicLinkSent(false);
            }}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="login">Login</TabsTrigger>
                <TabsTrigger value="magic">Login Link</TabsTrigger>
                <TabsTrigger value="signup">Register</TabsTrigger>
              </TabsList>

              <TabsContent value="login">
              {showResetForm ? (
                resetEmailSent ? (
                  <div className="space-y-4 text-center py-4">
                    <div className="text-sm text-muted-foreground">
                      A password reset link has been sent to <strong>{resetEmail}</strong>.
                      Please check your email.
                    </div>
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => {
                        setShowResetForm(false);
                        setResetEmailSent(false);
                        setResetEmail('');
                      }}
                    >
                      Back to login
                    </Button>
                  </div>
                ) : (
                  <form onSubmit={handlePasswordReset} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="reset-email">Email</Label>
                      <Input
                        id="reset-email"
                        type="email"
                        placeholder="your@email.com"
                        value={resetEmail}
                        onChange={(e) => setResetEmail(e.target.value)}
                        required
                      />
                    </div>
                    <div className="text-sm text-muted-foreground">
                      We will send you a link to reset your password.
                    </div>
                    <Button type="submit" className="w-full" disabled={loading}>
                      {loading ? 'Sending...' : 'Send link'}
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      className="w-full"
                      onClick={() => setShowResetForm(false)}
                    >
                      Back to login
                    </Button>
                  </form>
                )
              ) : (
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="login-email">Email</Label>
                    <Input
                      id="login-email"
                      type="email"
                      placeholder="your@email.com"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="login-password">Password</Label>
                    <Input
                      id="login-password"
                      type="password"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? 'Loading...' : 'Sign in'}
                  </Button>
                  <Button
                    type="button"
                    variant="link"
                    className="w-full text-sm"
                    onClick={() => setShowResetForm(true)}
                  >
                    Forgot password?
                  </Button>
                </form>
              )}
            </TabsContent>

            <TabsContent value="magic">
              {magicLinkSent ? (
                <div className="space-y-4 text-center py-4">
                  <div className="text-sm text-muted-foreground">
                    A login link has been sent to <strong>{magicLinkEmail}</strong>.
                    Please check your email and click the link to sign in.
                  </div>
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => {
                      setMagicLinkSent(false);
                      setMagicLinkEmail('');
                    }}
                  >
                    Send again
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleMagicLink} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="magic-email">Email</Label>
                    <Input
                      id="magic-email"
                      type="email"
                      placeholder="your@email.com"
                      value={magicLinkEmail}
                      onChange={(e) => setMagicLinkEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div className="text-sm text-muted-foreground">
                    We will send you a login link so you can sign in without a password.
                  </div>
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? 'Sending...' : 'Send login link'}
                  </Button>
                </form>
              )}
            </TabsContent>
          </Tabs>
          )}
        </CardContent>
      </Card>

      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Assigned Organizations</DialogTitle>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Auth;
