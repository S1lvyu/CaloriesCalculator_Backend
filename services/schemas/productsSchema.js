const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const productsSchema = new Schema({
  categories: { type: String },
  weight: { type: Number },
  title: { type: String },
  calories: { type: Number },
  groupBloodNotAllowed: { type: Array },
});
const Products = mongoose.model("products", productsSchema);
module.exports = Products;
