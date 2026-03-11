import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { changeQty, removeFromCart, clearCart } from "../JS/redux/slices/cartSlice";
import { Link, useNavigate } from "react-router-dom";
import api from "../JS/api/axios";
import { toast } from "react-toastify";


export default function Cart() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const items = useSelector((s) => s.cart.items);
  const user = useSelector((s) => s.auth.user);

  const [promoCode, setPromoCode] = React.useState("");
  const [discount, setDiscount] = React.useState(0);
  const [applyingPromo, setApplyingPromo] = React.useState(false);

  // ✅ helper pour afficher en TND
  const toTND = (price) => {
    const v = Number(price) || 0;
    return `${v.toFixed(3)} TND`;
  };

  const subtotal = items.reduce((sum, x) => sum + x.price * x.qty, 0);
  const totalTND = subtotal - (subtotal * discount / 100);

  const handleApplyPromo = async () => {
    if (!promoCode.trim()) return;
    try {
      setApplyingPromo(true);
      const { data } = await api.post("/coupons/validate", { code: promoCode });
      setDiscount(data.discount);
      toast.success(data.message);
    } catch (err) {
      setDiscount(0);
      toast.error(err.response?.data?.message || "Code invalide");
    } finally {
      setApplyingPromo(false);
    }
  };

  const handleCheckout = async () => {
    if (!user?._id) {
      toast.info("Veuillez vous connecter pour valider votre commande.", { autoClose: 4000 });
      navigate("/login");
      return;
    }

    try {
      const { data } = await api.post("/orders", {
        items,
        total: totalTND,
        phone: user.phone,
        shippingAddress: user.address,
        guestName: user.name,
        appliedCoupon: discount > 0 ? promoCode : null
      });

      dispatch(clearCart());

      // ✅ Redirection vers la facture avec les données
      navigate("/invoice", {
        state: {
          order: data.order || data,
          userName: user.name
        }
      });
    } catch (error) {
      console.error(error);
      toast.error(`❌ ${error.response?.data?.message || "Erreur lors de la validation de la commande"}`, {
        position: "top-right",
        autoClose: 5000,
      });
    }
  };

  return (
    <div className="container">
      <h1>Panier</h1>

      {items.length === 0 ? (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px",
            textAlign: "center",
            minHeight: "60vh",
          }}
        >
          {/* Illustration SVG panier vide - taille réduite */}
          <svg
            width="200"
            height="200"
            viewBox="0 0 200 200"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            style={{ marginBottom: 16, opacity: 0.7 }}
          >
            {/* Panier */}
            <path
              d="M50 80 L50 160 L150 160 L150 80"
              stroke="#c79b5b"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
            <path
              d="M40 80 L50 50 L150 50 L160 80"
              stroke="#c79b5b"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
            {/* Poignée */}
            <path
              d="M70 50 Q100 30 130 50"
              stroke="#c79b5b"
              strokeWidth="3"
              strokeLinecap="round"
              fill="none"
            />
            {/* Lignes décoratives (panier vide) */}
            <circle cx="100" cy="120" r="2" fill="#c79b5b" opacity="0.4" />
            <circle cx="100" cy="130" r="2" fill="#c79b5b" opacity="0.3" />
            <circle cx="100" cy="140" r="2" fill="#c79b5b" opacity="0.2" />
          </svg>

          <h2
            style={{
              fontSize: 24,
              fontWeight: 900,
              margin: "0 0 8px",
              color: "#111",
            }}
          >
            Votre panier est vide
          </h2>
          <p
            style={{
              fontSize: 15,
              color: "var(--muted)",
              margin: "0 0 20px",
              maxWidth: 400,
            }}
          >
            Il semble que vous n'ayez pas encore ajouté de produits à votre
            panier. Explorez notre catalogue et trouvez des articles qui vous
            plaisent !
          </p>
          <Link
            to="/products"
            className="btnPrimary"
            style={{
              textDecoration: "none",
              display: "inline-block",
              marginTop: 0,
            }}
          >
            Découvrir les produits
          </Link>
        </div>
      ) : (
        <>
          <div className="cartList">
            {items.map((x) => (
              <div key={x.id} className="cartRow">
                <img
                  className="cartImg"
                  src={x.image || "https://via.placeholder.com/100"}
                  alt={x.title}
                  style={{ objectFit: "contain", backgroundColor: "#f7f7f5" }}
                />

                <div className="cartInfo">
                  <Link to={`/products/${x.slug}`} className="cartTitle">
                    {x.title}
                  </Link>

                  {/* ✅ prix unitaire en TND */}
                  <div className="muted">{toTND(x.price)}</div>
                </div>

                <div className="qtyWrap" style={{ width: "max-content", margin: "0 auto" }}>
                  <button
                    className="qtyBtn"
                    type="button"
                    onClick={() =>
                      dispatch(changeQty({ id: x.id, qty: Math.max(1, x.qty - 1) }))
                    }
                  >
                    -
                  </button>
                  <span className="qtyVal">{x.qty}</span>
                  <button
                    className="qtyBtn"
                    type="button"
                    disabled={x.qty >= (x.stock || 999)}
                    onClick={() => dispatch(changeQty({ id: x.id, qty: x.qty + 1 }))}
                  >
                    +
                  </button>
                </div>

                {/* ✅ sous-total ligne en TND */}
                <div className="cartSum">{toTND(x.price * x.qty)}</div>

                <button className="cartTrash" onClick={() => dispatch(removeFromCart(x.id))} title="Supprimer le produit">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="3 6 5 6 21 6"></polyline>
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                    <line x1="10" y1="11" x2="10" y2="17"></line>
                    <line x1="14" y1="11" x2="14" y2="17"></line>
                  </svg>
                </button>
              </div>
            ))}
          </div>

          {/* Code Promo UI */}
          <div style={{ display: "flex", gap: "10px", alignItems: "center", marginBottom: "16px", paddingBottom: "16px", borderBottom: "1px solid var(--line)", width: "100%", flexWrap: "wrap" }}>
            <input
              type="text"
              placeholder="Code Promo"
              value={promoCode}
              onChange={(e) => setPromoCode(e.target.value)}
              style={{ padding: "10px 14px", borderRadius: "10px", border: "1px solid var(--line)", outline: "none", flex: 1, minWidth: "150px" }}
            />
            <button
              className="cartBtn cartBtnPrimary"
              style={{ padding: "10px 20px" }}
              onClick={handleApplyPromo}
              disabled={applyingPromo || !promoCode}
            >
              {applyingPromo ? "Test..." : "Appliquer"}
            </button>
          </div>

          {/* ✅ total en TND */}
          <div className="cartTotal" style={{ width: "100%", display: "flex", justifyContent: "space-between", marginBottom: "16px" }}>
            {discount > 0 ? (
              <>
                <div style={{ display: "flex", flexDirection: "column" }}>
                  <span style={{ fontSize: 14, color: "var(--muted)", textDecoration: "line-through" }}>{toTND(subtotal)}</span>
                  <span>Total (-{discount}%) :</span>
                </div>
                <span>{toTND(totalTND)}</span>
              </>
            ) : (
              <>
                <span>Total :</span>
                <span>{toTND(totalTND)}</span>
              </>
            )}
          </div>

          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", flex: 1, justifyContent: "flex-end", width: "100%" }}>
            <Link to="/products" className="cartBtn cartBtnGhost" style={{ textDecoration: 'none' }}>
              Continuer mes achats
            </Link>

            <button className="cartBtn cartBtnGhost" onClick={() => dispatch(clearCart())}>
              Vider le panier
            </button>

            <button
              className="cartBtn cartBtnPrimary"
              onClick={handleCheckout}
            >
              Valider la commande
            </button>
          </div>
        </>
      )}
    </div>
  );
}
