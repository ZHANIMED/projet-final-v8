import React, { useEffect, useState } from "react";
import api from "../../JS/api/axios";

export default function AdminNewsletter() {
    const [subscribers, setSubscribers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get("/admin/newsletter/subscribers")
            .then(res => setSubscribers(res.data))
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    const exportToCSV = () => {
        if (!subscribers.length) return;

        const headers = ["Email", "Date d'inscription"];
        const rows = subscribers.map(sub => [
            sub.email,
            new Date(sub.createdAt).toLocaleString("fr-FR")
        ]);

        const csvContent = "data:text/csv;charset=utf-8,"
            + headers.join(",") + "\n"
            + rows.map(e => e.join(",")).join("\n");

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `Abonnes_Newsletter_${new Date().toISOString().split("T")[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="container">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 30 }}>
                <h1 style={{ margin: 0 }}>📧 Liste d'Abonnés (Newsletter)</h1>
                <button
                    className="ecoBtn ghost"
                    onClick={exportToCSV}
                    disabled={subscribers.length === 0}
                    style={{ padding: "8px 16px" }}
                >
                    📥 Exporter la liste (CSV)
                </button>
            </div>

            <div className="panel" style={{ padding: 24 }}>
                <div style={{ marginBottom: 20, color: "var(--muted)" }}>
                    {subscribers.length} abonnés au total.
                </div>

                {loading ? (
                    <div style={{ textAlign: "center", padding: 40, color: "var(--muted)" }}>Chargement...</div>
                ) : subscribers.length === 0 ? (
                    <div style={{ textAlign: "center", padding: 40, color: "var(--muted)" }}>
                        <div style={{ fontSize: 40, marginBottom: 10 }}>📭</div>
                        Aucun abonné pour le moment.
                    </div>
                ) : (
                    <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
                        <thead>
                            <tr style={{ background: "#f8fafc", color: "var(--muted)" }}>
                                <th style={{ padding: 12, borderBottom: "1px solid var(--line)" }}>Email</th>
                                <th style={{ padding: 12, borderBottom: "1px solid var(--line)", width: 250 }}>Date d'inscription</th>
                            </tr>
                        </thead>
                        <tbody>
                            {subscribers.map((sub, i) => (
                                <tr key={sub._id} style={{ background: i % 2 === 0 ? "white" : "#fafafa" }}>
                                    <td style={{ padding: 12, borderBottom: "1px solid var(--line)", fontWeight: "bold" }}>{sub.email}</td>
                                    <td style={{ padding: 12, borderBottom: "1px solid var(--line)", color: "var(--muted)", fontSize: 14 }}>
                                        {new Date(sub.createdAt).toLocaleString("fr-FR")}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}
