const Article = require("../models/Article");
const ApiError = require("../utils/ApiError");

const ITEMS_PER_PAGE = 6;

const populateArticle = [
  { path: "author", select: "name email role createdAt" },
  { path: "category", select: "name slug description createdAt" },
  { path: "tags", select: "name slug createdAt" },
];

exports.getAll = async (req, res) => {
  const { search, category, tag, sort, page = 1 } = req.query;
  const filter = { status: "published" };

  if (search) {
    filter.$or = [
      { title: { $regex: search, $options: "i" } },
      { content: { $regex: search, $options: "i" } },
    ];
  }

  if (category) {
    const Category = require("../models/Category");
    const cat = await Category.findOne({ slug: category });
    if (cat) filter.category = cat._id;
  }

  if (tag) {
    const Tag = require("../models/Tag");
    const t = await Tag.findOne({ slug: tag });
    if (t) filter.tags = t._id;
  }

  const sortOption = sort === "views" ? "-views" : "-createdAt";
  const skip = (Number(page) - 1) * ITEMS_PER_PAGE;

  const [data, total] = await Promise.all([
    Article.find(filter)
      .populate(populateArticle)
      .sort(sortOption)
      .skip(skip)
      .limit(ITEMS_PER_PAGE),
    Article.countDocuments(filter),
  ]);

  res.json({
    data,
    page: Number(page),
    totalPages: Math.ceil(total / ITEMS_PER_PAGE) || 1,
    total,
  });
};

exports.getAllAdmin = async (req, res) => {
  const { search, status, page = 1, authorId } = req.query;
  const filter = {};

  if (req.user.role === "author") {
    filter.author = req.user._id;
  } else if (authorId) {
    filter.author = authorId;
  }

  if (status && status !== "all") {
    filter.status = status;
  }

  if (search) {
    filter.title = { $regex: search, $options: "i" };
  }

  const skip = (Number(page) - 1) * ITEMS_PER_PAGE;

  const [data, total] = await Promise.all([
    Article.find(filter)
      .populate(populateArticle)
      .sort("-createdAt")
      .skip(skip)
      .limit(ITEMS_PER_PAGE),
    Article.countDocuments(filter),
  ]);

  res.json({
    data,
    page: Number(page),
    totalPages: Math.ceil(total / ITEMS_PER_PAGE) || 1,
    total,
  });
};

exports.getBySlug = async (req, res) => {
  const article = await Article.findOne({
    slug: req.params.slug,
    status: "published",
  }).populate(populateArticle);

  if (!article) {
    throw new ApiError(404, "Article not found");
  }

  res.json(article);
};

exports.recordView = async (req, res) => {
  const article = await Article.findOneAndUpdate(
    { _id: req.params.id, status: "published" },
    { $inc: { views: 1 } },
    { new: true }
  );

  if (!article) {
    throw new ApiError(404, "Article not found");
  }

  res.json({ views: article.views });
};

exports.getById = async (req, res) => {
  const article = await Article.findById(req.params.id).populate(
    populateArticle
  );

  if (!article) {
    throw new ApiError(404, "Article not found");
  }

  if (
    req.user.role === "author" &&
    article.author._id.toString() !== req.user._id.toString()
  ) {
    throw new ApiError(403, "Not authorized");
  }

  res.json(article);
};

exports.getRelated = async (req, res) => {
  const article = await Article.findById(req.params.id);

  if (!article) {
    return res.json([]);
  }

  const related = await Article.find({
    _id: { $ne: article._id },
    status: "published",
    $or: [{ category: article.category }, { tags: { $in: article.tags } }],
  })
    .populate(populateArticle)
    .limit(3);

  res.json(related);
};

exports.create = async (req, res) => {
  const { title, excerpt, content, coverImage, category, tags, status } =
    req.body;

  const article = await Article.create({
    title,
    excerpt,
    content,
    coverImage,
    category,
    tags,
    status,
    author: req.user._id,
  });

  const populated = await article.populate(populateArticle);
  res.status(201).json(populated);
};

exports.update = async (req, res) => {
  const article = await Article.findById(req.params.id);

  if (!article) {
    throw new ApiError(404, "Article not found");
  }

  if (
    req.user.role === "author" &&
    article.author.toString() !== req.user._id.toString()
  ) {
    throw new ApiError(403, "Not authorized");
  }

  const { title, excerpt, content, coverImage, category, tags, status } =
    req.body;

  if (title !== undefined) article.title = title;
  if (excerpt !== undefined) article.excerpt = excerpt;
  if (content !== undefined) article.content = content;
  if (coverImage !== undefined) article.coverImage = coverImage;
  if (category !== undefined) article.category = category;
  if (tags !== undefined) article.tags = tags;
  if (status !== undefined) article.status = status;

  await article.save();
  const populated = await article.populate(populateArticle);

  res.json(populated);
};

exports.remove = async (req, res) => {
  const article = await Article.findById(req.params.id);

  if (!article) {
    throw new ApiError(404, "Article not found");
  }

  if (
    req.user.role === "author" &&
    article.author.toString() !== req.user._id.toString()
  ) {
    throw new ApiError(403, "Not authorized");
  }

  await article.deleteOne();
  res.json({ message: "Article deleted" });
};
