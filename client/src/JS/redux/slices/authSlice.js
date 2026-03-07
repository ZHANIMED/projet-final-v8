import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import api from "../../api/axios"; // ✅ corrigé ici

const token = localStorage.getItem("token");
const user = localStorage.getItem("user");

export const login = createAsyncThunk("auth/login", async (payload, thunkAPI) => {
  try {
    const { data } = await api.post("/auth/login", payload);
    return data;
  } catch (e) {
    return thunkAPI.rejectWithValue(e.response?.data?.message || "Login error");
  }
});

export const register = createAsyncThunk("auth/register", async (payload, thunkAPI) => {
  try {
    const { data } = await api.post("/auth/register", payload);
    return data;
  } catch (e) {
    return thunkAPI.rejectWithValue(e.response?.data?.message || "Register error");
  }
});

export const getMe = createAsyncThunk("auth/getMe", async (_, thunkAPI) => {
  try {
    const { data } = await api.get("/auth/me");
    return data;
  } catch (e) {
    return thunkAPI.rejectWithValue(e.response?.data?.message || "Auth error");
  }
});

export const updateProfile = createAsyncThunk("auth/updateProfile", async (payload, thunkAPI) => {
  try {
    const { data } = await api.put("/users/profile", payload, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return data;
  } catch (e) {
    return thunkAPI.rejectWithValue(e.response?.data?.message || "Update error");
  }
});

const authSlice = createSlice({
  name: "auth",
  initialState: {
    token: token || null,
    user: user ? JSON.parse(user) : null,
    loading: false,
    error: null,
  },
  reducers: {
    logout(state) {
      state.token = null;
      state.user = null;
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.token = action.payload.token;
        state.user = action.payload.user;
        localStorage.setItem("token", action.payload.token);
        localStorage.setItem("user", JSON.stringify(action.payload.user));
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(register.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.loading = false;
        state.token = action.payload.token;
        state.user = action.payload.user;
        localStorage.setItem("token", action.payload.token);
        localStorage.setItem("user", JSON.stringify(action.payload.user));
      })
      .addCase(register.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(getMe.pending, (state) => {
        state.loading = true;
      })
      .addCase(getMe.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        localStorage.setItem("user", JSON.stringify(action.payload.user));
      })
      .addCase(getMe.rejected, (state) => {
        state.loading = false;
        state.token = null;
        state.user = null;
        localStorage.removeItem("token");
        localStorage.removeItem("user");
      })

      .addCase(updateProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        localStorage.setItem("user", JSON.stringify(action.payload.user));
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { logout } = authSlice.actions;
export default authSlice.reducer;