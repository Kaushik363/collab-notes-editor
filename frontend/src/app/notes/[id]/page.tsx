import Editor from "@/components/Editor";

type PageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function NotePage({ params }: PageProps) {
  const { id } = await params;

  const API_URL = process.env.NEXT_PUBLIC_API_URL;
const TOKEN = process.env.NEXT_PUBLIC_TEST_TOKEN;

  if (!API_URL || !TOKEN) {
    return <div>Server configuration error</div>;
  }

  const res = await fetch(`${API_URL}/notes/${id}`, {
    cache: "no-store",
    headers: {
      Authorization: `Bearer ${TOKEN}`,
    },
  });

  if (!res.ok) {
    return <div>Failed to load note</div>;
  }

  const note = await res.json();

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-4">{note.title}</h1>
      <Editor noteId={note.id} initialContent={note.content} />
    </div>
  );
}
