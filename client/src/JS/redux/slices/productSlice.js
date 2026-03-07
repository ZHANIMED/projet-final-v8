import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import api from "../../api/axios"; // ✅ corrigé

export const fetchProducts = createAsyncThunk(
  "products/fetch",
  async (params = {}, thunkAPI) => {
    try {
      const { data } = await api.get("/products", { params });
      return data.products;
    } catch (e) {
      return thunkAPI.rejectWithValue("Products error");
    }
  }
);

export const fetchProductBySlug = createAsyncThunk(
  "products/one",
  async (slug, thunkAPI) => {
    try {
      const { data } = await api.get(`/products/${slug}`);
      return data.product;
    } catch (e) {
      return thunkAPI.rejectWithValue("Product not found");
    }
  }
);

const slice = createSlice({
  name: "products",
  initialState: {
    list: [],
    current: null,
    loading: false,
    error: null,
  },
  reducers: {
    clearCurrent: (state) => {
      state.current = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.list = []; // ✅ On vide la liste au début du fetch pour éviter le "flash" d'anciens produits
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload;
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(fetchProductBySlug.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProductBySlug.fulfilled, (state, action) => {
        state.loading = false;
        state.current = action.payload;
      })
      .addCase(fetchProductBySlug.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearCurrent } = slice.actions;
export default slice.reducer;