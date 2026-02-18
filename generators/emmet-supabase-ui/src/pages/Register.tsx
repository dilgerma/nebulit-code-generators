import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Check, ChevronLeft } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { registerTenant } from "@/lib/api";
import { v4 } from "uuid";

const Register = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [tenantName, setTenantName] = useState('');
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const isLoggedIn = !!user;

  useEffect(() => {
    if (user?.email) {
      setEmail(user.email);
    }
  }, [user]);

  const steps = [
    { number: 1, label: 'Details' },
    { number: 2, label: 'Confirmation' },
  ];

  const handleNext = () => {
    if (!email || !tenantName) {
      toast({
        title: 'Error',
        description: 'Please fill in all fields',
        variant: 'destructive',
      });
      return;
    }

    if (!isLoggedIn) {
      if (!password) {
        toast({
          title: 'Error',
          description: 'Please enter a password',
          variant: 'destructive',
        });
        return;
      }
      if (password.length < 6) {
        toast({
          title: 'Error',
          description: 'Password must be at least 6 characters long',
          variant: 'destructive',
        });
        return;
      }
    }

    setCurrentStep(2);
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);

    try {
      let ownerId: string;

      if (isLoggedIn) {
        ownerId = user!.id;
      } else {
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email: email,
          password: password,
          options: {
            emailRedirectTo: `${window.location.origin}/`
          }
        });

        if (authError) {
            if (authError.code == "user_already_exists") {
                throw new Error('This email address is already registered. Please sign in.');
            } else {
                throw new Error(authError.message ?? "An error occurred. Please try again.");
            }
        }

        if (!authData.user) {
            throw new Error('User could not be created');
        }

        if (authData.user.identities && authData.user.identities.length === 0) {
            throw new Error('This email address is already registered. Please sign in.');
        }

        ownerId = authData.user.id;
      }

      // Get session token for API call
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData?.session?.access_token ?? "";
      const tenantId = v4();

      await registerTenant({
        tenantId,
        name: tenantName,
        ownerId: ownerId,
      }, { token, userId: ownerId, tenantId });

      toast({
        title: 'Success',
        description: isLoggedIn
          ? 'Organization registered successfully!'
          : 'Registration successful! Please check your email to confirm.',
      });
      navigate('/auth');
    } catch (error: any) {
      toast({
        title: 'Error',
        description: !error.message || (Object.keys(error.message)?.length ?? 0) == 0 ? 'Registration failed' : error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl shadow-[var(--shadow-medium)]">
        <CardContent className="p-8">
          <div className="flex justify-center mb-8">
            <img
              src="/logo.png"
              alt="App Logo"
              className="h-40 w-auto object-contain"
            />
          </div>

          {/* Step Indicator */}
          <div className="flex items-center justify-between mb-8 max-w-md mx-auto">
            {steps.map((step, index) => (
              <div key={step.number} className="flex items-center flex-1">
                <div className="flex flex-col items-center flex-1">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                      currentStep >= step.number
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    {currentStep > step.number ? (
                      <Check className="w-5 h-5" />
                    ) : (
                      step.number
                    )}
                  </div>
                  <span className="text-xs mt-2 text-center">{step.label}</span>
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={`h-0.5 flex-1 mx-2 transition-colors ${
                      currentStep > step.number ? 'bg-primary' : 'bg-muted'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>

          {/* Step 1: Details */}
          {currentStep === 1 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
              <div>
                <h2 className="text-2xl font-semibold mb-2">Enter your details</h2>
                <p className="text-muted-foreground">
                  Enter your email address and organization name.
                </p>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="tenantName">Organization name</Label>
                  <Input
                    id="tenantName"
                    type="text"
                    placeholder="My Organization"
                    value={tenantName}
                    onChange={(e) => setTenantName(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    readOnly={isLoggedIn}
                    className={isLoggedIn ? 'bg-muted' : ''}
                    required
                  />
                </div>
                {!isLoggedIn && (
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="At least 6 characters"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Step 2: Confirmation */}
          {currentStep === 2 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
              <div>
                <h2 className="text-2xl font-semibold mb-2">Confirmation</h2>
                <p className="text-muted-foreground">
                  Review your details and complete the registration.
                </p>
              </div>

              <div className="space-y-4 p-4 rounded-lg bg-muted/50">
                <div>
                  <span className="text-sm text-muted-foreground">Organization name</span>
                  <p className="font-medium">{tenantName}</p>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">Email</span>
                  <p className="font-medium">{email}</p>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8">
            <Button
              type="button"
              variant="outline"
              onClick={currentStep === 1 ? () => navigate('/auth') : handleBack}
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              Back
            </Button>

            {currentStep < 2 ? (
              <Button onClick={handleNext}>
                Next
              </Button>
            ) : (
              <Button onClick={handleSubmit} disabled={loading}>
                {loading ? 'Registering...' : 'Complete registration'}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Register;
