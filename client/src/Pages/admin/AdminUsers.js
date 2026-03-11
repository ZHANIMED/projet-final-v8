import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchAllUsers, toggleUserAdmin } from "../../JS/redux/slices/userSlice";
import api from "../../JS/api/axios";
import { toast } from "react-toastify";
import ConfirmModal from "../../Components/ConfirmModal";

export default function AdminUsers() {
    const dispatch = useDispatch();
    const { list: users = [], loading } = useSelector((s) => s.users);
    const currentUser = useSelector((s) => s.auth.user);

    const [confirmModal, setConfirmModal] = useState(null); // { user, action }
    const [banModal, setBanModal] = useState(null); // { user }
    const [historyModal, setHistoryModal] = useState(null); // { user, orders }
    const [loadingHistory, setLoadingHistory] = useState(false);

    useEffect(() => {
        dispatch(fetchAllUsers());
    }, [dispatch]);

    const handleConfirmToggle = async () => {
        if (!confirmModal) return;
        const { user } = confirmModal;

        try {
            await dispatch(toggleUserAdmin(user._id)).unwrap();
            toast.success(
                user.isAdmin
                    ? `✅ Droits admin retirés pour ${user.name}`
                    : `⭐ ${user.name} est maintenant administrateur`,
                { position: "top-right", autoClose: 3000 }
            );
            dispatch(fetchAllUsers()); // Refresh
        } catch (err) {
            toast.error(err || "Erreur lors de la modification", { position: "top-right" });
        } finally {
            setConfirmModal(null);
        }
    };

    const handleConfirmBan = async () => {
        if (!banModal) return;
        const { user } = banModal;
        try {
            const res = await api.patch(`/users/${user._id}/toggle-ban`);
            toast.success(res.data.message);
            dispatch(fetchAllUsers());
        } catch (err) {
            toast.error(err.response?.data?.message || "Erreur lors du bannissement");
        } finally {
            setBanModal(null);
        }
    };

    const handleViewHistory = async (user) => {
        setLoadingHistory(true);
        try {
            const res = await api.get(`/orders/user/${user._id}`);
            setHistoryModal({ user, orders: res.data });
        } catch (err) {
            toast.error("Impossible de charger l'historique.");
        } finally {
            setLoadingHistory(false);
        }
    };

    const exportToCSV = () => {
        if (!users || users.length === 0) return;

        const headers = ["ID", "Nom", "Email", "Telephone", "Adresse", "Date Inscription", "Est Admin", "Banni"];
        const rows = users.map(user => [
            user._id,
            user.name,
            user.email,
            user.phone || "",
            user.address || "",
            new Date(user.createdAt).toLocaleDateString("fr-FR"),
            user.isAdmin ? "OUI" : "NON",
            user.isBanned ? "OUI" : "NON"
        ]);

        const csvContent = [headers, ...rows].map(e => e.join(";")).join("\n");
        const blob = new Blob(["\ufeff" + csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", `Export_Clients_${new Date().toLocaleDateString()}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast.info("📁 Export CSV des utilisateurs prêt !");
    };

    const formatDate = (date) =>
        date ? new Date(date).toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" }) : "—";

    return (
        <div style={{ width: "100%", padding: "20px 40px" }}>
            {/* Header */}
            <div style={{ marginBottom: 28 }}>
                <h1 style={{ margin: "0 0 6px", fontSize: 36, fontWeight: 900, letterSpacing: "-0.5px" }}>
                    👥 Gestion des Utilisateurs
                </h1>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <p style={{ margin: 0, color: "var(--muted)", fontSize: 15 }}>
                        {users.length} utilisateur{users.length > 1 ? "s" : ""} inscrit{users.length > 1 ? "s" : ""}
                    </p>
                    <button
                        onClick={exportToCSV}
                        style={{
                            fontSize: 13,
                            padding: "8px 18px",
                            background: "linear-gradient(135deg, #10b981, #059669)",
                            color: "white",
                            border: "none",
                            borderRadius: "12px",
                            fontWeight: 800,
                            cursor: "pointer",
                            boxShadow: "0 4px 10px rgba(16, 185, 129, 0.3)",
                            transition: "all 0.2s"
                        }}
                    >
                        📥 Exporter CSV
                    </button>
                </div>
            </div>

            {loading ? (
                <div style={{ textAlign: "center", padding: "60px 0", color: "var(--muted)" }}>
                    <div style={{ fontSize: 40, marginBottom: 12 }}>⏳</div>
                    <p>Chargement des utilisateurs...</p>
                </div>
            ) : users.length === 0 ? (
                <div className="panel" style={{ textAlign: "center", padding: 60 }}>
                    <div style={{ fontSize: 48, marginBottom: 12 }}>👤</div>
                    <p style={{ color: "var(--muted)", margin: 0 }}>Aucun utilisateur trouvé.</p>
                </div>
            ) : (
                <div className="panel" style={{ padding: 0, overflow: "hidden" }}>
                    {/* Desktop Table */}
                    <div style={{ overflowX: "auto", width: "100%" }}>
                        <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 1000 }}>
                            <thead>
                                <tr style={{ background: "#f8fafc", borderBottom: "2px solid #e2e8f0" }}>
                                    {["Utilisateur", "Email", "Téléphone", "Adresse", "Inscrit le", "Rôle", "Action"].map((h) => (
                                        <th
                                            key={h}
                                            style={{
                                                padding: "16px 10px",
                                                color: "#475569",
                                                fontSize: 11,
                                                fontWeight: 900,
                                                textTransform: "uppercase",
                                                letterSpacing: ".05em",
                                                textAlign: "left",
                                                whiteSpace: "nowrap",
                                            }}
                                        >
                                            {h}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {users.map((user, idx) => {
                                    const isMe = currentUser && user._id === currentUser.id;
                                    return (
                                        <tr
                                            key={user._id}
                                            style={{
                                                background: idx % 2 === 0 ? "#fff" : "#fafafa",
                                                borderBottom: "1px solid #f3f4f6",
                                                transition: "background .15s",
                                            }}
                                        >
                                            <td style={{ padding: "14px 16px" }}>
                                                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                                    <div
                                                        style={{
                                                            width: 38,
                                                            height: 38,
                                                            borderRadius: 12,
                                                            background: user.isAdmin
                                                                ? "linear-gradient(135deg,#f59e0b,#d97706)"
                                                                : "linear-gradient(135deg,#6366f1,#4f46e5)",
                                                            display: "flex",
                                                            alignItems: "center",
                                                            justifyContent: "center",
                                                            color: "#fff",
                                                            fontWeight: 900,
                                                            fontSize: 15,
                                                            flexShrink: 0,
                                                            overflow: "hidden",
                                                        }}
                                                    >
                                                        {user.photo ? (
                                                            <img
                                                                src={user.photo}
                                                                alt={user.name}
                                                                style={{ width: "100%", height: "100%", objectFit: "cover" }}
                                                            />
                                                        ) : (
                                                            user.name?.charAt(0).toUpperCase()
                                                        )}
                                                    </div>
                                                    <div>
                                                        <div style={{ fontWeight: 900, fontSize: 14, color: "#111" }}>
                                                            {user.name}
                                                            {isMe && (
                                                                <span
                                                                    style={{
                                                                        marginLeft: 6,
                                                                        fontSize: 10,
                                                                        background: "#e0f2fe",
                                                                        color: "#0369a1",
                                                                        padding: "2px 7px",
                                                                        borderRadius: 999,
                                                                        fontWeight: 800,
                                                                    }}
                                                                >
                                                                    Vous
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td style={{ padding: "14px 10px", fontSize: 13, color: "#374151" }}>
                                                {user.email}
                                            </td>
                                            <td style={{ padding: "14px 10px", fontSize: 13, color: "#6b7280" }}>
                                                {user.phone || <span style={{ opacity: 0.4 }}>—</span>}
                                            </td>
                                            <td style={{ padding: "14px 10px", fontSize: 13, color: "#6b7280", maxWidth: 100, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                                {user.address || <span style={{ opacity: 0.4 }}>—</span>}
                                            </td>
                                            <td style={{ padding: "14px 10px", fontSize: 12, color: "#6b7280", whiteSpace: "nowrap" }}>
                                                {formatDate(user.createdAt)}
                                            </td>
                                            <td style={{ padding: "14px 16px" }}>
                                                {user.isAdmin ? (
                                                    <span style={{ display: "inline-flex", alignItems: "center", gap: 4, background: "linear-gradient(135deg,#fef9c3,#fde68a)", color: "#92400e", padding: "4px 10px", borderRadius: 999, fontSize: 12, fontWeight: 800, border: "1px solid #fcd34d" }}>⭐ Admin</span>
                                                ) : (
                                                    <span style={{ display: "inline-flex", alignItems: "center", gap: 4, background: "#f3f4f6", color: "#6b7280", padding: "4px 10px", borderRadius: 999, fontSize: 12, fontWeight: 700 }}>👤 Client</span>
                                                )}
                                            </td>
                                            <td style={{ padding: "14px 10px", display: "flex", gap: 6, whiteSpace: "nowrap" }}>
                                                <button
                                                    disabled={isMe}
                                                    onClick={() => setConfirmModal({ user })}
                                                    style={{
                                                        padding: "8px 14px",
                                                        borderRadius: 10,
                                                        border: "none",
                                                        cursor: isMe ? "not-allowed" : "pointer",
                                                        fontWeight: 800,
                                                        fontSize: 12,
                                                        transition: ".2s",
                                                        background: isMe ? "#f3f4f6" : user.isAdmin ? "#fee2e2" : "#d1fae5",
                                                        color: isMe ? "#9ca3af" : user.isAdmin ? "#dc2626" : "#065f46",
                                                        whiteSpace: "nowrap",
                                                        opacity: isMe ? 0.5 : 1,
                                                    }}
                                                >
                                                    {isMe ? "🔒 Vous" : user.isAdmin ? "🔽 Retirer admin" : "⭐ Promouvoir admin"}
                                                </button>
                                                <button
                                                    disabled={isMe}
                                                    onClick={() => setBanModal({ user })}
                                                    style={{
                                                        padding: "8px 14px",
                                                        borderRadius: 10,
                                                        border: "none",
                                                        cursor: isMe ? "not-allowed" : "pointer",
                                                        fontWeight: 800,
                                                        fontSize: 12,
                                                        transition: ".2s",
                                                        background: isMe ? "#f3f4f6" : user.isBanned ? "#d1fae5" : "#fee2e2",
                                                        color: isMe ? "#9ca3af" : user.isBanned ? "#065f46" : "#dc2626",
                                                        whiteSpace: "nowrap",
                                                        opacity: isMe ? 0.5 : 1,
                                                    }}
                                                >
                                                    {user.isBanned ? "✅ Débannir" : "🚫 Bannir"}
                                                </button>
                                                <button
                                                    onClick={() => handleViewHistory(user)}
                                                    style={{
                                                        padding: "8px 14px",
                                                        borderRadius: 10,
                                                        border: "none",
                                                        cursor: "pointer",
                                                        fontWeight: 800,
                                                        fontSize: 12,
                                                        transition: ".2s",
                                                        background: "#eff6ff",
                                                        color: "#1d4ed8",
                                                        whiteSpace: "nowrap",
                                                    }}
                                                >
                                                    📋 Historique {loadingHistory && historyModal?.user?._id === user._id ? "..." : ""}
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {confirmModal && (
                <ConfirmModal
                    title={confirmModal.user.isAdmin ? "Retirer les droits ?" : "Promouvoir l'utilisateur ?"}
                    message={
                        confirmModal.user.isAdmin
                            ? `Êtes-vous sûr de vouloir retirer les droits administrateur de ${confirmModal.user.name} ?`
                            : `Voulez-vous accorder les droits administrateur à ${confirmModal.user.name} ?`
                    }
                    onConfirm={handleConfirmToggle}
                    onCancel={() => setConfirmModal(null)}
                    confirmText={confirmModal.user.isAdmin ? "Retirer" : "Promouvoir"}
                    danger={confirmModal.user.isAdmin}
                />
            )}

            {banModal && (
                <ConfirmModal
                    title={banModal.user.isBanned ? "Débannir l'utilisateur ?" : "Bannir l'utilisateur ?"}
                    message={
                        banModal.user.isBanned
                            ? `Êtes-vous sûr de vouloir redonner l'accès au site à ${banModal.user.name} ?`
                            : `Voulez-vous vraiment bloquer l'accès au site pour ${banModal.user.name} ?`
                    }
                    onConfirm={handleConfirmBan}
                    onCancel={() => setBanModal(null)}
                    confirmText={banModal.user.isBanned ? "Débannir" : "Bannir"}
                    danger={!banModal.user.isBanned}
                />
            )}

            {historyModal && (
                <div className="modalOverlay" onClick={() => setHistoryModal(null)} style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999 }}>
                    <div className="modal modalWide" onClick={e => e.stopPropagation()} style={{ background: "#fff", padding: 30, borderRadius: 20, width: "100%", maxWidth: 600, maxHeight: "80vh", overflowY: "auto" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                            <h2 style={{ margin: 0 }}>Historique de {historyModal.user.name}</h2>
                            <button onClick={() => setHistoryModal(null)} style={{ background: "none", border: "none", fontSize: 24, cursor: "pointer", color: "var(--muted)" }}>&times;</button>
                        </div>
                        {historyModal.orders.length === 0 ? (
                            <p style={{ color: "var(--muted)", textAlign: "center", padding: 20 }}>Cet utilisateur n'a passé aucune commande.</p>
                        ) : (
                            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                                {historyModal.orders.map(o => (
                                    <div key={o._id} style={{ padding: 16, border: "1px solid var(--line)", borderRadius: 12, background: "#fafafa" }}>
                                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                                            <strong>Commande du {new Date(o.createdAt).toLocaleDateString("fr-FR")}</strong>
                                            <span style={{ fontWeight: 900, color: "var(--accent)" }}>{o.total.toFixed(3)} TND</span>
                                        </div>
                                        <div style={{ fontSize: 13, color: "var(--muted)" }}>
                                            Statut: <span style={{ color: "#333", fontWeight: "bold" }}>{o.status}</span>
                                        </div>
                                        <div style={{ fontSize: 13, color: "var(--muted)" }}>
                                            Articles: {o.items.map(i => i.title).join(", ")}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
