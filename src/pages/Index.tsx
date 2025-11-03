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
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 md:py-12">
        {/* Header */}
        <header className="text-center mb-12 md:mb-16">
          <div className="flex items-center justify-center gap-3 mb-4">
            <span className="material-icons text-primary text-4xl md:text-5xl">chat_bubble</span>
            <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold text-foreground">
              Anonymous Chat
            </h1>
          </div>
          <p className="text-muted-foreground text-base md:text-lg max-w-2xl mx-auto">
            Connect instantly with others in private chat rooms. No registration required.
          </p>
        </header>

        {/* Main Content */}
        <div className="max-w-2xl mx-auto space-y-8">
          {/* Join Room Card */}
          <Card className="p-6 md:p-8 shadow-lg">
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  <span className="material-icons text-sm">vpn_key</span>
                  Enter room code
                </label>
                <Input
                  value={roomCode}
                  onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                  placeholder="ABCD12"
                  className="h-14 text-center text-xl tracking-wider font-medium"
                  onKeyDown={(e) => e.key === "Enter" && handleJoinRoom()}
                />
              </div>
              <Button
                onClick={handleJoinRoom}
                disabled={!roomCode.trim()}
                className="w-full h-14 text-base font-medium gap-2"
              >
                <span className="material-icons">login</span>
                Join Room
              </Button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-card px-2 text-muted-foreground">Or</span>
                </div>
              </div>

              <Button
                onClick={handleCreateRoom}
                variant="outline"
                className="w-full h-14 text-base font-medium gap-2"
              >
                <span className="material-icons">add_circle</span>
                Create New Room
              </Button>
            </div>
          </Card>

          {/* Active Rooms */}
          {Object.keys(rooms).length > 0 && (
            <div className="space-y-4">
              <h2 className="text-xl md:text-2xl font-semibold flex items-center gap-2">
                <span className="material-icons">groups</span>
                Active Rooms
              </h2>
              <div className="grid gap-3">
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
    </div>
  );
}
