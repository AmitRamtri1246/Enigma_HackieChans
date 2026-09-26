import React, { useId, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthLayout } from "@/components/AuthLayout";
import { AuthInput } from "@/components/auth/AuthInput";
import { AuthButton } from "@/components/auth/AuthButton";
import { useAuth } from "@/contexts/AuthContext";
import { ApiRequestError } from "@/lib/api";
import { Label } from "@/components/ui/label";
import { RoleOption } from "@/components/auth/RoleOption";
import type { TraceRole } from "@/lib/onboarding";
import {
  AlertCircle,
  User as UserIcon,
  Building2,
  Truck,
  Landmark,
  type LucideIcon,
} from "lucide-react";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const ROLE_CHOICES: { value: TraceRole; icon: LucideIcon; title: string; description: string }[] = [
  {
    value: "citizen",
    icon: UserIcon,
    title: "Citizen",
    description: "List, exchange and track materials you no longer need.",
  },
  {
    value: "organization",
    icon: Building2,
    title: "Organization",
    description: "Find materials your organization can reuse, repair or recycle.",
  },
  {
    value: "collector",
    icon: Truck,
    title: "Collector",
    description: "Manage assigned pickups and deliveries.",
  },
  {
    value: "municipality",
    icon: Landmark,
    title: "Municipality",
    description: "Monitor circular activity and coordinate collection.",
  },
];

export const SignupPage: React.FC = () => {
  const navigate = useNavigate();
  const { register } = useAuth();

  const nameId = useId();
  const emailId = useId();
  const passwordId = useId();
  const confirmId = useId();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState<TraceRole>("citizen");

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<"idle" | "loading" | "success">("idle");
  const [generalError, setGeneralError] = useState<string | null>(null);

  const clearFieldError = (key: string) => {
    if (errors[key]) setErrors((p) => ({ ...p, [key]: "" }));
    if (generalError) setGeneralError(null);
  };

  const validate = () => {
    const next: Record<string, string> = {};
    if (!fullName.trim()) next.fullName = "Full name is required.";

    if (!email.trim()) {
      next.email = "Email is required.";
    } else if (!EMAIL_RE.test(email.trim())) {
      next.email = "Please enter a valid email.";
    }

    if (!password) {
      next.password = "Password is required.";
    } else if (password.length < 8) {
      next.password = "Use at least 8 characters.";
    }

    if (!confirmPassword) {
      next.confirmPassword = "Please confirm your password.";
    } else if (password !== confirmPassword) {
      next.confirmPassword = "Passwords don't match.";
    }

    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGeneralError(null);
    if (!validate()) return;

    setStatus("loading");
    try {
      await register({
        full_name: fullName.trim(),
        email: email.trim().toLowerCase(),
        password,
        role,
      });
      setStatus("success");
      // Role is chosen here and persisted server-side; open the workspace.
      setTimeout(() => navigate("/app"), 500);
    } catch (err) {
      setStatus("idle");
      if (err instanceof ApiRequestError) {
        if (err.status === 409) {
          setErrors((p) => ({ ...p, email: "An account with this email already exists." }));
        } else {
          setGeneralError(err.detail);
        }
      } else {
        setGeneralError("We couldn't reach the server. Check your connection and try again.");
      }
    }
  };

  const busy = status !== "idle";

  return (
    <AuthLayout
      title="Create your account"
      subtitle="Join the local circular economy."
    >
      {generalError && (
        <div
          role="alert"
          className="mb-5 flex items-start gap-2.5 rounded-[10px] border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive motion-safe:animate-fadeIn"
        >
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <p className="leading-relaxed">{generalError}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <AuthInput
          id={nameId}
          label="Full name"
          type="text"
          autoComplete="name"
          placeholder="Your name"
          value={fullName}
          error={errors.fullName}
          disabled={busy}
          onChange={(e) => {
            setFullName(e.target.value);
            clearFieldError("fullName");
          }}
        />

        <AuthInput
          id={emailId}
          label="Email"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          value={email}
          error={errors.email}
          disabled={busy}
          onChange={(e) => {
            setEmail(e.target.value);
            clearFieldError("email");
          }}
        />

        <AuthInput
          id={passwordId}
          label="Password"
          password
          autoComplete="new-password"
          placeholder="At least 8 characters"
          value={password}
          error={errors.password}
          disabled={busy}
          onChange={(e) => {
            setPassword(e.target.value);
            clearFieldError("password");
          }}
        />

        <AuthInput
          id={confirmId}
          label="Confirm password"
          password
          autoComplete="new-password"
          placeholder="Re-enter your password"
          value={confirmPassword}
          error={errors.confirmPassword}
          disabled={busy}
          onChange={(e) => {
            setConfirmPassword(e.target.value);
            clearFieldError("confirmPassword");
          }}
        />

        {/* Role selection — how you'll use TraceIQ (saved to your account) */}
        <div className="space-y-1.5">
          <Label className="text-xs font-medium text-foreground">
            How will you use TraceIQ?
          </Label>
          <div
            role="radiogroup"
            aria-label="Select your role"
            className="space-y-2"
          >
            {ROLE_CHOICES.map((choice) => (
              <RoleOption
                key={choice.value}
                icon={choice.icon}
                title={choice.title}
                description={choice.description}
                selected={role === choice.value}
                onSelect={() => setRole(choice.value)}
                disabled={busy}
              />
            ))}
          </div>
        </div>

        <AuthButton
          type="submit"
          loading={status === "loading"}
          success={status === "success"}
          loadingText="Creating account..."
          successText="Account created"
          className="mt-2"
        >
          Create account
        </AuthButton>
      </form>

      <p className="mt-6 text-center text-xs text-muted-foreground">
        Already have an account?{" "}
        <Link
          to="/login"
          className="rounded-xs font-medium text-brand-forest underline underline-offset-4 transition-colors hover:text-brand-sage focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        >
          Sign in
        </Link>
      </p>
    </AuthLayout>
  );
};
