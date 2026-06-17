import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { coinAPI } from '../../api/coinAPI';

const initialState = {
  list: [],
  selected: null,
  pagination: { page: 1, limit: 10, total: 0, pages: 0 },
  filters: { sort: '', filter: '', search: '' },
  loading: false,
  error: null,
};

export const fetchCoins = createAsyncThunk(
  'coins/fetchCoins',
  async (params = {}, { rejectWithValue }) => {
    try {
      const { data } = await coinAPI.getAll(params);
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch coins');
    }
  }
);

export const fetchCoinById = createAsyncThunk(
  'coins/fetchCoinById',
  async (id, { rejectWithValue }) => {
    try {
      const { data } = await coinAPI.getById(id);
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch coin');
    }
  }
);

export const createCoin = createAsyncThunk(
  'coins/createCoin',
  async (coinData, { rejectWithValue }) => {
    try {
      const { data } = await coinAPI.create(coinData);
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to create coin');
    }
  }
);

export const updateCoin = createAsyncThunk(
  'coins/updateCoin',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await coinAPI.update(id, data);
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to update coin');
    }
  }
);

export const deleteCoin = createAsyncThunk(
  'coins/deleteCoin',
  async (id, { rejectWithValue }) => {
    try {
      await coinAPI.delete(id);
      return id;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to delete coin');
    }
  }
);

export const fetchFilteredCoins = createAsyncThunk(
  'coins/fetchFilteredCoins',
  async ({ path, params }, { rejectWithValue }) => {
    try {
      const { data } = path ? await coinAPI.filter(path, params) : await coinAPI.getAll(params);
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch coins');
    }
  }
);

export const fetchSortedCoins = createAsyncThunk(
  'coins/fetchSortedCoins',
  async ({ path, params }, { rejectWithValue }) => {
    try {
      const { data } = path ? await coinAPI.sort(path, params) : await coinAPI.getAll(params);
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch coins');
    }
  }
);

const normalizeCoinsResponse = (payload) => {
  const list = payload?.data || payload?.coins || (Array.isArray(payload) ? payload : []);
  const pagination = payload?.pagination || {
    page: 1,
    limit: list.length,
    total: list.length,
    pages: 1,
  };
  return { list, pagination };
};

const coinSlice = createSlice({
  name: 'coins',
  initialState,
  reducers: {
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearSelected: (state) => {
      state.selected = null;
    },
    clearCoinError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    const handleFetchPending = (state) => {
      state.loading = true;
      state.error = null;
    };
    const handleFetchFulfilled = (state, action) => {
      state.loading = false;
      const { list, pagination } = normalizeCoinsResponse(action.payload);
      state.list = list;
      state.pagination = pagination;
    };
    const handleFetchRejected = (state, action) => {
      state.loading = false;
      state.error = action.payload;
    };

    builder
      .addCase(fetchCoins.pending, handleFetchPending)
      .addCase(fetchCoins.fulfilled, handleFetchFulfilled)
      .addCase(fetchCoins.rejected, handleFetchRejected)
      .addCase(fetchFilteredCoins.pending, handleFetchPending)
      .addCase(fetchFilteredCoins.fulfilled, handleFetchFulfilled)
      .addCase(fetchFilteredCoins.rejected, handleFetchRejected)
      .addCase(fetchSortedCoins.pending, handleFetchPending)
      .addCase(fetchSortedCoins.fulfilled, handleFetchFulfilled)
      .addCase(fetchSortedCoins.rejected, handleFetchRejected)
      .addCase(fetchCoinById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCoinById.fulfilled, (state, action) => {
        state.loading = false;
        state.selected = action.payload?.data || action.payload;
      })
      .addCase(fetchCoinById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(createCoin.fulfilled, (state, action) => {
        state.loading = false;
        const coin = action.payload?.data || action.payload;
        if (coin) state.list.unshift(coin);
      })
      .addCase(updateCoin.fulfilled, (state, action) => {
        state.loading = false;
        const coin = action.payload?.data || action.payload;
        if (coin?._id) {
          const idx = state.list.findIndex((c) => c._id === coin._id);
          if (idx !== -1) state.list[idx] = coin;
        }
        state.selected = coin;
      })
      .addCase(deleteCoin.fulfilled, (state, action) => {
        state.loading = false;
        state.list = state.list.filter((c) => c._id !== action.payload);
      });
  },
});

export const { setFilters, clearSelected, clearCoinError } = coinSlice.actions;
export default coinSlice.reducer;
