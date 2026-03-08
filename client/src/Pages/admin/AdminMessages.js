import React, { useEffect, useState } from "react";
import api from "../../JS/api/axios";
import ConfirmModal from "../../Components/ConfirmModal";

export default function AdminMessages() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [toDelete, setToDelete] = useState(null);

  const loadMessages = async () => {
    try {
      setLoading(true);
      const { data } = await api.get("/messages");
      setMessages(data.messages || []);
      setError("");
    } catch (err) {
      setError(
        err?.response?.data?.message || "Erreur lors du chargement des messages."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMessages();
  }, []);

  const handleMarkRead = async (id) => {
    try {
      const { data } = await api.patch(`/messages/${id}/read`);
      setMessages((prev) =>
        prev.map((m) => (m._id === id ? data.message : m))
      );
    } catch {
      // optionnel
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/messages/${id}`);
      setMessages((prev) => prev.filter((m) => m._id !== id));
    } catch {
      // optionnel
    } finally {
      setToDelete(null);
    }
  };

  const unreadCount = messages.filter((m) => !m.read).length;

  return (
    <div className="container">
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ margin: "0 0 8px", fontSize: 42, fontWeight: 900 }}>
          Messages clients
        </h1>
        <p style={{ margin: 0, color: "var(--muted)", fontSize: 16 }}>
          {unreadCount > 0
            ? `${unreadCount} message(s) non lu(s)`
            : "Tous les messages sont lus"}
        </p>
      </div>

      {error && (
        <div
          style={{
            padding: 14,
            borderRadius: 14,
            background: "#fee",
            color: "#c33",
            marginBottom: 16,
          }}
        >
          {error}
        </div>
      )}

      {loading ? (
        <p>Chargement...</p>
      ) : messages.length === 0 ? (
        <div className="panel" style={{ textAlign: "center", padding: 40 }}>
          <p style={{ fontSize: 18, color: "var(--muted)" }}>
            Aucun message pour le moment.
          </p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {messages.map((msg) => (
            <div
              key={msg._id}
              className="panel"
              style={{
                background: msg.read
                  ? "rgba(255,255,255,.75)"
                  : "#fff9f2",
                border: msg.read
                  ? "1px solid var(--line)"
                  : "2px solid var(--accent)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  gap: 16,
                }}
              >
                <div style={{ flex: 1 }}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      marginBottom: 8,
                    }}
                  >
                    <strong style={{ fontSize: 16 }}>
                      {msg.user?.name || "Client"}
                    </strong>
                    {!msg.read && (
                      <span
                        style={{
                          background: "#c79b5b",
                          color: "white",
                          fontSize: 10,
                          fontWeight: 900,
                          padding: "2px 8px",
                          borderRadius: 999,
                        }}
                      >
                        Nouveau
                      </span>
                    )}
                  </div>
                  <p
                    style={{
                      margin: "8px 0",
                      fontSize: 14,
                      lineHeight: 1.6,
                      whiteSpace: "pre-wrap",
                    }}
                  >
                    {msg.content}
                  </p>
                  <span
                    style={{
                      fontSize: 12,
                      color: "var(--muted)",
                    }}
                  >
                    {new Date(msg.createdAt).toLocaleString("fr-FR", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
                <div
                  style={{
                    display: "flex",
                    gap: 8,
                    flexShrink: 0,
                  }}
                >
                  {!msg.read && (
                    <button
                      className="adminIconBtn"
                      onClick={() => handleMarkRead(msg._id)}
                      title="Marquer comme lu"
                      style={{ color: "#c79b5b" }}
                    >
                      ✓
                    </button>
                  )}
                  <button
                    className="adminIconBtn iconDelete"
                    onClick={() => setToDelete(msg._id)}
                    title="Supprimer"
                  >
                    🗑
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {toDelete && (
        <ConfirmModal
          title="Supprimer le message"
          message="Êtes-vous sûr de vouloir supprimer ce message ? Cette action est irréversible."
          onConfirm={() => handleDelete(toDelete)}
          onCancel={() => setToDelete(null)}
        />
      )}
    </div>
  );
}

