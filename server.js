require("dotenv").config();

const express = require("express");
const cors = require("cors");
const path = require("path"); // ✅ AJOUTER
const http = require("http");
const { Server } = require("socket.io");
const connectDB = require("./config/connectDB");
const errorHandler = require("./middlewares/errorHandler");

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: { origin: process.env.CLIENT_URL || "http://localhost:3000", credentials: true }
});
app.locals.io = io; // Partager l'instance io avec les controllers

app.use(cors({ origin: process.env.CLIENT_URL || "http://localhost:3000", credentials: true }));
app.use(express.json({ limit: "5mb" }));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

app.get("/", (req, res) => res.send("API OK - VERSION 2.1 ✅"));

app.use("/api/auth", require("./routes/auth.routes"));
app.use("/api/categories", require("./routes/category.routes"));
app.use("/api/products", require("./routes/product.routes"));
app.use("/api/messages", require("./routes/message.routes"));
app.use("/api/users", require("./routes/user.routes"));
app.use("/api/orders", require("./routes/order.routes"));
app.use("/api/notifications", require("./routes/notification.routes"));
app.use("/api/ai", require("./routes/ai.routes"));
app.use("/api/coupons", require("./routes/coupon.routes"));
app.use("/api/settings", require("./routes/settings.routes"));
app.use("/api/newsletter", require("./routes/newsletter.routes"));
app.use("/api/pages", require("./routes/page.routes"));

// Admin routes - Déplacés vers admin.routes.js
app.use("/api/admin", require("./routes/admin.routes"));

app.use(errorHandler);

// Socket.io événements
io.on("connection", (socket) => {
  console.log("🟢 Nouvelle connexion Socket :", socket.id);
  socket.on("disconnect", () => console.log("🔴 Déconnexion Socket :", socket.id));
});

connectDB(process.env.MONGO_URI).then(() => {
  server.listen(process.env.PORT || 5000, () => {
    console.log(`✅ Server on http://localhost:${process.env.PORT || 5000}`);
  });
});