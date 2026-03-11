import React from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import "./Navbar.css";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../JS/redux/slices/authSlice";
import { fetchActiveCoupon } from "../JS/redux/slices/couponSlice";
import logo from "../assets/MYECODECO.png";
import NotificationBell from "./NotificationBell";

export default function Navbar() {
  const { user } = useSelector((s) => s.auth);

  const { activeCoupon } = useSelector((s) => s.coupon);

  const cartCount = useSelector((s) =>
    (s.cart?.items || []).reduce((a, x) => a + (x.qty || 0), 0)
  );

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const fallbackAvatar = "https://cdn-icons-png.flaticon.com/512/149/149071.png";

  const getUserPhoto = (photo) => {
    if (!photo) return null;
    if (photo.startsWith("http")) return photo;
    if (photo.startsWith("blob:")) return photo;
    return `/${photo}`;
  };

  const onLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

  React.useEffect(() => {
    if (user) {
      dispatch(fetchActiveCoupon());
    }
  }, [dispatch, user]);

  return (
    <header className="nav">
      <Link className="brand" to="/">
        <img src={logo} alt="My Ecodeco" className="logo" />
      </Link>

      <nav className="links">
        <NavLink to="/" end>Accueil</NavLink>
        <NavLink to="/products">Produits</NavLink>
        {user?.isAdmin && <NavLink to="/admin">Admin</NavLink>}
      </nav>

      <div className="actions">
        {!user ? (
          <NavLink to="/login" className="iconBtn">👤</NavLink>
        ) : (
          <NavLink to="/profile" className="iconBtn userPhotoBtn" style={{ padding: 0, overflow: "hidden" }}>
            {getUserPhoto(user?.photo) ? (
              <img
                src={getUserPhoto(user.photo)}
                alt={user.name}
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = fallbackAvatar;
                }}
              />
            ) : (
              <span className="fallbackIcon">👤</span>
            )}
          </NavLink>
        )}

        {user?.isAdmin && <NotificationBell />}

        <NavLink to="/cart" className="iconBtn">
          🛒 <span className="badge">{cartCount}</span>
        </NavLink>

        {user && (
          <button className="linkBtn" onClick={onLogout}>Logout</button>
        )}
      </div>
    </header>
  );
}