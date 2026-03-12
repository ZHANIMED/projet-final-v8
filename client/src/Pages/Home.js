import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchCategories } from "../JS/redux/slices/categorySlice";
import CategoryCard from "../Components/CategoryCard";
import ProductCard from "../Components/ProductCard";
import { fetchProducts } from "../JS/redux/slices/productSlice";
import { Link } from "react-router-dom";
import logo from "../assets/MYECODECO.png";
import api from "../JS/api/axios";
import { toast } from "react-toastify";

export default function Home() {
  const dispatch = useDispatch();
  const { list: categories } = useSelector((s) => s.categories);
  const { list: products } = useSelector((s) => s.products);
  const [settings, setSettings] = React.useState(null);
  const [email, setEmail] = React.useState("");
  const [loadingNewsletter, setLoadingNewsletter] = React.useState(false);

  const featuredProducts = products.filter(p => p.isFeatured).slice(0, 4);

  useEffect(() => {
    dispatch(fetchCategories());
    dispatch(fetchProducts({}));
    api.get("/settings").then(({ data }) => setSettings(data)).catch(() => { });
  }, [dispatch]);

  const handleAddToCart = (p, qty) => {
    dispatch({ type: "cart/addToCart", payload: { ...p, id: p._id, qty } });
  };

  const handleSubscribe = async (e) => {
    e.preventDefault();
    if (!email) return;
    try {
      setLoadingNewsletter(true);
      const res = await api.post("/newsletter/subscribe", { email });
      toast.success(res.data.message);
      setEmail("");
    } catch (err) {
      toast.error(err.response?.data?.message || "Erreur lors de l'inscription.");
    } finally {
      setLoadingNewsletter(false);
    }
  };

  return (
    <div className="container">
      <section className="hero">
        <div className="heroLeft">
          <h1>{settings?.heroTitle || "Nouvelle Collection"}</h1>
          <p>Notre collection éco-déco: articles conçus et fabriqués dans le respect de normes et de process éco-responsables..</p>
          <Link className="btnPrimary" to="/products">
            Découvrir
          </Link>
        </div>
        <div
          className="heroRight"
          style={{ backgroundImage: settings?.heroImage ? `url(${settings.heroImage})` : undefined }}
        />

        {/* ✅ LOGO SOCIETE EN BAS A DROITE */}
        <img src={logo} alt="Logo" className="heroLogo" />
      </section>

      {featuredProducts.length > 0 && (
        <div style={{ marginBottom: 60 }}>
          <h2 className="sectionTitle">Produits à la Une</h2>
          <p className="sectionSub">Nos coups de cœur du moment ✨</p>
          <div className="grid4">
            {featuredProducts.map((p) => (
              <ProductCard key={p._id} p={p} onAdd={handleAddToCart} />
            ))}
          </div>
        </div>
      )}

      <h2 className="sectionTitle">Nos Catégories</h2>
      <p className="sectionSub">Explorez notre univers</p>

      <div className="grid4">
        {categories.map((c) => (
          <CategoryCard key={c._id} c={c} />
        ))}
      </div>

      {/* Newsletter Block */}
      <div style={{ marginTop: 80, marginBottom: 40, padding: 40, background: "linear-gradient(135deg, #c3f0ca 0%, #e0f4ff 100%)", borderRadius: 24, textAlign: "center", boxShadow: "0 10px 30px rgba(163, 230, 165, 0.25)" }}>
        <h2 style={{ margin: "0 0 10px", fontSize: 32, fontWeight: 900, color: "#1b4332" }}>Rejoignez notre Newsletter 💌</h2>
        <p style={{ margin: "0 0 20px", color: "#2d5a45", fontSize: 16 }}>Ne manquez aucune de nos nouveautés et offres exclusives en éco-déco !</p>
        <form onSubmit={handleSubscribe} style={{ display: "flex", gap: 10, justifyContent: "center", maxWidth: 500, margin: "0 auto" }}>
          <input
            type="email"
            placeholder="Votre adresse e-mail"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            style={{ flex: 1, padding: "12px 20px", borderRadius: 12, border: "none", outline: "none", boxShadow: "0 4px 10px rgba(0,0,0,0.05)" }}
          />
          <button type="submit" className="ecoBtn" disabled={loadingNewsletter} style={{ padding: "12px 24px", borderRadius: 12 }}>
            {loadingNewsletter ? "..." : "S'inscrire"}
          </button>
        </form>
      </div>

    </div>
  );
}