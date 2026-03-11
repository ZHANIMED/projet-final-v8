import React, { useEffect } from "react";
import "./App.css";
import "react-toastify/dist/ReactToastify.css";
import { Routes, Route } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import Navbar from "./Components/Navbar";
import { useDispatch, useSelector } from "react-redux";
import { getMe } from "./JS/redux/slices/authSlice";
import { syncCartUser } from "./JS/redux/slices/cartSlice";
import { io } from "socket.io-client";
import api from "./JS/api/axios";

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
import Chatbot from "./Components/Chatbot";
import DynamicPage from "./Pages/DynamicPage";

// Admin
import AdminDashboard from "./Pages/admin/AdminDashboard";
import AdminProducts from "./Pages/admin/AdminProducts";
import AdminCategories from "./Pages/admin/AdminCategories";
import AdminOrders from "./Pages/admin/AdminOrders";
import AdminStats from "./Pages/admin/AdminStats";
import AdminUsers from "./Pages/admin/AdminUsers";
import AdminMessages from "./Pages/admin/AdminMessages";
import AdminCoupons from "./Pages/admin/AdminCoupons";
import AdminSettings from "./Pages/admin/AdminSettings";
import AdminReviews from "./Pages/admin/AdminReviews";
import AdminNewsletter from "./Pages/admin/AdminNewsletter";
import AdminPages from "./Pages/admin/AdminPages";

const socket = io(process.env.REACT_APP_API_URL || "http://localhost:5000", {
  withCredentials: true,
});

function App() {
  const dispatch = useDispatch();
  const user = useSelector(s => s.auth.user);
  const [globalSettings, setGlobalSettings] = React.useState(null);

  useEffect(() => {
    if (localStorage.getItem("token")) {
      dispatch(getMe());
    }
    // Fetch global settings for Topbar Banner
    const fetchSettings = () => api.get("/settings").then(({ data }) => setGlobalSettings(data)).catch(() => { });

    fetchSettings();
    window.addEventListener("settingsUpdated", fetchSettings);

    return () => {
      window.removeEventListener("settingsUpdated", fetchSettings);
    };
  }, [dispatch]);

  // ✅ Synchronise ownership of the cart with the logged-in user
  useEffect(() => {
    dispatch(syncCartUser(user?._id));
  }, [user?._id, dispatch]);

  // ✅ Écoute Socket globale pour les notifications
  useEffect(() => {
    socket.on("new_notification", (notif) => {
      toast.info(`🔔 NOUVEAU: ${notif.message}`, {
        position: "bottom-right",
        autoClose: 6000,
        className: "socket-toast",
      });
    });

    return () => {
      socket.off("new_notification");
    };
  }, []);

  return (
    <>
      {/* Global Topbar Banner */}
      {globalSettings?.bannerActive && globalSettings?.bannerText && (
        <div className="marquee-container">
          <div className="marquee-content">
            {globalSettings.bannerText}
          </div>
        </div>
      )}
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
      <Chatbot />
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
          <Route path="/pages/:slug" element={<DynamicPage />} />

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
          <Route path="/admin/coupons" element={<AdminCoupons />} />
          <Route path="/admin/newsletter" element={<AdminNewsletter />} />
          <Route path="/admin/settings" element={<AdminSettings />} />
          <Route path="/admin/reviews" element={<AdminReviews />} />
          <Route path="/admin/pages" element={<AdminPages />} />

          {/* 404 */}
          <Route path="*" element={<Error />} />
        </Routes>
      </div>
    </>
  );
}

export default App;