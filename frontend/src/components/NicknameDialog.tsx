import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface NicknameDialogProps {
  open: boolean;
  currentNickname: string;
  onClose: () => void;
  onSubmit: (nickname: string) => void;
}

export function NicknameDialog({
  open,
  currentNickname,
  onClose,
  onSubmit,
}: NicknameDialogProps) {
  const [nickname, setNickname] = useState(currentNickname);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (nickname.trim()) {
      onSubmit(nickname.trim());
      onClose();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Change Nickname</DialogTitle>
          <DialogDescription>
            Set a room-specific nickname. This will only affect how you appear in this room.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="nickname">Nickname</Label>
              <Input
                id="nickname"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                placeholder="Enter your nickname"
                maxLength={30}
                autoFocus
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={!nickname.trim()}>
              Save Nickname
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
