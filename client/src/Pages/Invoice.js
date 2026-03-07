import React, { useState } from "react";
import { useLocation, Link, Navigate } from "react-router-dom";
import logo from "../assets/MYECODECO.png";
import printerIcon from "../assets/printer.png";
import { toast } from "react-toastify";
import ConfirmModal from "../Components/ConfirmModal";

export default function Invoice() {
    const location = useLocation();
    const order = location.state?.order;
    const [paying, setPaying] = useState(false);
    const [showAlert, setShowAlert] = useState(false);

    if (!order) {
        return <Navigate to="/products" />;
    }

    const printInvoice = () => {
        window.print();
    };

    const handlePayment = () => {
        setPaying(true);
        toast.info("🔄 Préparation du paiement sécurisé...", { autoClose: 2000 });

        setTimeout(() => {
            toast.success("💳 Redirection vers la plateforme de paiement...", { autoClose: 3000 });
            setTimeout(() => {
                setPaying(false);
                setShowAlert(true);
            }, 2500);
        }, 2000);
    };

    return (
        <div className="container" style={{ maxWidth: 850, paddingBottom: 50 }}>
            {/* Boutons d'action cachés à l'impression */}
            <div className="invoiceActions no-print" style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 30,
                background: "#f8fafc",
                padding: "20px 30px",
                borderRadius: "20px",
                boxShadow: "0 10px 25px rgba(0,0,0,0.05)"
            }}>
                <Link to="/products" className="ecoBtn ghost" style={{ fontSize: 14 }}>
                    ← Retour Boutique
                </Link>

                <div style={{ display: "flex", gap: "15px" }}>
                    <button
                        className="ecoBtn"
                        onClick={printInvoice}
                        style={{
                            background: "#fff",
                            color: "#1e293b",
                            border: "1px solid #e2e8f0",
                            display: "flex",
                            alignItems: "center",
                            gap: "10px",
                            padding: "12px 24px"
                        }}
                    >
                        <img src={printerIcon} alt="Imprimer" style={{ width: 22, height: 22 }} />
                        <span>Imprimer</span>
                    </button>

                    <button
                        className="ecoBtn"
                        disabled={paying}
                        onClick={handlePayment}
                        style={{
                            background: "linear-gradient(135deg, #3b82f6, #2563eb)",
                            color: "#fff",
                            display: "flex",
                            alignItems: "center",
                            gap: "10px",
                            padding: "12px 28px",
                            boxShadow: "0 8px 20px rgba(37, 99, 235, 0.25)"
                        }}
                    >
                        <span>{paying ? "Traitement..." : "Payer Maintenant"}</span>
                        <span>💳</span>
                    </button>
                </div>
            </div>

            {/* Contenu de la facture */}
            <div className="invoicePaper" style={{
                padding: "60px 50px",
                background: "#fff",
                borderRadius: "24px",
                boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.08)",
                position: "relative",
                overflow: "hidden"
            }}>
                {/* Filigrane discret */}
                <div style={{
                    position: "absolute",
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%, -50%) rotate(-45deg)",
                    fontSize: "120px",
                    fontWeight: 900,
                    color: "rgba(0,0,0,0.02)",
                    pointerEvents: "none",
                    whiteSpace: "nowrap"
                }}>
                    MY ECO-DECO
                </div>

                {/* Entête avec logo */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", borderBottom: "2px solid #f1f5f9", paddingBottom: 30, marginBottom: 40 }}>
                    <div>
                        <img src={logo} alt="My eco-deco logo" style={{ height: 60, marginBottom: 15 }} />
                        <h2 style={{ margin: 0, fontSize: 32, fontWeight: 900, letterSpacing: -1, color: "#0f172a" }}>
                            My eco-deco
                        </h2>
                        <p style={{ margin: "8px 0 0", color: "#64748b", fontSize: 15, fontWeight: 500 }}>
                            Art & Décoration Durable
                        </p>
                    </div>
                    <div style={{ textAlign: "right" }}>
                        <div style={{
                            background: "#eff6ff",
                            color: "#1e40af",
                            padding: "8px 16px",
                            borderRadius: "12px",
                            fontWeight: 800,
                            fontSize: 14,
                            marginBottom: 15,
                            display: "inline-block"
                        }}>
                            FACTURE OFFICIELLE
                        </div>
                        <p style={{ margin: "4px 0", color: "#64748b", fontSize: 14 }}>Réf: <strong style={{ color: "#0f172a" }}>#{order._id.slice(-6).toUpperCase()}</strong></p>
                        <p style={{ margin: "4px 0", color: "#64748b", fontSize: 14 }}>Date: <strong style={{ color: "#0f172a" }}>{new Date(order.createdAt).toLocaleDateString("fr-FR")}</strong></p>
                    </div>
                </div>

                {/* Détails du client */}
                <div style={{ marginBottom: 50, display: "flex", justifyContent: "space-between" }}>
                    <div style={{ flex: 1 }}>
                        <h4 style={{ margin: "0 0 12px", color: "#94a3b8", textTransform: "uppercase", fontSize: 11, fontWeight: 800, letterSpacing: 1 }}>CLIENT</h4>
                        <p style={{ margin: "4px 0", fontWeight: 800, fontSize: 20, color: "#0f172a" }}>{location.state?.userName || "Client Privé"}</p>
                        <p style={{ margin: "6px 0", color: "#475569", fontSize: 15, lineHeight: 1.5 }}>{order.shippingAddress || "Adresse de livraison non spécifiée"}</p>
                        <p style={{ margin: "6px 0", color: "#475569", fontSize: 15 }}>📞 {order.phone || "Contact non spécifié"}</p>
                    </div>
                    <div style={{ flex: 1, textAlign: "right" }}>
                        <h4 style={{ margin: "0 0 12px", color: "#94a3b8", textTransform: "uppercase", fontSize: 11, fontWeight: 800, letterSpacing: 1 }}>EXPÉDITEUR</h4>
                        <p style={{ margin: "4px 0", fontWeight: 700, fontSize: 15, color: "#0f172a" }}>Atelier My eco-deco</p>
                        <p style={{ margin: "4px 0", color: "#475569", fontSize: 14 }}>Route de Marsa, Tunis</p>
                        <p style={{ margin: "4px 0", color: "#475569", fontSize: 14 }}>contact@myecodeco.tn</p>
                    </div>
                </div>

                {/* Tableau des articles */}
                <div style={{ borderRadius: "16px", overflow: "hidden", border: "1px solid #f1f5f9", marginBottom: 30 }}>
                    <table style={{ width: "100%", borderCollapse: "collapse" }}>
                        <thead>
                            <tr style={{ background: "#f8fafc" }}>
                                <th style={{ padding: "18px 20px", textAlign: "left", color: "#475569", fontSize: 12, fontWeight: 800 }}>ARTICLE</th>
                                <th style={{ padding: "18px 20px", textAlign: "center", color: "#475569", fontSize: 12, fontWeight: 800 }}>QTÉ</th>
                                <th style={{ padding: "18px 20px", textAlign: "right", color: "#475569", fontSize: 12, fontWeight: 800 }}>UNITAIRE</th>
                                <th style={{ padding: "18px 20px", textAlign: "right", color: "#475569", fontSize: 12, fontWeight: 800 }}>TOTAL</th>
                            </tr>
                        </thead>
                        <tbody>
                            {order.items.map((item, idx) => (
                                <tr key={idx} style={{ borderBottom: "1px solid #f1f5f9" }}>
                                    <td style={{ padding: "18px 20px", fontWeight: 700, color: "#0f172a", fontSize: 15 }}>{item.title}</td>
                                    <td style={{ padding: "18px 20px", textAlign: "center", color: "#475569" }}>{item.qty}</td>
                                    <td style={{ padding: "18px 20px", textAlign: "right", color: "#475569" }}>{Number(item.price).toFixed(3)} TND</td>
                                    <td style={{ padding: "18px 20px", textAlign: "right", fontWeight: 800, color: "#0f172a" }}>
                                        {(item.price * item.qty).toFixed(3)} TND
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Total */}
                <div style={{ display: "flex", justifyContent: "flex-end" }}>
                    <div style={{ minWidth: 280, background: "#f8fafc", padding: 25, borderRadius: 20 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
                            <span style={{ color: "#64748b", fontWeight: 600 }}>Sous-total</span>
                            <span style={{ fontWeight: 700 }}>{order.total.toFixed(3)} TND</span>
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 15, paddingBottom: 15, borderBottom: "1px dashed #cbd5e1" }}>
                            <span style={{ color: "#64748b", fontWeight: 600 }}>TVA (0%)</span>
                            <span style={{ fontWeight: 700 }}>0.000 TND</span>
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between" }}>
                            <strong style={{ fontSize: 20, color: "#0f172a", fontWeight: 900 }}>NET À PAYER</strong>
                            <strong style={{ fontSize: 24, color: "#2563eb", fontWeight: 900 }}>{order.total.toFixed(3)} TND</strong>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div style={{ marginTop: 80, textAlign: "center" }}>
                    <div style={{ display: "flex", justifyContent: "center", gap: 30, marginBottom: 20 }}>
                        <div style={{ textAlign: "center" }}>
                            <div style={{ fontSize: 24, marginBottom: 5 }}>🌿</div>
                            <p style={{ fontSize: 10, color: "#94a3b8", fontWeight: 700, margin: 0 }}>ÉCO-RESPONSABLE</p>
                        </div>
                        <div style={{ textAlign: "center" }}>
                            <div style={{ fontSize: 24, marginBottom: 5 }}>🛠️</div>
                            <p style={{ fontSize: 10, color: "#94a3b8", fontWeight: 700, margin: 0 }}>ARTISANAT TUNISIEN</p>
                        </div>
                        <div style={{ textAlign: "center" }}>
                            <div style={{ fontSize: 24, marginBottom: 5 }}>🛡️</div>
                            <p style={{ fontSize: 10, color: "#94a3b8", fontWeight: 700, margin: 0 }}>QUALITÉ DURABLE</p>
                        </div>
                    </div>
                    <p style={{ color: "#64748b", fontSize: 13, marginBottom: 5 }}>Toute l'équipe My eco-deco vous remercie de votre confiance.</p>
                    <p style={{ color: "#94a3b8", fontSize: 11 }}>Cette facture est générée électroniquement et ne nécessite pas de signature.</p>
                </div>
            </div>

            {showAlert && (
                <ConfirmModal
                    title="Paiement"
                    message="Système de paiement en cours de préparation. Cette fonctionnalité sera bientôt disponible ! ✨"
                    onConfirm={() => setShowAlert(false)}
                    alertMode={true}
                    type="info"
                    confirmText="Compris !"
                />
            )}

            {/* CSS pour l'impression */}
            <style>{`
                @media print {
                    @page { margin: 0; }
                    body { background: white; }
                    .container { max-width: 100% !important; padding: 0 !important; margin: 0 !important; }
                    .invoiceActions { display: none !important; }
                    .invoicePaper { 
                        box-shadow: none !important; 
                        border-radius: 0 !important; 
                        padding: 40px !important; 
                        width: 100% !important;
                        margin: 0 !important;
                    }
                    .no-print { display: none !important; }
                }
            `}</style>
        </div>
    );
}
