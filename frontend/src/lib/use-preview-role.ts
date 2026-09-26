import { useCallback, useEffect, useState } from "react";
import { loadOnboarding, type TraceRole } from "@/lib/onboarding";

/**
 * Preview-role state for the TraceIQ prototype.
 *
 * NOTE: This is a frontend-only demo convenience for the hackathon so a single
 * account can preview every role's workspace. It is NOT an authorization
 * mechanism — the backend does not know or enforce roles. Do not gate anything
 * sensitive on it.
 */

export const PREVIEW_ROLE_KEY = "traceiq.previewRole";
const PREVIEW_ROLE_EVENT = "traceiq:preview-role-change";

export const ROLE_LABELS: Record<TraceRole, string> = {
  citizen: "Citizen",
  organization: "Organization",
  collector: "Collector",
  municipality: "Municipality",
};

/**
 * Imperatively set the preview role from outside React (e.g. AuthContext after
 * login) and notify listeners. Writing storage keeps the choice across reloads.
 */
export function setPreviewRole(role: TraceRole): void {
  try {
    localStorage.setItem(PREVIEW_ROLE_KEY, role);
  } catch {
    // ignore storage failures; the event still updates in-memory state
  }
  window.dispatchEvent(new CustomEvent(PREVIEW_ROLE_EVENT));
}

function readStoredRole(): TraceRole {
  try {
    const stored = localStorage.getItem(PREVIEW_ROLE_KEY);
    if (stored && stored in ROLE_LABELS) return stored as TraceRole;
  } catch {
    // ignore
  }
  // Fall back to the role chosen during onboarding, else citizen.
  return loadOnboarding()?.role ?? "citizen";
}

/**
 * Reads and updates the current preview role. Changes broadcast across
 * components in the same tab (custom event) and other tabs (storage event).
 */
export function usePreviewRole(): {
  role: TraceRole;
  setRole: (role: TraceRole) => void;
} {
  const [role, setRoleState] = useState<TraceRole>(readStoredRole);

  useEffect(() => {
    const sync = () => setRoleState(readStoredRole());
    window.addEventListener(PREVIEW_ROLE_EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(PREVIEW_ROLE_EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  const setRole = useCallback((next: TraceRole) => {
    try {
      localStorage.setItem(PREVIEW_ROLE_KEY, next);
    } catch {
      // ignore storage failures; still update in-memory
    }
    setRoleState(next);
    window.dispatchEvent(new CustomEvent(PREVIEW_ROLE_EVENT));
  }, []);

  return { role, setRole };
}
