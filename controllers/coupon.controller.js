const Coupon = require("../models/Coupon");

exports.getAll = async (req, res, next) => {
    try {
        const coupons = await Coupon.find().sort({ createdAt: -1 });
        res.json({ coupons });
    } catch (err) {
        next(err);
    }
};

exports.getActive = async (req, res, next) => {
    try {
        const coupon = await Coupon.findOne({
            isActive: true,
            $or: [
                { expiresAt: { $exists: false } },
                { expiresAt: null },
                { expiresAt: { $gt: new Date() } }
            ]
        }).sort({ createdAt: -1 });

        if (!coupon) {
            return res.status(404).json({ message: "Aucun code promo actif trouvé." });
        }

        res.json({ code: coupon.code, discountPercentage: coupon.discountPercentage });
    } catch (err) {
        next(err);
    }
};

exports.create = async (req, res, next) => {
    try {
        const { code, discountPercentage, isActive, expiresAt, usageLimit } = req.body;

        const exists = await Coupon.findOne({ code: code.toUpperCase() });
        if (exists) {
            return res.status(409).json({ message: "Ce code promo existe déjà" });
        }

        const coupon = await Coupon.create({
            code: code.toUpperCase(),
            discountPercentage,
            isActive,
            expiresAt: expiresAt || null,
            usageLimit: usageLimit || 0
        });

        res.status(201).json({ coupon });
    } catch (err) {
        next(err);
    }
};

exports.remove = async (req, res, next) => {
    try {
        const { id } = req.params;
        const coupon = await Coupon.findByIdAndDelete(id);
        if (!coupon) return res.status(404).json({ message: "Coupon introuvable" });
        res.json({ message: "Coupon supprimé", id });
    } catch (err) {
        next(err);
    }
};

exports.validate = async (req, res, next) => {
    try {
        const { code } = req.body;
        if (!code) return res.status(400).json({ message: "Code manquant" });

        const coupon = await Coupon.findOne({ code: code.toUpperCase() });
        if (!coupon) return res.status(404).json({ message: "Code promo invalide." });

        if (!coupon.isActive) {
            return res.status(400).json({ message: "Ce code promo est inactif." });
        }

        if (coupon.expiresAt && new Date() > new Date(coupon.expiresAt)) {
            return res.status(400).json({ message: "Ce code promo a expiré." });
        }

        if (coupon.usageLimit > 0 && coupon.usageCount >= coupon.usageLimit) {
            return res.status(400).json({ message: "La limite d'utilisation de ce code promo a été atteinte." });
        }

        res.json({
            message: "Code appliqué avec succès !",
            discount: coupon.discountPercentage
        });
    } catch (err) {
        next(err);
    }
};
