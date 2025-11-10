import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';

// Types
export interface Task {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  due_date?: string; // ISO date string
  due_time?: string; // HH:MM format
  reminder_enabled: boolean;
  reminder_minutes_before: number;
  completed: boolean;
  completed_at?: string;
  priority: 'low' | 'medium' | 'high';
  category?: string;
  created_at: string;
  updated_at: string;
}

interface TasksState {
  tasks: Task[];
  currentTask: Task | null;
  isLoading: boolean;
  error: string | null;
  filter: 'all' | 'today' | 'upcoming' | 'completed';
}

interface CreateTaskData {
  title: string;
  description?: string;
  due_date?: string;
  due_time?: string;
  reminder_enabled?: boolean;
  reminder_minutes_before?: number;
  priority?: 'low' | 'medium' | 'high';
  category?: string;
}

interface UpdateTaskData {
  id: string;
  title?: string;
  description?: string;
  due_date?: string;
  due_time?: string;
  reminder_enabled?: boolean;
  reminder_minutes_before?: number;
  completed?: boolean;
  priority?: 'low' | 'medium' | 'high';
  category?: string;
}

// Initial state
const initialState: TasksState = {
  tasks: [],
  currentTask: null,
  isLoading: false,
  error: null,
  filter: 'all',
};

/**
 * Fetch all tasks
 */
export const fetchTasks = createAsyncThunk(
  'tasks/fetchTasks',
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch('/api/tasks');
      const result = await response.json();

      if (!response.ok) {
        return rejectWithValue(result.error || 'Failed to fetch tasks');
      }

      return result.tasks;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Network error');
    }
  }
);

/**
 * Fetch single task by ID
 */
export const fetchTaskById = createAsyncThunk(
  'tasks/fetchTaskById',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await fetch(`/api/tasks/${id}`);
      const result = await response.json();

      if (!response.ok) {
        return rejectWithValue(result.error || 'Failed to fetch task');
      }

      return result.task;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Network error');
    }
  }
);

/**
 * Create new task
 */
export const createTask = createAsyncThunk(
  'tasks/createTask',
  async (data: CreateTaskData, { rejectWithValue }) => {
    try {
      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        return rejectWithValue(result.error || 'Failed to create task');
      }

      return result.task;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Network error');
    }
  }
);

/**
 * Update task
 */
export const updateTask = createAsyncThunk(
  'tasks/updateTask',
  async (data: UpdateTaskData, { rejectWithValue }) => {
    try {
      const { id, ...updateData } = data;
      const response = await fetch(`/api/tasks/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData),
      });

      const result = await response.json();

      if (!response.ok) {
        return rejectWithValue(result.error || 'Failed to update task');
      }

      return result.task;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Network error');
    }
  }
);

/**
 * Delete task
 */
export const deleteTask = createAsyncThunk(
  'tasks/deleteTask',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await fetch(`/api/tasks/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const result = await response.json();
        return rejectWithValue(result.error || 'Failed to delete task');
      }

      return id;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Network error');
    }
  }
);

/**
 * Toggle task completion
 */
export const toggleTaskCompletion = createAsyncThunk(
  'tasks/toggleTaskCompletion',
  async (task: Task, { rejectWithValue }) => {
    try {
      const response = await fetch(`/api/tasks/${task.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          completed: !task.completed,
          completed_at: !task.completed ? new Date().toISOString() : null,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        return rejectWithValue(result.error || 'Failed to toggle task');
      }

      return result.task;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Network error');
    }
  }
);

/**
 * Tasks slice
 */
const tasksSlice = createSlice({
  name: 'tasks',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setCurrentTask: (state, action: PayloadAction<Task | null>) => {
      state.currentTask = action.payload;
    },
    clearCurrentTask: (state) => {
      state.currentTask = null;
    },
    setFilter: (state, action: PayloadAction<'all' | 'today' | 'upcoming' | 'completed'>) => {
      state.filter = action.payload;
    },
  },
  extraReducers: (builder) => {
    // Fetch all tasks
    builder
      .addCase(fetchTasks.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchTasks.fulfilled, (state, action) => {
        state.isLoading = false;
        state.tasks = action.payload;
      })
      .addCase(fetchTasks.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Fetch single task
    builder
      .addCase(fetchTaskById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchTaskById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentTask = action.payload;
      })
      .addCase(fetchTaskById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Create task
    builder
      .addCase(createTask.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createTask.fulfilled, (state, action) => {
        state.isLoading = false;
        state.tasks.unshift(action.payload);
        state.currentTask = action.payload;
      })
      .addCase(createTask.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Update task
    builder
      .addCase(updateTask.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateTask.fulfilled, (state, action) => {
        state.isLoading = false;
        const index = state.tasks.findIndex((t) => t.id === action.payload.id);
        if (index !== -1) {
          state.tasks[index] = action.payload;
        }
        if (state.currentTask?.id === action.payload.id) {
          state.currentTask = action.payload;
        }
      })
      .addCase(updateTask.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Delete task
    builder
      .addCase(deleteTask.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteTask.fulfilled, (state, action) => {
        state.isLoading = false;
        state.tasks = state.tasks.filter((t) => t.id !== action.payload);
        if (state.currentTask?.id === action.payload) {
          state.currentTask = null;
        }
      })
      .addCase(deleteTask.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Toggle task completion
    builder
      .addCase(toggleTaskCompletion.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(toggleTaskCompletion.fulfilled, (state, action) => {
        state.isLoading = false;
        const index = state.tasks.findIndex((t) => t.id === action.payload.id);
        if (index !== -1) {
          state.tasks[index] = action.payload;
        }
        if (state.currentTask?.id === action.payload.id) {
          state.currentTask = action.payload;
        }
      })
      .addCase(toggleTaskCompletion.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError, setCurrentTask, clearCurrentTask, setFilter } = tasksSlice.actions;
export default tasksSlice.reducer;
