import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

interface RoomCardProps {
  roomId: string;
  roomName?: string;
  participantCount: number;
}

export const RoomCard = ({ roomId, roomName, participantCount }: RoomCardProps) => {
  const navigate = useNavigate();

  return (
    <div
      className="md-card md-ripple bg-card rounded-lg px-4 py-3 flex items-center justify-between cursor-pointer hover:bg-secondary/50 transition-colors"
      onClick={() => navigate(`/room/${roomId}`)}
      style={{ boxShadow: "var(--md-shadow-1)" }}
    >
      <div className="flex items-center gap-3 min-w-0">
        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
          <span className="material-icons text-primary text-lg">chat_bubble</span>
        </div>
        <div className="min-w-0">
          <h3 className="font-medium text-sm text-foreground truncate">{roomName || `Room ${roomId}`}</h3>
          <p className="text-xs text-muted-foreground truncate">{roomId}</p>
          <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
            <span className="material-icons text-xs" style={{ fontSize: "14px" }}>people</span>
            {participantCount} {participantCount === 1 ? "participant" : "participants"}
          </p>
        </div>
      </div>
      <Button
        onClick={(e) => { e.stopPropagation(); navigate(`/room/${roomId}`); }}
        size="sm"
        variant="ghost"
        className="flex-shrink-0 text-primary"
      >
        <span className="material-icons">chevron_right</span>
      </Button>
    </div>
  );
};
