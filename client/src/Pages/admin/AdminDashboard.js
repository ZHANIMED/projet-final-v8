import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchProducts } from "../../JS/redux/slices/productSlice";
import api from "../../JS/api/axios";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const panels = [
  {
    to: "/admin/stats",
    icon: "📊",
    label: "Statistiques",
    desc: "Revenus, ventes & tendances",
    gradient: "linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)", // Plus clair (Pastel Purple)
    shadow: "0 10px 30px rgba(161, 140, 209, 0.2)",
    textColor: "#4a3a63",
  },
  {
    to: "/admin/orders",
    icon: "📦",
    label: "Suivi des ventes",
    desc: "Commandes & livraisons",
    gradient: "linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)", // Plus clair (Pastel Pink)
    shadow: "0 10px 30px rgba(255, 154, 158, 0.2)",
    textColor: "#7a4547",
  },
  {
    to: "/admin/products",
    icon: "🛒",
    label: "Produits",
    desc: "Stock, prix & catalogue",
    gradient: "linear-gradient(120deg, #a1c4fd 0%, #c2e9fb 100%)", // Plus clair (Pastel Blue)
    shadow: "0 10px 30px rgba(161, 196, 253, 0.2)",
    textColor: "#3d5a80",
  },
  {
    to: "/admin/categories",
    icon: "🏷️",
    label: "Catégories",
    desc: "Gérer les catégories",
    gradient: "linear-gradient(to right, #84fab0 0%, #8fd3f4 100%)", // Plus clair (Pastel Green/Cyan)
    shadow: "0 10px 30px rgba(132, 250, 176, 0.2)",
    textColor: "#2d5a45",
  },
  {
    to: "/admin/users",
    icon: "👥",
    label: "Utilisateurs",
    desc: "Comptes & rôles",
    gradient: "linear-gradient(120deg, #f6d365 0%, #fda085 100%)", // Plus clair (Pastel Orange)
    shadow: "0 10px 30px rgba(246, 211, 101, 0.2)",
    textColor: "#7a5a1f",
  },
  {
    to: "/admin/messages",
    icon: "💬",
    label: "Messages",
    desc: "Contact & retours clients",
    gradient: "linear-gradient(135deg, #c3f0ca 0%, #e0f4ff 100%)",
    shadow: "0 10px 30px rgba(163, 230, 165, 0.25)",
    textColor: "#1b4332",
  },
  {
    to: "/admin/coupons",
    icon: "🎟️",
    label: "Code Promo",
    desc: "Bons de réduction",
    gradient: "linear-gradient(135deg, #fdfbfb 0%, #ebedee 100%)", // Silver / light gray
    shadow: "0 10px 30px rgba(235, 237, 238, 0.5)",
    textColor: "#2d3436",
  },
  {
    to: "/admin/settings",
    icon: "⚙️",
    label: "Paramètres CMS",
    desc: "Logo, contact & réseaux",
    gradient: "linear-gradient(135deg, #e2ebf0 0%, #cfd9df 100%)",
    shadow: "0 10px 30px rgba(207, 217, 223, 0.3)",
    textColor: "#2c3e50",
  },
  {
    to: "/admin/reviews",
    icon: "⭐",
    label: "Avis clients",
    desc: "Modérer les commentaires",
    gradient: "linear-gradient(135deg, #fff1eb 0%, #ace0f9 100%)",
    shadow: "0 10px 30px rgba(172, 224, 249, 0.3)",
    textColor: "#2d3436",
  },
  {
    to: "/admin/newsletter",
    icon: "📧",
    label: "Newsletter",
    desc: "Abonnés",
    gradient: "linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)",
    shadow: "0 10px 30px rgba(161, 140, 209, 0.2)",
    textColor: "#4a3a63",
  },
];

export default function AdminDashboard() {
  const dispatch = useDispatch();
  const { list: products } = useSelector((s) => s.products);

  const [stats, setStats] = useState(null);
  const [loadingStats, setLoadingStats] = useState(true);

  useEffect(() => {
    dispatch(fetchProducts({}));

    // Fetch stats
    api.get("/admin/stats/dashboard")
      .then(res => setStats(res.data))
      .catch(console.error)
      .finally(() => setLoadingStats(false));

  }, [dispatch]);

  const lowStockProducts = products.filter((p) => (p.stock || 0) <= 5);

  return (
    <div className="container">
      {/* Stock Alert Banner */}
      {lowStockProducts.length > 0 && (
        <div
          style={{
            background: "linear-gradient(135deg, #ff416c 0%, #ff4b2b 100%)",
            color: "white",
            padding: "16px 24px",
            borderRadius: "16px",
            marginBottom: "24px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            boxShadow: "0 10px 20px rgba(255, 65, 108, 0.3)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <span style={{ fontSize: "24px" }}>⚠️</span>
            <div>
              <strong style={{ fontSize: "16px", display: "block" }}>Alerte Stock Bas</strong>
              <span style={{ fontSize: "14px", opacity: 0.9 }}>
                Il y a {lowStockProducts.length} produit(s) avec un stock critique.
              </span>
            </div>
          </div>
          <Link
            to="/admin/products"
            style={{
              background: "rgba(255, 255, 255, 0.2)",
              color: "white",
              padding: "8px 16px",
              borderRadius: "10px",
              textDecoration: "none",
              fontSize: "13px",
              fontWeight: "bold",
              backdropFilter: "blur(4px)",
              border: "1px solid rgba(255, 255, 255, 0.3)",
              transition: "background 0.2s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255, 255, 255, 0.3)")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(255, 255, 255, 0.2)")}
          >
            Gérer le stock
          </Link>
        </div>
      )}

      {/* Header */}
      <div style={{ marginBottom: 36, display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <h1
            style={{
              margin: "0 0 8px",
              fontSize: 42,
              fontWeight: 900,
              letterSpacing: "-0.8px",
              background: "linear-gradient(135deg, #111, #555)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            Tableau de bord
          </h1>
          <p style={{ margin: 0, color: "var(--muted)", fontSize: 16 }}>
            Bienvenue, administrateur 👋
          </p>
        </div>
        {stats && stats.pendingCount > 0 && (
          <Link to="/admin/orders" style={{ textDecoration: 'none' }}>
            <div style={{ background: "#fee2e2", color: "#ef4444", padding: "10px 20px", borderRadius: 12, fontWeight: 900, display: "flex", alignItems: "center", gap: 10, boxShadow: "0 4px 10px rgba(239, 68, 68, 0.2)" }}>
              <span style={{ fontSize: 20 }}>📦</span>
              {stats.pendingCount} Commande{stats.pendingCount > 1 ? "s" : ""} à traiter
            </div>
          </Link>
        )}
      </div>

      {stats && (
        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 20, marginBottom: 40 }}>
          {/* Graphique Revenus */}
          <div className="panel" style={{ padding: 24 }}>
            <h3 style={{ marginTop: 0, marginBottom: 20 }}>Revenus (30 derniers jours)</h3>
            <div style={{ width: "100%", height: 300 }}>
              <ResponsiveContainer>
                <LineChart data={stats.revenueData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                  <XAxis dataKey="date" tick={{ fontSize: 12 }} tickMargin={10} minTickGap={30} stroke="#999" />
                  <YAxis tick={{ fontSize: 12 }} stroke="#999" width={60} tickFormatter={(v) => `${v} TND`} />
                  <Tooltip formatter={(value) => [`${value.toFixed(3)} TND`, "Revenu"]} />
                  <Line type="monotone" dataKey="revenue" stroke="var(--accent)" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Top Produits */}
          <div className="panel" style={{ padding: 24, display: "flex", flexDirection: "column" }}>
            <h3 style={{ marginTop: 0, marginBottom: 20 }}>Top 5 Produits (Vendus)</h3>
            {stats.topProducts.length === 0 ? (
              <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", color: "var(--muted)" }}>
                Aucune vente enregistrée.
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 15 }}>
                {stats.topProducts.map((p, index) => (
                  <div key={p._id} style={{ display: "flex", alignItems: "center", gap: 15, paddingBottom: 15, borderBottom: index < stats.topProducts.length - 1 ? "1px solid var(--line)" : "none" }}>
                    <div style={{ width: 30, height: 30, borderRadius: "50%", background: "var(--accent)", color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold", fontSize: 14 }}>
                      {index + 1}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 700, fontSize: 14, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: 150 }}>{p.title}</div>
                      <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 2 }}>{p.sales} unités</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Cards Grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: 20,
        }}
      >
        {panels.map((p) => (
          <Link
            key={p.to}
            to={p.to}
            style={{
              textDecoration: "none",
              display: "block",
              borderRadius: 22,
              overflow: "hidden",
              background: p.gradient,
              boxShadow: p.shadow,
              transition: "transform .25s ease, box-shadow .25s ease",
              padding: "28px 24px 24px",
              position: "relative",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-6px) scale(1.02)";
              e.currentTarget.style.boxShadow = p.shadow.replace("0.2)", "0.4)");
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0) scale(1)";
              e.currentTarget.style.boxShadow = p.shadow;
            }}
          >
            {/* Background decoration */}
            <div
              style={{
                position: "absolute",
                top: -20,
                right: -20,
                width: 90,
                height: 90,
                borderRadius: "50%",
                background: "rgba(255,255,255,.12)",
              }}
            />
            <div
              style={{
                position: "absolute",
                bottom: -30,
                left: -10,
                width: 120,
                height: 120,
                borderRadius: "50%",
                background: "rgba(255,255,255,.08)",
              }}
            />

            {/* Icon */}
            <div
              style={{
                width: 56,
                height: 56,
                borderRadius: 16,
                background: "rgba(255,255,255,.25)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 28,
                marginBottom: 16,
                backdropFilter: "blur(6px)",
                border: "1px solid rgba(255,255,255,.30)",
              }}
            >
              {p.icon}
            </div>

            {/* Text */}
            <div
              style={{
                color: p.textColor, // Texte foncé pour fond clair
                fontWeight: 900,
                fontSize: 20,
                marginBottom: 4,
                letterSpacing: "-0.3px",
              }}
            >
              {p.label}
            </div>
            <div
              style={{
                color: p.textColor + "aa", // Opacité sur texte
                fontSize: 13,
                fontWeight: 600,
              }}
            >
              {p.desc}
            </div>

            {/* Arrow */}
            <div
              style={{
                marginTop: 20,
                color: p.textColor,
                fontSize: 20,
                fontWeight: 900,
              }}
            >
              →
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
