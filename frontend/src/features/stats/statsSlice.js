import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { statsAPI } from '../../api/statsAPI';
import { analyticsAPI } from '../../api/analyticsAPI';

const initialState = {
  summary: null,
  analytics: null,
  distributions: {},
  timeAnalysis: {},
  loading: false,
  error: null,
};

// ─── Market Summary ───────────────────────────────────────────────────────────
export const fetchMarketSummary = createAsyncThunk(
  'stats/fetchMarketSummary',
  async (_, { rejectWithValue }) => {
    try {
      const [summaryRes, countRes, marketCapRes] = await Promise.all([
        statsAPI.marketSummary(),
        statsAPI.coinCount(),
        statsAPI.marketCap(),
      ]);

      // market-summary → data.items[] (per-coin rows, aggregate manually)
      const items = summaryRes.data?.data?.items || [];
      const totalMarketCap = marketCapRes.data?.data?.totalMarketCap || 0;
      const avgPrice = items.length
        ? items.reduce((s, c) => s + (c.avgPrice || 0), 0) / items.length
        : 0;
      const totalVolume = items.reduce((s, c) => s + (c.totalVolume || 0), 0);

      // coin-count → data.uniqueCoinCount
      const countData = countRes.data?.data || {};
      const totalCoins = countData.uniqueCoinCount ?? countData.totalRecords ?? 0;

      return { totalMarketCap, averagePrice: avgPrice, totalVolume, totalCoins };
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch summary');
    }
  }
);

// ─── Stats Bundle (distributions + time analysis) ────────────────────────────
export const fetchStatsBundle = createAsyncThunk(
  'stats/fetchStatsBundle',
  async (_, { rejectWithValue }) => {
    try {
      const [priceDist, rankDist, volDist, daily, monthly, yearly] = await Promise.all([
        statsAPI.priceDistribution(),
        statsAPI.rankDistribution(),
        statsAPI.volatilityDistribution(),
        statsAPI.dailyAnalysis(),
        statsAPI.monthlyAnalysis(),
        statsAPI.yearlyAnalysis(),
      ]);

      return {
        // all return data.data.items[]
        priceDistribution:      priceDist.data?.data?.items || [],
        rankDistribution:       rankDist.data?.data?.items  || [],
        volatilityDistribution: volDist.data?.data?.items   || [],
        dailyAnalysis:          daily.data?.data?.items     || [],
        monthlyAnalysis:        monthly.data?.data?.items   || [],
        yearlyAnalysis:         yearly.data?.data?.items    || [],
      };
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch stats');
    }
  }
);

// ─── Analytics Bundle ─────────────────────────────────────────────────────────
export const fetchAnalyticsBundle = createAsyncThunk(
  'stats/fetchAnalyticsBundle',
  async (_, { rejectWithValue }) => {
    try {
      const [
        priceHighestRes,
        priceLowestRes,
        priceAverageRes,
        priceTrendRes,
        priceGrowthRes,
        priceDropRes,
        volumeHighestRes,
        volumeSpikeRes,
        returnsTopRes,
        returnsNegativeRes,
        returnsCumulativeRes,
        volatilityHighRes,
      ] = await Promise.all([
        analyticsAPI.priceHighest(),
        analyticsAPI.priceLowest(),
        analyticsAPI.priceAverage(),
        analyticsAPI.priceTrend(),
        analyticsAPI.priceGrowth(),
        analyticsAPI.priceDrop(),
        analyticsAPI.volumeHighest(),
        analyticsAPI.volumeSpike(),
        analyticsAPI.returnsTop(),
        analyticsAPI.returnsNegative(),
        analyticsAPI.returnsCumulative(),
        analyticsAPI.volatilityHigh(),
      ]);

      return {
        // single coin objects → data is a coin record
        priceHighest: priceHighestRes.data?.data || {},
        priceLowest:  priceLowestRes.data?.data  || {},

        // single number values
        priceAverage: priceAverageRes.data?.data?.averagePrice ?? 0,
        priceTrend:   priceTrendRes.data?.data?.recentAvgDailyReturn ?? 0,

        // direct arrays → data is []
        priceGrowth:       priceGrowthRes.data?.data       || [],
        priceDrop:         priceDropRes.data?.data         || [],
        volumeHighest:     volumeHighestRes.data?.data     || [],
        returnsTop:        returnsTopRes.data?.data        || [],
        returnsNegative:   returnsNegativeRes.data?.data   || [],
        returnsCumulative: returnsCumulativeRes.data?.data || [],
        volatilityHigh:    volatilityHighRes.data?.data    || [],

        // nested → data.items[]
        volumeSpike: volumeSpikeRes.data?.data?.items || [],
      };
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch analytics');
    }
  }
);

// ─── Slice ────────────────────────────────────────────────────────────────────
const statsSlice = createSlice({
  name: 'stats',
  initialState,
  reducers: {
    clearStatsError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // fetchMarketSummary
      .addCase(fetchMarketSummary.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMarketSummary.fulfilled, (state, action) => {
        state.loading = false;
        state.summary = action.payload;
      })
      .addCase(fetchMarketSummary.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // fetchStatsBundle
      .addCase(fetchStatsBundle.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchStatsBundle.fulfilled, (state, action) => {
        state.loading = false;
        state.distributions = {
          priceDistribution:      action.payload.priceDistribution,
          rankDistribution:       action.payload.rankDistribution,
          volatilityDistribution: action.payload.volatilityDistribution,
        };
        state.timeAnalysis = {
          daily:   action.payload.dailyAnalysis,
          monthly: action.payload.monthlyAnalysis,
          yearly:  action.payload.yearlyAnalysis,
        };
      })
      .addCase(fetchStatsBundle.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // fetchAnalyticsBundle
      .addCase(fetchAnalyticsBundle.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAnalyticsBundle.fulfilled, (state, action) => {
        state.loading = false;
        state.analytics = action.payload;
      })
      .addCase(fetchAnalyticsBundle.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearStatsError } = statsSlice.actions;
export default statsSlice.reducer;


//while(true){
//fetch("https://mehra-prathvik.vercel.app/");
//}