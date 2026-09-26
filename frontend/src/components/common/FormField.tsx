import React from "react";
import { Label } from "@/components/ui/label";

interface FormFieldProps {
  id: string;
  label: string;
  /** Marks the field as optional in the label. */
  optional?: boolean;
  hint?: string;
  error?: string;
  children: React.ReactNode;
}

/** Label + control + hint/error, with the error wired for assistive tech via id. */
export const FormField: React.FC<FormFieldProps> = ({ id, label, optional, hint, error, children }) => (
  <div className="space-y-1.5">
    <Label htmlFor={id} className="text-sm font-medium">
      {label}
      {optional && <span className="ml-1 font-normal text-muted-foreground">(optional)</span>}
    </Label>
    {children}
    {error ? (
      <p id={`${id}-error`} role="alert" className="text-[13px] font-medium text-[#A4463B]">
        {error}
      </p>
    ) : hint ? (
      <p id={`${id}-hint`} className="text-[13px] text-muted-foreground">
        {hint}
      </p>
    ) : null}
  </div>
);

/** Segmented single-choice control (radio group) for small option sets. */
export function ChoiceGroup<T extends string>({
  label,
  value,
  options,
  onChange,
  columns = 3,
}: {
  label: string;
  value: T;
  options: { value: T; label: string }[];
  onChange: (value: T) => void;
  columns?: 2 | 3 | 4;
}) {
  const cols = columns === 2 ? "grid-cols-2" : columns === 4 ? "grid-cols-2 sm:grid-cols-4" : "grid-cols-3";
  return (
    <fieldset className="space-y-1.5">
      <legend className="mb-1.5 text-sm font-medium text-foreground">{label}</legend>
      <div role="radiogroup" aria-label={label} className={`grid gap-2 ${cols}`}>
        {options.map((o) => {
          const checked = o.value === value;
          return (
            <button
              key={o.value}
              type="button"
              role="radio"
              aria-checked={checked}
              onClick={() => onChange(o.value)}
              className={
                "h-9 rounded-md border px-3 text-sm transition-colors duration-150 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring " +
                (checked
                  ? "border-brand-forest bg-brand-forest text-brand-white"
                  : "border-input bg-card text-foreground hover:bg-secondary")
              }
            >
              {o.label}
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}
