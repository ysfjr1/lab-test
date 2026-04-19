const mongoose = require("mongoose");
const slugify = require("slugify");

const articleSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, unique: true },
    excerpt: { type: String, default: "" },
    content: { type: String, required: true },
    coverImage: { type: String, default: "" },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    tags: [{ type: mongoose.Schema.Types.ObjectId, ref: "Tag" }],
    status: {
      type: String,
      enum: ["draft", "pending", "published"],
      default: "draft",
    },
    views: { type: Number, default: 0 },
  },
  { timestamps: true }
);

articleSchema.pre("save", function (next) {
  if (this.isModified("title")) {
    this.slug =
      slugify(this.title, { lower: true, strict: true }) +
      "-" +
      Date.now().toString(36);
  }
  next();
});

articleSchema.index({ title: "text", content: "text" });

module.exports = mongoose.model("Article", articleSchema);
