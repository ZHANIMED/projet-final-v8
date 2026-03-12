const mongoose = require("mongoose");
require("dotenv").config();
const Order = require("./models/Order");

async function debugStats() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to DB");

        const orders = await Order.find({});
        console.log(`Found ${orders.length} total orders.`);
        const statuses = {};
        orders.forEach(o => {
            statuses[o.status] = (statuses[o.status] || 0) + 1;
        });
        console.log("STATUSES:", JSON.stringify(statuses));
        process.exit(0);

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

debugStats();
