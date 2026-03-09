import React, { useState, useRef, useEffect } from "react";
import api from "../JS/api/axios";

export default function Chatbot() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { sender: "ai", text: "Bonjour ! Je suis l'assistant My Ecodeco. Comment puis-je vous aider ?" }
    ]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const sendMessage = async (e) => {
        e.preventDefault();
        if (!input.trim()) return;

        const userMessage = input.trim();
        setMessages((prev) => [...prev, { sender: "user", text: userMessage }]);
        setInput("");
        setLoading(true);

        try {
            const { data } = await api.post("/ai/chat", { message: userMessage });
            setMessages((prev) => [...prev, { sender: "ai", text: data.response }]);
        } catch (err) {
            setMessages((prev) => [...prev, { sender: "ai", text: "Désolé, je rencontre des difficultés techniques avec l'IA (clé API manquante ou invalide)." }]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ position: "fixed", bottom: 20, right: 20, zIndex: 9999 }}>
            {!isOpen && (
                <button
                    onClick={() => setIsOpen(true)}
                    style={{
                        width: 60, height: 60, borderRadius: "50%",
                        background: "var(--accent)", color: "white",
                        border: "none", fontSize: 30, cursor: "pointer",
                        boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        paddingTop: 4
                    }}
                    title="Discuter avec notre IA"
                >
                    ✨
                </button>
            )}

            {isOpen && (
                <div style={{
                    width: 350, height: 500, background: "white",
                    borderRadius: 16, boxShadow: "0 8px 30px rgba(0,0,0,0.15)",
                    display: "flex", flexDirection: "column", overflow: "hidden",
                    border: "1px solid #eaeaea"
                }}>
                    {/* Header */}
                    <div style={{
                        background: "var(--accent)", color: "white", padding: "16px",
                        display: "flex", justifyContent: "space-between", alignItems: "center",
                        fontWeight: 800
                    }}>
                        <span>✨ Assistant My Ecodeco</span>
                        <button onClick={() => setIsOpen(false)} style={{
                            background: "transparent", color: "white", border: "none",
                            fontSize: 20, cursor: "pointer"
                        }}>✕</button>
                    </div>

                    {/* Messages */}
                    <div style={{ flex: 1, padding: 16, overflowY: "auto", display: "flex", flexDirection: "column", gap: 12 }}>
                        {messages.map((m, i) => (
                            <div key={i} style={{
                                alignSelf: m.sender === "user" ? "flex-end" : "flex-start",
                                background: m.sender === "user" ? "var(--accent)" : "#f5f5f5",
                                color: m.sender === "user" ? "white" : "#333",
                                padding: "10px 14px", borderRadius: 16, maxWidth: "85%",
                                fontSize: 14, lineHeight: 1.4
                            }}>
                                {m.text}
                            </div>
                        ))}
                        {loading && (
                            <div style={{
                                alignSelf: "flex-start", background: "#f5f5f5", color: "#333",
                                padding: "10px 14px", borderRadius: 16, fontSize: 14, fontStyle: "italic"
                            }}>
                                L'IA réfléchit...
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input */}
                    <form onSubmit={sendMessage} style={{
                        padding: 12, borderTop: "1px solid #eee", display: "flex", gap: 8, background: "#fafafa"
                    }}>
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Posez votre question..."
                            style={{
                                flex: 1, padding: "10px 14px", borderRadius: 24,
                                border: "1px solid #ddd", outline: "none", fontSize: 14,
                                background: "white"
                            }}
                            disabled={loading}
                        />
                        <button type="submit" disabled={loading || !input.trim()} style={{
                            background: input.trim() ? "var(--accent)" : "#ddd", color: "white",
                            border: "none", borderRadius: "50%", width: 40, height: 40,
                            display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer",
                            fontSize: 16
                        }}>
                            ➤
                        </button>
                    </form>
                </div>
            )}
        </div>
    );
}
