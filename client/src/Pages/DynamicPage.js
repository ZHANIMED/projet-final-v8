import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../JS/api/axios";

export default function DynamicPage() {
    const { slug } = useParams();
    const navigate = useNavigate();
    const [page, setPage] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get(`/pages/${slug}`)
            .then((res) => {
                setPage(res.data);
            })
            .catch((err) => {
                if (err.response?.status === 404) {
                    navigate("/404", { replace: true });
                }
            })
            .finally(() => setLoading(false));
    }, [slug, navigate]);

    if (loading) return <div style={{ textAlign: "center", padding: "50px 0" }}>Chargement...</div>;
    if (!page) return null;

    return (
        <div className="container" style={{ maxWidth: 800, margin: "auto", padding: "40px 20px" }}>
            <h1 style={{ textAlign: "center", marginBottom: 30 }}>{page.title}</h1>
            <div
                className="page-content"
                dangerouslySetInnerHTML={{ __html: page.content }}
                style={{ lineHeight: 1.8, color: "#444" }}
            />
        </div>
    );
}
