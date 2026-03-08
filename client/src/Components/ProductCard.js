import React, { useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";

// Composant étoiles pour les cartes (version compacte)
const Stars = ({ value }) => {
  const safe = Math.max(0, Math.min(10, Number(value) || 0));
  const percentage = (safe / 10) * 100;
  const stars = "★★★★★";
  return (
    <div className="ratingStars" style={{ fontSize: 14 }} aria-label={`${safe.toFixed(1)}/10`}>
      <div className="ratingStarsBg">{stars}</div>
      <div
        className="ratingStarsInner"
        style={{ width: `${percentage}%` }}
      >
        {stars}
      </div>
    </div>
  );
};

export default function ProductCard({ p, onAdd }) {
  const [qty, setQty] = useState(1);

  // ✅ Prix déjà stocké en TND
  const priceTND = Number(p?.price) || 0;

  const dec = () => setQty((q) => Math.max(1, q - 1));
  const inc = () => setQty((q) => q + 1);

  const handleAdd = () => {
    if (qty > p?.stock) {
      toast.error(`Stock insuffisant. Seulement ${p.stock} article(s) disponible(s).`);
      return;
    }
    onAdd?.(p, qty);
    setQty(1);
    toast.success("Produit ajouté au panier !");
  };

  return (
    <div className="card">
      <Link to={`/products/${p?.slug}`} className="cardImgWrap">
        <img
          className="cardImg"
          src={p?.image || "https://via.placeholder.com/600x400"}
          alt={p?.title || "produit"}
        />
      </Link>

      <div className="cardBody">
        <Link to={`/products/${p?.slug}`} className="cardTitle" style={{ display: 'block', textDecoration: 'none', color: 'inherit' }}>
          {p?.title}
        </Link>

        <div className="cardDesc">
          {(p?.description || "").slice(0, 60)}
          {(p?.description || "").length > 60 ? "..." : ""}
        </div>

        {/* Note du produit */}
        {p?.averageRating !== undefined && p?.averageRating > 0 && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              marginTop: 8,
              marginBottom: 4,
            }}
          >
            <Stars value={p.averageRating} />
            <span
              style={{
                fontSize: 13,
                fontWeight: 700,
                color: "var(--muted)",
              }}
            >
              {(p.averageRating || 0).toFixed(1)}/10
            </span>
            {p?.ratingsCount > 0 && (
              <span
                style={{
                  fontSize: 11,
                  color: "var(--muted)",
                  marginLeft: 4,
                }}
              >
                ({p.ratingsCount})
              </span>
            )}
          </div>
        )}

        <div className="cardRow">
          {/* ✅ Prix TND direct */}
          <div>
            <div className="cardPrice">{priceTND.toFixed(3)} TND</div>
            {p?.stock > 0 && (
              <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 4, fontWeight: 700 }}>
                Stock: <span style={{ color: "#111" }}>{p.stock}</span>
              </div>
            )}
          </div>

          {p?.stock > 0 ? (
            <>
              {/* quantité */}
              <div className="qtyWrap">
                <button className="qtyBtn" onClick={dec} type="button" aria-label="Diminuer">-</button>
                <span className="qtyVal">{qty}</span>
                <button className="qtyBtn" onClick={inc} type="button" aria-label="Augmenter">+</button>
              </div>

              {/* bouton panier */}
              <button
                className="cartBtn"
                onClick={handleAdd}
                type="button"
                aria-label="Ajouter au panier"
                title="Ajouter au panier"
              >
                🛒
              </button>
            </>
          ) : (
            <span style={{ color: '#e74c3c', fontWeight: 900, fontSize: 14 }}>Stock épuisé</span>
          )}
        </div>
      </div>
    </div>
  );
}