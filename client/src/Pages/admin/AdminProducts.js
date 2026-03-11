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
  const [importing, setImporting] = useState(false);

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

  const toggleFeatured = async (product) => {
    try {
      await api.put(`/products/${product._id}`, { isFeatured: !product.isFeatured });
      dispatch(fetchProducts({}));
      toast.success(product.isFeatured ? "✨ Retiré de la Une" : "🌟 Mis à la Une !");
    } catch {
      toast.error("❌ Erreur lors de la mise à jour");
    }
  };

  const exportToCSV = () => {
    if (!products.length) return toast.info("Aucun produit à exporter.");

    const headers = ["Title", "Price", "Category_ID", "Stock", "PromoPercentage", "Description", "Image", "Images", "Colors", "Sizes", "IsFeatured"];
    const rows = products.map(p => {
      return [
        p.title,
        p.price,
        p.category?._id || p.category,
        p.stock,
        p.promoPercentage,
        p.description || "",
        p.image || "",
        (p.images || []).join(","),
        (p.colors || []).join(","),
        (p.sizes || []).join(","),
        p.isFeatured ? "true" : "false"
      ].map(val => `"${String(val).replace(/"/g, '""')}"`);
    });

    const csvContent = [headers.join(";"), ...rows.map(r => r.join(";"))].join("\n");
    const blob = new Blob(["\ufeff" + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `Export_Produits_${new Date().toLocaleDateString()}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("📁 Export CSV prêt !");
  };

  const handleImportCSV = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImporting(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await api.post("/products/bulk-import", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      toast.success(res.data.message || "Importation réussie");
      dispatch(fetchProducts({}));
    } catch (err) {
      toast.error(err.response?.data?.message || "Erreur lors de l'importation");
    } finally {
      setImporting(false);
      e.target.value = null; // reset input
    }
  };

  return (
    <div className="container">
      <div className="rowBetween" style={{ marginBottom: 25, flexWrap: "wrap", gap: 15 }}>
        <h1 style={{ margin: 0 }}>📦 Gestion des Produits</h1>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
          <button
            onClick={exportToCSV}
            style={{
              padding: "10px 18px",
              background: "linear-gradient(135deg, #10b981, #059669)",
              color: "white",
              border: "none",
              borderRadius: "12px",
              fontWeight: 800,
              cursor: "pointer",
              boxShadow: "0 4px 10px rgba(16, 185, 129, 0.3)",
              transition: "transform 0.2s"
            }}
          >
            📥 Exporter CSV
          </button>
          <label
            style={{
              padding: "10px 18px",
              background: "white",
              color: "#374151",
              border: "1px solid #d1d5db",
              borderRadius: "12px",
              fontWeight: 800,
              cursor: importing ? "not-allowed" : "pointer",
              boxShadow: "0 2px 5px rgba(0,0,0,0.05)",
              display: "flex",
              alignItems: "center",
              transition: "transform 0.2s",
              opacity: importing ? 0.6 : 1
            }}
          >
            {importing ? "⏳ Import..." : "📤 Importer CSV"}
            <input
              type="file"
              accept=".csv"
              onChange={handleImportCSV}
              style={{ display: "none" }}
              disabled={importing}
            />
          </label>
          <button
            onClick={() => {
              setEditing(null);
              setOpen(true);
            }}
            style={{
              padding: "10px 20px",
              background: "var(--dark)",
              color: "white",
              border: "none",
              borderRadius: "12px",
              fontWeight: 900,
              cursor: "pointer",
              boxShadow: "0 6px 15px rgba(0,0,0,0.15)",
              transition: "transform 0.2s"
            }}
          >
            ➕ Ajouter un Produit
          </button>
        </div>
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
                <div className="cardTitle" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span>{p.title}</span>
                  <button
                    onClick={(e) => { e.preventDefault(); toggleFeatured(p); }}
                    style={{ background: "none", border: "none", cursor: "pointer", fontSize: 20, padding: 0 }}
                    title={p.isFeatured ? "Retirer de la Une" : "Mettre à la Une"}
                  >
                    {p.isFeatured ? "⭐" : "☆"}
                  </button>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 4 }}>
                  <div className="muted">{formatTND(p.price)}</div>
                  <div style={{ fontSize: 13, fontWeight: "bold", color: p.stock > 0 ? "var(--accent)" : "#ef4444" }}>
                    Stock : {p.stock ?? 0}
                  </div>
                </div>

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