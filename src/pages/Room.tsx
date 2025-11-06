import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ref, push, onValue, serverTimestamp, update, remove } from "firebase/database";
import { database } from "@/lib/firebase";
import { UsernameDialog } from "@/components/UsernameDialog";
import { LiveDateTime } from "@/components/LiveDateTime";
import { MessageBubble } from "@/components/MessageBubble";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";

interface Message {
  id: string;
  text: string;
  username: string;
  timestamp: number;
  reactions?: { [emoji: string]: string[] };
  replyTo?: {
    id: string;
    text: string;
    username: string;
  };
  edited?: boolean;
}

export default function Room() {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const [username, setUsername] = useState<string | null>(null);
  const [roomName, setRoomName] = useState<string>("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [replyingTo, setReplyingTo] = useState<Message | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Load username from localStorage on mount
  useEffect(() => {
    const storedUsername = localStorage.getItem("chatUsername");
    if (storedUsername) {
      setUsername(storedUsername);
    }
  }, []);

  // Store current room in localStorage
  useEffect(() => {
    if (roomId && username) {
      localStorage.setItem("currentRoom", roomId);
    }
  }, [roomId, username]);

  useEffect(() => {
    if (!roomId) return;

    // Listen to room data including name
    const roomRef = ref(database, `rooms/${roomId}`);
    const roomUnsubscribe = onValue(roomRef, (snapshot) => {
      const data = snapshot.val();
      if (data?.name) {
        setRoomName(data.name);
      }
    });

    const messagesRef = ref(database, `rooms/${roomId}/messages`);
    const messagesUnsubscribe = onValue(messagesRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const messagesList = Object.entries(data).map(([id, msg]: [string, any]) => ({
          id,
          text: msg.text,
          username: msg.username,
          timestamp: msg.timestamp,
          reactions: msg.reactions || {},
          replyTo: msg.replyTo,
          edited: msg.edited || false,
        }));
        setMessages(messagesList.sort((a, b) => a.timestamp - b.timestamp));
      } else {
        setMessages([]);
      }
    });

    return () => {
      roomUnsubscribe();
      messagesUnsubscribe();
    };
  }, [roomId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleUsernameSubmit = (newUsername: string) => {
    setUsername(newUsername);
    localStorage.setItem("chatUsername", newUsername);
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !username || !roomId) return;

    try {
      if (editingMessageId) {
        // Update existing message
        const messageRef = ref(database, `rooms/${roomId}/messages/${editingMessageId}`);
        await update(messageRef, {
          text: newMessage.trim(),
          edited: true,
        });
        setEditingMessageId(null);
      } else {
        // Send new message
        const messagesRef = ref(database, `rooms/${roomId}/messages`);
        const messageData: any = {
          text: newMessage.trim(),
          username,
          timestamp: serverTimestamp(),
        };
        
        if (replyingTo) {
          messageData.replyTo = {
            id: replyingTo.id,
            text: replyingTo.text,
            username: replyingTo.username,
          };
        }
        
        await push(messagesRef, messageData);
      }
      
      setNewMessage("");
      setReplyingTo(null);
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("Failed to send message");
    }
  };

  const handleReact = async (messageId: string, emoji: string) => {
    if (!username || !roomId) return;

    try {
      const message = messages.find((m) => m.id === messageId);
      if (!message) return;

      const reactions = message.reactions || {};
      const userReactions = reactions[emoji] || [];
      
      let updatedUsers;
      if (userReactions.includes(username)) {
        // Remove reaction
        updatedUsers = userReactions.filter((u) => u !== username);
      } else {
        // Add reaction
        updatedUsers = [...userReactions, username];
      }

      const messageRef = ref(database, `rooms/${roomId}/messages/${messageId}`);
      await update(messageRef, {
        [`reactions.${emoji}`]: updatedUsers,
      });
    } catch (error) {
      console.error("Error reacting to message:", error);
      toast.error("Failed to add reaction");
    }
  };

  const handleEdit = (messageId: string) => {
    const message = messages.find((m) => m.id === messageId);
    if (message && message.username === username) {
      setNewMessage(message.text);
      setEditingMessageId(messageId);
      inputRef.current?.focus();
    }
  };

  const handleDelete = async (messageId: string) => {
    if (!roomId) return;

    try {
      const messageRef = ref(database, `rooms/${roomId}/messages/${messageId}`);
      await remove(messageRef);
      toast.success("Message deleted");
    } catch (error) {
      console.error("Error deleting message:", error);
      toast.error("Failed to delete message");
    }
  };

  const handleReply = (message: Message) => {
    setReplyingTo(message);
    inputRef.current?.focus();
  };

  const handleLeaveRoom = () => {
    localStorage.removeItem("currentRoom");
    navigate("/");
  };

  if (!username) {
    return <UsernameDialog open={true} onSubmit={handleUsernameSubmit} />;
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="bg-card border-b shadow-sm">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/")}
              className="lg:hidden"
            >
              <span className="material-icons">arrow_back</span>
            </Button>
            <span className="material-icons text-primary">spa</span>
            <div className="min-w-0 flex-1">
              <h1 className="text-base md:text-lg font-semibold truncate">
                {roomName || `Room ${roomId}`}
              </h1>
              <p className="text-xs md:text-sm text-muted-foreground truncate">
                {roomId} • {username}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <LiveDateTime />
            <Button
              onClick={handleLeaveRoom}
              variant="outline"
              size="sm"
              className="gap-2"
            >
              <span className="material-icons text-sm">exit_to_app</span>
              <span className="hidden sm:inline">Leave</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Messages */}
      <main className="flex-1 container mx-auto px-4 py-4 overflow-hidden flex flex-col max-w-4xl">
        <ScrollArea className="flex-1 pr-4">
          <div className="space-y-4 pb-4">
            {messages.length === 0 ? (
              <div className="flex items-center justify-center h-full text-muted-foreground py-20">
                <div className="text-center">
                  <span className="material-icons text-5xl mb-4 opacity-50">chat_bubble_outline</span>
                  <p>No messages yet. Start the conversation!</p>
                </div>
              </div>
            ) : (
              messages.map((message) => (
                <MessageBubble
                  key={message.id}
                  message={message}
                  isOwn={message.username === username}
                  currentUsername={username || ""}
                  onReact={handleReact}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  onReply={handleReply}
                />
              ))
            )}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        {/* Message Input */}
        <div className="pt-4 border-t">
          {replyingTo && (
            <div className="mb-2 p-2 bg-muted rounded-lg flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-muted-foreground">
                  Replying to {replyingTo.username}
                </p>
                <p className="text-sm truncate">{replyingTo.text}</p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={() => setReplyingTo(null)}
              >
                <span className="material-icons text-sm">close</span>
              </Button>
            </div>
          )}
          {editingMessageId && (
            <div className="mb-2 p-2 bg-muted rounded-lg flex items-center justify-between">
              <div className="flex-1">
                <p className="text-xs font-medium text-muted-foreground">
                  Editing message
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={() => {
                  setEditingMessageId(null);
                  setNewMessage("");
                }}
              >
                <span className="material-icons text-sm">close</span>
              </Button>
            </div>
          )}
          <form onSubmit={handleSendMessage} className="flex gap-2">
            <Textarea
              ref={inputRef}
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type a message..."
              className="flex-1 min-h-[48px] max-h-[120px] resize-none"
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage(e);
                }
              }}
            />
            <Button type="submit" size="icon" className="h-12 w-12 self-end">
              <span className="material-icons">
                {editingMessageId ? "check" : "send"}
              </span>
            </Button>
          </form>
        </div>
      </main>
    </div>
  );
}
