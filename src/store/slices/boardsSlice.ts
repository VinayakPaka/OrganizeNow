import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';

// Types
export interface Board {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  color?: string;
  icon?: string;
  position?: number;
  is_archived: boolean;
  created_at: string;
  updated_at: string;
}

export interface ContentBlock {
  id: string;
  user_id: string;
  board_id: string;
  parent_id?: string;
  content_type: 'text' | 'image' | 'shape' | 'grid';
  content: Record<string, any>;
  position_x: number;
  position_y: number;
  position_index: number;
  is_done: boolean;
  is_collapsed: boolean;
  created_at: string;
  updated_at: string;
}

interface BoardsState {
  boards: Board[];
  currentBoard: Board | null;
  currentBlocks: ContentBlock[];
  isLoading: boolean;
  error: string | null;
}

interface CreateBoardData {
  title: string;
  description?: string;
  color?: string;
  icon?: string;
}

interface UpdateBoardData {
  id: string;
  title?: string;
  description?: string;
  color?: string;
  icon?: string;
}

interface CreateBlockData {
  board_id: string;
  content_type: 'text' | 'image' | 'shape' | 'grid';
  content: Record<string, any>;
  position_x?: number;
  position_y?: number;
  position_index?: number;
}

// Initial state
const initialState: BoardsState = {
  boards: [],
  currentBoard: null,
  currentBlocks: [],
  isLoading: false,
  error: null,
};

/**
 * Fetch all boards
 */
export const fetchBoards = createAsyncThunk(
  'boards/fetchBoards',
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch('/api/boards', {
        credentials: 'include',
      });
      const result = await response.json();

      if (!response.ok) {
        return rejectWithValue(result.error || 'Failed to fetch boards');
      }

      return result.boards;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Network error');
    }
  }
);

/**
 * Fetch single board with blocks
 */
export const fetchBoardById = createAsyncThunk(
  'boards/fetchBoardById',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await fetch(`/api/boards/${id}`);
      const result = await response.json();

      if (!response.ok) {
        return rejectWithValue(result.error || 'Failed to fetch board');
      }

      return { board: result.board, blocks: result.blocks };
    } catch (error: any) {
      return rejectWithValue(error.message || 'Network error');
    }
  }
);

/**
 * Create new board
 */
export const createBoard = createAsyncThunk(
  'boards/createBoard',
  async (data: CreateBoardData, { rejectWithValue }) => {
    try {
      const response = await fetch('/api/boards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        return rejectWithValue(result.error || 'Failed to create board');
      }

      return result.board;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Network error');
    }
  }
);

/**
 * Update board
 */
export const updateBoard = createAsyncThunk(
  'boards/updateBoard',
  async (data: UpdateBoardData, { rejectWithValue }) => {
    try {
      const { id, ...updateData } = data;
      const response = await fetch(`/api/boards/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData),
      });

      const result = await response.json();

      if (!response.ok) {
        return rejectWithValue(result.error || 'Failed to update board');
      }

      return result.board;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Network error');
    }
  }
);

/**
 * Delete board
 */
export const deleteBoard = createAsyncThunk(
  'boards/deleteBoard',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await fetch(`/api/boards/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const result = await response.json();
        return rejectWithValue(result.error || 'Failed to delete board');
      }

      return id;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Network error');
    }
  }
);

/**
 * Create content block
 */
export const createBlock = createAsyncThunk(
  'boards/createBlock',
  async (data: CreateBlockData, { rejectWithValue }) => {
    try {
      const response = await fetch(`/api/boards/${data.board_id}/blocks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        return rejectWithValue(result.error || 'Failed to create block');
      }

      return result.block;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Network error');
    }
  }
);

/**
 * Update content block
 */
export const updateBlock = createAsyncThunk(
  'boards/updateBlock',
  async ({ boardId, blockId, data }: { boardId: string; blockId: string; data: Partial<ContentBlock> }, { rejectWithValue }) => {
    try {
      const response = await fetch(`/api/boards/${boardId}/blocks/${blockId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        return rejectWithValue(result.error || 'Failed to update block');
      }

      return result.block;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Network error');
    }
  }
);

/**
 * Delete content block
 */
export const deleteBlock = createAsyncThunk(
  'boards/deleteBlock',
  async ({ boardId, blockId }: { boardId: string; blockId: string }, { rejectWithValue }) => {
    try {
      const response = await fetch(`/api/boards/${boardId}/blocks/${blockId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const result = await response.json();
        return rejectWithValue(result.error || 'Failed to delete block');
      }

      return blockId;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Network error');
    }
  }
);

/**
 * Boards slice
 */
const boardsSlice = createSlice({
  name: 'boards',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setCurrentBoard: (state, action: PayloadAction<Board | null>) => {
      state.currentBoard = action.payload;
    },
    clearCurrentBoard: (state) => {
      state.currentBoard = null;
      state.currentBlocks = [];
    },
    updateBlockLocally: (state, action: PayloadAction<ContentBlock>) => {
      const index = state.currentBlocks.findIndex((b) => b.id === action.payload.id);
      if (index !== -1) {
        state.currentBlocks[index] = action.payload;
      }
    },
  },
  extraReducers: (builder) => {
    // Fetch all boards
    builder
      .addCase(fetchBoards.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchBoards.fulfilled, (state, action) => {
        state.isLoading = false;
        state.boards = action.payload;
      })
      .addCase(fetchBoards.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Fetch single board
    builder
      .addCase(fetchBoardById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchBoardById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentBoard = action.payload.board;
        state.currentBlocks = action.payload.blocks;
      })
      .addCase(fetchBoardById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Create board
    builder
      .addCase(createBoard.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createBoard.fulfilled, (state, action) => {
        state.isLoading = false;
        state.boards.unshift(action.payload);
      })
      .addCase(createBoard.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Update board
    builder
      .addCase(updateBoard.fulfilled, (state, action) => {
        const index = state.boards.findIndex((b) => b.id === action.payload.id);
        if (index !== -1) {
          state.boards[index] = action.payload;
        }
        if (state.currentBoard?.id === action.payload.id) {
          state.currentBoard = action.payload;
        }
      });

    // Delete board
    builder
      .addCase(deleteBoard.fulfilled, (state, action) => {
        state.boards = state.boards.filter((b) => b.id !== action.payload);
        if (state.currentBoard?.id === action.payload) {
          state.currentBoard = null;
          state.currentBlocks = [];
        }
      });

    // Create block
    builder
      .addCase(createBlock.fulfilled, (state, action) => {
        state.currentBlocks.push(action.payload);
      });

    // Update block
    builder
      .addCase(updateBlock.fulfilled, (state, action) => {
        const index = state.currentBlocks.findIndex((b) => b.id === action.payload.id);
        if (index !== -1) {
          state.currentBlocks[index] = action.payload;
        }
      });

    // Delete block
    builder
      .addCase(deleteBlock.fulfilled, (state, action) => {
        state.currentBlocks = state.currentBlocks.filter((b) => b.id !== action.payload);
      });
  },
});

export const { clearError, setCurrentBoard, clearCurrentBoard, updateBlockLocally } = boardsSlice.actions;
export default boardsSlice.reducer;
