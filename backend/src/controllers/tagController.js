const Tag = require("../models/Tag");
const Article = require("../models/Article");
const ApiError = require("../utils/ApiError");

const withArticleCount = async (tags) => {
  const counts = await Article.aggregate([
    { $unwind: "$tags" },
    { $group: { _id: "$tags", count: { $sum: 1 } } },
  ]);

  const countMap = Object.fromEntries(
    counts.map((c) => [c._id.toString(), c.count])
  );

  return tags.map((tag) => ({
    ...tag.toObject(),
    articleCount: countMap[tag._id.toString()] || 0,
  }));
};

exports.getAll = async (_req, res) => {
  const tags = await Tag.find().sort("-createdAt");
  const result = await withArticleCount(tags);
  res.json(result);
};

exports.create = async (req, res) => {
  const { name } = req.body;

  if (!name) {
    throw new ApiError(400, "Name is required");
  }

  const tag = await Tag.create({ name });
  res.status(201).json({ ...tag.toObject(), articleCount: 0 });
};

exports.update = async (req, res) => {
  const tag = await Tag.findById(req.params.id);

  if (!tag) {
    throw new ApiError(404, "Tag not found");
  }

  if (req.body.name !== undefined) tag.name = req.body.name;
  await tag.save();

  const count = await Article.countDocuments({ tags: tag._id });
  res.json({ ...tag.toObject(), articleCount: count });
};

exports.remove = async (req, res) => {
  const tag = await Tag.findById(req.params.id);

  if (!tag) {
    throw new ApiError(404, "Tag not found");
  }

  await tag.deleteOne();
  res.json({ message: "Tag deleted" });
};
