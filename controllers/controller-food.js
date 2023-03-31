const { default: mongoose } = require("mongoose");
const foodModel = require("../models/food-model");
const userModel = require("../models/user-model");
const { calculateNutritions } = require("../utils/food-calculator");


const getFoodByID = async (req, res) => {
  try {
    if (mongoose.isValidObjectId(req.params.id)) {
      let food = await foodModel
        .findById(req.params.id)
        .select("-foods -ingredients -__v");
      if (!food) {
        res.status(404).json({ error: "Food was not found!" });
        return;
      }
      res.status(200).json({ food });
      return;
    }
    return res.status(400).json({ error: "FoodID is not a vlid ID" });
  } catch (error) {
    res.status(500).json({ msg: error });
    return;
  }
};

const getFoodDetailsByID = async (req, res, next) => {
  try {
    if (mongoose.isValidObjectId(req.params.id)) {
      let food = await foodModel
        .findById(req.params.id)
        .select("-__v -types");
      if (!food) {
        res.status(404).json({ error: "Food was not found!" });
        return;
      }
      if (req.userData.userID !== food.owner.toString()) {
        return res.status(400).json({ error: "This user is not authorized to get detailed information of this food!" });
      }
      res.status(200).json({ food });
      return;
    }
    return res.status(400).json({ error: "FoodID is not a vlid ID" });
  } catch (error) {
    res.status(500).json({ msg: error });
    return;
  }
};

const createUserFood = async (req, res, next) => {
  const { name, ingredients, foods, foodID, totalWeight } = req.body;
  const userID = req.userData.userID;
  let createdFood;
  //check to see if food already exists
  //if it exist then we check to see if user is owner of that food. if not user cannot
  //update it
  let foodExists = false;
  try {
    if (mongoose.isValidObjectId(foodID)) {
      createdFood = await foodModel.findByIdAndUpdate(foodID);
      if (createdFood) {
        if (createdFood.owner.toString() === userID) {
          foodExists = true;
        } else {
          res
            .status(401)
            .json({ error: "user is not authorized to change this food!" });
          return;
        }
      } else {
        res.status(200).json({ error: "Cannot save food" });
        return;
      }
    }
    //if food doesnt exist or user is not the owner then we create new food
    calculateNutritions(ingredients, foods, totalWeight)
      .then(async (nutritions) => {
        if (nutritions.error === undefined) {
          if (foodExists) {
            createdFood.name = name;
            createdFood.ingredients = ingredients;
            createdFood.foods = foods;
            createdFood.types = { "User Food": { ...nutritions } };
          } else {
            createdFood = new foodModel({
              name,
              ingredients,
              foods,
              owner: userID,
              types: { "User Food": { ...nutritions } },
            });
          }
        } else {
          throw new Error(nutritions.error);
        }

        let user = await userModel.findById(userID);
        //check to see if user exists
        if (!user) {
          res.status(404).json({ error: "user not found!" });
          return;
        }
        //if user exists then we save food in database and put a referene in user database
        await createdFood.save();
        if (!foodExists) {
          user.userFoods.push(createdFood._id);
          await user.save();
        }
        //then we return message to show success and unique id of food in database
        //frontend can use this id to update food

        let dbFoodID = createdFood._id;

        //201 -> created code
        return res
          .status(201)
          .json({ foodID: dbFoodID, message: "food created successfully!" });
      })
      .catch((error) => {
        console.log(error);
        return res.status(500).json({ error: error.message });
      });
  } catch (error) {
    res.status(500).json({ error });
    return;
  }
};

const saveUserFood = async (req, res, next) => {
  const { name, ingredients, foods, totalWeight } = req.body;
  const userID = req.userData.userID;
  let createdFood;

  try {
    calculateNutritions(ingredients, foods, totalWeight)
      .then(async (nutritions) => {
        if (nutritions.error === undefined) {
          createdFood = new foodModel({
            name,
            ingredients,
            foods,
            owner: userID,
            totalWeight,
            foodImage: "test",
            types: { "User Food": { ...nutritions } },
          });
          createdFood.foodImage = "foodImage-" + req.userData.userID + "-" + name + "-" + createdFood._id;

        } else {
          throw new Error(nutritions.error);
        }

        let user = await userModel.findById(userID);
        //check to see if user exists
        if (!user) {
          res.status(404).json({ error: "user not found!" });
          return;
        }
        //if user exists then we save food in database and put a referene in user database
        await createdFood.save();
        user.userFoods.push(createdFood._id);
        await user.save();
        //then we return message to show success and unique id of food in database
        //frontend can use this id to update food

        let dbFoodID = createdFood._id;

        //201 -> created code
        return res
          .status(201)
          .json({ foodID: dbFoodID, message: "food created successfully!" });
      })
      .catch((error) => {
        console.log(error);
        return res.status(500).json({ error: error.message });
      });
  } catch (error) {
    res.status(500).json({ error });
    return;
  }
};

const updateFood = async (req, res) => {
  const { name, ingredients, foods, foodID, totalWeight, foodUnit } = req.body;
  const userID = req.userData.userID;
  let createdFood;
  try {
    if (mongoose.isValidObjectId(foodID)) {
      createdFood = await foodModel.findByIdAndUpdate(foodID)
      if (!createdFood) {
        res.status(200).json({ error: "Cannot update food" });
        return;
      } else {
        if (createdFood.owner.toString() !== userID) {
          res
            .status(401)
            .json({ error: "user is not authorized to change this food!" });
          return;
        }
      }
    }
    else {
      res.status(200).json({ error: "Cannot update food" });
      return;
    }
    //if food doesnt exist or user is not the owner then we create new food
    calculateNutritions(ingredients, foods, totalWeight, foodUnit)
      .then(async (nutritions) => {
        if (nutritions.error === undefined) {
          createdFood.name = name;
          createdFood.ingredients = ingredients;
          createdFood.foods = foods;
          createdFood.totalWeight = totalWeight;
          createdFood.foodUnit = foodUnit;
          createdFood.foodImage = "foodImage-" + req.userData.userID + "-" + name + "-" + createdFood._id;
          createdFood.types = { "User Food": { ...nutritions } };
        } else {
          throw new Error(nutritions.error);
        }

        let user = await userModel.findById(userID);
        //check to see if user exists
        if (!user) {
          res.status(404).json({ error: "user was not found!" });
          return;
        }

        await createdFood.save();

        let dbFoodID = createdFood._id;

        //201 -> created code
        return res
          .status(201)
          .json({ foodID: dbFoodID, message: "food created successfully!" });
      })
      .catch((error) => {
        console.log(error);
        return res.status(500).json({ error: error.message });
      });
  } catch (error) {
    res.status(500).json({ error });
    return;
  }
};

module.exports = {
  getFoodByID,
  getFoodDetailsByID,
  createUserFood,
  updateFood,
  saveUserFood,
};
