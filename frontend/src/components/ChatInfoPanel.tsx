import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useState } from "react";
import { ref, update } from "firebase/database";
import { database } from "@/lib/firebase";
import { toast } from "sonner";

interface Member {
  username: string;
  nickname: string;
  typing?: boolean;
  lastSeen?: number;
}

interface ChatInfoPanelProps {
  roomId: string;
  roomName: string;
  presence: Record<string, Member>;
  currentClientId: string;
  creator: string;
  admins: Record<string, boolean>;
  mutedUsers: Record<string, { mutedUntil: number }>;
  bannedUsers: Record<string, boolean>;
  onClose?: () => void;
  onMuteUser: (clientId: string, duration: number) => void;
  onKickUser: (clientId: string) => void;
  onBanUser: (clientId: string) => void;
  onPromoteAdmin: (clientId: string) => void;
  onDemoteAdmin: (clientId: string) => void;
  onChangeNickname: () => void;
}

export function ChatInfoPanel({ 
  roomId, 
  roomName, 
  presence, 
  currentClientId,
  creator,
  admins,
  mutedUsers,
  bannedUsers,
  onClose,
  onMuteUser,
  onKickUser,
  onBanUser,
  onPromoteAdmin,
  onDemoteAdmin,
  onChangeNickname
}: ChatInfoPanelProps) {
  const [isCustomizeOpen, setIsCustomizeOpen] = useState(false);
  const [isMembersOpen, setIsMembersOpen] = useState(true);
  const [editedRoomName, setEditedRoomName] = useState(roomName);

  const handleRenameRoom = async () => {
    if (!roomId || !editedRoomName.trim()) return;
    try {
      await update(ref(database, `rooms/${roomId}`), { name: editedRoomName.trim() });
      toast.success("Room renamed");
    } catch (e) {
      toast.error("Failed to rename");
    }
  };

  const isCurrentUserAdmin = admins?.[currentClientId] || creator === currentClientId;
  const isCreator = creator === currentClientId;

  const participants = Object.entries(presence || {}).map(([clientId, data]) => ({
    clientId,
    ...data,
  }));

  return (
    <div className="h-full flex flex-col bg-card border-l">
      {/* Header */}
      <div className="p-4 border-b flex items-center justify-between">
        <h3 className="font-semibold">Chat info</h3>
        {onClose && (
          <Button variant="ghost" size="icon" onClick={onClose} className="lg:hidden">
            <span className="material-icons">close</span>
          </Button>
        )}
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4 space-y-4">
          {/* Room Avatar & Name */}
          <div className="text-center">
            <div className="w-20 h-20 mx-auto mb-3 rounded-full overflow-hidden bg-muted">
              <img
                src={`https://api.dicebear.com/7.x/shapes/svg?seed=${roomId}`}
                alt={roomName}
                className="w-full h-full"
              />
            </div>
            <h2 className="text-lg font-semibold">{roomName}</h2>
            <p className="text-xs text-muted-foreground">{roomId}</p>
          </div>

          {/* Customize Chat */}
          <Collapsible open={isCustomizeOpen} onOpenChange={setIsCustomizeOpen}>
            <CollapsibleTrigger asChild>
              <button className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-accent/50 transition-colors">
                <div className="flex items-center gap-3">
                  <span className="material-icons text-muted-foreground">palette</span>
                  <span className="font-medium">Customize chat</span>
                </div>
                <span className="material-icons text-muted-foreground">
                  {isCustomizeOpen ? "expand_less" : "expand_more"}
                </span>
              </button>
            </CollapsibleTrigger>
            <CollapsibleContent className="px-3 pt-2 pb-3 space-y-3">
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Room name</label>
                <div className="flex gap-2">
                  <Input
                    value={editedRoomName}
                    onChange={(e) => setEditedRoomName(e.target.value)}
                    placeholder="Room name"
                    className="flex-1"
                  />
                  <Button onClick={handleRenameRoom} size="sm">
                    Save
                  </Button>
                </div>
              </div>
            </CollapsibleContent>
          </Collapsible>

          {/* Chat Members */}
          <Collapsible open={isMembersOpen} onOpenChange={setIsMembersOpen}>
            <CollapsibleTrigger asChild>
              <button className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-accent/50 transition-colors">
                <div className="flex items-center gap-3">
                  <span className="material-icons text-muted-foreground">people</span>
                  <span className="font-medium">
                    Chat members ({Object.keys(presence).length})
                  </span>
                </div>
                <span className="material-icons text-muted-foreground">
                  {isMembersOpen ? "expand_less" : "expand_more"}
                </span>
              </button>
            </CollapsibleTrigger>
            <CollapsibleContent className="px-3 pt-2 pb-3 space-y-2">
              {participants.map((p: any, idx: number) => (
                <div key={idx} className="flex items-center gap-3 p-2 rounded-lg hover:bg-accent/50">
                  <div className="relative">
                    <img
                      src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${p.username}`}
                      alt={p.username}
                      className="w-10 h-10 rounded-full"
                    />
                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-card"></div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium truncate">{p.username}</div>
                    {p.typing ? (
                      <div className="text-xs text-primary">typing…</div>
                    ) : (
                      <div className="text-xs text-muted-foreground">Active now</div>
                    )}
                  </div>
                </div>
              ))}
            </CollapsibleContent>
          </Collapsible>
        </div>
      </ScrollArea>
    </div>
  );
}
