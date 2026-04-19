const Category = require("../models/Category");
const Article = require("../models/Article");
const ApiError = require("../utils/ApiError");

const withArticleCount = async (categories) => {
  const counts = await Article.aggregate([
    { $group: { _id: "$category", count: { $sum: 1 } } },
  ]);

  const countMap = Object.fromEntries(
    counts.map((c) => [c._id.toString(), c.count])
  );

  return categories.map((cat) => ({
    ...cat.toObject(),
    articleCount: countMap[cat._id.toString()] || 0,
  }));
};

exports.getAll = async (_req, res) => {
  const categories = await Category.find().sort("-createdAt");
  const result = await withArticleCount(categories);
  res.json(result);
};

exports.create = async (req, res) => {
  const { name, description } = req.body;

  if (!name) {
    throw new ApiError(400, "Name is required");
  }

  const category = await Category.create({ name, description });
  res.status(201).json({ ...category.toObject(), articleCount: 0 });
};

exports.update = async (req, res) => {
  const category = await Category.findById(req.params.id);

  if (!category) {
    throw new ApiError(404, "Category not found");
  }

  const { name, description } = req.body;
  if (name !== undefined) category.name = name;
  if (description !== undefined) category.description = description;

  await category.save();

  const count = await Article.countDocuments({ category: category._id });
  res.json({ ...category.toObject(), articleCount: count });
};

exports.remove = async (req, res) => {
  const category = await Category.findById(req.params.id);

  if (!category) {
    throw new ApiError(404, "Category not found");
  }

  await category.deleteOne();
  res.json({ message: "Category deleted" });
};
