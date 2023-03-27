const { default: mongoose } = require("mongoose");
const ingredientModel = require("../models/ingredient-model");
const foodModel = require("../models/food-model");

async function calculateNutritions(ingredients, foods, totalWeight) {
    let nutrition =
    {
        calories: "-",
        macros: {
            carbs: {
                total: "-",
                fiber: "-",
                sugar: "-",
            },
            fats: {
                total: "-",
                saturated: "-",
                cholesterol: "-",
            },
            proteins: "-"
        },
        micros: {
            iron: "-",
            calcium: "-",
            potassium: "-",
            sodium: "-",
            omega3: "-"
        },
        vitamins: {
            a: "-",
            c: "-",
            d: "-",
            e: "-",
            k: "-",
            b1: "-",
            b2: "-",
            b5: "-",
            b6: "-",
            b12: "-"
        }
    }
    let ingredientsWeight = 0;

    const getUnitRatioToGrams = (unit) => {
        switch (unit) {
            case "oz":
                return 28.3495;
            case "lb":
                return 453.592;
            default:
                return 1;
        }

    }

    try {
        for (const ingredientItem of ingredients) {
            if (ingredientItem.ingredientObj) {
                const ingredID = ingredientItem.ingredientObj;
                let ingredient;
                if (mongoose.isValidObjectId(ingredID)) {
                    ingredient = await ingredientModel
                        .findById(ingredID)
                        .select(`types.${ingredientItem.ingredientType} name -_id`);

                    //converting unit to g
                    let unitRatio = getUnitRatioToGrams(ingredientItem.ingredientUnit)

                    //Sum ingredients and foods weight to check if user input weight is greater than raw ingredients weight
                    ingredientsWeight += parseFloat(ingredientItem.ingredientWeight) * unitRatio;
                    let food = ingredient.types[ingredientItem.ingredientType];
                    nutrition = objectSum(nutrition, food, ingredientItem.ingredientWeight * unitRatio / 100);

                } else {
                    throw new Error("Food Id is not valid");
                }
            }
        }

        for (const foodItem of foods) {
            const foodID = foodItem.foodObj;
            let food;
            if (mongoose.isValidObjectId(foodID)) {

                food = await foodModel.findById(foodID).select("-_id");

                //converting unit to g
                let unitRatio = getUnitRatioToGrams(foodItem.foodUnit);

                //Sum ingredients and foods weight to check if user input weight is greater than raw ingredients weight
                ingredientsWeight += parseFloat(foodItem.foodWeight) * unitRatio;
                let foodData = food.types[foodItem.foodType];
                nutrition = objectSum(nutrition, foodData, foodItem.foodWeight * unitRatio / 100);
            }
        }

        if (ingredientsWeight > totalWeight) {
            throw new Error("food weight cannot be less than ingredients weight!");
        }

        nutrition = objectMulti(nutrition, 100 / totalWeight);

        return { ...nutrition };
    } catch (error) {
        console.log(error);
        return { error: error.message };
    }
}

const objectSum = (a, b, weight) => {
    let result = {};
    try {
        for (let item in a) {
            if (typeof (a[item]) !== "object") {
                if (isNaN(a[item]) && !isNaN(b[item])) {
                    result[item] = parseFloat(b[item]) * weight;
                } else if (!isNaN(a[item]) && isNaN(b[item])) {
                    result[item] = parseFloat(a[item]);
                } else {
                    result[item] = parseFloat(a[item]) + parseFloat(b[item]) * weight;
                }
            } else if (typeof (a[item]) === "object") {
                result[item] = objectSum(a[item] ? a[item] : "-", b[item] ? b[item] : "-", weight);
            }
        }
    } catch (error) {
        console.log(error);
    }

    return result;
}

const objectMulti = (a, b) => {
    let result = {};
    try {
        for (let item in a) {
            if (typeof (a[item]) !== "object") {
                if (isNaN(a[item])) {
                    result[item] = "-";
                } else {
                    result[item] = parseFloat(a[item]) * parseFloat(b);
                }
            } else {
                result[item] = objectMulti(a[item], b);
            }
        }
        return result;
    } catch (error) {
        return error;
    }
}

const objectRound = (inputObject) => {
    let result = {};
    for (let item in inputObject) {
        if (typeof (inputObject[item]) !== "object") {
            if (isNaN(inputObject[item])) {
                result[item] = "-";
            } else {
                result[item] = Math.round((inputObject[item] + Number.EPSILON) * 100) / 100;
            }
        } else if (typeof (inputObject[item]) === "object") {
            result[item] = objectRound(inputObject[item]);
        }
    }
    return result;
}

module.exports = { objectRound, objectSum, calculateNutritions };