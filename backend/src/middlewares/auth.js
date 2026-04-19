const jwt = require("jsonwebtoken");
const User = require("../models/User");
const ApiError = require("../utils/ApiError");

const authenticate = async (req, _res, next) => {
  const header = req.headers.authorization;
  if (!header || !header.startsWith("Bearer ")) {
    throw new ApiError(401, "Authentication required");
  }

  const token = header.split(" ")[1];
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  const user = await User.findById(decoded.id);

  if (!user) {
    throw new ApiError(401, "User no longer exists");
  }

  req.user = user;
  next();
};

const authorize = (...roles) => {
  return (req, _res, next) => {
    if (!roles.includes(req.user.role)) {
      throw new ApiError(403, "Insufficient permissions");
    }
    next();
  };
};

module.exports = { authenticate, authorize };
