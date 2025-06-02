"use client";

import { signIn } from "next-auth/react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Icons } from "@/components/ui/icons";

interface ReAuthModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function ReAuthModal({ open, onOpenChange, onSuccess }: ReAuthModalProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleReAuth = async () => {
    try {
      setIsLoading(true);
      const result = await signIn("google", {
        redirect: false,
        callbackUrl: window.location.href,
      });

      if (result?.error) {
        throw new Error(result.error);
      }

      onSuccess?.();
      onOpenChange(false);
    } catch (error) {
      console.error("Re-authentication failed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Additional Permissions Required</DialogTitle>
          <DialogDescription>
            To sync your focus blocks with Google Calendar, we need additional permissions.
            Please re-authenticate with Google to grant calendar access.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleReAuth}
            disabled={isLoading}
            className="gap-2"
          >
            {isLoading ? (
              <>
                <Icons.spinner className="h-4 w-4 animate-spin" />
                Authenticating...
              </>
            ) : (
              <>
                <Icons.google className="h-4 w-4" />
                Continue with Google
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 