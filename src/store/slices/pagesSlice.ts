import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';

// Types
export interface Page {
  id: string;
  user_id: string;
  title: string;
  content: string;
  icon?: string;
  is_archived: boolean;
  created_at: string;
  updated_at: string;
}

interface PagesState {
  pages: Page[];
  currentPage: Page | null;
  isLoading: boolean;
  error: string | null;
}

interface CreatePageData {
  title: string;
  content?: string;
  icon?: string;
  is_archived?: boolean;
}

interface UpdatePageData {
  id: string;
  title?: string;
  content?: string;
  icon?: string;
}

// Initial state
const initialState: PagesState = {
  pages: [],
  currentPage: null,
  isLoading: false,
  error: null,
};

/**
 * Fetch all pages
 */
export const fetchPages = createAsyncThunk(
  'pages/fetchPages',
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch('/api/pages');
      const result = await response.json();

      if (!response.ok) {
        return rejectWithValue(result.error || 'Failed to fetch pages');
      }

      return result.pages;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Network error');
    }
  }
);

/**
 * Fetch single page by ID
 */
export const fetchPageById = createAsyncThunk(
  'pages/fetchPageById',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await fetch(`/api/pages/${id}`);
      const result = await response.json();

      if (!response.ok) {
        return rejectWithValue(result.error || 'Failed to fetch page');
      }

      return result.page;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Network error');
    }
  }
);

/**
 * Create new page
 */
export const createPage = createAsyncThunk(
  'pages/createPage',
  async (data: CreatePageData, { rejectWithValue }) => {
    try {
      const response = await fetch('/api/pages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        return rejectWithValue(result.error || 'Failed to create page');
      }

      return result.page;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Network error');
    }
  }
);

/**
 * Update page
 */
export const updatePage = createAsyncThunk(
  'pages/updatePage',
  async (data: UpdatePageData, { rejectWithValue }) => {
    try {
      const { id, ...updateData } = data;
      const response = await fetch(`/api/pages/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData),
      });

      const result = await response.json();

      if (!response.ok) {
        return rejectWithValue(result.error || 'Failed to update page');
      }

      return result.page;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Network error');
    }
  }
);

/**
 * Delete page
 */
export const deletePage = createAsyncThunk(
  'pages/deletePage',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await fetch(`/api/pages/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const result = await response.json();
        return rejectWithValue(result.error || 'Failed to delete page');
      }

      return id;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Network error');
    }
  }
);

/**
 * Pages slice
 */
const pagesSlice = createSlice({
  name: 'pages',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setCurrentPage: (state, action: PayloadAction<Page | null>) => {
      state.currentPage = action.payload;
    },
    clearCurrentPage: (state) => {
      state.currentPage = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch all pages
    builder
      .addCase(fetchPages.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchPages.fulfilled, (state, action) => {
        state.isLoading = false;
        state.pages = action.payload;
      })
      .addCase(fetchPages.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Fetch single page
    builder
      .addCase(fetchPageById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchPageById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentPage = action.payload;
      })
      .addCase(fetchPageById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Create page
    builder
      .addCase(createPage.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createPage.fulfilled, (state, action) => {
        state.isLoading = false;
        state.pages.unshift(action.payload);
        state.currentPage = action.payload;
      })
      .addCase(createPage.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Update page
    builder
      .addCase(updatePage.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updatePage.fulfilled, (state, action) => {
        state.isLoading = false;
        const index = state.pages.findIndex((p) => p.id === action.payload.id);
        if (index !== -1) {
          state.pages[index] = action.payload;
        }
        if (state.currentPage?.id === action.payload.id) {
          state.currentPage = action.payload;
        }
      })
      .addCase(updatePage.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Delete page
    builder
      .addCase(deletePage.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deletePage.fulfilled, (state, action) => {
        state.isLoading = false;
        state.pages = state.pages.filter((p) => p.id !== action.payload);
        if (state.currentPage?.id === action.payload) {
          state.currentPage = null;
        }
      })
      .addCase(deletePage.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError, setCurrentPage, clearCurrentPage } = pagesSlice.actions;
export default pagesSlice.reducer;
