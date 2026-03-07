import React, { useEffect, useMemo, useState } from "react";
import api from "../../JS/api/axios";
import ConfirmModal from "../../Components/ConfirmModal";

export default function CategoryFormModal({ initial, onClose, onSaved }) {
  const isEdit = !!initial?._id;

  const [name, setName] = useState("");
  const [file, setFile] = useState(null);          // ✅ fichier upload
  const [preview, setPreview] = useState("");      // ✅ preview image
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    setName(initial?.name || "");
    setFile(null);
    setPreview(initial?.image || ""); // preview = image existante en edit
  }, [initial]);

  // créer un preview quand on choisit un fichier
  useEffect(() => {
    if (!file) return;
    const url = URL.createObjectURL(file);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  const canSave = useMemo(() => name.trim().length > 0, [name]);

  const submit = async (e) => {
    e.preventDefault();
    if (!canSave) return;

    setLoading(true);
    try {
      const fd = new FormData();
      fd.append("name", name.trim());
      if (file) fd.append("image", file); // ✅ nom du champ = "image"
      else if (!preview) fd.append("image", ""); // ✅ Si preview vide, on supprime l'image côté serveur

      if (isEdit) {
        await api.put(`/categories/${initial._id}`, fd, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      } else {
        await api.post(`/categories`, fd, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      }

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
      <div className="modal">
        <div className="modalHeader">
          <h2 className="modalTitle">
            {isEdit ? "Modifier catégorie" : "Ajouter catégorie"}
          </h2>
          <button className="iconClose" type="button" onClick={onClose} aria-label="Fermer">
            ✕
          </button>
        </div>

        <form className="productForm" onSubmit={submit}>
          <div className="field">
            <label className="fieldLabel">Nom</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nom catégorie"
            />
          </div>

          <div className="field">
            <label className="fieldLabel">Image (upload)</label>
            <input
              type="file"
              accept="image/*"
              className="customFileInput"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
            />
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
                    // Vider l'input file physiquement
                    const fileInput = document.querySelector('.customFileInput');
                    if (fileInput) fileInput.value = "";
                  }}
                >
                  🗑️ Retirer l'image
                </button>
              </div>
            )}
          </div>

          <div className="formActions">
            <button className="ecoBtn ghost" type="button" onClick={onClose}>
              Annuler
            </button>

            <button className="ecoBtn" type="submit" disabled={!canSave || loading}>
              {loading ? "Enregistrement..." : "Enregistrer"}
            </button>
          </div>
        </form>
      </div>

      {errorMsg && (
        <ConfirmModal
          title="Erreur"
          message={errorMsg}
          onConfirm={() => setErrorMsg("")}
          alertMode={true}
          type="danger"
        />
      )}
    </div>
  );
}