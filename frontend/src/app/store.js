import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../features/auth/authSlice';
import coinReducer from '../features/coins/coinSlice';
import statsReducer from '../features/stats/statsSlice';
import uiReducer from '../features/ui/uiSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    coins: coinReducer,
    stats: statsReducer,
    ui: uiReducer,
  },
});
