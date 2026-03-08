import React, { useEffect } from "react";
import "./App.css";
import "react-toastify/dist/ReactToastify.css";
import { Routes, Route } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import Navbar from "./Components/Navbar";
import { useDispatch } from "react-redux";
import { getMe } from "./JS/redux/slices/authSlice";

import Home from "./Pages/Home";
import Login from "./Pages/Login";
import Register from "./Pages/Register";
import Products from "./Pages/Products";
import ProductDetails from "./Pages/ProductDetails";
import CategoryPage from "./Pages/CategoryPage";
import Cart from "./Pages/Cart";
import Profile from "./Pages/Profile";
import Invoice from "./Pages/Invoice";
import Error from "./Pages/Error";

// Admin
import AdminDashboard from "./Pages/admin/AdminDashboard";
import AdminProducts from "./Pages/admin/AdminProducts";
import AdminCategories from "./Pages/admin/AdminCategories";
import AdminOrders from "./Pages/admin/AdminOrders";
import AdminStats from "./Pages/admin/AdminStats";
import AdminUsers from "./Pages/admin/AdminUsers";
import AdminMessages from "./Pages/admin/AdminMessages";

function App() {
  const dispatch = useDispatch();

  useEffect(() => {
    if (localStorage.getItem("token")) {
      dispatch(getMe());
    }
  }, [dispatch]);

  return (
    <>
      <Navbar />
      <ToastContainer
        position="top-right"
        autoClose={3500}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
        toastStyle={{
          borderRadius: "14px",
          fontFamily: "system-ui, -apple-system, Segoe UI, sans-serif",
          fontWeight: 700,
          boxShadow: "0 20px 40px rgba(0,0,0,0.12)",
        }}
      />
      <div className="container">
        <Routes>
          {/* Public */}
          <Route path="/" element={<Home />} />
          <Route path="/products" element={<Products />} />
          <Route path="/products/:slug" element={<ProductDetails />} />
          <Route path="/categories/:slug" element={<CategoryPage />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/invoice" element={<Invoice />} />

          {/* Auth */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Admin */}
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/products" element={<AdminProducts />} />
          <Route path="/admin/categories" element={<AdminCategories />} />
          <Route path="/admin/orders" element={<AdminOrders />} />
          <Route path="/admin/stats" element={<AdminStats />} />
          <Route path="/admin/users" element={<AdminUsers />} />
          <Route path="/admin/messages" element={<AdminMessages />} />

          {/* 404 */}
          <Route path="*" element={<Error />} />
        </Routes>
      </div>
    </>
  );
}

export default App;