"use client";

import { useEffect, useState } from "react";
import { socket } from "@/lib/socket";

export type EditorProps = {
  noteId: string;
  initialContent: string;
};

export default function Editor({ noteId, initialContent }: EditorProps) {
  const [content, setContent] = useState(initialContent);
  const [presenceMsg, setPresenceMsg] = useState<string | null>(null);

  useEffect(() => {
    socket.connect();
    socket.emit("join-note", noteId);

    // update
    socket.on("note-update", (newContent: string) => {
      setContent(newContent);
    });

    // Presence
    socket.on("presence", (msg: string) => {
      setPresenceMsg(msg);
      setTimeout(() => setPresenceMsg(null), 2000);
    });

    return () => {
      socket.off("note-update");
      socket.off("presence");
      socket.disconnect();
    };
  }, [noteId]);

  function handleChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    const value = e.target.value;
    setContent(value);

    socket.emit("note-update", {
      noteId,
      content: value,
    });
  }

  return (
    <div>
      {presenceMsg && (
        <div className="mb-2 text-sm text-green-600">
          {presenceMsg}
        </div>
      )}

      <textarea
        className="w-full h-[75vh] border rounded p-4 text-sm"
        value={content}
        onChange={handleChange}
      />
    </div>
  );
}
