import React, { useEffect, useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { addToCart } from "../JS/redux/slices/cartSlice";
import { fetchProductBySlug, clearCurrent } from "../JS/redux/slices/productSlice";
import { toast } from "react-toastify";
import api from "../JS/api/axios";

export default function ProductDetails() {
  const { slug } = useParams();
  const dispatch = useDispatch();

  const { list = [], loading, current } = useSelector((s) => s.products);
  const { user } = useSelector((s) => s.auth);

  const product = useMemo(
    () => current || list.find((x) => x.slug === slug),
    [current, list, slug]
  );

  const [qty, setQty] = useState(1);
  const [reviewText, setReviewText] = useState("");
  const [rating, setRating] = useState(8);
  const [sendingReview, setSendingReview] = useState(false);

  // ✅ Nouveau Modal Promo
  const [earnedPromo, setEarnedPromo] = useState(null);

  useEffect(() => {
    dispatch(fetchProductBySlug(slug));
    return () => {
      dispatch(clearCurrent());
    };
  }, [dispatch, slug]);

  const Stars = ({ value }) => {
    const safe = Math.max(0, Math.min(10, Number(value) || 0));
    const percentage = (safe / 10) * 100;
    const stars = "★★★★★";
    return (
      <div className="ratingStars" aria-label={`${safe.toFixed(1)}/10`}>
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

  const dec = () => setQty((q) => Math.max(1, q - 1));
  const inc = () => setQty((q) => q + 1);

  const add = () => {
    if (!product) return;
    if (qty > product.stock) {
      toast.error(`Stock insuffisant. Seulement ${product.stock} article(s) disponible(s).`);
      return;
    }
    dispatch(
      addToCart({
        product: {
          id: product._id,
          title: product.title,
          price: priceTND, // ✅ TND
          image: product.image,
          slug: product.slug,
          stock: product.stock, // On passe le stock au slice pour validation cumulative
        },
        qty,
      })
    );
    setQty(1);
    toast.success("Produit ajouté au panier !");
  };

  const submitReview = async () => {
    if (!user) {
      toast.error("Vous devez être connecté pour laisser un avis.");
      return;
    }
    if (!product) return;

    try {
      setSendingReview(true);
      await api.post(`/products/${product.slug}/reviews`, {
        rating,
        comment: reviewText.trim(),
      });
      setReviewText("");

      // ✅ Message clair sur l'ajout de l'avis
      toast.success("Merci ! Votre avis a été publié avec succès.", { autoClose: 4000 });

      // ✅ Si la note est excellente (> 7), on offre un code promo s'il y en a un d'actif
      if (rating > 7) {
        try {
          const { data } = await api.get("/coupons/active");
          if (data && data.code) {
            // Au lieu d'un toast, on affiche le joli Modal persistant
            setEarnedPromo(data);
            setSendingReview(false);
            return; // 🛑 On s'arrête ici, on ne recharge pas la page tout de suite !
          }
        } catch (err) {
          // Pas de code promo actif (404) ou erreur silencieuse
        }
      }

      // S'il n'y a pas eu de modal promo, on recharge la page normalement
      dispatch(fetchProductBySlug(slug));
    } catch (error) {
      const msg =
        error?.response?.data?.message ||
        "Erreur lors de l'envoi de l'avis. Veuillez réessayer.";
      toast.error(msg);
    } finally {
      setSendingReview(false);
    }
  };

  if (loading) return <div className="container"><p>Chargement...</p></div>;

  if (!product) {
    return (
      <div className="container">
        <h1>Produit introuvable</h1>
        <Link className="btnPrimary" to="/products">Retour produits</Link>
      </div>
    );
  }

  const originalPrice = Number(product.price) || 0;
  const promo = Number(product.promoPercentage) || 0;
  const priceTND = promo > 0 ? originalPrice - (originalPrice * promo / 100) : originalPrice;

  return (
    <div className="container">
      <div className="details">
        <img
          className="detailsImg"
          src={product.image || "https://via.placeholder.com/900x650"}
          alt={product.title || "Produit"}
          style={{ objectFit: "contain", backgroundColor: "#f7f7f5" }}
        />

        <div className="panel">
          <h1 style={{ marginTop: 0 }}>{product.title}</h1>
          <p className="muted" style={{ marginTop: 6 }}>
            {product.description || "—"}
          </p>

          {promo > 0 ? (
            <div style={{ marginTop: 14 }}>
              <div style={{ textDecoration: "line-through", color: "var(--muted)", fontSize: 16 }}>
                {originalPrice.toFixed(3)} TND
              </div>
              <div style={{ fontWeight: 900, fontSize: 22, color: "var(--accent)", display: "flex", alignItems: "center", gap: 8 }}>
                {priceTND.toFixed(3)} TND
                <span style={{ fontSize: 14, background: "var(--accent)", color: "white", padding: "2px 6px", borderRadius: 4 }}>-{promo}%</span>
              </div>
            </div>
          ) : (
            <div style={{ marginTop: 14, fontWeight: 900, fontSize: 22, color: "var(--accent)" }}>
              {priceTND.toFixed(3)} TND
            </div>
          )}

          <div style={{ marginTop: 10 }} className="muted">
            Stock : <b style={{ color: "#111" }}>{product.stock ?? 0}</b>
          </div>

          <div style={{ marginTop: 16, display: "flex", alignItems: "center", gap: 12 }}>
            {product.stock > 0 ? (
              <>
                <div className="qtyWrap">
                  <button className="qtyBtn" type="button" onClick={dec}>-</button>
                  <span className="qtyVal">{qty}</span>
                  <button className="qtyBtn" type="button" onClick={inc}>+</button>
                </div>

                <button className="cartBtn cartBtnPrimary" type="button" onClick={add} style={{ marginTop: 0, padding: "14px 24px", fontSize: "16px" }}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: 10 }}>
                    <circle cx="9" cy="21" r="1"></circle>
                    <circle cx="20" cy="21" r="1"></circle>
                    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
                  </svg>
                  Ajouter au panier
                </button>
              </>
            ) : (
              <span style={{ color: '#e74c3c', fontWeight: 900, fontSize: 18 }}>Stock épuisé</span>
            )}
          </div>

          <div style={{ marginTop: 18 }}>
            <Link className="muted" to="/products">← Retour</Link>
          </div>
        </div>
      </div>

      {/* Avis & notes */}
      <div
        style={{
          marginTop: 32,
          display: "grid",
          gridTemplateColumns: "minmax(0, 2fr) minmax(0, 3fr)",
          gap: 20,
          alignItems: "flex-start",
        }}
      >
        <div className="panel">
          <h2 className="sectionTitle">Note du produit</h2>
          <p className="sectionSub">
            Donnez une note sur 10 et partagez votre expérience.
          </p>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 16,
              marginTop: 10,
            }}
          >
            <div>
              <div
                style={{
                  fontSize: 32,
                  fontWeight: 900,
                }}
              >
                {(product.averageRating || 0).toFixed(1)}
                <span
                  style={{
                    fontSize: 16,
                    color: "var(--muted)",
                    marginLeft: 4,
                  }}
                >
                  /10
                </span>
              </div>
              <div style={{ marginTop: 4 }}>
                <Stars value={product.averageRating || 0} />
              </div>
              <div
                style={{
                  marginTop: 6,
                  fontSize: 13,
                  color: "var(--muted)",
                }}
              >
                {product.ratingsCount || 0} avis
              </div>
            </div>
          </div>

          <div style={{ marginTop: 20 }}>
            <div className="field">
              <span className="fieldLabel">Votre note (sur 10)</span>
              <input
                type="range"
                min="0"
                max="10"
                step="1"
                value={rating}
                onChange={(e) => setRating(Number(e.target.value) || 0)}
              />
              <div
                style={{
                  marginTop: 6,
                  fontSize: 14,
                  fontWeight: 700,
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <span>
                  Votre note :{" "}
                  <b>
                    {rating}
                    /10
                  </b>
                </span>
                <Stars value={rating} />
              </div>
            </div>

            <div className="field" style={{ marginTop: 12 }}>
              <span className="fieldLabel">Votre avis</span>
              <textarea
                rows={3}
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
                placeholder="Partagez ce que vous avez aimé (ou moins aimé) de ce produit..."
                style={{ resize: "vertical" }}
              />
            </div>

            <div
              style={{
                marginTop: 14,
                display: "flex",
                justifyContent: "flex-end",
              }}
            >
              <button
                type="button"
                className="btnPrimary"
                style={{ marginTop: 0 }}
                onClick={submitReview}
                disabled={sendingReview}
              >
                {sendingReview ? "Envoi de votre avis..." : "Envoyer mon avis"}
              </button>
            </div>
          </div>
        </div>

        <div className="panel">
          <h2 className="sectionTitle">Tous les avis</h2>
          {product.reviews && product.reviews.length > 0 ? (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 12,
                marginTop: 8,
              }}
            >
              {product.reviews.filter(r => r.isApproved).map((r) => (
                <div
                  key={r._id || `${r.user?._id}-${r.createdAt}`}
                  style={{
                    borderRadius: 14,
                    border: "1px solid var(--line)",
                    padding: 12,
                    background: "rgba(255,255,255,.9)",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: 4,
                      gap: 10,
                    }}
                  >
                    <div
                      style={{
                        fontWeight: 800,
                        fontSize: 14,
                      }}
                    >
                      {r.user?.name || "Client"}
                    </div>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                      }}
                    >
                      <Stars value={r.rating || 0} />
                      <span
                        style={{
                          fontSize: 12,
                          color: "var(--muted)",
                          fontWeight: 700,
                        }}
                      >
                        {(r.rating || 0).toFixed(1)}/10
                      </span>
                    </div>
                  </div>
                  {r.comment && (
                    <p
                      style={{
                        margin: "4px 0 6px",
                        fontSize: 14,
                        lineHeight: 1.5,
                      }}
                    >
                      {r.comment}
                    </p>
                  )}
                  <span
                    style={{
                      fontSize: 11,
                      color: "var(--muted)",
                    }}
                  >
                    {r.createdAt &&
                      new Date(r.createdAt).toLocaleDateString("fr-FR", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="sectionSub" style={{ marginTop: 8 }}>
              Aucun avis pour le moment. Soyez le premier à donner votre avis !
            </p>
          )}
        </div>
      </div>

      {/* ✅ Modal de Promo Cadeau */}
      {earnedPromo && (
        <div
          className="modalOverlay"
          style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.6)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999, padding: "20px" }}
        >
          <div
            className="modal"
            style={{
              background: "#fff",
              padding: "40px",
              borderRadius: "24px",
              textAlign: "center",
              maxWidth: "500px",
              boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
              border: "2px solid var(--accent)",
              animation: "fadeInUp 0.3s ease-out"
            }}
          >
            <div style={{ fontSize: "60px", marginBottom: "15px" }}>🎁</div>
            <h2 style={{ margin: "0 0 15px", fontSize: "28px", color: "var(--accent)" }}>Merci pour votre avis !</h2>
            <p style={{ fontSize: "16px", color: "var(--text)", marginBottom: "25px", lineHeight: "1.5" }}>
              Pour vous remercier de votre excellente note, nous vous offrons <b>{earnedPromo.discountPercentage}% de réduction</b> sur l'ensemble de notre boutique !
            </p>

            <div style={{ background: "#fbfbfa", border: "1px dashed var(--muted)", borderRadius: "12px", padding: "20px", marginBottom: "25px", display: "flex", flexDirection: "column", alignItems: "center", gap: "15px" }}>
              <span style={{ fontSize: "14px", color: "var(--muted)", textTransform: "uppercase", letterSpacing: "1px", fontWeight: "bold" }}>Votre Code Promo</span>
              <span style={{ fontSize: "32px", fontWeight: "900", letterSpacing: "2px", color: "#111" }}>{earnedPromo.code}</span>
            </div>

            <div style={{ display: "flex", gap: "15px", justifyContent: "center" }}>
              <button
                className="ecoBtn ghost"
                onClick={() => {
                  setEarnedPromo(null);
                  dispatch(fetchProductBySlug(slug)); // ✅ Recharge la page une fois fermé
                }}
              >
                Fermer
              </button>

              <button
                className="ecoBtn"
                onClick={() => {
                  navigator.clipboard.writeText(earnedPromo.code);
                  toast.success("Code copié dans le presse-papier !", { autoClose: 2000, position: "top-center" });
                }}
                style={{ background: "var(--accent)", border: "none" }}
              >
                📋 Copier le code
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}