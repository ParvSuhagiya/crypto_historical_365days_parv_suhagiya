import { useSelector, useDispatch } from 'react-redux';
import { useCallback } from 'react';
import {
  fetchCoins,
  fetchFilteredCoins,
  fetchSortedCoins,
  setFilters,
} from '../features/coins/coinSlice';

export default function useCoins() {
  const dispatch = useDispatch();
  const { list, selected, pagination, filters, loading, error } = useSelector(
    (state) => state.coins
  );

  const loadCoins = useCallback(
    (params = {}) => {
      dispatch(fetchCoins({ page: pagination.page, limit: pagination.limit, ...params }));
    },
    [dispatch, pagination.page, pagination.limit]
  );

  const applyFilter = useCallback(
    (path, params = {}) => {
      dispatch(setFilters({ filter: path }));
      dispatch(fetchFilteredCoins({ path, params: { page: 1, limit: pagination.limit, ...params } }));
    },
    [dispatch, pagination.limit]
  );

  const applySort = useCallback(
    (path, params = {}) => {
      dispatch(setFilters({ sort: path }));
      dispatch(fetchSortedCoins({ path, params: { page: 1, limit: pagination.limit, ...params } }));
    },
    [dispatch, pagination.limit]
  );

  return {
    coins: list,
    selected,
    pagination,
    filters,
    loading,
    error,
    loadCoins,
    applyFilter,
    applySort,
  };
}
