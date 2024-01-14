const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const consumedProductsSchema = new Schema({
  title: {
    type: String,
    required: true,
  },
  weight: {
    type: Number,
    required: true,
  },
  calories: {
    type: Number,
  },
  categories: { type: String },
  groupBloodNotAllowed: { type: Array },
});

const diarySchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
  date: {
    type: String,
    required: true,
  },
  necessaryCalories: {
    type: Number,
    required: true,
  },
  consumedCalories: {
    type: Number,
    default: 0,
    required: true,
  },

  remainingCalories: {
    type: Number,
  },
  percentageRemaining: {
    type: Number,
  },
  consumedProducts: [consumedProductsSchema],
  nonRecommendedFood: {
    type: Object,
  },
});

diarySchema.methods.calculateConsumedCalories = function () {
  let total = 0;

  for (let item of this.consumedProducts) {
    total += item.calories || 0;
  }

  this.consumedCalories = total;
  return this.consumedCalories;
};

diarySchema.methods.calculateRemainingCalories = function () {
  return this.necessaryCalories - this.consumedCalories || 0;
};

diarySchema.methods.calculatePercentageRemaining = function () {
  const remainingPercentage =
    (this.remainingCalories / this.necessaryCalories) * 100;
  return isFinite(remainingPercentage)
    ? Math.max(0, remainingPercentage).toFixed(2)
    : 0;
};
const Diary = mongoose.model("diaries", diarySchema);
module.exports = Diary;
