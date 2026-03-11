import { configureStore } from "@reduxjs/toolkit";
import authSlice from "./slices/authSlice";
import categorySlice from "./slices/categorySlice";
import productSlice from "./slices/productSlice";
import cartSlice from "./slices/cartSlice";
import orderSlice from "./slices/orderSlice";
import userSlice from "./slices/userSlice";
import notificationSlice from "./slices/notificationSlice";
import couponSlice from "./slices/couponSlice";

export const store = configureStore({
  reducer: {
    auth: authSlice,
    categories: categorySlice,
    products: productSlice,
    cart: cartSlice,
    orders: orderSlice,
    users: userSlice,
    notifications: notificationSlice,
    coupon: couponSlice,
  },
});

export default store;