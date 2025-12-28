import { headers } from "next/headers";
import Editor from "@/components/Editor";

export const dynamic = "force-dynamic";

export default async function NotePage({
  params,
}: {
  params: { id: string };
}) {
  const { id } = await params;

  const h = await headers();
  const cookie = h.get("cookie") ?? "";

  // 🔒 Get current origin dynamically (works locally + prod)
  const host = h.get("host");
  const protocol = process.env.NODE_ENV === "production" ? "https" : "http";
  const origin = `${protocol}://${host}`;

  const res = await fetch(`${origin}/notes/${id}`, {
    cache: "no-store",
    headers: {
      cookie,
    },
  });

  if (!res.ok) {
    throw new Error(`NOTE FETCH FAILED: ${res.status}`);
  }

  const note = await res.json();

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-4">{note.title}</h1>

      <Editor
        key={note.id} // 🔒 critical
        noteId={note.id}
        initialContent={note.content}
      />
    </div>
  );
}
