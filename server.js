require("dotenv").config();

const express = require("express");
const cors = require("cors");
const path = require("path"); // ✅ AJOUTER
const connectDB = require("./config/connectDB");
const errorHandler = require("./middlewares/errorHandler");

const app = express();

app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));
app.use(express.json({ limit: "5mb" }));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.get("/", (req, res) => res.send("API OK ✅"));

app.use("/api/auth", require("./routes/auth.routes"));
app.use("/api/categories", require("./routes/category.routes"));
app.use("/api/products", require("./routes/product.routes"));
app.use("/api/messages", require("./routes/message.routes"));
app.use("/api/users", require("./routes/user.routes"));
app.use("/api/orders", require("./routes/order.routes"));
app.use("/api/notifications", require("./routes/notification.routes"));

app.use(errorHandler);

connectDB(process.env.MONGO_URI).then(() => {
  app.listen(process.env.PORT || 5000, () =>
    console.log(`✅ Server on http://localhost:${process.env.PORT || 5000}`)
  );
});