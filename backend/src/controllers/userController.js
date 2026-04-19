const User = require("../models/User");
const ApiError = require("../utils/ApiError");

exports.getAll = async (_req, res) => {
  const users = await User.find().sort("-createdAt");
  res.json(users);
};

exports.remove = async (req, res) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  if (user._id.toString() === req.user._id.toString()) {
    throw new ApiError(400, "Cannot delete yourself");
  }

  await user.deleteOne();
  res.json({ message: "User deleted" });
};
