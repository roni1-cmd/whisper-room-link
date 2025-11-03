import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ref, onValue } from "firebase/database";
import { database, signInAnonymouslyUser } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { RoomCard } from "@/components/RoomCard";
import { toast } from "sonner";

export default function Index() {
  const navigate = useNavigate();
  const [roomCode, setRoomCode] = useState("");
  const [rooms, setRooms] = useState<{ [key: string]: any }>({});
  const [activeTab, setActiveTab] = useState("rooms");

  useEffect(() => {
    // Sign in anonymously
    signInAnonymouslyUser().catch((error) => {
      console.error("Auth error:", error);
      toast.error("Authentication failed");
    });

    // Listen to all rooms
    const roomsRef = ref(database, "rooms");
    const unsubscribe = onValue(roomsRef, (snapshot) => {
      const data = snapshot.val();
      setRooms(data || {});
    });

    return () => unsubscribe();
  }, []);

  const handleJoinRoom = () => {
    if (roomCode.trim()) {
      navigate(`/room/${roomCode.trim()}`);
    }
  };

  const handleCreateRoom = () => {
    const newRoomId = Math.random().toString(36).substring(2, 8).toUpperCase();
    navigate(`/room/${newRoomId}`);
  };

  const getRoomParticipantCount = (roomData: any) => {
    if (!roomData?.messages) return 0;
    const usernames = new Set(
      Object.values(roomData.messages).map((msg: any) => msg.username)
    );
    return usernames.size;
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar - Hidden on mobile */}
      <aside className="hidden lg:flex lg:w-64 bg-card border-r flex-col p-4">
        <div className="flex items-center gap-3 mb-8 px-2">
          <span className="material-icons text-primary text-3xl">chat_bubble</span>
          <span className="text-xl font-medium">Anonymous Chat</span>
        </div>
        
        <nav className="space-y-2">
          <button
            onClick={() => setActiveTab("rooms")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
              activeTab === "rooms"
                ? "bg-accent text-accent-foreground"
                : "hover:bg-accent/50"
            }`}
          >
            <span className="material-icons">calendar_today</span>
            <span className="font-medium">Rooms</span>
          </button>
          
          <button
            onClick={() => setActiveTab("active")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
              activeTab === "active"
                ? "bg-accent text-accent-foreground"
                : "hover:bg-accent/50"
            }`}
          >
            <span className="material-icons">videocam</span>
            <span className="font-medium">Active Chats</span>
          </button>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col">
        {/* Header - Mobile only */}
        <header className="lg:hidden bg-card border-b px-4 py-4 flex items-center gap-3">
          <span className="material-icons text-primary text-2xl">chat_bubble</span>
          <span className="text-lg font-medium">Anonymous Chat</span>
        </header>

        {/* Main Content Area */}
        <div className="flex-1 flex items-center justify-center p-4 md:p-8">
          <div className="w-full max-w-3xl">
            {/* Hero Section */}
            <div className="text-center mb-12">
              <h1 className="text-3xl md:text-5xl lg:text-6xl font-normal text-foreground mb-4">
                Instant chats and rooms for everyone
              </h1>
              <p className="text-base md:text-lg text-muted-foreground">
                Connect, collaborate, and chat from anywhere
              </p>
            </div>

            {/* Action Section */}
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-center mb-8">
              <Button
                onClick={handleCreateRoom}
                size="lg"
                className="h-12 px-6 gap-2 font-medium"
              >
                <span className="material-icons text-xl">add</span>
                New room
              </Button>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <div className="relative flex-1 sm:flex-none">
                  <span className="material-icons absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    keyboard
                  </span>
                  <Input
                    value={roomCode}
                    onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                    placeholder="Enter a code"
                    className="h-12 pl-12 pr-4 w-full sm:w-64 border-2"
                    onKeyDown={(e) => e.key === "Enter" && handleJoinRoom()}
                  />
                </div>
                <Button
                  onClick={handleJoinRoom}
                  disabled={!roomCode.trim()}
                  variant="outline"
                  size="lg"
                  className="h-12 px-6 font-medium"
                >
                  Join
                </Button>
              </div>
            </div>

            <div className="border-t my-12"></div>

            {/* Active Rooms Section */}
            {Object.keys(rooms).length > 0 && (
              <div className="space-y-6">
                <h2 className="text-xl md:text-2xl font-medium flex items-center gap-2">
                  <span className="material-icons">groups</span>
                  Active Rooms
                </h2>
                <div className="grid gap-3 md:grid-cols-2">
                  {Object.entries(rooms).map(([roomId, roomData]) => (
                    <RoomCard
                      key={roomId}
                      roomId={roomId}
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
