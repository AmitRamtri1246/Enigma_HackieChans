/**
 * Client-side onboarding/role storage for the TraceIQ prototype.
 *
 * NOTE: This is a frontend-only demo convenience. Role selection here is NOT a
 * security or authorization mechanism — the backend does not persist roles yet.
 * Do not use these values to gate anything sensitive.
 */

export type TraceRole = "citizen" | "organization" | "collector" | "municipality";

export interface OnboardingProfile {
  role: TraceRole;
  /** Free-form optional details, keyed by field name (area, organizationName, etc.). */
  details: Record<string, string>;
}

const STORAGE_KEY = "traceiq.onboarding";

export function saveOnboarding(profile: OnboardingProfile): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
  } catch {
    // Storage may be unavailable (private mode); onboarding is non-critical.
  }
}

export function loadOnboarding(): OnboardingProfile | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as OnboardingProfile) : null;
  } catch {
    return null;
  }
}

export function hasCompletedOnboarding(): boolean {
  return loadOnboarding() !== null;
}

export function clearOnboarding(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // no-op
  }
}
