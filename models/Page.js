const mongoose = require("mongoose");

const pageSchema = new mongoose.Schema(
    {
        title: { type: String, required: true, trim: true },
        slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
        content: { type: String, default: "" },
    },
    { timestamps: true }
);

module.exports = mongoose.model("Page", pageSchema);
