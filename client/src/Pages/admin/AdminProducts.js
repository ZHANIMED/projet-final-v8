import React, { useEffect, useState } from "react";
import api from "../../JS/api/axios";
import { useDispatch, useSelector } from "react-redux";
import { fetchProducts } from "../../JS/redux/slices/productSlice";
import { fetchCategories } from "../../JS/redux/slices/categorySlice";
import ProductFormModal from "./ProductFormModal";
import ConfirmModal from "../../Components/ConfirmModal";
import { toast } from "react-toastify";

export default function AdminProducts() {
  const dispatch = useDispatch();
  const { list: products, loading } = useSelector((s) => s.products);
  const categories = useSelector((s) => s.categories.list);

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);

  const formatTND = (price) => {
    const tnd = Number(price) || 0;
    return `${tnd.toFixed(3)} TND`;
  };

  useEffect(() => {
    dispatch(fetchCategories());
    dispatch(fetchProducts({}));
  }, [dispatch]);

  const handleRemove = async () => {
    if (!confirmDelete) return;
    try {
      await api.delete(`/products/${confirmDelete}`);
      dispatch(fetchProducts({}));
      toast.success("🗑️ Produit supprimé avec succès", { autoClose: 2000 });
    } catch {
      toast.error("❌ Erreur lors de la suppression");
    } finally {
      setConfirmDelete(null);
    }
  };

  return (
    <div className="container">
      <div className="rowBetween">
        <h1>Produits</h1>
        <button
          className="btnPrimary"
          onClick={() => {
            setEditing(null);
            setOpen(true);
          }}
        >
          + Ajouter
        </button>
      </div>

      {loading ? (
        <div className="skeletonGrid">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div key={i} className="skeletonCard" style={{ height: 200, borderRadius: 20, background: '#f5f5f5' }} />
          ))}
        </div>
      ) : (
        <div className="grid4">
          {products.map((p) => (
            <div key={p._id} className="card">
              <img
                className="cardImg"
                src={p.image || "https://via.placeholder.com/600x400"}
                alt={p.title}
              />
              <div className="cardBody">
                <div className="cardTitle">{p.title}</div>
                <div className="muted">{formatTND(p.price)}</div>

                <div className="adminActions">
                  <button
                    className="btn"
                    onClick={() => {
                      setEditing(p);
                      setOpen(true);
                    }}
                  >
                    ✏️
                  </button>
                  <button className="btn" onClick={() => setConfirmDelete(p._id)}>
                    🗑️
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {open && (
        <ProductFormModal
          categories={categories}
          initial={editing}
          onClose={() => setOpen(false)}
          onSaved={() => dispatch(fetchProducts({}))}
        />
      )}

      {confirmDelete && (
        <ConfirmModal
          title="Supprimer le produit ?"
          message="Êtes-vous sûr de vouloir supprimer cet article ? Cette action est définitive."
          onConfirm={handleRemove}
          onCancel={() => setConfirmDelete(null)}
          confirmText="Supprimer"
          danger={true}
        />
      )}
    </div>
  );
}