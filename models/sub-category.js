const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const Sub_CategorySchema = new Schema({
  name: { type: String, required: true, minLength: 3, maxLength: 100 },
  summary: { type: String, required: true },
  category: { type: Schema.Types.ObjectId, ref: "Category", required: true },
});

Sub_CategorySchema.virtual("url").get(function () {
  return "/catalog/sub_category/" + this._id;
});

module.exports = mongoose.model("Sub_Category", Sub_CategorySchema);
