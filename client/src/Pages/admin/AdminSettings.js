import React, { useState, useEffect } from "react";
import api from "../../JS/api/axios";
import { toast } from "react-toastify";

export default function AdminSettings() {
    const [settings, setSettings] = useState({
        siteName: "",
        siteLogo: "",
        contactEmail: "",
        socialLinks: { facebook: "", instagram: "", twitter: "" },
        footerText: "",
        heroTitle: "",
        heroImage: "",
        bannerActive: false,
        bannerText: ""
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [logoFile, setLogoFile] = useState(null);
    const [previewLogo, setPreviewLogo] = useState("");
    const [heroImageFile, setHeroImageFile] = useState(null);
    const [previewHeroImage, setPreviewHeroImage] = useState("");

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const { data } = await api.get("/settings");
                if (data) {
                    setSettings({
                        ...data,
                        heroTitle: data.heroTitle || "",
                        heroImage: data.heroImage || "",
                        bannerActive: data.bannerActive || false,
                        bannerText: data.bannerText || ""
                    });
                    setPreviewLogo(data.siteLogo || "");
                    setPreviewHeroImage(data.heroImage || "");
                }
            } catch (err) {
                toast.error("Erreur lors du chargement des paramètres");
            } finally {
                setLoading(false);
            }
        };
        fetchSettings();
    }, []);

    useEffect(() => {
        if (!logoFile) return;
        const url = URL.createObjectURL(logoFile);
        setPreviewLogo(url);
        return () => URL.revokeObjectURL(url);
    }, [logoFile]);

    useEffect(() => {
        if (!heroImageFile) return;
        const url = URL.createObjectURL(heroImageFile);
        setPreviewHeroImage(url);
        return () => URL.revokeObjectURL(url);
    }, [heroImageFile]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const formData = new FormData();
            formData.append("siteName", settings.siteName);
            formData.append("contactEmail", settings.contactEmail);
            formData.append("contactPhone", settings.contactPhone);
            formData.append("address", settings.address);
            formData.append("footerText", settings.footerText);
            formData.append("heroTitle", settings.heroTitle);
            formData.append("bannerActive", settings.bannerActive);
            formData.append("bannerText", settings.bannerText);
            formData.append("socialLinks", JSON.stringify(settings.socialLinks));

            if (logoFile) {
                formData.append("siteLogo", logoFile);
            } else if (previewLogo) {
                formData.append("siteLogo", settings.siteLogo);
            } else {
                formData.append("siteLogo", "");
            }

            if (heroImageFile) {
                formData.append("heroImage", heroImageFile);
            } else if (previewHeroImage) {
                formData.append("heroImage", settings.heroImage);
            } else {
                formData.append("heroImage", "");
            }

            await api.put("/settings", formData, {
                headers: { "Content-Type": "multipart/form-data" }
            });
            toast.success("✅ Paramètres enregistrés !");
            window.dispatchEvent(new Event("settingsUpdated"));
        } catch (err) {
            toast.error("❌ Erreur lors de l'enregistrement");
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="container">Chargement...</div>;

    return (
        <div className="container" style={{ maxWidth: 800 }}>
            <h1 style={{ marginBottom: 30 }}>Paramètres du Site (CMS)</h1>

            <form className="panel" onSubmit={handleSubmit} style={{ padding: 30 }}>
                <div className="grid2" style={{ gap: 20 }}>
                    <div className="field">
                        <label className="fieldLabel">Nom du Site</label>
                        <input
                            value={settings.siteName}
                            onChange={e => setSettings({ ...settings, siteName: e.target.value })}
                        />
                    </div>
                    <div className="field">
                        <label className="fieldLabel">Logo du Site (Image)</label>
                        <input
                            type="file"
                            accept="image/*"
                            className="customFileInput"
                            onChange={(e) => setLogoFile(e.target.files?.[0] || null)}
                            style={{ marginBottom: 10 }}
                        />
                        {previewLogo && (
                            <div style={{ position: "relative", display: "inline-block", marginTop: 10 }}>
                                <img
                                    src={previewLogo}
                                    alt="Logo preview"
                                    style={{ width: "100%", maxWidth: 150, maxHeight: 150, objectFit: "contain", borderRadius: 8, border: "1px solid #eee", background: "#fff", padding: 5 }}
                                />
                                <button
                                    type="button"
                                    title="Retirer l'image"
                                    style={{
                                        position: "absolute",
                                        top: -5,
                                        right: -5,
                                        background: "white",
                                        color: "#ef4444",
                                        border: "1px solid #fee2e2",
                                        borderRadius: "50%",
                                        width: 24,
                                        height: 24,
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        fontSize: 14,
                                        fontWeight: "bold",
                                        cursor: "pointer",
                                        boxShadow: "0 2px 5px rgba(0,0,0,0.2)"
                                    }}
                                    onClick={() => {
                                        setLogoFile(null);
                                        setPreviewLogo("");
                                        setSettings({ ...settings, siteLogo: "" });
                                        const fileInput = document.querySelector('.customFileInput');
                                        if (fileInput) fileInput.value = "";
                                    }}
                                >
                                    ✕
                                </button>
                            </div>
                        )}
                    </div>
                    <div className="field">
                        <label className="fieldLabel">Email de Contact</label>
                        <input
                            value={settings.contactEmail}
                            onChange={e => setSettings({ ...settings, contactEmail: e.target.value })}
                        />
                    </div>
                    <div className="field">
                        <label className="fieldLabel">Téléphone de Contact</label>
                        <input
                            value={settings.contactPhone}
                            onChange={e => setSettings({ ...settings, contactPhone: e.target.value })}
                        />
                    </div>
                </div>

                <div className="field" style={{ marginTop: 20 }}>
                    <label className="fieldLabel">Adresse</label>
                    <input
                        value={settings.address}
                        onChange={e => setSettings({ ...settings, address: e.target.value })}
                    />
                </div>

                <h3 style={{ marginTop: 30, marginBottom: 15 }}>Page d'accueil (Hero)</h3>
                <div className="grid2" style={{ gap: 20 }}>
                    <div className="field">
                        <label className="fieldLabel">Titre Principal</label>
                        <input
                            value={settings.heroTitle}
                            onChange={e => setSettings({ ...settings, heroTitle: e.target.value })}
                            placeholder="Ex: Nouvelle Collection"
                        />
                    </div>
                    <div className="field">
                        <label className="fieldLabel">Image d'arrière-plan (Hero)</label>
                        <input
                            type="file"
                            accept="image/*"
                            className="customFileInput customFileInputHero"
                            onChange={(e) => setHeroImageFile(e.target.files?.[0] || null)}
                            style={{ marginBottom: 10 }}
                        />
                        {previewHeroImage && (
                            <div style={{ position: "relative", display: "inline-block", marginTop: 10 }}>
                                <img
                                    src={previewHeroImage}
                                    alt="Hero preview"
                                    style={{ width: "100%", maxWidth: 150, maxHeight: 150, objectFit: "cover", borderRadius: 8, border: "1px solid #eee", background: "#fff", padding: 5 }}
                                />
                                <button
                                    type="button"
                                    title="Retirer l'image"
                                    style={{
                                        position: "absolute",
                                        top: -5,
                                        right: -5,
                                        background: "white",
                                        color: "#ef4444",
                                        border: "1px solid #fee2e2",
                                        borderRadius: "50%",
                                        width: 24,
                                        height: 24,
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        fontSize: 14,
                                        fontWeight: "bold",
                                        cursor: "pointer",
                                        boxShadow: "0 2px 5px rgba(0,0,0,0.2)"
                                    }}
                                    onClick={() => {
                                        setHeroImageFile(null);
                                        setPreviewHeroImage("");
                                        setSettings({ ...settings, heroImage: "" });
                                        const fileInput = document.querySelector('.customFileInputHero');
                                        if (fileInput) fileInput.value = "";
                                    }}
                                >
                                    ✕
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                <h3 style={{ marginTop: 30, marginBottom: 15 }}>Bannière d'annonce (Topbar)</h3>
                <div className="grid2" style={{ gap: 20 }}>
                    <div className="field">
                        <label className="fieldLabel">Activer la bannière ?</label>
                        <select
                            value={settings.bannerActive}
                            onChange={(e) => setSettings({ ...settings, bannerActive: e.target.value === "true" })}
                            style={{ padding: "10px", borderRadius: "8px", border: "1px solid var(--line)" }}
                        >
                            <option value="false">Non (Désactivée)</option>
                            <option value="true">Oui (Activée)</option>
                        </select>
                    </div>
                    <div className="field">
                        <label className="fieldLabel">Texte de l'annonce</label>
                        <input
                            value={settings.bannerText}
                            onChange={e => setSettings({ ...settings, bannerText: e.target.value })}
                            placeholder="Ex: Livraison gratuite à partir de 200 TND !"
                        />
                    </div>
                </div>

                <h3 style={{ marginTop: 30, marginBottom: 15 }}>Réseaux Sociaux</h3>
                <div className="grid3" style={{ gap: 15 }}>
                    <div className="field">
                        <label className="fieldLabel">Facebook</label>
                        <input
                            value={settings.socialLinks.facebook}
                            onChange={e => setSettings({ ...settings, socialLinks: { ...settings.socialLinks, facebook: e.target.value } })}
                        />
                    </div>
                    <div className="field">
                        <label className="fieldLabel">Instagram</label>
                        <input
                            value={settings.socialLinks.instagram}
                            onChange={e => setSettings({ ...settings, socialLinks: { ...settings.socialLinks, instagram: e.target.value } })}
                        />
                    </div>
                    <div className="field">
                        <label className="fieldLabel">Twitter</label>
                        <input
                            value={settings.socialLinks.twitter}
                            onChange={e => setSettings({ ...settings, socialLinks: { ...settings.socialLinks, twitter: e.target.value } })}
                        />
                    </div>
                </div>

                <div className="field" style={{ marginTop: 25 }}>
                    <label className="fieldLabel">Texte de Pied de Page (Footer)</label>
                    <textarea
                        rows={2}
                        value={settings.footerText}
                        onChange={e => setSettings({ ...settings, footerText: e.target.value })}
                    />
                </div>

                <div className="formActions" style={{ marginTop: 40 }}>
                    <button className="ecoBtn" type="submit" disabled={saving}>
                        {saving ? "⏳ Enregistrement..." : "💾 Enregistrer les modifications"}
                    </button>
                </div>
            </form>
        </div>
    );
}
