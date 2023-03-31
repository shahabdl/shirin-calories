const mongoose = require("mongoose");

const FoodSchema = new mongoose.Schema({
  name: String,
  ingredients: [
    {
      ingredientObj: {
        type: mongoose.Types.ObjectId,
        ref: "ingredients",
        required: [true, "enter ingredient ID"],
      },
      ingredientWeight: {
        type: Number,
        required: [true, "enter Ingredient weight (g)"],
      },
      ingredientType: {
        type: String,
        required: [true, "enter ingredient type"],
      },
      ingredientUnit: {
        type: String,
        required: [true, "Enter Unit (g,oz,lb)"],
      },
      _id: false,
    },
  ],
  foods: [
    {
      foodObj: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "food",
        required: [true, "enter Food ID"],
      },
      foodWeight: {
        type: Number,
        required: [true, "enter Food Weight"],
      },
      foodUnit: {
        type: String,
        required: [true, "enter food unit (g,oz,lb)"],
      },
      _id: false,
    },
  ],
  owner: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  totalWeight: { type: Number, required: [true, "enter total weight of food!"] },
  foodImage: { type: String, required: [true, "please upload image for food!"] },
  foodUnit:{type: String, required:[true,"Please Enter Food Unit"]},
  types: {
    type: Object,
    require: [true, "calculate nutrition data"],
    _id: false,
  },
});

module.exports = mongoose.model("foods", FoodSchema);
