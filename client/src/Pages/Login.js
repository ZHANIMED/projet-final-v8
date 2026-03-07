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