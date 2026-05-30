const mongoose = require("mongoose");
const slugify = require("slugify");

const tagSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true, trim: true },
    slug: { type: String, unique: true },
  },
  { timestamps: true }
);

tagSchema.pre("save", function () {
  if (this.isModified("name")) {
    this.slug = slugify(this.name, { lower: true, strict: true });
  }
});

tagSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.__v;
  return obj;
};

module.exports = mongoose.model("Tag", tagSchema);
