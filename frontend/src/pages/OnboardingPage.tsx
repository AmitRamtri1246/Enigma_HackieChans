import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Recycle,
  User,
  Building2,
  Truck,
  Landmark,
  UsersRound,
  type LucideIcon,
} from "lucide-react";
import { RoleOption } from "@/components/auth/RoleOption";
import { AuthButton } from "@/components/auth/AuthButton";
import { AuthInput } from "@/components/auth/AuthInput";
import { useAuth } from "@/contexts/AuthContext";
import { saveOnboarding, type TraceRole } from "@/lib/onboarding";

interface RoleDef {
  value: TraceRole;
  icon: LucideIcon;
  title: string;
  description: string;
}

const ROLES: RoleDef[] = [
  {
    value: "citizen",
    icon: User,
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
  {
    value: "community_admin",
    icon: UsersRound,
    title: "Community Admin",
    description: "Manage local listings and decide the next step for unsold items.",
  },
];

export const OnboardingPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [role, setRole] = useState<TraceRole | null>(null);
  const [details, setDetails] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<"idle" | "loading" | "success">("idle");

  const setDetail = (key: string, value: string) =>
    setDetails((prev) => ({ ...prev, [key]: value }));

  // Optional, minimal per-role detail fields (all optional for the prototype).
  const detailFields = useMemo(() => {
    switch (role) {
      case "citizen":
        return [{ key: "area", label: "Area / neighborhood", placeholder: "e.g. Riverside" }];
      case "organization":
        return [
          { key: "organizationName", label: "Organization name", placeholder: "e.g. GreenLoop Co-op" },
          { key: "materialFocus", label: "Material focus", placeholder: "e.g. Textiles, electronics" },
        ];
      case "collector":
        return [{ key: "serviceArea", label: "Service area", placeholder: "e.g. North district" }];
      case "municipality":
        return [{ key: "zone", label: "Area / zone", placeholder: "e.g. Zone 4" }];
      case "community_admin":
        return [{ key: "communityName", label: "Community", placeholder: "e.g. Green Acres Society" }];
      default:
        return [];
    }
  }, [role]);

  const handleContinue = () => {
    if (!role) return;
    setStatus("loading");
    saveOnboarding({ role, details });
    setStatus("success");
    setTimeout(() => navigate("/app"), 500);
  };

  const busy = status !== "idle";
  const firstName = user?.full_name?.trim().split(" ")[0];

  return (
    <div className="flex min-h-screen w-full flex-col bg-background text-foreground antialiased">
      <header className="flex items-center justify-center px-6 pt-8">
        <div className="flex items-center gap-2.5">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand-forest text-brand-white">
            <Recycle className="h-4 w-4" strokeWidth={2} />
          </span>
          <span className="text-sm font-semibold tracking-tight text-foreground">
            TraceIQ
          </span>
        </div>
      </header>

      <main className="flex flex-1 flex-col justify-center px-6 py-10">
        <div className="mx-auto w-full max-w-md">
          <div className="mb-6 space-y-1.5 text-center">
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">
              How will you use TraceIQ?
            </h1>
            <p className="text-sm leading-relaxed text-muted-foreground">
              {firstName ? `Welcome, ${firstName}. ` : ""}
              Choose how you participate in the circular economy.
            </p>
          </div>

          <div
            role="radiogroup"
            aria-label="Select your role"
            className="space-y-2.5"
          >
            {ROLES.map((r) => (
              <RoleOption
                key={r.value}
                icon={r.icon}
                title={r.title}
                description={r.description}
                selected={role === r.value}
                onSelect={() => {
                  setRole(r.value);
                  setDetails({});
                }}
                disabled={busy}
              />
            ))}
          </div>

          {detailFields.length > 0 && (
            <div className="mt-5 space-y-4 rounded-[10px] border border-border bg-card p-4 motion-safe:animate-fadeIn">
              <p className="text-xs text-muted-foreground">
                A couple of optional details to personalize your experience. You can skip these.
              </p>
              {detailFields.map((field) => (
                <AuthInput
                  key={field.key}
                  id={`detail-${field.key}`}
                  label={field.label}
                  type="text"
                  placeholder={field.placeholder}
                  value={details[field.key] ?? ""}
                  disabled={busy}
                  onChange={(e) => setDetail(field.key, e.target.value)}
                />
              ))}
            </div>
          )}

          <AuthButton
            type="button"
            onClick={handleContinue}
            disabled={!role}
            loading={status === "loading"}
            success={status === "success"}
            loadingText="Setting up..."
            successText="All set"
            showArrow
            className="mt-6"
          >
            Continue
          </AuthButton>
        </div>
      </main>

      <footer className="px-6 pb-8 text-center text-[11px] text-muted-foreground/80">
        You can change how you use TraceIQ later.
      </footer>
    </div>
  );
};
