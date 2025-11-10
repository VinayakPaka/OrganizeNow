import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';

// Types
export interface Password {
  id: string;
  user_id: string;
  service_name: string;
  username: string;
  password?: string; // Only included when fetching individual password
  url?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

interface PasswordsState {
  passwords: Password[];
  currentPassword: Password | null;
  isLoading: boolean;
  error: string | null;
}

export interface CreatePasswordData {
  service_name: string;
  username: string;
  password: string;
  url?: string;
  notes?: string;
}

export interface UpdatePasswordData {
  id: string;
  service_name?: string;
  username?: string;
  password?: string;
  url?: string;
  notes?: string;
}

// Initial state
const initialState: PasswordsState = {
  passwords: [],
  currentPassword: null,
  isLoading: false,
  error: null,
};

/**
 * Fetch all passwords (without decrypted passwords)
 */
export const fetchPasswords = createAsyncThunk(
  'passwords/fetchPasswords',
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch('/api/passwords');
      const result = await response.json();

      if (!response.ok) {
        return rejectWithValue(result.error || 'Failed to fetch passwords');
      }

      return result.passwords;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Network error');
    }
  }
);

/**
 * Fetch single password by ID (with decrypted password)
 */
export const fetchPasswordById = createAsyncThunk(
  'passwords/fetchPasswordById',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await fetch(`/api/passwords/${id}`);
      const result = await response.json();

      if (!response.ok) {
        return rejectWithValue(result.error || 'Failed to fetch password');
      }

      return result.password;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Network error');
    }
  }
);

/**
 * Create new password
 */
export const createPassword = createAsyncThunk(
  'passwords/createPassword',
  async (data: CreatePasswordData, { rejectWithValue }) => {
    try {
      const response = await fetch('/api/passwords', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        return rejectWithValue(result.error || 'Failed to create password');
      }

      return result.password;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Network error');
    }
  }
);

/**
 * Update password
 */
export const updatePassword = createAsyncThunk(
  'passwords/updatePassword',
  async (data: UpdatePasswordData, { rejectWithValue }) => {
    try {
      const { id, ...updateData } = data;
      const response = await fetch(`/api/passwords/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData),
      });

      const result = await response.json();

      if (!response.ok) {
        return rejectWithValue(result.error || 'Failed to update password');
      }

      return result.password;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Network error');
    }
  }
);

/**
 * Delete password
 */
export const deletePassword = createAsyncThunk(
  'passwords/deletePassword',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await fetch(`/api/passwords/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const result = await response.json();
        return rejectWithValue(result.error || 'Failed to delete password');
      }

      return id;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Network error');
    }
  }
);

/**
 * Search passwords
 */
export const searchPasswords = createAsyncThunk(
  'passwords/searchPasswords',
  async (query: string, { rejectWithValue }) => {
    try {
      const response = await fetch(`/api/passwords/search?q=${encodeURIComponent(query)}`);
      const result = await response.json();

      if (!response.ok) {
        return rejectWithValue(result.error || 'Failed to search passwords');
      }

      return result.passwords;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Network error');
    }
  }
);

/**
 * Passwords slice
 */
const passwordsSlice = createSlice({
  name: 'passwords',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setCurrentPassword: (state, action: PayloadAction<Password | null>) => {
      state.currentPassword = action.payload;
    },
    clearCurrentPassword: (state) => {
      state.currentPassword = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch all passwords
    builder
      .addCase(fetchPasswords.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchPasswords.fulfilled, (state, action) => {
        state.isLoading = false;
        state.passwords = action.payload;
      })
      .addCase(fetchPasswords.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Fetch single password
    builder
      .addCase(fetchPasswordById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchPasswordById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentPassword = action.payload;
      })
      .addCase(fetchPasswordById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Create password
    builder
      .addCase(createPassword.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createPassword.fulfilled, (state, action) => {
        state.isLoading = false;
        state.passwords.unshift(action.payload);
      })
      .addCase(createPassword.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Update password
    builder
      .addCase(updatePassword.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updatePassword.fulfilled, (state, action) => {
        state.isLoading = false;
        const index = state.passwords.findIndex((p) => p.id === action.payload.id);
        if (index !== -1) {
          state.passwords[index] = action.payload;
        }
        if (state.currentPassword?.id === action.payload.id) {
          state.currentPassword = action.payload;
        }
      })
      .addCase(updatePassword.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Delete password
    builder
      .addCase(deletePassword.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deletePassword.fulfilled, (state, action) => {
        state.isLoading = false;
        state.passwords = state.passwords.filter((p) => p.id !== action.payload);
        if (state.currentPassword?.id === action.payload) {
          state.currentPassword = null;
        }
      })
      .addCase(deletePassword.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Search passwords
    builder
      .addCase(searchPasswords.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(searchPasswords.fulfilled, (state, action) => {
        state.isLoading = false;
        state.passwords = action.payload;
      })
      .addCase(searchPasswords.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError, setCurrentPassword, clearCurrentPassword } = passwordsSlice.actions;
export default passwordsSlice.reducer;
