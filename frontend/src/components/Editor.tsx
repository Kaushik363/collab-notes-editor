"use client";

import { useEffect, useRef, useState } from "react";
import { socket } from "@/lib/socket";

const SOCKET_DEBOUNCE_MS = 200;
const AUTOSAVE_INTERVAL_MS = 5000;

export default function Editor({
  noteId,
  initialContent,
}: {
  noteId: string;
  initialContent: string;
}) {
  const [content, setContent] = useState(initialContent);

  const hasJoined = useRef(false);
  const emitTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isApplyingRemoteUpdate = useRef(false);

  // ===============================
  // SOCKET SETUP
  // ===============================
  useEffect(() => {
    if (!socket.connected) socket.connect();

    if (!hasJoined.current) {
      socket.emit("join-note", noteId);
      hasJoined.current = true;
    }

    socket.on("note-update", (payload: any) => {
      const nextContent =
        typeof payload === "string"
          ? payload
          : payload?.content;

      if (typeof nextContent !== "string") return;

      isApplyingRemoteUpdate.current = true;
      setContent(nextContent);
    });

    return () => {
      socket.off("note-update");
    };
  }, [noteId]);

  // ===============================
  // DEBOUNCED SOCKET EMIT
  // ===============================
  useEffect(() => {
    if (!socket.connected) return;

    if (isApplyingRemoteUpdate.current) {
      isApplyingRemoteUpdate.current = false;
      return;
    }

    if (emitTimeoutRef.current) {
      clearTimeout(emitTimeoutRef.current);
    }

    emitTimeoutRef.current = setTimeout(() => {
      socket.emit("note-update", { noteId, content });
    }, SOCKET_DEBOUNCE_MS);

    return () => {
      if (emitTimeoutRef.current) {
        clearTimeout(emitTimeoutRef.current);
      }
    };
  }, [content, noteId]);

  // ===============================
  // AUTOSAVE (SIMPLE & SAFE)
  // ===============================
  useEffect(() => {
    if (!noteId) return;

    const interval = setInterval(() => {
      fetch(`/notes/${noteId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ content }),
      });
    }, AUTOSAVE_INTERVAL_MS);

    return () => clearInterval(interval);
  }, [noteId, content]);

  function handleChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    setContent(e.target.value);
  }

  return (
    <textarea
      className="w-full h-[75vh] border rounded p-4"
      value={content}
      onChange={handleChange}
    />
  );
}
