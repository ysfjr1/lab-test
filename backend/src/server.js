require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const errorHandler = require("./middlewares/error");

const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/users");
const articleRoutes = require("./routes/articles");
const categoryRoutes = require("./routes/categories");
const tagRoutes = require("./routes/tags");
const dashboardRoutes = require("./routes/dashboard");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/articles", articleRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/tags", tagRoutes);
app.use("/api/dashboard", dashboardRoutes);

app.use(errorHandler);

const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  app.listen(PORT, () => {
    process.stdout.write(`Server running on port ${PORT}\n`);
  });
});
