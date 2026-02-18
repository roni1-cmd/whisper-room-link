import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { EmojiPickerComponent } from "@/components/EmojiPicker";
import { LinkPreview } from "@/components/LinkPreview";

interface Message {
  id: string;
  text: string;
  username: string;
  timestamp: number;
  reactions?: { [emoji: string]: string[] };
  replyTo?: { id: string; text: string; username: string };
  edited?: boolean;
  fileUrl?: string;
  fileName?: string;
  fileType?: string;
  pinned?: boolean;
}

interface MessageBubbleProps {
  message: Message;
  isOwn: boolean;
  currentUsername: string;
  onReact: (messageId: string, emoji: string) => void;
  onEdit: (messageId: string) => void;
  onDelete: (messageId: string) => void;
  onReply: (message: Message) => void;
  onPin?: (messageId: string) => void;
}

const QUICK_REACTIONS = ["❤️", "👍", "😂", "😮", "😢", "🙏"];

export const MessageBubble = ({
  message,
  isOwn,
  currentUsername,
  onReact,
  onEdit,
  onDelete,
  onReply,
  onPin,
}: MessageBubbleProps) => {
  const [showActions, setShowActions] = useState(false);
  const [pinActions, setPinActions] = useState(false);

  const reactions = message.reactions || {};
  const reactionEntries = Object.entries(reactions).filter(([_, users]) => users.length > 0);

  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const urls = message.text.match(urlRegex) || [];
  const textWithoutUrls = message.text.replace(urlRegex, "").trim();

  const handleReaction = (emoji: string) => onReact(message.id, emoji);

  const timeStr = new Date(message.timestamp).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div
      className={`flex gap-2 group ${isOwn ? "flex-row-reverse" : "flex-row"}`}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      {/* Avatar */}
      <div className="flex-shrink-0 self-end">
        <img
          src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${message.username}`}
          alt={message.username}
          className="w-8 h-8 rounded-full"
          style={{ boxShadow: "var(--md-shadow-1)" }}
        />
      </div>

      {/* Message Content */}
      <div className={`flex flex-col max-w-[70%] ${isOwn ? "items-end" : "items-start"}`}>
        {/* Username */}
        {!isOwn && (
          <span className="text-xs font-medium text-muted-foreground mb-1 px-1">
            {message.username}
          </span>
        )}

        {/* Reply Preview */}
        {message.replyTo && (
          <div
            className={`text-xs px-3 py-1.5 mb-1 rounded border-l-4 bg-secondary ${
              isOwn ? "border-primary/60" : "border-muted-foreground/40"
            }`}
          >
            <div className="font-medium text-muted-foreground">{message.replyTo.username}</div>
            <div className="text-muted-foreground truncate">{message.replyTo.text}</div>
          </div>
        )}

        {/* MD2 Message bubble */}
        <div className="relative">
          <div
            className={`px-3 py-2 rounded-2xl text-sm ${
              isOwn
                ? "bg-primary text-primary-foreground rounded-br-sm"
                : "bg-card text-foreground rounded-bl-sm"
            }`}
            style={{
              boxShadow: isOwn
                ? "0 1px 2px hsla(0,0%,0%,0.20)"
                : "var(--md-shadow-1)",
            }}
          >
            {/* File Attachment */}
            {message.fileUrl && (
              <div className="mb-2">
                {message.fileType?.startsWith("image/") ? (
                  <img
                    src={message.fileUrl}
                    alt={message.fileName}
                    className="max-w-full max-h-60 rounded-xl"
                  />
                ) : message.fileType?.startsWith("video/") ? (
                  <video
                    src={message.fileUrl}
                    controls
                    className="max-w-full max-h-60 rounded-xl"
                  />
                ) : message.fileType?.startsWith("audio/") ? (
                  <audio src={message.fileUrl} controls className="w-full" />
                ) : (
                  <a
                    href={message.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 p-2 bg-black/10 rounded-lg hover:bg-black/20"
                  >
                    <span className="material-icons text-sm">insert_drive_file</span>
                    <span className="text-sm truncate">{message.fileName}</span>
                  </a>
                )}
              </div>
            )}

            {textWithoutUrls && (
              <p className="break-words whitespace-pre-wrap leading-relaxed">
                {textWithoutUrls}
                {message.edited && (
                  <span className="text-xs opacity-60 ml-2 italic">(edited)</span>
                )}
              </p>
            )}

            {urls.map((url, idx) => (
              <div key={idx} className="mt-1">
                <a
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs underline break-all block mb-1 opacity-80"
                >
                  {url}
                </a>
                <LinkPreview url={url} />
              </div>
            ))}

            {/* Timestamp */}
            <p className={`text-xs mt-1 ${isOwn ? "text-primary-foreground/60 text-right" : "text-muted-foreground"}`}>
              {timeStr}
              {message.pinned && (
                <span className="material-icons ml-1 text-xs" style={{ fontSize: "12px", verticalAlign: "middle" }}>
                  push_pin
                </span>
              )}
            </p>
          </div>

          {/* Quick Actions — appear on hover */}
          {(showActions || pinActions) && (
            <div
              className={`absolute -top-1 flex gap-0.5 ${
                isOwn ? "right-full mr-1" : "left-full ml-1"
              }`}
            >
              {/* Emoji */}
              <Popover onOpenChange={(open) => setPinActions(open)}>
                <PopoverTrigger asChild>
                  <button
                    className="md-ripple h-7 w-7 rounded-full bg-card flex items-center justify-center text-muted-foreground hover:text-foreground"
                    style={{ boxShadow: "var(--md-shadow-2)" }}
                  >
                    <span className="material-icons" style={{ fontSize: "16px" }}>add_reaction</span>
                  </button>
                </PopoverTrigger>
                <PopoverContent className="z-50 bg-popover rounded-full w-auto p-1.5 border" style={{ boxShadow: "var(--md-shadow-3)" }}>
                  <div className="flex gap-0.5 items-center">
                    {QUICK_REACTIONS.map((emoji) => (
                      <button
                        key={emoji}
                        className="md-ripple h-8 w-8 rounded-full flex items-center justify-center text-lg hover:bg-secondary transition-colors"
                        onClick={() => handleReaction(emoji)}
                      >
                        {emoji}
                      </button>
                    ))}
                    <div className="w-px h-6 bg-border mx-0.5" />
                    <EmojiPickerComponent onEmojiClick={(emoji) => handleReaction(emoji)} />
                  </div>
                </PopoverContent>
              </Popover>

              {/* More options */}
              <DropdownMenu onOpenChange={(open) => setPinActions(open)}>
                <DropdownMenuTrigger asChild>
                  <button
                    className="md-ripple h-7 w-7 rounded-full bg-card flex items-center justify-center text-muted-foreground hover:text-foreground"
                    style={{ boxShadow: "var(--md-shadow-2)" }}
                  >
                    <span className="material-icons" style={{ fontSize: "16px" }}>more_vert</span>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  className="rounded-lg border bg-popover"
                  style={{ boxShadow: "var(--md-shadow-3)" }}
                  align={isOwn ? "end" : "start"}
                >
                  <DropdownMenuItem className="md-ripple cursor-pointer" onClick={() => onReply(message)}>
                    <span className="material-icons text-sm mr-2">reply</span> Reply
                  </DropdownMenuItem>
                  {onPin && (
                    <DropdownMenuItem className="md-ripple cursor-pointer" onClick={() => onPin(message.id)}>
                      <span className="material-icons text-sm mr-2">push_pin</span>
                      {message.pinned ? "Unpin" : "Pin"}
                    </DropdownMenuItem>
                  )}
                  {isOwn && (
                    <>
                      <DropdownMenuItem className="md-ripple cursor-pointer" onClick={() => onEdit(message.id)}>
                        <span className="material-icons text-sm mr-2">edit</span> Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="md-ripple cursor-pointer text-destructive"
                        onClick={() => onDelete(message.id)}
                      >
                        <span className="material-icons text-sm mr-2">delete</span> Unsend
                      </DropdownMenuItem>
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}
        </div>

        {/* Reaction chips */}
        {reactionEntries.length > 0 && (
          <div className="flex gap-1 mt-1 flex-wrap">
            {reactionEntries.map(([emoji, users]) => {
              const hasReacted = users.includes(currentUsername);
              return (
                <button
                  key={emoji}
                  onClick={() => handleReaction(emoji)}
                  className={`md-ripple text-xs px-2 py-0.5 rounded-full border transition-all ${
                    hasReacted
                      ? "bg-primary/15 border-primary text-primary font-medium"
                      : "bg-card border-border hover:bg-secondary"
                  }`}
                  style={{ boxShadow: "var(--md-shadow-1)" }}
                >
                  {emoji} {users.length}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
