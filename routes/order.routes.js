const express = require("express");
const router = express.Router();
const Order = require("../models/Order");
const Product = require("../models/Product");
const User = require("../models/User");
const Coupon = require("../models/Coupon");
const Notification = require("../models/Notification");
const isAuth = require("../middlewares/isAuth");
const isAdmin = require("../middlewares/isAdmin");
const maybeAuth = require("../middlewares/maybeAuth");
const {
    sendOrderConfirmation,
    sendAdminOrderAlert,
    sendAdminLowStockAlert,
} = require("../config/mailer");

// POST /api/orders
// Créer une commande + décrémenter le stock + envoyer emails
router.post("/", maybeAuth, async (req, res, next) => {
    try {
        const { items, shippingAddress, phone, guestName, appliedCoupon } = req.body;

        if (!items || items.length === 0) {
            return res.status(400).json({ message: "Le panier est vide" });
        }

        // 1. Décrémenter le stock + détecter les produits à 0
        const outOfStockProducts = [];
        for (const item of items) {
            const product = await Product.findById(item.id || item.product);
            if (product) {
                if (product.stock < item.qty) {
                    return res.status(400).json({ message: `Stock insuffisant pour ${product.title}` });
                }
                product.stock -= item.qty;
                await product.save();
                // Détecter stock = 0
                if (product.stock === 0) {
                    outOfStockProducts.push(product);
                }
            }
        }

        // 2. Calculer le total sécurisé
        let finalTotal = items.reduce((sum, item) => sum + item.price * item.qty, 0);

        if (appliedCoupon) {
            const coupon = await Coupon.findOne({ code: appliedCoupon.toUpperCase(), isActive: true });
            if (coupon && (!coupon.expiresAt || new Date() <= new Date(coupon.expiresAt))) {
                if (coupon.usageLimit > 0 && coupon.usageCount >= coupon.usageLimit) {
                    return res.status(400).json({ message: "La limite d'utilisation de ce code promo a été atteinte." });
                }
                finalTotal = finalTotal - (finalTotal * coupon.discountPercentage / 100);
                coupon.usageCount = (coupon.usageCount || 0) + 1;
                await coupon.save();
            } else {
                return res.status(400).json({ message: "Code promo refusé : expiré ou invalide." });
            }
        }

        // 3. Créer la commande
        const newOrder = new Order({
            user: req.user ? req.user.id : null,
            items: items.map(x => ({
                product: x.id || x.product,
                title: x.title,
                price: x.price,
                qty: x.qty,
                image: x.image
            })),
            total: finalTotal,
            shippingAddress: shippingAddress || "Adresse non fournie",
            phone: phone || "Téléphone non fourni",
            guestName: guestName,
            status: "Validée"
        });

        await newOrder.save();

        // 3. Récupérer les données utilisateur pour les emails et la notification
        let userDoc = null;
        if (req.user) {
            userDoc = await User.findById(req.user.id).select("name email");
        } else {
            // Pour un invité, on pourrait simuler un userDoc simple si on avait son mail
            // Mais la consigne dit juste adresse et tel.
            // On peut envoyer une alerte admin quand même sans user confirmation.
        }

        // 4. Créer une notification pour l'admin lorsqu'une commande est validée
        try {
            const customerName = userDoc?.name || newOrder.guestName || "Un client";
            const itemsCount = items.reduce((sum, item) => sum + item.qty, 0);

            const totalValue = finalTotal.toFixed(3);

            const notification = await Notification.create({
                message: `Nouvelle commande de ${customerName}: ${itemsCount} article(s) pour ${totalValue} TND`,
                type: "order",
                userId: req.user ? req.user.id : null,
            });
            console.log("[Notification] ✅ Commande créée:", notification.message);
            console.log("[Notification] Détails:", { customerName, itemsCount, totalValue, orderId: newOrder._id });
        } catch (notifError) {
            console.error("❌ Erreur création notification commande:", notifError);
            console.error("❌ Détails erreur:", notifError.message, notifError.stack);
            // Ne pas bloquer la réponse si la notification échoue
        }

        // 5. Envoyer emails (non-bloquants mais avec await pour voir les erreurs)
        try {
            if (userDoc) {
                console.log("[Email] Envoi confirmation client et alerte admin...");
                await sendOrderConfirmation(userDoc, newOrder).catch(e => console.error("❌ Email confirmation:", e.message));
                await sendAdminOrderAlert(userDoc, newOrder).catch(e => console.error("❌ Email admin:", e.message));
            } else {
                // Alerte admin pour commande invité
                const guestDoc = { name: newOrder.guestName || "Invité", email: "guest@example.com" };
                console.log("[Email] Envoi alerte admin (invité)...");
                await sendAdminOrderAlert(guestDoc, newOrder).catch(e => console.error("❌ Email admin invité:", e.message));
            }
        } catch (emailError) {
            console.error("❌ Erreur générale emails:", emailError);
            // Ne pas bloquer la réponse si les emails échouent
        }

        // 6. Alerte stock = 0 si applicable
        if (outOfStockProducts.length > 0) {
            sendAdminLowStockAlert(outOfStockProducts);
        }

        res.status(201).json({ message: "Commande validée avec succès", order: newOrder });
    } catch (error) {
        next(error);
    }
});

// GET /api/orders/admin/dashboard-stats - Stats globales pour le dashboard (Admin)
router.get("/admin/dashboard-stats", isAuth, isAdmin, async (req, res, next) => {
    try {
        const totalOrders = await Order.countDocuments();
        const totalProducts = await Product.countDocuments();
        const totalUsers = await User.countDocuments();

        const revenueData = await Order.aggregate([
            { $group: { _id: null, totalRevenue: { $sum: "$total" } } }
        ]);
        const totalRevenue = revenueData.length > 0 ? revenueData[0].totalRevenue : 0;

        const recentOrders = await Order.find()
            .populate("user", "name")
            .sort({ createdAt: -1 })
            .limit(5);

        // Sales over time (6 derniers mois)
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

        const salesOverTime = await Order.aggregate([
            { $match: { createdAt: { $gte: sixMonthsAgo } } },
            {
                $group: {
                    _id: {
                        month: { $month: "$createdAt" },
                        year: { $year: "$createdAt" }
                    },
                    totalSales: { $sum: "$total" },
                    count: { $sum: 1 }
                }
            },
            { $sort: { "_id.year": 1, "_id.month": 1 } }
        ]);

        res.status(200).json({
            totalOrders,
            totalProducts,
            totalUsers,
            totalRevenue,
            recentOrders,
            salesOverTime: salesOverTime.map(s => ({
                name: `${s._id.month}/${s._id.year}`,
                sales: s.totalSales
            }))
        });
    } catch (error) {
        next(error);
    }
});

// GET /api/orders/stats/sales - Statistiques de ventes par produit (Admin)
router.get("/stats/sales", isAuth, isAdmin, async (req, res, next) => {
    try {
        const salesStats = await Order.aggregate([
            { $unwind: "$items" },
            {
                $group: {
                    _id: "$items.product",
                    title: { $first: "$items.title" },
                    totalSold: { $sum: "$items.qty" },
                    revenue: { $sum: { $multiply: ["$items.qty", "$items.price"] } }
                }
            },
            { $sort: { totalSold: -1 } }
        ]);
        res.status(200).json(salesStats);
    } catch (error) {
        next(error);
    }
});

// GET /api/orders - Récupérer toutes les commandes (Admin)
router.get("/", isAuth, isAdmin, async (req, res, next) => {
    try {
        const orders = await Order.find()
            .populate("user", "name email")
            .sort({ createdAt: -1 });
        res.status(200).json(orders);
    } catch (error) {
        next(error);
    }
});

// GET /api/orders/user/:id - Récupérer les commandes d'un utilisateur spécifique (Admin)
router.get("/user/:id", isAuth, isAdmin, async (req, res, next) => {
    try {
        const orders = await Order.find({ user: req.params.id })
            .sort({ createdAt: -1 });
        res.status(200).json(orders);
    } catch (error) {
        next(error);
    }
});

// PUT /api/orders/:id/status - Mettre à jour le statut d'une commande (Admin)
router.put("/:id/status", isAuth, isAdmin, async (req, res, next) => {
    try {
        const { status } = req.body;
        const order = await Order.findById(req.params.id);

        if (!order) {
            return res.status(404).json({ message: "Commande introuvable" });
        }

        order.status = status;
        await order.save();

        res.status(200).json({ message: "Statut mis à jour", order });
    } catch (error) {
        next(error);
    }
});

module.exports = router;
