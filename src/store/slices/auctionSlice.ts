import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

export interface Auction {
  id: string;
  vehicleName: string;
  startingPrice: number;
  currentBid: number;
  endTime: string;
  status: 'active' | 'upcoming' | 'ended';
  sellerId: string;
}

interface AuctionState {
  auctions: Auction[];
  currentAuction: Auction | null;
  loading: boolean;
  error: string | null;
}

const initialState: AuctionState = {
  auctions: [],
  currentAuction: null,
  loading: false,
  error: null,
};

const auctionSlice = createSlice({
  name: 'auction',
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setAuctions: (state, action: PayloadAction<Auction[]>) => {
      state.auctions = action.payload;
    },
    setCurrentAuction: (state, action: PayloadAction<Auction>) => {
      state.currentAuction = action.payload;
    },
    setError: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
    },
  },
});

export const { setAuctions, setCurrentAuction, setLoading, setError } = auctionSlice.actions;

export default auctionSlice.reducer;
