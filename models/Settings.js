const mongoose = require("mongoose");

const settingsSchema = new mongoose.Schema(
    {
        siteName: { type: String, default: "My Eco-Deco" },
        siteLogo: { type: String, default: "" },
        contactEmail: { type: String, default: "" },
        contactPhone: { type: String, default: "" },
        address: { type: String, default: "" },
        socialLinks: {
            facebook: { type: String, default: "" },
            instagram: { type: String, default: "" },
            twitter: { type: String, default: "" }
        },
        footerText: { type: String, default: "© 2024 My Eco-Deco. Tous droits réservés." },
        heroTitle: { type: String, default: "Nouvelle Collection" },
        heroImage: { type: String, default: "" },
        bannerActive: { type: Boolean, default: false },
        bannerText: { type: String, default: "Livraison gratuite à partir de 200 TND !" }
    },
    { timestamps: true }
);

module.exports = mongoose.model("Settings", settingsSchema);
