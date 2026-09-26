import React, { useState, useId } from "react";
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
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
  Check,
} from "lucide-react";

export const SignupPage: React.FC = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const fullNameId = useId();
  const emailId = useId();
  const passwordId = useId();
  const confirmPasswordId = useId();
  const termsId = useId();

  // Form fields - clean initial values, no default errors
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [agreeTerms, setAgreeTerms] = useState(false);

  // Visibility toggles
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Status & Validation states - strictly empty on initial load
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [generalError, setGeneralError] = useState<string | null>(null);

  // Password Strength Calculation
  const hasMinLength = password.length >= 8;
  const hasUppercase = /[A-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[^A-Za-z0-9]/.test(password);

  const strengthScore = [hasMinLength, hasUppercase, hasNumber, hasSpecial].filter(
    Boolean
  ).length;

  const getStrengthLabel = () => {
    if (!password) return { text: "None", width: "0%" };
    if (strengthScore <= 1) return { text: "Weak", width: "25%", color: "bg-destructive" };
    if (strengthScore === 2) return { text: "Fair", width: "50%", color: "bg-amber-500" };
    if (strengthScore === 3) return { text: "Good", width: "75%", color: "bg-emerald-500" };
    return { text: "Strong", width: "100%", color: "bg-emerald-600" };
  };

  const strength = getStrengthLabel();

  // Form Validation
  const validateForm = () => {
    const errs: Record<string, string> = {};

    if (!fullName.trim()) {
      errs.fullName = "Full name is required.";
    }

    if (!email.trim()) {
      errs.email = "Email is required.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errs.email = "Please enter a valid work email.";
    }

    if (!password) {
      errs.password = "Password is required.";
    } else if (password.length < 8) {
      errs.password = "Password must be at least 8 characters.";
    }

    if (!confirmPassword) {
      errs.confirmPassword = "Please confirm your password.";
    } else if (password !== confirmPassword) {
      errs.confirmPassword = "Passwords do not match.";
    }

    if (!agreeTerms) {
      errs.agreeTerms = "You must agree to the terms and privacy guidelines.";
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGeneralError(null);

    if (!validateForm()) return;

    setIsLoading(true);

    try {
      await register({ full_name: fullName.trim(), email: email.trim().toLowerCase(), password });
      navigate('/app');
    } catch (err) {
      if (err instanceof ApiRequestError) {
        if (err.status === 409) {
          setErrors({ email: err.detail });
        } else {
          setGeneralError(err.detail);
        }
      } else {
        setGeneralError('An unexpected error occurred. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Create your account"
      subtitle="Establish your organization's environmental baseline and reduction workflows."
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

      <form onSubmit={handleSubmit} className="space-y-3.5" noValidate>
        {/* Full Name */}
        <div className="space-y-1">
          <Label htmlFor={fullNameId} className="text-xs font-medium text-foreground">
            Full name
          </Label>
          <Input
            id={fullNameId}
            type="text"
            placeholder="Marcus Lindqvist"
            value={fullName}
            onChange={(e) => {
              setFullName(e.target.value);
              if (errors.fullName) setErrors((prev) => ({ ...prev, fullName: "" }));
              if (generalError) setGeneralError(null);
            }}
            error={Boolean(errors.fullName)}
            disabled={isLoading}
          />
          {errors.fullName && (
            <p className="text-xs text-destructive font-medium transition-opacity duration-150">
              {errors.fullName}
            </p>
          )}
        </div>

        {/* Work Email */}
        <div className="space-y-1">
          <Label htmlFor={emailId} className="text-xs font-medium text-foreground">
            Work email
          </Label>
          <Input
            id={emailId}
            type="email"
            placeholder="name@organization.com"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (errors.email) setErrors((prev) => ({ ...prev, email: "" }));
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

        {/* Password */}
        <div className="space-y-1">
          <Label htmlFor={passwordId} className="text-xs font-medium text-foreground">
            Password
          </Label>
          <div className="relative">
            <Input
              id={passwordId}
              type={showPassword ? "text" : "password"}
              placeholder="Minimum 8 characters"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (errors.password) setErrors((prev) => ({ ...prev, password: "" }));
                if (generalError) setGeneralError(null);
              }}
              error={Boolean(errors.password)}
              disabled={isLoading}
              className="pr-10"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-0.5 rounded focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
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

          {/* Password Strength Indicator - appears naturally only while typing */}
          {password.length > 0 && (
            <div className="space-y-1.5 pt-1.5 transition-all duration-200">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-muted-foreground flex items-center gap-1">
                  <ShieldCheck className="h-3 w-3 text-muted-foreground" />
                  Strength
                </span>
                <span className="font-medium text-foreground">{strength.text}</span>
              </div>
              <div className="h-1 w-full bg-secondary rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-300 ${strength.color}`}
                  style={{ width: strength.width }}
                />
              </div>

              {/* Requirement Checkpoints */}
              <div className="grid grid-cols-2 gap-1 pt-0.5 text-[10px] text-muted-foreground">
                <span className={`flex items-center gap-1 ${hasMinLength ? "text-emerald-700 font-medium" : ""}`}>
                  <Check className={`h-2.5 w-2.5 ${hasMinLength ? "opacity-100" : "opacity-30"}`} />
                  8+ characters
                </span>
                <span className={`flex items-center gap-1 ${hasUppercase ? "text-emerald-700 font-medium" : ""}`}>
                  <Check className={`h-2.5 w-2.5 ${hasUppercase ? "opacity-100" : "opacity-30"}`} />
                  Uppercase letter
                </span>
                <span className={`flex items-center gap-1 ${hasNumber ? "text-emerald-700 font-medium" : ""}`}>
                  <Check className={`h-2.5 w-2.5 ${hasNumber ? "opacity-100" : "opacity-30"}`} />
                  Number
                </span>
                <span className={`flex items-center gap-1 ${hasSpecial ? "text-emerald-700 font-medium" : ""}`}>
                  <Check className={`h-2.5 w-2.5 ${hasSpecial ? "opacity-100" : "opacity-30"}`} />
                  Special symbol
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Confirm Password */}
        <div className="space-y-1">
          <Label htmlFor={confirmPasswordId} className="text-xs font-medium text-foreground">
            Confirm password
          </Label>
          <div className="relative">
            <Input
              id={confirmPasswordId}
              type={showConfirmPassword ? "text" : "password"}
              placeholder="Repeat password"
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value);
                if (errors.confirmPassword) setErrors((prev) => ({ ...prev, confirmPassword: "" }));
                if (generalError) setGeneralError(null);
              }}
              error={Boolean(errors.confirmPassword)}
              disabled={isLoading}
              className="pr-10"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-0.5 rounded focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              aria-label={showConfirmPassword ? "Hide password" : "Show password"}
            >
              {showConfirmPassword ? (
                <EyeOff className="h-4 w-4 transition-transform duration-150" />
              ) : (
                <Eye className="h-4 w-4 transition-transform duration-150" />
              )}
            </button>
          </div>
          {errors.confirmPassword && (
            <p className="text-xs text-destructive font-medium transition-opacity duration-150">
              {errors.confirmPassword}
            </p>
          )}
        </div>

        {/* Terms Checkbox */}
        <div className="space-y-1 pt-1">
          <div className="flex items-start space-x-2">
            <Checkbox
              id={termsId}
              checked={agreeTerms}
              onCheckedChange={(checked) => {
                setAgreeTerms(checked === true);
                if (errors.agreeTerms) setErrors((prev) => ({ ...prev, agreeTerms: "" }));
              }}
              disabled={isLoading}
              className="mt-0.5"
            />
            <Label
              htmlFor={termsId}
              className="text-xs text-muted-foreground leading-snug cursor-pointer select-none font-normal"
            >
              I agree to the platform terms and privacy guidelines.
            </Label>
          </div>
          {errors.agreeTerms && (
            <p className="text-xs text-destructive font-medium transition-opacity duration-150">
              {errors.agreeTerms}
            </p>
          )}
        </div>

        {/* Primary Create Account Button */}
        <Button
          type="submit"
          disabled={isLoading}
          className="w-full gap-2 mt-2 h-10 font-medium"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 motion-safe:animate-spin" />
              <span>Creating account...</span>
            </>
          ) : (
            <>
              <span>Create account</span>
              <ArrowRight className="h-4 w-4 opacity-80" />
            </>
          )}
        </Button>
      </form>

      {/* Small Sign-in Link */}
      <div className="mt-6 text-center text-xs text-muted-foreground">
        <span>Already have an account? </span>
        <Link
          to="/login"
          className="font-medium text-foreground underline underline-offset-4 hover:text-primary transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring rounded-xs"
        >
          Sign in
        </Link>
      </div>
    </AuthLayout>
  );
};
