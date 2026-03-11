import React, { useEffect, useMemo, useState } from "react";
import api from "../../JS/api/axios";
import ConfirmModal from "../../Components/ConfirmModal";
import { toast } from "react-toastify";

export default function ProductFormModal({ initial, categories = [], onClose, onSaved }) {
  const isEdit = !!initial?._id;

  const [title, setTitle] = useState(initial?.title || "");
  const [description, setDescription] = useState(initial?.description || "");
  const [price, setPrice] = useState(initial?.price ?? "");
  const [image, setImage] = useState(initial?.image || "");
  const [category, setCategory] = useState(initial?.category?._id || initial?.category || "");
  const [stock, setStock] = useState(initial?.stock ?? 0);
  const [promoPercentage, setPromoPercentage] = useState(initial?.promoPercentage ?? 0);
  const [isFeatured, setIsFeatured] = useState(initial?.isFeatured ?? false);
  const [colors, setColors] = useState(initial?.colors?.join(", ") || "");
  const [sizes, setSizes] = useState(initial?.sizes?.join(", ") || "");
  const [existingImages, setExistingImages] = useState(initial?.images || []);
  const [newImages, setNewImages] = useState([]);

  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [aiGenerating, setAiGenerating] = useState(false);

  useEffect(() => {
    setTitle(initial?.title || "");
    setDescription(initial?.description || "");
    setPrice(initial?.price ?? "");
    setImage(initial?.image || "");
    setCategory(initial?.category?._id || initial?.category || "");
    setStock(initial?.stock ?? 0);
    setPromoPercentage(initial?.promoPercentage ?? 0);
    setIsFeatured(initial?.isFeatured ?? false);
    setColors(initial?.colors?.join(", ") || "");
    setSizes(initial?.sizes?.join(", ") || "");
    setExistingImages(initial?.images || []);
    setNewImages([]);
    setFile(null);
    setPreview(initial?.image || "");
  }, [initial]);

  useEffect(() => {
    if (!file) return;
    const url = URL.createObjectURL(file);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  const canSave = useMemo(() => {
    return title.trim() && String(price).trim() && category;
  }, [title, price, category]);

  const generateDescriptionFromImage = async () => {
    if (!file && !image && !preview) return;
    setAiGenerating(true);
    try {
      const payload = new FormData();
      if (file) {
        payload.append("image", file);
      } else {
        payload.append("imageUrl", image || preview);
      }

      const { data } = await api.post("/ai/describe-image", payload, {
        headers: { "Content-Type": "multipart/form-data" }
      });

      if (data.description) {
        setDescription(data.description);
        toast.success("✨ Description IA générée !");
      }
    } catch (err) {
      console.error(err);
      toast.error("❌ Erreur avec l'IA. Vérifiez que la clé API est configurée dans le backend.");
    } finally {
      setAiGenerating(false);
    }
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!canSave) return;

    setLoading(true);
    try {
      const fd = new FormData();
      fd.append("title", title.trim());
      fd.append("description", description.trim());
      fd.append("price", Number(price));

      if (file) {
        fd.append("image", file);
      } else if (preview) {
        fd.append("image", image.trim());
      } else {
        fd.append("image", ""); // ✅ Supprime l'image
      }

      fd.append("category", category);
      fd.append("stock", Number(stock) || 0);
      fd.append("promoPercentage", Number(promoPercentage) || 0);
      fd.append("isFeatured", isFeatured);

      fd.append("colors", JSON.stringify(colors.split(",").map(c => c.trim()).filter(Boolean)));
      fd.append("sizes", JSON.stringify(sizes.split(",").map(s => s.trim()).filter(Boolean)));

      if (existingImages.length > 0) {
        fd.append("images", JSON.stringify(existingImages));
      }
      newImages.forEach(f => fd.append("images", f));

      const config = { headers: { "Content-Type": "multipart/form-data" } };

      if (isEdit) await api.put(`/products/${initial._id}`, fd, config);
      else await api.post(`/products`, fd, config);

      onSaved?.();
      onClose?.();
    } catch (err) {
      console.error(err);
      const msg = err.response?.data?.message || "Erreur lors de l'enregistrement";
      setErrorMsg(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modalBackdrop" role="dialog" aria-modal="true">
      <div className="modal modalWide">
        <div className="modalHeader">
          <h2 className="modalTitle">{isEdit ? "Modifier produit" : "Ajouter produit"}</h2>
          <button className="iconClose" type="button" onClick={onClose} aria-label="Fermer">✕</button>
        </div>

        <form className="productForm" onSubmit={submit}>
          <div className="field">
            <label className="fieldLabel">Titre</label>
            <input value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>

          <div className="field fieldSpan2">
            <label className="fieldLabel" style={{ display: "flex", alignItems: "center" }}>
              <span>Description</span>
              {(file || preview || image) && (
                <button
                  type="button"
                  onClick={generateDescriptionFromImage}
                  disabled={aiGenerating}
                  style={{
                    marginLeft: 12, background: "linear-gradient(90deg, #A855F7, #EC4899)",
                    color: "white", border: "none", borderRadius: 6, padding: "4px 8px",
                    fontSize: 12, cursor: "pointer", fontWeight: "bold",
                    opacity: aiGenerating ? 0.6 : 1
                  }}
                >
                  {aiGenerating ? "✨ Génération..." : "✨ Générer via IA"}
                </button>
              )}
            </label>
            <textarea rows={3} value={description} onChange={(e) => setDescription(e.target.value)} />
          </div>

          <div className="field">
            <label className="fieldLabel">Prix (TND)</label>
            <input
              type="number"
              step="0.001"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
            />
          </div>

          <div className="field">
            <label className="fieldLabel">Stock</label>
            <input type="number" value={stock} onChange={(e) => setStock(e.target.value)} />
          </div>

          <div className="field">
            <label className="fieldLabel">Remise Promo (%)</label>
            <input type="number" min="0" max="100" value={promoPercentage} onChange={(e) => setPromoPercentage(e.target.value)} />
          </div>

          <div className="field" style={{ display: "flex", alignItems: "center", gap: "10px", marginTop: "10px" }}>
            <input
              type="checkbox"
              id="isFeatured"
              checked={isFeatured}
              onChange={(e) => setIsFeatured(e.target.checked)}
              style={{ width: "auto", margin: 0 }}
            />
            <label htmlFor="isFeatured" style={{ fontWeight: "bold", cursor: "pointer" }}>Mettre à la Une (Featured)</label>
          </div>

          <div className="field">
            <label className="fieldLabel">Tailles (séparées par des virgules)</label>
            <input value={sizes} onChange={(e) => setSizes(e.target.value)} placeholder="S, M, L, XL" />
          </div>

          <div className="field">
            <label className="fieldLabel">Couleurs (séparées par des virgules)</label>
            <input value={colors} onChange={(e) => setColors(e.target.value)} placeholder="Rouge, Bleu, Vert" />
          </div>

          <div className="field fieldSpan2">
            <label className="fieldLabel">Image (URL ou fichier)</label>
            <input value={image} onChange={(e) => setImage(e.target.value)} placeholder="URL de l'image (optionnel)" />
            <div style={{ marginTop: 10 }}>
              <input
                type="file"
                accept="image/*"
                className="customFileInput"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
              />
            </div>
            {preview && (
              <div style={{ marginTop: 15, position: "relative", display: "inline-block" }}>
                <img
                  src={preview}
                  alt="preview"
                  style={{ width: "100%", maxHeight: 250, objectFit: "cover", borderRadius: 16, border: "1px solid #eee" }}
                />
                <button
                  type="button"
                  style={{
                    position: "absolute",
                    top: 10,
                    right: 10,
                    background: "rgba(255, 255, 255, 0.9)",
                    color: "#ef4444",
                    border: "1px solid #fee2e2",
                    borderRadius: "12px",
                    padding: "8px 12px",
                    fontSize: "12px",
                    fontWeight: "900",
                    cursor: "pointer",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                    display: "flex",
                    alignItems: "center",
                    gap: "5px",
                    transition: "all 0.2s"
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "#ef4444";
                    e.currentTarget.style.color = "#fff";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "rgba(255, 255, 255, 0.9)";
                    e.currentTarget.style.color = "#ef4444";
                  }}
                  onClick={() => {
                    setFile(null);
                    setPreview("");
                    setImage("");
                    const fileInput = document.querySelector('.customFileInput');
                    if (fileInput) fileInput.value = "";
                  }}
                >
                  🗑️ Retirer l'image principale
                </button>
              </div>
            )}
          </div>

          <div className="field fieldSpan2">
            <label className="fieldLabel">Galerie d'images supplémentaires</label>
            <input
              type="file"
              accept="image/*"
              multiple
              className="customFileInput"
              onChange={(e) => setNewImages(Array.from(e.target.files || []))}
            />

            {/* Display new images preview */}
            {newImages.length > 0 && (
              <div style={{ marginTop: 10, display: "flex", gap: 10, flexWrap: "wrap" }}>
                {newImages.map((file, idx) => (
                  <div key={idx} style={{ position: "relative" }}>
                    <img src={URL.createObjectURL(file)} alt="new preview" style={{ width: 80, height: 80, objectFit: "cover", borderRadius: 8 }} />
                  </div>
                ))}
              </div>
            )}

            {/* Display existing images */}
            {existingImages.length > 0 && (
              <div style={{ marginTop: 10, display: "flex", gap: 10, flexWrap: "wrap" }}>
                {existingImages.map((img, idx) => (
                  <div key={idx} style={{ position: "relative" }}>
                    <img src={img} alt="existing" style={{ width: 80, height: 80, objectFit: "cover", borderRadius: 8 }} />
                    <button
                      type="button"
                      onClick={() => setExistingImages(existingImages.filter((_, i) => i !== idx))}
                      style={{
                        position: "absolute", top: -5, right: -5, background: "red", color: "white",
                        border: "none", borderRadius: "50%", width: 20, height: 20, cursor: "pointer",
                        fontSize: 10, display: "flex", alignItems: "center", justifyContent: "center"
                      }}
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="field fieldSpan2">
            <label className="fieldLabel">Catégorie</label>
            <select value={category} onChange={(e) => setCategory(e.target.value)}>
              <option value="">-- Choisir une catégorie --</option>
              {categories.map((c) => (
                <option key={c._id} value={c._id}>{c.name}</option>
              ))}
            </select>
          </div>

          <div className="formActions">
            <button className="ecoBtn ghost" type="button" onClick={onClose}>Annuler</button>
            <button className="ecoBtn" type="submit" disabled={!canSave || loading}>
              {loading ? "Enregistrement..." : "Enregistrer"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}