const Page = require("../models/Page");
const slugify = (s) => s.toLowerCase().trim().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");

exports.getAll = async (req, res, next) => {
    try {
        const pages = await Page.find().sort({ createdAt: -1 });
        res.json(pages);
    } catch (err) {
        next(err);
    }
};

exports.getOne = async (req, res, next) => {
    try {
        const { slug } = req.params;
        const page = await Page.findOne({ slug });
        if (!page) return res.status(404).json({ message: "Page non trouvée" });
        res.json(page);
    } catch (err) {
        next(err);
    }
};

exports.create = async (req, res, next) => {
    try {
        const { title, content } = req.body;
        const slug = slugify(title);

        const exists = await Page.findOne({ slug });
        if (exists) return res.status(409).json({ message: "Ce titre de page existe déjà" });

        const page = await Page.create({ title, slug, content });
        res.status(201).json(page);
    } catch (err) {
        next(err);
    }
};

exports.update = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { title, content } = req.body;
        const update = {};
        if (title) {
            update.title = title;
            const slug = slugify(title);
            const exists = await Page.findOne({ slug, _id: { $ne: id } });
            if (exists) return res.status(409).json({ message: "Ce titre de page existe déjà" });
            update.slug = slug;
        }
        if (content !== undefined) update.content = content;

        const page = await Page.findByIdAndUpdate(id, update, { new: true });
        if (!page) return res.status(404).json({ message: "Page non trouvée" });
        res.json(page);
    } catch (err) {
        next(err);
    }
};

exports.remove = async (req, res, next) => {
    try {
        const { id } = req.params;
        const page = await Page.findByIdAndDelete(id);
        if (!page) return res.status(404).json({ message: "Page non trouvée" });
        res.json({ message: "Page supprimée" });
    } catch (err) {
        next(err);
    }
};
