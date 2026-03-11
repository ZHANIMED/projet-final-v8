import React, { useState, useEffect } from "react";
import api from "../../JS/api/axios";
import { toast } from "react-toastify";
import ConfirmModal from "../../Components/ConfirmModal";

export default function AdminCoupons() {
    const [coupons, setCoupons] = useState([]);
    const [loading, setLoading] = useState(true);

    const [showModal, setShowModal] = useState(false);
    const [form, setForm] = useState({
        code: "",
        discountPercentage: "",
        isActive: true,
        expiresAt: "",
        usageLimit: ""
    });

    const [deleteId, setDeleteId] = useState(null);

    const fetchCoupons = async () => {
        try {
            setLoading(true);
            const { data } = await api.get("/coupons");
            setCoupons(data.coupons || []);
        } catch (err) {
            toast.error(err.response?.data?.message || "Erreur de chargement des coupons.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCoupons();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.code || !form.discountPercentage) return;

        try {
            await api.post("/coupons", {
                code: form.code,
                discountPercentage: Number(form.discountPercentage),
                isActive: form.isActive,
                expiresAt: form.expiresAt ? new Date(form.expiresAt).toISOString() : null,
                usageLimit: form.usageLimit ? Number(form.usageLimit) : 0
            });

            toast.success("Code promo créé avec succès !");
            setShowModal(false);
            setForm({ code: "", discountPercentage: "", isActive: true, expiresAt: "", usageLimit: "" });
            fetchCoupons();
        } catch (err) {
            toast.error(err.response?.data?.message || "Erreur création coupon");
        }
    };

    const confirmDelete = async () => {
        if (!deleteId) return;
        try {
            await api.delete(`/coupons/${deleteId}`);
            toast.success("Coupon supprimé");
            fetchCoupons();
        } catch (err) {
            toast.error("Erreur suppression");
        } finally {
            setDeleteId(null);
        }
    };

    return (
        <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                <h1 style={{ margin: 0 }}>Gestion des Coupons</h1>
                <button className="ecoBtn" onClick={() => setShowModal(true)}>
                    + Nouveau Code Promo
                </button>
            </div>

            {loading ? (
                <p>Chargement des coupons...</p>
            ) : coupons.length === 0 ? (
                <div className="panel" style={{ textAlign: "center", padding: 40 }}>
                    <p className="muted">Aucun code promo créé pour le moment.</p>
                </div>
            ) : (
                <div className="panel" style={{ padding: 0, overflow: "hidden" }}>
                    <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
                        <thead>
                            <tr style={{ background: "rgba(0,0,0,0.02)", borderBottom: "1px solid var(--line)" }}>
                                <th style={{ padding: "14px 20px" }}>Code Promo</th>
                                <th style={{ padding: "14px 20px" }}>Réduction</th>
                                <th style={{ padding: "14px 20px" }}>Statut</th>
                                <th style={{ padding: "14px 20px" }}>Utilisations</th>
                                <th style={{ padding: "14px 20px" }}>Expiration</th>
                                <th style={{ padding: "14px 20px", textAlign: "right" }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {coupons.map(c => (
                                <tr key={c._id} style={{ borderBottom: "1px solid var(--line)" }}>
                                    <td style={{ padding: "14px 20px", fontWeight: "bold" }}>
                                        <span style={{
                                            background: "var(--dark)",
                                            color: "#fff",
                                            padding: "4px 10px",
                                            borderRadius: 8,
                                            letterSpacing: 1
                                        }}>
                                            {c.code}
                                        </span>
                                    </td>
                                    <td style={{ padding: "14px 20px", fontWeight: 900, color: "var(--accent)" }}>-{c.discountPercentage}%</td>
                                    <td style={{ padding: "14px 20px" }}>
                                        {c.isActive ? (
                                            <span style={{ color: "#27ae60", fontWeight: "bold" }}>Actif</span>
                                        ) : (
                                            <span style={{ color: "var(--muted)" }}>Inactif</span>
                                        )}
                                    </td>
                                    <td style={{ padding: "14px 20px" }}>
                                        <div style={{ fontSize: 13, fontWeight: "bold" }}>
                                            {c.usageCount} / {c.usageLimit > 0 ? c.usageLimit : "∞"}
                                        </div>
                                    </td>
                                    <td style={{ padding: "14px 20px", color: "var(--muted)", fontSize: 13 }}>
                                        {c.expiresAt ? new Date(c.expiresAt).toLocaleDateString("fr-FR") : "Jamais"}
                                    </td>
                                    <td style={{ padding: "14px 20px", textAlign: "right" }}>
                                        <div className="adminActions" style={{ justifyContent: "flex-end", marginTop: 0 }}>
                                            <button className="iconDelete" onClick={() => setDeleteId(c._id)} title="Supprimer">🗑️</button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {showModal && (
                <div className="modalOverlay" onClick={() => setShowModal(false)} style={{
                    position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
                    background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999
                }}>
                    <div className="modal modalWide" onClick={(e) => e.stopPropagation()} style={{ background: "#fff", padding: 24, borderRadius: 16 }}>
                        <h2 style={{ marginTop: 0 }}>Créer un Code Promo</h2>
                        <form onSubmit={handleSubmit} className="productForm">
                            <div className="field">
                                <label className="fieldLabel">Code (ex: WELCOME10)</label>
                                <input
                                    type="text"
                                    required
                                    value={form.code}
                                    onChange={e => setForm({ ...form, code: e.target.value.toUpperCase() })}
                                    placeholder="CODE"
                                />
                            </div>
                            <div className="field">
                                <label className="fieldLabel">Réduction (%)</label>
                                <input
                                    type="number"
                                    required
                                    min="1"
                                    max="100"
                                    value={form.discountPercentage}
                                    onChange={e => setForm({ ...form, discountPercentage: e.target.value })}
                                    placeholder="Ex: 10"
                                />
                            </div>
                            <div className="field">
                                <label className="fieldLabel">Date d'expiration (optionnel)</label>
                                <input
                                    type="date"
                                    value={form.expiresAt}
                                    onChange={e => setForm({ ...form, expiresAt: e.target.value })}
                                />
                            </div>
                            <div className="field">
                                <label className="fieldLabel">Limite d'utilisation (0 = illimité)</label>
                                <input
                                    type="number"
                                    min="0"
                                    value={form.usageLimit}
                                    onChange={e => setForm({ ...form, usageLimit: e.target.value })}
                                    placeholder="Ex: 50"
                                />
                            </div>
                            <div className="field formActions">
                                <button type="button" className="ecoBtn ghost" onClick={() => setShowModal(false)}>Annuler</button>
                                <button type="submit" className="ecoBtn">Créer Code</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {deleteId && (
                <ConfirmModal
                    title="Supprimer le code"
                    message="Voulez-vous vraiment supprimer définitivement ce code promotionnel ?"
                    onConfirm={confirmDelete}
                    onCancel={() => setDeleteId(null)}
                />
            )}
        </div>
    );
}
