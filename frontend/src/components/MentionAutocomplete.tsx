import { useEffect, useRef } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";

interface User {
  clientId: string;
  nickname: string;
  username: string;
}

interface MentionAutocompleteProps {
  users: User[];
  onSelect: (user: User) => void;
  position: { top: number; left: number };
  selectedIndex: number;
}

export function MentionAutocomplete({
  users,
  onSelect,
  position,
  selectedIndex,
}: MentionAutocompleteProps) {
  const selectedRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    selectedRef.current?.scrollIntoView({ block: "nearest" });
  }, [selectedIndex]);

  if (users.length === 0) return null;

  return (
    <div
      className="absolute z-50 w-64 bg-popover border rounded-lg shadow-lg overflow-hidden"
      style={{
        bottom: position.top,
        left: position.left,
      }}
    >
      <ScrollArea className="max-h-48">
        <div className="p-1">
          {users.map((user, index) => (
            <div
              key={user.clientId}
              ref={index === selectedIndex ? selectedRef : null}
              onClick={() => onSelect(user)}
              className={`flex items-center gap-3 p-2 rounded cursor-pointer transition-colors ${
                index === selectedIndex
                  ? "bg-accent text-accent-foreground"
                  : "hover:bg-accent/50"
              }`}
            >
              <img
                src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}`}
                alt={user.nickname}
                className="w-8 h-8 rounded-full"
              />
              <div className="flex-1 min-w-0">
                <div className="font-medium truncate">{user.nickname}</div>
                {user.nickname !== user.username && (
                  <div className="text-xs text-muted-foreground truncate">
                    @{user.username}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
