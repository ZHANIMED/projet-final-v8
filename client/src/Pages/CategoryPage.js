import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";

import { fetchCategories } from "../JS/redux/slices/categorySlice";
import { fetchProducts } from "../JS/redux/slices/productSlice";
import { addToCart } from "../JS/redux/slices/cartSlice";

import ProductCard from "../Components/ProductCard";

export default function CategoryPage() {
  const { slug } = useParams();
  const dispatch = useDispatch();

  const categories = useSelector((s) => s.categories.list);
  const { list: products, loading } = useSelector((s) => s.products);

  useEffect(() => {
    dispatch(fetchCategories());
  }, [dispatch]);

  useEffect(() => {
    const cat = categories.find((c) => c.slug === slug);
    if (cat?._id) dispatch(fetchProducts({ category: cat._id }));
  }, [dispatch, categories, slug]);

  const cat = categories.find((c) => c.slug === slug);

  const onAdd = (p, qty) =>
    dispatch(
      addToCart({
        id: p._id,
        title: p.title,
        price: p.price,
        image: p.image,
        slug: p.slug,
        qty: qty || 1
      })
    );

  return (
    <div className="container">
      <h1>{cat?.name || "Catégorie"}</h1>

      {loading ? (
        <div className="skeletonGrid">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="skeletonCard" style={{ height: 350, borderRadius: 20, background: '#f5f5f5' }} />
          ))}
        </div>
      ) : products.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '50px 20px', background: '#f9f9f9', borderRadius: 20 }}>
          <p style={{ fontSize: '1.2rem', color: '#666' }}>Bientôt disponible ! ✨</p>
          <p style={{ color: '#999' }}>Nous préparons de nouveaux articles pour cette catégorie.</p>
        </div>
      ) : (
        <div className="grid4">
          {products.map((p) => (
            <ProductCard key={p._id} p={p} onAdd={onAdd} />
          ))}
        </div>
      )}
    </div>
  );
}