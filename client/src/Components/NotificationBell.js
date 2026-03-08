import React, { useEffect, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchNotifications, markRead, markAllAsRead } from "../JS/redux/slices/notificationSlice";

export default function NotificationBell() {
    const [isOpen, setIsOpen] = useState(false);
    const dispatch = useDispatch();
    const { list: notifications } = useSelector((s) => s.notifications);
    const unreadCount = notifications.filter((n) => !n.read).length;
    const dropdownRef = useRef(null);

    useEffect(() => {
        dispatch(fetchNotifications());
        // Polling every 30 seconds for new notifications
        const interval = setInterval(() => dispatch(fetchNotifications()), 30000);
        return () => clearInterval(interval);
    }, [dispatch]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleToggle = () => setIsOpen(!isOpen);

    const handleMarkRead = (id) => {
        dispatch(markRead(id));
    };

    const handleMarkAllRead = () => {
        dispatch(markAllAsRead());
    };

    return (
        <div className="notification-wrapper" style={{ position: "relative" }} ref={dropdownRef}>
            <button
                onClick={handleToggle}
                className="iconBtn"
                style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    fontSize: "22px",
                    position: "relative",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: "8px",
                }}
            >
                🔔
                {unreadCount > 0 && (
                    <span
                        style={{
                            position: "absolute",
                            top: "2px",
                            right: "2px",
                            background: "#ff416c",
                            color: "white",
                            fontSize: "10px",
                            fontWeight: "900",
                            width: "18px",
                            height: "18px",
                            borderRadius: "50%",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            border: "2px solid white",
                            boxShadow: "0 2px 5px rgba(0,0,0,0.2)",
                        }}
                    >
                        {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                )}
            </button>

            {isOpen && (
                <div
                    style={{
                        position: "absolute",
                        top: "50px",
                        right: "0",
                        width: "320px",
                        background: "white",
                        borderRadius: "16px",
                        boxShadow: "0 15px 40px rgba(0,0,0,0.15)",
                        zIndex: 1000,
                        overflow: "hidden",
                        border: "1px solid #eee",
                        animation: "slideIn 0.2s ease",
                    }}
                >
                    <div
                        style={{
                            padding: "16px",
                            borderBottom: "1px solid #eee",
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            background: "#f8f9fa",
                        }}
                    >
                        <h4 style={{ margin: 0, fontSize: "16px", fontWeight: "800" }}>Notifications</h4>
                        {unreadCount > 0 && (
                            <button
                                onClick={handleMarkAllRead}
                                style={{
                                    background: "none",
                                    border: "none",
                                    color: "#c79b5b",
                                    fontSize: "12px",
                                    fontWeight: "700",
                                    cursor: "pointer",
                                    padding: "4px 8px",
                                }}
                            >
                                Tout lire
                            </button>
                        )}
                    </div>

                    <div style={{ maxHeight: "350px", overflowY: "auto" }}>
                        {notifications.length === 0 ? (
                            <div style={{ padding: "40px 20px", textAlign: "center", color: "#888", fontSize: "14px" }}>
                                Aucune notification
                            </div>
                        ) : (
                            notifications.map((n) => (
                                <div
                                    key={n._id}
                                    onClick={() => !n.read && handleMarkRead(n._id)}
                                    style={{
                                        padding: "14px 16px",
                                        borderBottom: "1px solid #f5f5f5",
                                        cursor: n.read ? "default" : "pointer",
                                        background: n.read ? "transparent" : "#fff9f2",
                                        transition: "background 0.2s",
                                        display: "flex",
                                        gap: "12px",
                                    }}
                                >
                                    <div style={{ fontSize: "20px" }}>
                                        {n.type === "login" ? "🔐" : n.type === "register" ? "👤" : n.type === "review" ? "⭐" : n.type === "message" ? "💬" : n.type === "order" ? "📦" : "🔔"}
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <p style={{ margin: "0 0 4px", fontSize: "13px", fontWeight: n.read ? "500" : "700", color: "#333" }}>
                                            {n.message}
                                        </p>
                                        <span style={{ fontSize: "11px", color: "#999" }}>
                                            {new Date(n.createdAt).toLocaleString("fr-FR", { hour: "2-digit", minute: "2-digit", day: "2-digit", month: "short" })}
                                        </span>
                                    </div>
                                    {!n.read && (
                                        <div
                                            style={{
                                                width: "8px",
                                                height: "8px",
                                                background: "#c79b5b",
                                                borderRadius: "50%",
                                                marginTop: "6px",
                                            }}
                                        />
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}

            <style>{`
        @keyframes slideIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
        </div>
    );
}
