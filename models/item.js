const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const ItemSchema = new Schema({
  name: { type: String, required: true, minLength: 3, maxLength: 100 },
  summary: { type: String, required: true },
  sub_category: {
    type: Schema.Types.ObjectId,
    ref: "Sub_Category",
    required: true,
  },
});

ItemSchema.virtual("url").get(function () {
  return "/catalog/item/" + this._id;
});

module.exports = mongoose.model("Item", ItemSchema);
