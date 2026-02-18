import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface UsernameDialogProps {
  open: boolean;
  onSubmit: (username: string) => void;
}

export const UsernameDialog = ({ open, onSubmit }: UsernameDialogProps) => {
  const [username, setUsername] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (username.trim()) onSubmit(username.trim());
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      {/* MD2 Dialog */}
      <div
        className="bg-card rounded-lg w-full max-w-sm mx-4 overflow-hidden"
        style={{ boxShadow: "var(--md-shadow-5)" }}
      >
        {/* Dialog title */}
        <div className="px-6 pt-6 pb-2">
          <h2 className="text-xl font-medium text-foreground">Choose a username</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Pick a display name to join the chat room.
          </p>
        </div>

        {/* Dialog content */}
        <form onSubmit={handleSubmit} className="px-6 pb-4">
          <div className="mt-4">
            <Input
              placeholder="Your username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoFocus
              className="h-12"
            />
          </div>

          {/* MD2 Dialog actions */}
          <div className="flex justify-end gap-2 mt-6">
            <Button
              type="submit"
              disabled={!username.trim()}
              className="min-w-[88px]"
            >
              Continue
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
