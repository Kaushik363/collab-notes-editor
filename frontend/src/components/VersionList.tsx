"use client";

import { useEffect, useState } from "react";

export default function VersionList({ noteId }: { noteId: string }) {
  const [versions, setVersions] = useState<any[]>([]);

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/versions/${noteId}`, {
      headers: {
        Authorization: `Bearer ${process.env.DUMMY_TOKEN}`,
      },
    })
      .then(res => res.json())
      .then(setVersions);
  }, [noteId]);

  return (
    <div className="w-64 border-l p-3 text-sm">
      <h3 className="font-semibold mb-2">History</h3>
      {versions.map(v => (
        <div key={v.id} className="mb-1 text-gray-600">
          {new Date(v.createdAt).toLocaleTimeString()}
        </div>
      ))}
    </div>
  );
}
