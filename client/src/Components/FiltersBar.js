import React from "react";

export default function FiltersBar({ q, setQ, minPrice, setMinPrice, maxPrice, setMaxPrice, minRating, setMinRating }) {
  return (
    <div className="filters">
      <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Rechercher..." />
      <input type="number" step="0.001" value={minPrice} onChange={(e) => setMinPrice(e.target.value)} placeholder="Min TND" min="0" />
      <input type="number" step="0.001" value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} placeholder="Max TND" min="0" />
      <input type="number" step="1" value={minRating} onChange={(e) => setMinRating(e.target.value)} placeholder="Note Min/10" min="0" max="10" />
    </div>
  );
}