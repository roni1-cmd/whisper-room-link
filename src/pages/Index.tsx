import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ref, onValue, set, serverTimestamp } from "firebase/database";
import { database, signInAnonymouslyUser } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RoomCard } from "@/components/RoomCard";
import { CreateRoomDialog } from "@/components/CreateRoomDialog";
import { LiveDateTime } from "@/components/LiveDateTime";
import { toast } from "sonner";
import logo from "@/assets/app-logo.png";

export default function Index() {
  const navigate = useNavigate();
  const [roomCode, setRoomCode] = useState("");
  const [rooms, setRooms] = useState<{ [key: string]: any }>({});
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  useEffect(() => {
    const currentRoom = localStorage.getItem("currentRoom");
    const storedUsername = localStorage.getItem("chatUsername");
    if (currentRoom && storedUsername) {
      navigate(`/room/${currentRoom}`);
      return;
    }

    signInAnonymouslyUser().catch((error) => {
      console.error("Auth error:", error);
      toast.error("Authentication failed");
    });

    const roomsRef = ref(database, "rooms");
    const unsubscribe = onValue(roomsRef, (snapshot) => {
      const data = snapshot.val();
      setRooms(data || {});
    });
    return () => unsubscribe();
  }, [navigate]);

  const handleJoinRoom = () => {
    if (roomCode.trim()) navigate(`/room/${roomCode.trim()}`);
  };

  const handleCreateRoom = async (roomName: string) => {
    const newRoomId = "IL" + Math.random().toString(36).substring(2, 6).toUpperCase();
    const roomRef = ref(database, `rooms/${newRoomId}`);
    await set(roomRef, { name: roomName, createdAt: serverTimestamp() });
    setCreateDialogOpen(false);
    navigate(`/room/${newRoomId}`);
  };

  const getRoomParticipantCount = (roomData: any) => {
    if (!roomData?.messages) return 0;
    const usernames = new Set(Object.values(roomData.messages).map((msg: any) => msg.username));
    return usernames.size;
  };

  return (
    <div className="min-h-screen bg-background flex">
      <CreateRoomDialog
        open={createDialogOpen}
        onClose={() => setCreateDialogOpen(false)}
        onSubmit={handleCreateRoom}
      />

      {/* MD2 Navigation Drawer (desktop) */}
      <aside className="hidden lg:flex lg:w-72 flex-col bg-card border-r border-border" style={{ boxShadow: "var(--md-shadow-1)" }}>
        <div className="flex items-center gap-3 px-6 h-16 border-b border-border">
          <img src={logo} alt="Inner Leaf logo" className="w-8 h-8" />
          <span className="text-xl font-medium tracking-wide text-foreground">Inner Leaf</span>
        </div>

        <nav className="flex-1 overflow-y-auto py-2">
          <div className="md-overline text-muted-foreground px-6 py-3">Your Rooms</div>

          {Object.entries(rooms).length === 0 ? (
            <div className="px-6 py-8 text-sm text-muted-foreground text-center">
              No rooms yet. Create one!
            </div>
          ) : (
            Object.entries(rooms).map(([roomId, roomData]) => (
              <button
                key={roomId}
                onClick={() => navigate(`/room/${roomId}`)}
                className="md-ripple w-full flex items-center gap-4 px-6 py-3 hover:bg-secondary transition-colors text-left"
              >
                <span className="material-icons text-primary text-xl">chat_bubble_outline</span>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate">{roomData.name || `Room ${roomId}`}</div>
                  <div className="text-xs text-muted-foreground truncate">{roomId}</div>
                </div>
              </button>
            ))
          )}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-h-screen">
        {/* MD2 Top App Bar */}
        <header
          className="bg-primary text-primary-foreground px-4 md:px-6 flex items-center justify-between flex-shrink-0"
          style={{ height: "64px", boxShadow: "var(--md-shadow-2)" }}
        >
          <div className="flex items-center gap-4">
            <img src={logo} alt="Inner Leaf logo" className="w-7 h-7 lg:hidden" />
            <h1 className="text-xl font-medium tracking-wide lg:hidden">Inner Leaf</h1>
            <h1 className="hidden lg:block text-xl font-medium tracking-wide">Inner Leaf Chat</h1>
          </div>
          <div className="flex items-center gap-3 text-primary-foreground/80">
            <LiveDateTime />
          </div>
        </header>

        {/* Content */}
        <div className="flex-1 flex items-center justify-center p-4 md:p-8">
          <div className="w-full max-w-2xl">
            {/* Hero */}
            <div className="text-center mb-12">
              <div className="flex justify-center mb-6">
                <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center" style={{ boxShadow: "var(--md-shadow-1)" }}>
                  <img src={logo} alt="Inner Leaf" className="w-12 h-12" />
                </div>
              </div>
              <h2 className="text-3xl md:text-5xl font-normal text-foreground mb-3 tracking-tight">
                Instant chats for everyone
              </h2>
              <p className="text-base text-muted-foreground">
                Connect, collaborate, and chat from anywhere
              </p>
            </div>

            {/* MD2 Card for actions */}
            <div
              className="bg-card rounded-lg p-6 mb-8"
              style={{ boxShadow: "var(--md-shadow-2)" }}
            >
              {/* Create Room Row */}
              <Button
                onClick={() => setCreateDialogOpen(true)}
                className="w-full h-12 text-sm font-medium mb-4 md-fab"
              >
                <span className="material-icons text-xl">add</span>
                Create New Room
              </Button>

              <div className="flex items-center gap-3 text-muted-foreground mb-4">
                <div className="flex-1 h-px bg-border" />
                <span className="text-xs uppercase tracking-widest">or join existing</span>
                <div className="flex-1 h-px bg-border" />
              </div>

              {/* Join Row */}
              <div className="flex gap-3">
                <div className="relative flex-1">
                  <span className="material-icons absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-xl">
                    vpn_key
                  </span>
                  <Input
                    value={roomCode}
                    onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                    placeholder="Room code"
                    className="h-12 pl-12"
                    onKeyDown={(e) => e.key === "Enter" && handleJoinRoom()}
                  />
                </div>
                <Button
                  onClick={handleJoinRoom}
                  disabled={!roomCode.trim()}
                  variant="outline"
                  className="h-12 px-6"
                >
                  Join
                </Button>
              </div>
            </div>

            {/* Rooms grid (mobile) */}
            {Object.keys(rooms).length > 0 && (
              <div className="space-y-3 lg:hidden">
                <div className="md-overline text-muted-foreground px-1 mb-2">Recent Rooms</div>
                <div className="grid gap-3">
                  {Object.entries(rooms).map(([roomId, roomData]) => (
                    <RoomCard
                      key={roomId}
                      roomId={roomId}
                      roomName={roomData.name}
                      participantCount={getRoomParticipantCount(roomData)}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
