import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { login } from "../JS/redux/slices/authSlice";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

export default function Login() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector((s) => s.auth);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    const res = await dispatch(login({ email, password }));
    if (res.meta.requestStatus === "fulfilled") {
      toast.success("✅ Connexion réussie !", { autoClose: 2000 });
      if (res.payload.user?.isAdmin) {
        navigate("/admin");
      } else {
        // Check for active promo codes and show a banner-like toast
        try {
          // Must access api via the axios instance to maintain the url prefix
          const api = require("../JS/api/axios").default;
          const { data } = await api.get("/coupons/active");
          if (data && data.code) {
            setTimeout(() => {
              toast.success(
                `🎉 Bienvenue ! Obtenez -${data.discountPercentage}% sur votre panier avec le code : ${data.code}`,
                {
                  autoClose: 8000,
                  position: "top-center",
                  style: { border: "2px solid #c79b5b", background: "#fbfbfa", color: "#111" }
                }
              );
            }, 500); // Slight delay so it appears clearly after the login success toast
          }
        } catch (err) {
          // No active coupon found or error, just navigate quietly
        }
        navigate("/");
      }
    } else {
      toast.error(`❌ ${res.payload || "Identifiants incorrects"}`);
    }
  };

  return (
    <div className="container auth">
      <h1>Connexion</h1>
      <form onSubmit={submit} className="authForm">
        <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" />
        <input value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Mot de passe" type="password" />
        {error && <p className="error">{error}</p>}
        <button className="btnPrimary" disabled={loading}>{loading ? "..." : "Se connecter"}</button>
      </form>

      <p className="muted">Pas de compte ? <Link to="/register">Créer un compte</Link></p>
    </div>
  );
}