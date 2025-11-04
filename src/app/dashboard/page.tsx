"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchBoards, createBoard, deleteBoard } from "@/store/slices/boardsSlice";
import { Plus, Trash2, Loader2 } from "lucide-react";

export default function DashboardPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { boards, isLoading } = useAppSelector((state) => state.boards);
  const { isAuthenticated } = useAppSelector((state) => state.auth);

  const [showCreate, setShowCreate] = useState(false);
  const [newTitle, setNewTitle] = useState("");

  // Fetch boards on mount
  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchBoards());
    }
  }, [dispatch, isAuthenticated]);

  // Sort boards alphabetically
  const sortedBoards = useMemo(() => {
    return [...boards].sort((a, b) => a.title.localeCompare(b.title));
  }, [boards]);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!newTitle.trim()) return;

    try {
      const colors = [
        "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
        "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
        "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)",
        "linear-gradient(135deg, #fa709a 0%, #fee140 100%)",
        "linear-gradient(135deg, #30cfd0 0%, #330867 100%)",
      ];
      const randomColor = colors[Math.floor(Math.random() * colors.length)];

      const result = await dispatch(createBoard({
        title: newTitle,
        color: randomColor
      }));

      if (createBoard.fulfilled.match(result)) {
        setNewTitle("");
        setShowCreate(false);
      } else if (createBoard.rejected.match(result)) {
        const errorMessage = result.payload as string || 'Failed to create board';
        console.error('Failed to create board:', errorMessage);
        alert(`Failed to create board: ${errorMessage}`);
      }
    } catch (error) {
      console.error('Error creating board:', error);
      alert('An error occurred while creating the board.');
    }
  }

  async function handleDelete(id: string, e: React.MouseEvent) {
    e.stopPropagation();
    if (!confirm("Are you sure you want to delete this board?")) return;
    await dispatch(deleteBoard(id));
  }

  function handleOpenBoard(id: string) {
    router.push(`/board/${id}`);
  }

  // Show boards grid
  return (
    <div className="space-y-6">
      {/* Header with Create Button */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Boards</h1>
          <p className="text-gray-500 mt-1">Organize your tasks and ideas visually</p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-purple-500 to-violet-600 text-white px-6 py-3 font-medium shadow-lg hover:shadow-xl transition-all hover:scale-105"
        >
          <Plus size={20} />
          Create Board
        </button>
      </div>

      {/* Create Board Modal */}
      {showCreate && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowCreate(false)}>
          <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-xl font-bold mb-4">Create New Board</h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <input
                autoFocus
                type="text"
                placeholder="Board title..."
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-purple-500"
              />
              <div className="flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => setShowCreate(false)}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading || !newTitle.trim()}
                  className="px-6 py-2 bg-gradient-to-r from-purple-500 to-violet-600 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? "Creating..." : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Loading State */}
      {isLoading && boards.length === 0 && (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="animate-spin text-purple-600" size={48} />
        </div>
      )}

      {/* Boards Grid - Sorted Alphabetically */}
      {!isLoading && sortedBoards.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {sortedBoards.map((board) => (
            <div
              key={board.id}
              onClick={() => handleOpenBoard(board.id)}
              className="group relative aspect-square rounded-2xl shadow-md hover:shadow-xl transition-all cursor-pointer overflow-hidden border border-gray-100 hover:scale-105"
              style={{ background: board.color || "linear-gradient(135deg, #667eea 0%, #764ba2 100%)" }}
            >
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
              <div className="absolute bottom-0 left-0 right-0 p-6">
                <h3 className="text-xl font-bold text-white drop-shadow-lg">{board.title}</h3>
              </div>
              <button
                onClick={(e) => handleDelete(board.id, e)}
                className="absolute top-4 right-4 p-2 bg-white/20 backdrop-blur-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500/80"
              >
                <Trash2 size={18} className="text-white" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && sortedBoards.length === 0 && (
        <div className="text-center py-20">
          <div className="text-gray-400 text-6xl mb-4">📋</div>
          <h3 className="text-xl font-semibold text-gray-600 mb-2">No boards yet</h3>
          <p className="text-gray-500 mb-6">Create your first board to get started!</p>
          <button
            onClick={() => setShowCreate(true)}
            className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-purple-500 to-violet-600 text-white px-6 py-3 font-medium"
          >
            <Plus size={20} />
            Create Your First Board
          </button>
        </div>
      )}
    </div>
  );
}


