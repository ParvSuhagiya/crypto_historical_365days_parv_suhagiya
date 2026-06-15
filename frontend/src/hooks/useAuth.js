import { useSelector, useDispatch } from 'react-redux';
import { useCallback } from 'react';
import { logoutUser, fetchProfile } from '../features/auth/authSlice';

export default function useAuth() {
  const dispatch = useDispatch();
  const { user, token, isAuthenticated, loading, error } = useSelector((state) => state.auth);

  const logout = useCallback(() => {
    dispatch(logoutUser());
  }, [dispatch]);

  const refreshProfile = useCallback(() => {
    if (token) dispatch(fetchProfile());
  }, [dispatch, token]);

  const isAdmin = user?.role === 'admin';

  return {
    user,
    token,
    isAuthenticated,
    loading,
    error,
    logout,
    refreshProfile,
    isAdmin,
  };
}
