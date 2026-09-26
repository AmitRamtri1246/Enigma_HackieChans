import React from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";

interface ConfirmationDialogProps {
  open: boolean;
  title: string;
  description?: React.ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  destructive?: boolean;
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

/** Confirmation for consequential actions, built on Dialog. */
export const ConfirmationDialog: React.FC<ConfirmationDialogProps> = ({
  open,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  destructive = false,
  loading = false,
  onConfirm,
  onCancel,
}) => (
  <Dialog
    open={open}
    onClose={onCancel}
    title={title}
    description={description}
    busy={loading}
    footer={
      <>
        <Button variant="outline" onClick={onCancel} disabled={loading}>
          {cancelLabel}
        </Button>
        <Button
          data-autofocus
          variant={destructive ? "destructive" : "default"}
          onClick={onConfirm}
          disabled={loading}
          className="gap-2"
        >
          {loading && <Loader2 className="h-4 w-4 motion-safe:animate-spin" />}
          {confirmLabel}
        </Button>
      </>
    }
  />
);
