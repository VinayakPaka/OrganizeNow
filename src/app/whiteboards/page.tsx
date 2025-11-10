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
  const [deletingId, setDeletingId] = useState<string | null>(null);

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
    if (!confirm("Are you sure you want to delete this board and all its content?")) return;

    try {
      setDeletingId(id);
      console.log(`[Dashboard] Starting deletion of board ${id}...`);
      const result = await dispatch(deleteBoard(id));

      if (deleteBoard.fulfilled.match(result)) {
        console.log('[Dashboard] Board deleted successfully');
      } else {
        console.error('[Dashboard] Board deletion failed:', result);
        alert('Failed to delete board. Please try again.');
      }
    } catch (error) {
      console.error('[Dashboard] Error deleting board:', error);
      alert('An error occurred while deleting the board.');
    } finally {
      setDeletingId(null);
    }
  }

  function handleOpenBoard(id: string) {
    router.push(`/board/${id}`);
  }

  // Show boards grid
  return (
    <div className="flex flex-col h-full bg-gray-50 dark:bg-gray-900">
      {/* Header with Create Button */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-8 py-6">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-2">My Boards</h1>
            <p className="text-gray-600 dark:text-gray-400 text-lg">Organize your tasks and ideas visually</p>
          </div>
          <button
            onClick={() => setShowCreate(true)}
            className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-purple-500 to-violet-600 text-white px-6 py-3 font-medium shadow-lg hover:shadow-xl transition-all hover:scale-105"
          >
            <Plus size={20} />
            Create Board
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-7xl mx-auto">
      {/* Create Board Modal */}
      {showCreate && (
        <div className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-50" onClick={() => setShowCreate(false)}>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-md shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">Create New Board</h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <input
                autoFocus
                type="text"
                placeholder="Board title..."
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-lg outline-none focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
              />
              <div className="flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => setShowCreate(false)}
                  className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
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
          <Loader2 className="animate-spin text-purple-600 dark:text-purple-400" size={48} />
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
                disabled={deletingId === board.id}
                className="absolute top-4 right-4 p-2 bg-white/20 backdrop-blur-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500/80 disabled:opacity-100 disabled:cursor-not-allowed"
              >
                {deletingId === board.id ? (
                  <Loader2 size={18} className="text-white animate-spin" />
                ) : (
                  <Trash2 size={18} className="text-white" />
                )}
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && sortedBoards.length === 0 && (
        <div className="text-center py-20">
          <div className="text-gray-400 dark:text-gray-600 text-6xl mb-4">📋</div>
          <h3 className="text-xl font-semibold text-gray-600 dark:text-gray-300 mb-2">No boards yet</h3>
          <p className="text-gray-500 dark:text-gray-400 mb-6">Create your first board to get started!</p>
          <button
            onClick={() => setShowCreate(true)}
            className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-purple-500 to-violet-600 text-white px-6 py-3 font-medium shadow-lg hover:shadow-xl transition-all hover:scale-105"
          >
            <Plus size={20} />
            Create Your First Board
          </button>
        </div>
      )}
        </div>
      </div>
    </div>
  );
}


