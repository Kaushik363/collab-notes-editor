import { cookies } from "next/headers";
import Editor from "@/components/Editor";

export const dynamic = "force-dynamic";

export default async function NotePage({
  params,
}: {
  params: { id: string };
}) {
  const { id } = await params;

  const cookieStore = await cookies();
  const cookieHeader = cookieStore.toString();

  const res = await fetch(`${process.env.API_URL}/notes/${id}`, {
    cache: "no-store",
    headers: {
      Cookie: cookieHeader, // ✅ THIS FIXES 401
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
        key={note.id}
        noteId={note.id}
        initialContent={note.content}
      />
    </div>
  );
}
