const Order = require("../models/Order");
const Product = require("../models/Product");

exports.getDashboardStats = async (req, res) => {
    try {
        // 1. Revenus des 30 derniers jours (groupés par jour)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const orders = await Order.find({
            createdAt: { $gte: thirtyDaysAgo },
            status: { $ne: "Annulée" }
        }).select("total createdAt");

        // Agréger les revenus par date (YYYY-MM-DD)
        const revenueMap = {};
        orders.forEach(order => {
            const dateStr = order.createdAt.toISOString().split("T")[0];
            revenueMap[dateStr] = (revenueMap[dateStr] || 0) + order.total;
        });

        const revenueData = Object.keys(revenueMap).sort().map(date => ({
            date,
            revenue: revenueMap[date]
        }));

        // 2. Commandes non traitées (badge)
        const pendingCount = await Order.countDocuments({
            status: { $in: ["Validée", "En Préparation"] }
        });

        // 3. Top 5 Produits vendus
        const topProductsGroups = await Order.aggregate([
            { $match: { status: { $ne: "Annulée" } } },
            { $unwind: "$items" },
            { $group: { _id: "$items.id", title: { $first: "$items.title" }, totalSold: { $sum: "$items.qty" } } },
            { $sort: { totalSold: -1 } },
            { $limit: 5 }
        ]);

        const topProducts = topProductsGroups.map(p => ({
            _id: p._id,
            title: p.title,
            sales: p.totalSold
        }));

        // 4. Nombre total de produits et utilisateurs (optionnel)
        const totalProducts = await Product.countDocuments();
        const totalOrders = await Order.countDocuments();

        res.json({
            revenueData,
            pendingCount,
            topProducts,
            totalProducts,
            totalOrders
        });

    } catch (error) {
        res.status(500).json({ message: "Erreur serveur lors du calcul des statistiques." });
    }
};
