const Article = require("../models/Article");
const Category = require("../models/Category");
const User = require("../models/User");

const populateArticle = [
  { path: "author", select: "name email role" },
  { path: "category", select: "name slug" },
  { path: "tags", select: "name slug" },
];

exports.getStats = async (req, res) => {
  const isAuthor = req.user.role === "author";
  const articleFilter = isAuthor ? { author: req.user._id } : {};

  const [totalArticles, viewsAgg, totalCategories, totalUsers, recentArticles] =
    await Promise.all([
      Article.countDocuments(articleFilter),
      Article.aggregate([
        { $match: articleFilter },
        { $group: { _id: null, total: { $sum: "$views" } } },
      ]),
      Category.countDocuments(),
      User.countDocuments(),
      Article.find(articleFilter)
        .populate(populateArticle)
        .sort("-createdAt")
        .limit(5),
    ]);

  res.json({
    totalArticles,
    totalViews: viewsAgg[0]?.total || 0,
    totalCategories,
    totalUsers,
    recentArticles,
  });
};
