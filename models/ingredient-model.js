const mongoose = require('mongoose');

const IngredientSchema = new mongoose.Schema({
    name:{
        type:String,
        required:[true, 'Ingredients need name!'],
        maxlength:[30, 'Ingredient name should be less than 30 chars!'],
    },
    types:{
        type:Object,
        required:[true,'enter food data here']
    },
    foodImage:{
        type:String,
        required:[false],
    },
    author:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User"
    }
});

module.exports = mongoose.model('ingredients', IngredientSchema);
