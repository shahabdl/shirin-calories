const { default: mongoose } = require("mongoose");
const sanitize = require('mongo-sanitize');

const foodmodel = require("../models/food-model");
const ingredientModel = require("../models/ingredient-model");

const searchIngredientByName = async (req, res, next) => {
  try {
    if (req.query.name) {
      var name = sanitize(req.query.name);
      name = name.replace('*','');
      name = name.replace('[','');
      name = name.replace(']','')

      const ingredients = await ingredientModel
        .find({ name: { $regex: ".*" + name + ".*" } })
        .limit(20);
      const usersFoods = await foodmodel
        .find({ name: { $regex: ".*" + name + ".*" } })
        .limit(20)
        .select('-foods -ingredients -__v')
      res.status(200).json({ ingredients, usersFoods });
      return;
    } else {
      next();
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal Server Error! 500" });
    return;
  }
};

const getIngredientsByID = async (req, res, next) => {
  try {
    if (req.query.id) {
      const ingredID = req.query.id;
      let ingredient;
      if (mongoose.isValidObjectId(ingredID)) {
        ingredient = await ingredientModel.findById(ingredID);
      } else {
        return res.status(204).json({ error: "Food was not found!" });
      }
      return res.status(200).json({ ingredient });
    } else {
      next();
    }
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error! 500" });
    return;
  }
};

module.exports = {
  getIngredientsByID,
  searchIngredientByName,
};
