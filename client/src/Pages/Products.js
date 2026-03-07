import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import { fetchProducts } from "../JS/redux/slices/productSlice";
import { fetchCategories } from "../JS/redux/slices/categorySlice";
import { addToCart } from "../JS/redux/slices/cartSlice";

import ProductCard from "../Components/ProductCard";
import FiltersBar from "../Components/FiltersBar";

export default function Products() {
  const dispatch = useDispatch();
  const { list = [], loading } = useSelector((s) => s.products);
  const categories = useSelector((s) => s.categories.list);

  const [activeCat, setActiveCat] = useState("");
  const [q, setQ] = useState("");
  const [minPrice, setMinPrice] = useState(""); // TND
  const [maxPrice, setMaxPrice] = useState(""); // TND

  useEffect(() => {
    dispatch(fetchCategories());
  }, [dispatch]);

  // ✅ on récupère les produits (filtre catégorie côté backend si tu veux)
  useEffect(() => {
    dispatch(fetchProducts({ category: activeCat }));
  }, [dispatch, activeCat]);

  // ✅ filtre côté FRONT (TND direct)
  const filteredList = useMemo(() => {
    const qLower = q.trim().toLowerCase();

    const min = minPrice === "" ? null : Number(minPrice);
    const max = maxPrice === "" ? null : Number(maxPrice);

    return list.filter((p) => {
      const price = Number(p?.price) || 0; // ✅ TND

      const matchesQ =
        !qLower ||
        (p?.title || "").toLowerCase().includes(qLower) ||
        (p?.description || "").toLowerCase().includes(qLower);

      const matchesMin = min === null || (!Number.isNaN(min) && price >= min);
      const matchesMax = max === null || (!Number.isNaN(max) && price <= max);

      return matchesQ && matchesMin && matchesMax;
    });
  }, [list, q, minPrice, maxPrice]);

  // ✅ IMPORTANT: ProductCard appelle onAdd(p, qty)
  const onAdd = (p, qty = 1) =>
    dispatch(
      addToCart({
        product: {
          id: p._id,
          title: p.title,
          price: p.price, // ✅ TND stocké
          image: p.image,
          slug: p.slug,
        },
        qty,
      })
    );

  return (
    <div className="container">
      <h1>Nos Produits</h1>

      <div className="chips">
        <button
          className={!activeCat ? "chip active" : "chip"}
          onClick={() => setActiveCat("")}
          type="button"
        >
          Tous
        </button>

        {categories.map((c) => (
          <button
            key={c._id}
            className={activeCat === c._id ? "chip active" : "chip"}
            onClick={() => setActiveCat(c._id)}
            type="button"
          >
            {c.name}
          </button>
        ))}
      </div>

      <FiltersBar
        q={q}
        setQ={setQ}
        minPrice={minPrice}
        setMinPrice={setMinPrice}
        maxPrice={maxPrice}
        setMaxPrice={setMaxPrice}
      />

      {loading ? (
        <div className="skeletonGrid">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div key={i} className="skeletonCard" style={{ height: 350, borderRadius: 20, background: '#f5f5f5' }} />
          ))}
        </div>
      ) : (
        <div className="grid4">
          {filteredList.map((p) => (
            <ProductCard key={p._id} p={p} onAdd={onAdd} />
          ))}
        </div>
      )}
    </div>
  );
}