import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import pagesReducer from './slices/pagesSlice';
import boardsReducer from './slices/boardsSlice';
import passwordsReducer from './slices/passwordsSlice';

/**
 * Redux store configuration
 */
export const store = configureStore({
  reducer: {
    auth: authReducer,
    pages: pagesReducer,
    boards: boardsReducer,
    passwords: passwordsReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false, // Disable for dates and complex objects
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
