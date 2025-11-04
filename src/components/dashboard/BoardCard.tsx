import Link from "next/link";

export function BoardCard({ id, title, color }: { id: string; title: string; color: string }) {
  return (
    <Link href={`/board/${id}`} className="rounded-lg bg-white shadow-sm p-4 border border-gray-100 hover:shadow transition">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-lg" style={{ background: color }} />
        <div>
          <div className="font-medium">{title}</div>
          <div className="text-sm text-gray-500">Progress: 0%</div>
        </div>
      </div>
    </Link>
  );
}















