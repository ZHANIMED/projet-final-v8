const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
    {
        message: { type: String, required: true },
        type: {
            type: String,
            enum: ["login", "register", "order", "stock", "message", "review"],
            required: true,
        },
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },
        read: { type: Boolean, default: false },
    },
    { timestamps: true }
);

module.exports = mongoose.model("Notification", notificationSchema);
