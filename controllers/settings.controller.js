const Settings = require("../models/Settings");

exports.getSettings = async (req, res, next) => {
    try {
        let settings = await Settings.findOne();
        if (!settings) {
            settings = await Settings.create({});
        }
        res.json(settings);
    } catch (err) {
        next(err);
    }
};

exports.updateSettings = async (req, res, next) => {
    try {
        const update = { ...req.body };

        // Handle socialLinks parsing if it comes as a string from FormData
        if (typeof update.socialLinks === "string") {
            try {
                update.socialLinks = JSON.parse(update.socialLinks);
            } catch (e) {
                // If it fails, leave it as is or handle error, but it shouldn't fail if stringified correctly
            }
        }

        if (update.bannerActive === "true") update.bannerActive = true;
        if (update.bannerActive === "false") update.bannerActive = false;

        if (req.files) {
            if (req.files.siteLogo && req.files.siteLogo[0]) {
                update.siteLogo = req.files.siteLogo[0].path;
            }
            if (req.files.heroImage && req.files.heroImage[0]) {
                update.heroImage = req.files.heroImage[0].path;
            }
        } else if (req.file) {
            // Logback si utilisé en single sur une autre route / cas
            if (req.file.fieldname === "siteLogo") update.siteLogo = req.file.path;
            if (req.file.fieldname === "heroImage") update.heroImage = req.file.path;
        }

        let settings = await Settings.findOne();
        if (!settings) {
            settings = await Settings.create(update);
        } else {
            settings = await Settings.findOneAndUpdate({}, update, { new: true });
        }
        res.json(settings);
    } catch (err) {
        next(err);
    }
};
