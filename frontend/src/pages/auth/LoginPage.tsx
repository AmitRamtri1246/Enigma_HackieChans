import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthLayout } from "@/components/AuthLayout";
import { useAuth } from "@/contexts/AuthContext";
import { ApiRequestError } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  AlertCircle,
  Loader2,
  CheckCircle2,
  Eye,
  EyeOff,
  ArrowRight,
} from "lucide-react";

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  // Form states - clean initial values, no default errors
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Status & Validation states - strictly empty on initial load
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [isLoading, setIsLoading] = useState(false);
  const [generalError, setGeneralError] = useState<string | null>(null);

  // Simple forgot password modal
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotSubmitted, setForgotSubmitted] = useState(false);

  // Form validation handler
  const validate = () => {
    const newErrors: { email?: string; password?: string } = {};

    if (!email.trim()) {
      newErrors.email = "Email is required.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = "Please enter a valid email address.";
    }

    if (!password) {
      newErrors.password = "Password is required.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGeneralError(null);

    if (!validate()) return;

    setIsLoading(true);

    try {
      await login({ email: email.trim().toLowerCase(), password });
      navigate('/app');
    } catch (err) {
      if (err instanceof ApiRequestError) {
        setGeneralError(err.detail);
      } else {
        setGeneralError('An unexpected error occurred. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (forgotEmail.trim()) {
      setForgotSubmitted(true);
      setTimeout(() => {
        setForgotSubmitted(false);
        setShowForgotModal(false);
        setForgotEmail("");
      }, 2000);
    }
  };

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Sign in to access your organization's environmental telemetry."
    >
      {/* General error alert - only visible when an actual error occurs */}
      {generalError && (
        <div
          role="alert"
          className="mb-5 flex items-start gap-2.5 rounded-md border border-destructive/25 bg-destructive/10 p-3 text-xs text-destructive transition-all duration-200 motion-safe:animate-fadeIn"
        >
          <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
          <p className="leading-relaxed">{generalError}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        {/* Email Field */}
        <div className="space-y-1.5">
          <Label htmlFor="login-email" className="text-xs font-medium text-foreground">
            Work email
          </Label>
          <Input
            id="login-email"
            type="email"
            autoComplete="email"
            placeholder="name@organization.com"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (errors.email) setErrors((prev) => ({ ...prev, email: undefined }));
              if (generalError) setGeneralError(null);
            }}
            error={Boolean(errors.email)}
            disabled={isLoading}
          />
          {errors.email && (
            <p className="text-xs text-destructive font-medium transition-opacity duration-150">
              {errors.email}
            </p>
          )}
        </div>

        {/* Password Field */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <Label htmlFor="login-password" className="text-xs font-medium text-foreground">
              Password
            </Label>
            <button
              type="button"
              onClick={() => {
                setForgotEmail(email);
                setShowForgotModal(true);
              }}
              className="text-xs text-muted-foreground hover:text-foreground transition-colors hover:underline underline-offset-2 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring rounded-xs"
            >
              Forgot password?
            </button>
          </div>
          <div className="relative">
            <Input
              id="login-password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              placeholder="••••••••••••"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (errors.password) setErrors((prev) => ({ ...prev, password: undefined }));
                if (generalError) setGeneralError(null);
              }}
              error={Boolean(errors.password)}
              disabled={isLoading}
              className="pr-10"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors p-0.5 rounded focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4 transition-transform duration-150" />
              ) : (
                <Eye className="h-4 w-4 transition-transform duration-150" />
              )}
            </button>
          </div>
          {errors.password && (
            <p className="text-xs text-destructive font-medium transition-opacity duration-150">
              {errors.password}
            </p>
          )}
        </div>

        {/* Remember device checkbox */}
        <div className="flex items-center space-x-2 pt-0.5">
          <Checkbox
            id="remember-device"
            checked={rememberMe}
            onCheckedChange={(checked) => setRememberMe(checked === true)}
            disabled={isLoading}
          />
          <Label
            htmlFor="remember-device"
            className="text-xs font-normal text-muted-foreground cursor-pointer select-none"
          >
            Remember this device
          </Label>
        </div>

        {/* Primary Sign-in Button */}
        <Button
          type="submit"
          disabled={isLoading}
          className="w-full gap-2 mt-2 h-10 font-medium"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 motion-safe:animate-spin" />
              <span>Signing in...</span>
            </>
          ) : (
            <>
              <span>Sign in</span>
              <ArrowRight className="h-4 w-4 opacity-80" />
            </>
          )}
        </Button>
      </form>

      {/* Small Signup Link */}
      <div className="mt-6 text-center text-xs text-muted-foreground">
        <span>Don't have an account? </span>
        <Link
          to="/signup"
          className="font-medium text-foreground underline underline-offset-4 hover:text-primary transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring rounded-xs"
        >
          Create account
        </Link>
      </div>

      {/* Forgot Password Dialog */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-sm rounded-lg border border-border bg-card p-6 shadow-xl space-y-4 transition-all">
            <div className="space-y-1">
              <h3 className="text-base font-semibold text-foreground">
                Reset password
              </h3>
              <p className="text-xs text-muted-foreground leading-normal">
                Enter your work email to receive password reset instructions.
              </p>
            </div>

            {forgotSubmitted ? (
              <div className="flex items-center gap-2 rounded-md bg-emerald-50 border border-emerald-200 p-3 text-xs text-emerald-800">
                <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
                <span>Reset link dispatched. Please check your inbox.</span>
              </div>
            ) : (
              <form onSubmit={handleForgotSubmit} className="space-y-3">
                <div className="space-y-1">
                  <Label htmlFor="forgot-email" className="text-xs">
                    Work email
                  </Label>
                  <Input
                    id="forgot-email"
                    type="email"
                    placeholder="name@organization.com"
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setShowForgotModal(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" size="sm">
                    Send instructions
                  </Button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </AuthLayout>
  );
};
