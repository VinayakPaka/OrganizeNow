"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchBoards, createBoard, deleteBoard } from "@/store/slices/boardsSlice";
import { Plus, Trash2, Loader2, Bell, Settings, Search } from "lucide-react";

export default function WhiteboardsPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { boards, isLoading } = useAppSelector((state) => state.boards);
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);

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
      const result = await dispatch(deleteBoard(id));

      if (deleteBoard.fulfilled.match(result)) {
        console.log('[Whiteboards] Board deleted successfully');
      } else {
        console.error('[Whiteboards] Board deletion failed:', result);
        alert('Failed to delete board. Please try again.');
      }
    } catch (error) {
      console.error('[Whiteboards] Error deleting board:', error);
      alert('An error occurred while deleting the board.');
    } finally {
      setDeletingId(null);
    }
  }

  function handleOpenBoard(id: string) {
    router.push(`/board/${id}`);
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-gray-200 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Top Header Bar */}
      <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-8 py-4">
          <div className="flex items-center justify-between">
            {/* Welcome Message */}
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center">
                <span className="text-white text-xl">📋</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">Whiteboards</h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">{boards.length} boards total</p>
              </div>
            </div>

            {/* Search and Actions */}
            <div className="flex items-center gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="text"
                  placeholder="Search"
                  className="pl-10 pr-4 py-2 bg-gray-100 dark:bg-gray-700 border-0 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-64 text-gray-900 dark:text-gray-100 placeholder-gray-500"
                />
              </div>
              <button className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-600 transition">
                <Bell size={18} className="text-gray-600 dark:text-gray-300" />
              </button>
              <button className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-600 transition">
                <Settings size={18} className="text-gray-600 dark:text-gray-300" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">My Boards</h2>
            <p className="text-gray-600 dark:text-gray-400">Organize your tasks and ideas visually</p>
          </div>
          <button
            onClick={() => setShowCreate(true)}
            className="flex items-center gap-2 rounded-2xl bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white px-6 py-3 font-medium shadow-lg transition-all"
          >
            <Plus size={20} />
            Create Board
          </button>
        </div>

        {/* Create Board Modal */}
        {showCreate && (
          <div className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-50" onClick={() => setShowCreate(false)}>
            <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 w-full max-w-md shadow-2xl border border-gray-100 dark:border-gray-700" onClick={(e) => e.stopPropagation()}>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Create New Board</h2>
              <form onSubmit={handleCreate} className="space-y-4">
                <input
                  autoFocus
                  type="text"
                  placeholder="Board title..."
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-2xl outline-none focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
                />
                <div className="flex gap-3 justify-end pt-2">
                  <button
                    type="button"
                    onClick={() => setShowCreate(false)}
                    className="px-6 py-2.5 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-2xl transition-colors font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading || !newTitle.trim()}
                    className="px-6 py-2.5 bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white rounded-2xl disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg font-medium"
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

        {/* Boards Grid */}
        {!isLoading && sortedBoards.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {sortedBoards.map((board) => (
              <div
                key={board.id}
                onClick={() => handleOpenBoard(board.id)}
                className="group relative aspect-square rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer overflow-hidden border border-white/20 hover:scale-105"
                style={{ background: board.color || "linear-gradient(135deg, #667eea 0%, #764ba2 100%)" }}
              >
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/20 to-transparent"></div>
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <h3 className="text-2xl font-bold text-white drop-shadow-lg">{board.title}</h3>
                  <p className="text-white/80 text-sm mt-1">Click to open</p>
                </div>
                <button
                  onClick={(e) => handleDelete(board.id, e)}
                  disabled={deletingId === board.id}
                  className="absolute top-4 right-4 p-2.5 bg-white/20 backdrop-blur-md rounded-2xl opacity-0 group-hover:opacity-100 transition-all hover:bg-red-500/90 hover:scale-110 disabled:opacity-100 disabled:cursor-not-allowed shadow-lg"
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
            <div className="w-32 h-32 rounded-full bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/20 dark:to-pink-900/20 flex items-center justify-center mx-auto mb-6">
              <span className="text-6xl">📋</span>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">No boards yet</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-8">Create your first board to get started!</p>
            <button
              onClick={() => setShowCreate(true)}
              className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white px-8 py-3 font-medium shadow-lg transition-all"
            >
              <Plus size={20} />
              Create Your First Board
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
