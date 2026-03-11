import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../api/axios";

export const fetchActiveCoupon = createAsyncThunk(
    "coupon/fetchActive",
    async (_, { rejectWithValue }) => {
        try {
            const { data } = await api.get("/coupons/active");
            return data;
        } catch (err) {
            return rejectWithValue(err.response?.data?.message || "Erreur lors de la récupération du coupon");
        }
    }
);

const couponSlice = createSlice({
    name: "coupon",
    initialState: {
        activeCoupon: null,
        loading: false,
        error: null,
    },
    reducers: {
        clearCoupon: (state) => {
            state.activeCoupon = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchActiveCoupon.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchActiveCoupon.fulfilled, (state, action) => {
                state.loading = false;
                state.activeCoupon = action.payload;
            })
            .addCase(fetchActiveCoupon.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
                state.activeCoupon = null;
            });
    },
});

export const { clearCoupon } = couponSlice.actions;
export default couponSlice.reducer;
