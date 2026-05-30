const ApiError = require("../utils/ApiError");

const errorHandler = (err, _req, res, _next) => {
  if (err.name === "ValidationError") {
    const messages = Object.values(err.errors).map((e) => e.message);
    return res.status(400).json({ message: messages.join(", ") });
  }

  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    const messages = {
      name: "This name already exists.",
      slug: "An entry with this title already exists.",
      email: "This email is already registered.",
    };
    const message =
      messages[field] ?? `This ${field} is already in use.`;
    return res.status(409).json({ message });
  }

  if (err.name === "JsonWebTokenError" || err.name === "TokenExpiredError") {
    return res.status(401).json({ message: "Invalid or expired token" });
  }

  if (err.name === "CastError") {
    return res.status(400).json({ message: "Invalid ID format" });
  }

  const statusCode = err instanceof ApiError ? err.statusCode : 500;
  const message =
    err instanceof ApiError ? err.message : "Internal server error";

  res.status(statusCode).json({ message });
};

module.exports = errorHandler;
