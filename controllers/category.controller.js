const Category = require("../models/Category");
const Product = require("../models/Product");

const slugify = (s = "") =>
  s.toLowerCase().trim().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");

exports.getAll = async (req, res, next) => {
  try {
    const categories = await Category.find().sort({ createdAt: -1 });
    
    // Pour chaque catégorie, récupérer quelques produits (3-4) pour afficher leurs images
    const categoriesWithProducts = await Promise.all(
      categories.map(async (cat) => {
        const products = await Product.find({ category: cat._id })
          .select("image title")
          .limit(4)
          .sort({ createdAt: -1 });
        
        return {
          ...cat.toObject(),
          sampleProducts: products.map((p) => ({
            image: p.image,
            title: p.title,
          })),
        };
      })
    );
    
    res.json({ categories: categoriesWithProducts });
  } catch (err) {
    next(err);
  }
};

exports.create = async (req, res, next) => {
  try {
    const { name } = req.body;

    if (!name?.trim()) return res.status(400).json({ message: "Le nom est obligatoire" });

    const slug = slugify(name);
    const exists = await Category.findOne({ $or: [{ name: name.trim() }, { slug }] });
    if (exists) return res.status(409).json({ message: "Cette catégorie existe déjà" });

    const image = req.file ? req.file.path : "";

    const category = await Category.create({
      name: name.trim(),
      slug,
      image,
    });

    res.status(201).json({ category });
  } catch (err) {
    next(err);
  }
};

exports.update = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name } = req.body;

    const update = {};

    if (name?.trim()) {
      const slug = slugify(name);

      // Check if duplicate exists on OTHER categories
      const exists = await Category.findOne({
        $or: [{ name: name.trim() }, { slug }],
        _id: { $ne: id }
      });
      if (exists) return res.status(409).json({ message: "Une autre catégorie possède déjà ce nom ou ce slug" });

      update.name = name.trim();
      update.slug = slug;
    }

    if (req.file) {
      update.image = req.file.path;
    }

    const category = await Category.findByIdAndUpdate(id, update, { new: true });
    if (!category) return res.status(404).json({ message: "Catégorie introuvable" });

    res.json({ category });
  } catch (err) {
    next(err);
  }
};

exports.remove = async (req, res, next) => {
  try {
    const { id } = req.params;
    const category = await Category.findByIdAndDelete(id);
    if (!category) return res.status(404).json({ message: "Catégorie introuvable" });
    res.json({ message: "Supprimé" });
  } catch (err) {
    next(err);
  }
};