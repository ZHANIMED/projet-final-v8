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
    console.log("------- INCOMING PRODUCT CREATE -------", req.body);
    const { title, description = "", price, category, stock = 10, promoPercentage = 0, isFeatured = false } = req.body;

    let colors = [];
    if (req.body.colors) colors = Array.isArray(req.body.colors) ? req.body.colors : JSON.parse(req.body.colors).filter(Boolean);

    const image = (req.files && req.files.image) ? req.files.image[0].path : (req.body.image || "");
    let images = (req.files && req.files.images) ? req.files.images.map(f => f.path) : [];
    if (req.body.images && !req.files?.images) {
      images = Array.isArray(req.body.images) ? req.body.images : JSON.parse(req.body.images);
    }

    const slug = slugify(title);

    const exists = await Product.findOne({ slug });
    if (exists) return res.status(409).json({ message: "Ce titre de produit existe déjà" });

    const product = await Product.create({
      title,
      slug,
      description,
      price,
      image,
      images,
      colors,
      category,
      stock,
      promoPercentage,
      isFeatured,
    });

    res.status(201).json({ product });
  } catch (err) {
    console.error("PRODUCT CREATE ERROR:", err);
    if (err.code === 11000) {
      return res.status(409).json({ message: "Un produit avec ce slug existe déjà" });
    }
    next(err);
  }
};

exports.update = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, description, price, category, stock, promoPercentage, isFeatured } = req.body;

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
    if (isFeatured !== undefined) update.isFeatured = isFeatured;

    if (req.body.colors) update.colors = Array.isArray(req.body.colors) ? req.body.colors : JSON.parse(req.body.colors).filter(Boolean);

    const image = (req.files && req.files.image) ? req.files.image[0].path : req.body.image;
    if (image !== undefined) update.image = image;

    if (req.files && req.files.images) {
      update.images = req.files.images.map(f => f.path);
    } else if (req.body.images) {
      update.images = Array.isArray(req.body.images) ? req.body.images : JSON.parse(req.body.images);
    }

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
      existing.isApproved = true; // Par défaut approuvé sans validation
      existing.createdAt = new Date();
    } else {
      product.reviews.push({
        user: userId,
        rating: numericRating,
        comment,
        isApproved: true, // Par défaut approuvé
      });
    }

    // Recalculate aggregates based ONLY on approved reviews
    const approvedReviews = product.reviews.filter(r => r.isApproved);
    if (approvedReviews.length) {
      const sum = approvedReviews.reduce(
        (acc, r) => acc + (r.rating || 0),
        0
      );
      product.ratingsCount = approvedReviews.length;
      product.averageRating = sum / approvedReviews.length;
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

exports.moderateReview = async (req, res, next) => {
  try {
    const { productId, reviewId } = req.params;
    const { action } = req.body; // "approve" | "block" | "delete"

    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ message: "Produit non trouvé" });

    const review = product.reviews.id(reviewId);
    if (!review) return res.status(404).json({ message: "Avis non trouvé" });

    if (action === "approve") {
      review.isApproved = true;
    } else if (action === "block") {
      review.isApproved = false;
    } else if (action === "delete") {
      product.reviews.pull(reviewId);
    }

    // Recalculate aggregates
    const approvedReviews = product.reviews.filter(r => r.isApproved);
    if (approvedReviews.length) {
      const sum = approvedReviews.reduce((acc, r) => acc + (r.rating || 0), 0);
      product.ratingsCount = approvedReviews.length;
      product.averageRating = sum / approvedReviews.length;
    } else {
      product.ratingsCount = 0;
      product.averageRating = 0;
    }

    await product.save();

    let message = "";
    if (action === "approve") message = "Avis approuvé";
    else if (action === "block") message = "Avis bloqué (caché)";
    else if (action === "delete") message = "Avis supprimé";

    res.json({ message, product });
  } catch (err) {
    next(err);
  }
};

exports.getAllReviews = async (req, res, next) => {
  try {
    const products = await Product.find({ "reviews.0": { $exists: true } })
      .populate("reviews.user", "name email");

    let allReviews = [];
    products.forEach(p => {
      if (p.reviews) {
        p.reviews.forEach(r => {
          allReviews.push({
            ...(r.toObject ? r.toObject() : r),
            productTitle: p.title,
            productId: p._id
          });
        });
      }
    });

    res.json(allReviews.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
  } catch (err) {
    next(err);
  }
};

exports.bulkImport = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "Veuillez fournir un fichier CSV." });
    }

    const fileContent = req.file.buffer.toString("utf-8");
    const lines = fileContent.split("\n").filter(l => l.trim().length > 0);

    if (lines.length <= 1) {
      return res.status(400).json({ message: "Le fichier CSV est vide ou ne contient que l'en-tête." });
    }

    const headers = lines[0].split(";").map(h => h.trim().toLowerCase());
    const required = ["title", "price", "category_id"];

    for (const reqHeader of required) {
      if (!headers.includes(reqHeader)) {
        return res.status(400).json({ message: `L'en-tête requis '${reqHeader}' est manquant.` });
      }
    }

    let importedCount = 0;
    let errorCount = 0;

    for (let i = 1; i < lines.length; i++) {
      try {
        const values = lines[i].split(";");
        const row = {};
        headers.forEach((h, idx) => {
          row[h] = values[idx] ? values[idx].trim() : "";
        });

        if (!row.title || !row.price || !row.category_id) {
          errorCount++;
          continue;
        }

        const slug = slugify(row.title);
        const exists = await Product.findOne({ slug });

        const colors = row.colors ? row.colors.split(",").map(c => c.trim()) : [];
        const sizes = row.sizes ? row.sizes.split(",").map(c => c.trim()) : [];
        const images = row.images ? row.images.split(",").map(c => c.trim()) : [];

        if (exists) {
          // Optionnel : Mettre à jour si le slug existe ? On le laisse ou l'ignore.
          // On l'ignore pour éviter d'écraser par erreur.
          errorCount++;
          continue;
        }

        await Product.create({
          title: row.title,
          slug,
          description: row.description || "",
          price: Number(row.price),
          category: row.category_id,
          stock: row.stock ? Number(row.stock) : 10,
          promoPercentage: row.promopercentage ? Number(row.promopercentage) : 0,
          image: row.image || "",
          images: images,
          colors: colors,
          sizes: sizes,
          isFeatured: row.isfeatured === 'true' || row.isfeatured === '1'
        });

        importedCount++;
      } catch (err) {
        errorCount++;
      }
    }

    res.json({ message: `Importation terminée. ${importedCount} produit(s) importé(s), ${errorCount} erreur(s).` });
  } catch (err) {
    next(err);
  }
};