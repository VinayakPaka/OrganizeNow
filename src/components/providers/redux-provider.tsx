'use client';

import { Provider } from 'react-redux';
import { store } from '@/store/store';

/**
 * Redux Provider component
 * Wraps the app with Redux store
 */
export function ReduxProvider({ children }: { children: React.ReactNode }) {
  return <Provider store={store}>{children}</Provider>;
}
