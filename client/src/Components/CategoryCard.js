import React from "react";
import { Link } from "react-router-dom";

export default function CategoryCard({ c }) {
  // Si on a des produits de la catégorie, afficher leurs images superposées
  const hasProducts = c.sampleProducts && c.sampleProducts.length > 0;
  const productImages = hasProducts
    ? c.sampleProducts
        .filter((p) => p.image)
        .slice(0, 4) // Maximum 4 images
    : [];

  return (
    <Link to={`/categories/${c.slug}`} className="catCard">
      {hasProducts && productImages.length > 0 ? (
        // Afficher les photos des produits superposées en cascade
        <div
          style={{
            position: "relative",
            width: "100%",
            height: "240px",
            overflow: "hidden",
            borderRadius: "18px 18px 0 0",
            background: "#f5f5f5",
          }}
        >
          {productImages.map((product, index) => {
            // Calcul des positions pour un effet de cascade élégant
            const positions = [
              { top: "0", left: "0", width: "100%", height: "100%", zIndex: 4 }, // Image principale (fond)
              { top: "10px", left: "10px", width: "45%", height: "45%", zIndex: 3 }, // Coin supérieur gauche
              { top: "10px", right: "10px", width: "45%", height: "45%", zIndex: 2 }, // Coin supérieur droit
              { bottom: "10px", left: "50%", transform: "translateX(-50%)", width: "40%", height: "40%", zIndex: 1 }, // Bas centre
            ];
            const pos = positions[index] || positions[0];

            return (
              <img
                key={index}
                src={product.image || "https://via.placeholder.com/200"}
                alt={product.title || c.name}
                style={{
                  position: "absolute",
                  ...pos,
                  objectFit: "cover",
                  borderRadius: index === 0 ? "18px 18px 0 0" : "10px",
                  border: index === 0 ? "none" : "3px solid white",
                  boxShadow:
                    index === 0
                      ? "none"
                      : "0 6px 20px rgba(0,0,0,0.2), 0 2px 6px rgba(0,0,0,0.1)",
                  transition: "transform 0.3s ease",
                }}
                onMouseEnter={(e) => {
                  if (index > 0) {
                    e.currentTarget.style.transform = pos.transform
                      ? `${pos.transform} scale(1.1)`
                      : "scale(1.1)";
                    e.currentTarget.style.zIndex = "10";
                  }
                }}
                onMouseLeave={(e) => {
                  if (index > 0) {
                    e.currentTarget.style.transform = pos.transform || "scale(1)";
                    e.currentTarget.style.zIndex = pos.zIndex;
                  }
                }}
              />
            );
          })}
        </div>
      ) : (
        // Sinon, afficher l'image de la catégorie comme avant
        <img
          src={c.image || "https://via.placeholder.com/600x400"}
          alt={c.name}
        />
      )}

      <div className="catOverlay">
        <div className="catName">{c.name}</div>
      </div>
    </Link>
  );
}