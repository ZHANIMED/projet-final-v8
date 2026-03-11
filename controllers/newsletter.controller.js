const Newsletter = require("../models/Newsletter");

exports.subscribe = async (req, res, next) => {
    try {
        const { email } = req.body;
        if (!email) {
            return res.status(400).json({ message: "L'email est requis." });
        }

        const existing = await Newsletter.findOne({ email });
        if (existing) {
            return res.status(400).json({ message: "Cet email est déjà inscrit." });
        }

        const newSubscriber = new Newsletter({ email });
        await newSubscriber.save();

        res.status(201).json({ message: "Inscription réussie à la newsletter ! 🎉" });
    } catch (err) {
        next(err);
    }
};

exports.getSubscribers = async (req, res, next) => {
    try {
        const subscribers = await Newsletter.find().sort({ createdAt: -1 });
        res.json(subscribers);
    } catch (err) {
        next(err);
    }
};
