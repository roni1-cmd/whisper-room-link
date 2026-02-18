import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ref, onValue } from "firebase/database";
import { database } from "@/lib/firebase";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

interface RoomsSidebarProps {
  currentRoomId?: string;
  onClose?: () => void;
}

export function RoomsSidebar({ currentRoomId, onClose }: RoomsSidebarProps) {
  const navigate = useNavigate();
  const [rooms, setRooms] = useState<{ [key: string]: any }>({});
  const [searchQuery, setSearchQuery] = useState("");
  const [unreadCounts, setUnreadCounts] = useState<Record<string, number>>({});
  const username = localStorage.getItem("chatUsername");

  useEffect(() => {
    const roomsRef = ref(database, "rooms");
    const unsubscribe = onValue(roomsRef, (snapshot) => {
      const data = snapshot.val();
      setRooms(data || {});

      if (data && username) {
        const counts: Record<string, number> = {};
        Object.entries(data).forEach(([roomId, roomData]: [string, any]) => {
          const messages = roomData?.messages || {};
          const lastRead = parseInt(localStorage.getItem(`lastRead_${roomId}`) || "0");
          const unreadCount = Object.values(messages).filter(
            (msg: any) => msg.timestamp > lastRead && msg.username !== username
          ).length;
          if (unreadCount > 0) counts[roomId] = unreadCount;
        });
        setUnreadCounts(counts);
      }
    });
    return () => unsubscribe();
  }, [username]);

  const filteredRooms = Object.entries(rooms).filter(([roomId, roomData]) => {
    const query = searchQuery.toLowerCase();
    return (
      roomId.toLowerCase().includes(query) ||
      roomData?.name?.toLowerCase().includes(query)
    );
  });

  return (
    <div className="h-full flex flex-col bg-card border-r border-border">
      {/* MD2 App bar */}
      <div className="px-4 pt-4 pb-2" style={{ boxShadow: "var(--md-shadow-1)" }}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            {onClose && (
              <Button variant="ghost" size="icon" onClick={onClose} className="lg:hidden -ml-2">
                <span className="material-icons text-muted-foreground">close</span>
              </Button>
            )}
            <h2 className="text-lg font-medium tracking-wide text-foreground">Chats</h2>
          </div>
          <Button variant="ghost" size="icon" onClick={() => navigate("/")} title="Home">
            <span className="material-icons text-muted-foreground">home</span>
          </Button>
        </div>

        {/* MD2 Search field */}
        <div className="relative flex items-center bg-secondary rounded-full px-4 py-2 gap-2">
          <span className="material-icons text-muted-foreground text-lg">search</span>
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search rooms"
            className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground text-foreground"
          />
        </div>
      </div>

      {/* Rooms List */}
      <ScrollArea className="flex-1">
        <div className="py-2">
          {filteredRooms.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground text-sm">
              No rooms found
            </div>
          ) : (
            filteredRooms.map(([roomId, roomData]) => {
              const isActive = currentRoomId === roomId;
              return (
                <button
                  key={roomId}
                  onClick={() => {
                    navigate(`/room/${roomId}`);
                    onClose?.();
                  }}
                  className={`md-ripple w-full flex items-center gap-3 px-4 py-3 transition-colors text-left ${
                    isActive
                      ? "bg-accent"
                      : "hover:bg-secondary"
                  }`}
                >
                  <div className="relative flex-shrink-0">
                    <img
                      src={`https://api.dicebear.com/7.x/shapes/svg?seed=${roomId}`}
                      alt={roomData?.name || roomId}
                      className="w-12 h-12 rounded-full"
                    />
                    {unreadCounts[roomId] && !isActive && (
                      <div className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center shadow-sm">
                        {unreadCounts[roomId] > 9 ? "9+" : unreadCounts[roomId]}
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className={`text-sm font-medium truncate ${isActive ? "text-accent-foreground" : "text-foreground"}`}>
                      {roomData?.name || `Room ${roomId}`}
                    </div>
                    <div className="text-xs text-muted-foreground truncate mt-0.5">
                      {roomId}
                    </div>
                  </div>
                  {isActive && (
                    <span className="material-icons text-primary text-sm flex-shrink-0">chat_bubble</span>
                  )}
                </button>
              );
            })
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
