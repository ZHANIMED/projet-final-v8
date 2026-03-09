const Product = require("../models/Product");
const Notification = require("../models/Notification");
const User = require("../models/User");

const slugify = (s) =>
  s.toLowerCase().trim().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");

exports.getAll = async (req, res, next) => {
  try {
    const { category, q, minPrice, maxPrice } = req.query;

    const filter = {};
    if (category) filter.category = category;
    if (q) filter.title = { $regex: q, $options: "i" };
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }

    const products = await Product.find(filter)
      .populate("category", "name slug")
      .sort({ createdAt: -1 });

    res.json({ products });
  } catch (err) {
    next(err);
  }
};

exports.getOne = async (req, res, next) => {
  try {
    const { slug } = req.params;
    const product = await Product.findOne({ slug })
      .populate("category", "name slug")
      .populate("reviews.user", "name photo");
    if (!product) return res.status(404).json({ message: "Produit non trouvé" });
    res.json({ product });
  } catch (err) {
    next(err);
  }
};

exports.create = async (req, res, next) => {
  try {
    const { title, description = "", price, category, stock = 10, promoPercentage = 0 } = req.body;
    const image = req.file ? req.file.path : (req.body.image || "");
    const slug = slugify(title);

    const exists = await Product.findOne({ slug });
    if (exists) return res.status(409).json({ message: "Ce titre de produit existe déjà" });

    const product = await Product.create({
      title,
      slug,
      description,
      price,
      image,
      category,
      stock,
      promoPercentage,
    });

    res.status(201).json({ product });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ message: "Un produit avec ce slug existe déjà" });
    }
    next(err);
  }
};

exports.update = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, description, price, category, stock, promoPercentage } = req.body;

    const update = {};
    if (title) {
      update.title = title;
      const slug = slugify(title);

      // Check if duplicate slug exists on OTHER products
      const exists = await Product.findOne({ slug, _id: { $ne: id } });
      if (exists) return res.status(409).json({ message: "Un autre produit utilise déjà ce titre" });

      update.slug = slug;
    }
    if (description !== undefined) update.description = description;
    if (price !== undefined) update.price = price;
    if (category !== undefined) update.category = category;
    if (stock !== undefined) update.stock = stock;
    if (promoPercentage !== undefined) update.promoPercentage = promoPercentage;

    const image = req.file ? req.file.path : req.body.image;
    if (image !== undefined) update.image = image;

    const product = await Product.findByIdAndUpdate(id, update, { new: true });
    if (!product) return res.status(404).json({ message: "Produit non trouvé" });
    res.json({ product });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ message: "Un autre produit possède déjà ce titre/slug" });
    }
    next(err);
  }
};

exports.remove = async (req, res, next) => {
  try {
    const { id } = req.params;
    const product = await Product.findByIdAndDelete(id);
    if (!product) return res.status(404).json({ message: "Produit non trouvé" });
    res.json({ message: "Supprimé" });
  } catch (err) {
    next(err);
  }
};

// User: add / update a review (rating /10 + comment)
exports.addReview = async (req, res, next) => {
  try {
    const { slug } = req.params;
    const { rating, comment = "" } = req.body;

    const numericRating = Number(rating);
    if (
      !Number.isFinite(numericRating) ||
      numericRating < 0 ||
      numericRating > 10
    ) {
      return res
        .status(400)
        .json({ message: "La note doit être comprise entre 0 et 10." });
    }

    const product = await Product.findOne({ slug });
    if (!product) {
      return res.status(404).json({ message: "Produit non trouvé" });
    }

    if (!Array.isArray(product.reviews)) {
      product.reviews = [];
    }

    const userId = req.user.id;
    const existing = product.reviews.find(
      (r) => r.user.toString() === userId.toString()
    );

    if (existing) {
      existing.rating = numericRating;
      existing.comment = comment;
      existing.createdAt = new Date();
    } else {
      product.reviews.push({
        user: userId,
        rating: numericRating,
        comment,
      });
    }

    // Recalculate aggregates
    if (product.reviews.length) {
      const sum = product.reviews.reduce(
        (acc, r) => acc + (r.rating || 0),
        0
      );
      product.ratingsCount = product.reviews.length;
      product.averageRating = sum / product.reviews.length;
    } else {
      product.ratingsCount = 0;
      product.averageRating = 0;
    }

    await product.save();
    await product.populate("category", "name slug");
    await product.populate("reviews.user", "name photo");

    // Créer une notification pour l'admin lorsqu'un avis est ajouté
    try {
      const user = await User.findById(req.user.id).select("name");
      const userName = user?.name || "Un client";
      const ratingText = `${numericRating}/10`;
      const isNewReview = !existing;

      const notification = await Notification.create({
        message: isNewReview
          ? `Nouvel avis sur "${product.title}": ${ratingText} par ${userName}`
          : `Avis modifié sur "${product.title}": ${ratingText} par ${userName}`,
        type: "review",
        userId: req.user.id,
      });
      console.log("[Notification] Avis créé:", notification.message);
    } catch (notifError) {
      console.error("Erreur création notification avis:", notifError);
      // Ne pas bloquer la réponse si la notification échoue
    }

    res.status(201).json({ product });
  } catch (err) {
    next(err);
  }
};