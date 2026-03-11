import React, { useState, useEffect } from "react";
import api from "../../JS/api/axios";
import { toast } from "react-toastify";

export default function AdminReviews() {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchReviews = async () => {
        try {
            const { data } = await api.get("/admin/reviews");
            setReviews(data);
        } catch (err) {
            const msg = err.response?.data?.message || "Erreur de chargement des avis";
            toast.error(msg);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReviews();
    }, []);

    const handleModerate = async (productId, reviewId, action) => {
        try {
            await api.put(`/admin/reviews/${productId}/${reviewId}/moderate`, { action });
            toast.success(
                action === "approve" ? "✅ Avis approuvé" :
                    action === "block" ? "⛔ Avis bloqué" : "🗑️ Avis supprimé"
            );
            fetchReviews();
        } catch (err) {
            toast.error("Erreur lors de la modération");
        }
    };

    if (loading) return <div className="container">Chargement...</div>;

    const blocked = reviews.filter(r => !r.isApproved);
    const approved = reviews.filter(r => r.isApproved);

    const ReviewTable = ({ list, title }) => (
        <div style={{ marginBottom: 40 }}>
            <h3>{title} ({list.length})</h3>
            {list.length === 0 ? (
                <p className="muted">Aucun avis dans cette catégorie.</p>
            ) : (
                <div className="panel" style={{ padding: 0, overflow: "hidden" }}>
                    <table style={{ width: "100%", borderCollapse: "collapse" }}>
                        <thead>
                            <tr style={{ background: "#f8fafc", borderBottom: "1px solid var(--line)" }}>
                                <th style={{ padding: 12, textAlign: "left" }}>Produit</th>
                                <th style={{ padding: 12, textAlign: "left" }}>Utilisateur</th>
                                <th style={{ padding: 12, textAlign: "center" }}>Note</th>
                                <th style={{ padding: 12, textAlign: "left" }}>Commentaire</th>
                                <th style={{ padding: 12, textAlign: "right" }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {list.map((r) => (
                                <tr key={r._id} style={{ borderBottom: "1px solid var(--line)" }}>
                                    <td style={{ padding: 12 }}>{r.productTitle}</td>
                                    <td style={{ padding: 12 }}>{r.user?.name || "Anonyme"}</td>
                                    <td style={{ padding: 12, textAlign: "center", fontWeight: "bold" }}>{r.rating}/10</td>
                                    <td style={{ padding: 12, fontSize: 13 }}>{r.comment}</td>
                                    <td style={{ padding: 12, textAlign: "right" }}>
                                        <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
                                            {!r.isApproved ? (
                                                <button
                                                    style={{
                                                        padding: "8px 14px",
                                                        border: "none",
                                                        borderRadius: 10,
                                                        cursor: "pointer",
                                                        fontWeight: 800,
                                                        fontSize: 12,
                                                        transition: ".2s",
                                                        background: "#d1fae5",
                                                        color: "#065f46"
                                                    }}
                                                    onClick={() => handleModerate(r.productId, r._id, "approve")}
                                                >
                                                    ✅ Approuver
                                                </button>
                                            ) : (
                                                <button
                                                    style={{
                                                        padding: "8px 14px",
                                                        border: "none",
                                                        borderRadius: 10,
                                                        cursor: "pointer",
                                                        fontWeight: 800,
                                                        fontSize: 12,
                                                        transition: ".2s",
                                                        background: "#fef3c7",
                                                        color: "#b45309"
                                                    }}
                                                    onClick={() => handleModerate(r.productId, r._id, "block")}
                                                >
                                                    ⛔ Bloquer
                                                </button>
                                            )}
                                            <button
                                                style={{
                                                    padding: "8px 14px",
                                                    border: "none",
                                                    borderRadius: 10,
                                                    cursor: "pointer",
                                                    fontWeight: 800,
                                                    fontSize: 12,
                                                    transition: ".2s",
                                                    background: "#fee2e2",
                                                    color: "#dc2626"
                                                }}
                                                onClick={() => handleModerate(r.productId, r._id, "delete")}
                                            >
                                                🗑️ Supprimer
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );

    return (
        <div className="container">
            <h1 style={{ marginBottom: 30 }}>Modération des Avis</h1>

            <ReviewTable list={blocked} title="Avis Bloqués / Signalés" />
            <hr style={{ margin: "40px 0", border: "none", borderTop: "1px solid var(--line)" }} />
            <ReviewTable list={approved} title="Avis Visibles" />
        </div>
    );
}
