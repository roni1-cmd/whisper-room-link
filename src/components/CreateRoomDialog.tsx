import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface CreateRoomDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (roomName: string) => void;
}

export const CreateRoomDialog = ({ open, onClose, onSubmit }: CreateRoomDialogProps) => {
  const [roomName, setRoomName] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (roomName.trim()) {
      onSubmit(roomName.trim());
      setRoomName("");
    }
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
      onClick={onClose}
    >
      {/* MD2 Dialog */}
      <div
        className="bg-card rounded-lg w-full max-w-sm mx-4 overflow-hidden"
        style={{ boxShadow: "var(--md-shadow-5)" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-6 pt-6 pb-2">
          <h2 className="text-xl font-medium text-foreground">Create New Room</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Give your chat room a name.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="px-6 pb-4">
          <div className="mt-4">
            <Input
              placeholder="Room name"
              value={roomName}
              onChange={(e) => setRoomName(e.target.value)}
              autoFocus
              className="h-12"
            />
          </div>

          {/* MD2 Dialog actions */}
          <div className="flex justify-end gap-2 mt-6">
            <Button type="button" variant="ghost" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={!roomName.trim()}>
              Create
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
