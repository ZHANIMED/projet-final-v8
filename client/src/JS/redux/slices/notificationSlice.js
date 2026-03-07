import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "../../api/axios";

export const fetchNotifications = createAsyncThunk(
    "notifications/fetchAll",
    async (_, { rejectWithValue }) => {
        try {
            const { data } = await axios.get("/notifications");
            return data.notifications;
        } catch (err) {
            return rejectWithValue(err.response.data);
        }
    }
);

export const markRead = createAsyncThunk(
    "notifications/markRead",
    async (id, { rejectWithValue }) => {
        try {
            const { data } = await axios.patch(`/notifications/${id}/read`);
            return data.notification;
        } catch (err) {
            return rejectWithValue(err.response.data);
        }
    }
);

export const markAllAsRead = createAsyncThunk(
    "notifications/markAllRead",
    async (_, { rejectWithValue }) => {
        try {
            await axios.patch("/notifications/mark-all-read");
            return true;
        } catch (err) {
            return rejectWithValue(err.response.data);
        }
    }
);

const notificationSlice = createSlice({
    name: "notifications",
    initialState: {
        list: [],
        loading: false,
        error: null,
    },
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchNotifications.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchNotifications.fulfilled, (state, action) => {
                state.loading = false;
                state.list = action.payload;
            })
            .addCase(fetchNotifications.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            .addCase(markRead.fulfilled, (state, action) => {
                const index = state.list.findIndex((n) => n._id === action.payload._id);
                if (index !== -1) {
                    state.list[index] = action.payload;
                }
            })
            .addCase(markAllAsRead.fulfilled, (state) => {
                state.list.forEach((n) => (n.read = true));
            });
    },
});

export default notificationSlice.reducer;
