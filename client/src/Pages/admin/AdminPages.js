import React, { useEffect, useState } from "react";
import api from "../../JS/api/axios";
import { toast } from "react-toastify";
import ConfirmModal from "../../Components/ConfirmModal";

export default function AdminPages() {
    const [pages, setPages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState(null); // null = pas d'édition, {} = nouvelle, ou objet = edit
    const [confirmDelete, setConfirmDelete] = useState(null);

    const [form, setForm] = useState({ title: "", content: "" });

    const fetchPages = async () => {
        try {
            setLoading(true);
            const res = await api.get("/pages");
            setPages(res.data);
        } catch {
            toast.error("Erreur lors du chargement des pages");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPages();
    }, []);

    const openForm = (page = null) => {
        if (page) {
            setEditing(page);
            setForm({ title: page.title, content: page.content });
        } else {
            setEditing({});
            setForm({ title: "", content: "" });
        }
    };

    const closeForm = () => {
        setEditing(null);
        setForm({ title: "", content: "" });
    };

    const savePage = async (e) => {
        e.preventDefault();
        if (!form.title.trim()) return toast.error("Le titre est requis.");

        try {
            if (editing._id) {
                await api.put(`/pages/${editing._id}`, form);
                toast.success("Page modifiée.");
            } else {
                await api.post("/pages", form);
                toast.success("Page créée.");
            }
            closeForm();
            fetchPages();
        } catch (err) {
            toast.error(err.response?.data?.message || "Erreur de sauvegarde.");
        }
    };

    const removePage = async () => {
        if (!confirmDelete) return;
        try {
            await api.delete(`/pages/${confirmDelete}`);
            toast.success("Page supprimée.");
            fetchPages();
        } catch {
            toast.error("Erreur lors de la suppression.");
        } finally {
            setConfirmDelete(null);
        }
    };

    if (editing) {
        return (
            <div className="container" style={{ maxWidth: 800 }}>
                <h2>{editing._id ? "Modifier la page" : "Nouvelle page"}</h2>
                <form onSubmit={savePage} style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                    <div className="field">
                        <label className="fieldLabel">Titre de la page</label>
                        <input
                            value={form.title}
                            onChange={e => setForm({ ...form, title: e.target.value })}
                            placeholder="ex: Qui sommes-nous ?"
                        />
                    </div>
                    <div className="field">
                        <label className="fieldLabel">Contenu (HTML supporté)</label>
                        <textarea
                            rows={15}
                            value={form.content}
                            onChange={e => setForm({ ...form, content: e.target.value })}
                            placeholder="<h1>Bonjour</h1><p>Notre entreprise...</p>"
                            style={{ fontFamily: "monospace", width: "100%", padding: 12, borderRadius: 8, border: "2px solid #e5e7eb" }}
                        />
                    </div>
                    <div style={{ display: "flex", gap: 10 }}>
                        <button type="submit" className="btnPrimary">Enregistrer</button>
                        <button type="button" className="btn ecoBtn ghost" onClick={closeForm}>Annuler</button>
                    </div>
                </form>
            </div>
        );
    }

    return (
        <div className="container">
            <div className="rowBetween" style={{ marginBottom: 20 }}>
                <h1>Pages Statiques</h1>
                <button className="btnPrimary" onClick={() => openForm(null)}>+ Créer une page</button>
            </div>

            {loading ? (
                <p>Chargement...</p>
            ) : (
                <table className="ecoTable">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Titre</th>
                            <th>Lien (Slug)</th>
                            <th align="right">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {pages.map((p) => (
                            <tr key={p._id}>
                                <td>{p._id.substring(18)}</td>
                                <td style={{ fontWeight: "bold" }}>{p.title}</td>
                                <td style={{ color: "var(--accent)" }}>/pages/{p.slug}</td>
                                <td align="right">
                                    <a href={`/pages/${p.slug}`} target="_blank" rel="noreferrer" className="btn ecoBtn ghost" style={{ marginRight: 10 }}>👀</a>
                                    <button className="btn ecoBtn ghost" onClick={() => openForm(p)}>✏️</button>
                                    <button className="btn ecoBtn ghost" style={{ color: "red" }} onClick={() => setConfirmDelete(p._id)}>🗑️</button>
                                </td>
                            </tr>
                        ))}
                        {pages.length === 0 && (
                            <tr>
                                <td colSpan="4" style={{ textAlign: "center", padding: 20 }}>Aucune page créée.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            )}

            {confirmDelete && (
                <ConfirmModal
                    title="Supprimer la page ?"
                    message="Êtes-vous sûr de vouloir supprimer cette page ? Cette action est irréversible."
                    onConfirm={removePage}
                    onCancel={() => setConfirmDelete(null)}
                    confirmText="Supprimer"
                    danger={true}
                />
            )}
        </div>
    );
}
