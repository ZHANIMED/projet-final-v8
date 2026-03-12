import { createSlice } from "@reduxjs/toolkit";
import { toast } from "react-toastify";
import { logout } from "./authSlice";

const persisted = sessionStorage.getItem("cart");
let parsed = { items: [], userId: null };
try {
  const p = JSON.parse(persisted);
  if (Array.isArray(p)) parsed = { items: p, userId: null }; // legacy
  else if (p) parsed = p;
} catch (e) { }

const save = (state) => sessionStorage.setItem("cart", JSON.stringify({ items: state.items, userId: state.userId }));

const cartSlice = createSlice({
  name: "cart",
  initialState: { items: parsed.items || [], userId: parsed.userId || null },
  reducers: {
    syncCartUser(state, action) {
      const currentUserId = action.payload; // either userId or null/undefined
      if (currentUserId) {
        // User logged in / exists
        if (state.userId && state.userId !== currentUserId) {
          // Different user logged in -> clear cart
          state.items = [];
        }
        state.userId = currentUserId;
        save(state);
      }
    },
    addToCart(state, action) {
      const payload = action.payload || {};
      const product = payload.product ?? payload;
      const qtyToAdd = Number(payload.qty ?? product.qty ?? 1) || 1;
      const id = product.id || product._id;
      if (!id) return;

      const stock = product.stock ?? 999;
      const found = state.items.find((x) => x.id === id);

      if (found) {
        const newTotalQty = (found.qty || 0) + qtyToAdd;
        if (newTotalQty > stock) {
          toast.error(`Impossible d'ajouter plus d'articles. Stock total disponible: ${stock}`);
          return;
        }
        found.qty = newTotalQty;
      } else {
        if (qtyToAdd > stock) {
          toast.error(`Stock insuffisant. Max disponible: ${stock}`);
          return;
        }
        state.items.push({
          id,
          title: product.title,
          price: product.price,
          image: product.image,
          slug: product.slug,
          qty: qtyToAdd,
          stock: stock, // On garde trace du stock si possible
        });
      }
      save(state);
    },

    removeFromCart(state, action) {
      state.items = state.items.filter((x) => x.id !== action.payload);
      save(state);
    },

    changeQty(state, action) {
      const { id, qty } = action.payload;
      const item = state.items.find((x) => x.id === id);
      if (!item) return;

      const newQty = Math.max(1, Number(qty) || 1);
      if (item.stock && newQty > item.stock) {
        toast.error(`Stock insuffisant. Max disponible: ${item.stock}`);
        return;
      }

      item.qty = newQty;
      save(state);
    },

    clearCart(state) {
      state.items = [];
      save(state);
    },
  },
  extraReducers: (builder) => {
    builder.addCase(logout, (state) => {
      state.items = [];
      state.userId = null;
      save(state);
    });
  }
});

export const { addToCart, removeFromCart, changeQty, clearCart, syncCartUser } = cartSlice.actions;
export default cartSlice.reducer;