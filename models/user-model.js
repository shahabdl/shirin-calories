const mongoose = require('mongoose')
const uniqueValidator = require('mongoose-unique-validator');

const Schema = mongoose.Schema;

const userSchema = new Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true, minlength: 6 },
    avatar: {
        image: {
            type: String,
            required: true
        },
        type: {
            type: String,
            required: true
        }
    },
    userFoods: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'food'
    }]
});

userSchema.plugin(uniqueValidator);
module.exports = mongoose.model('User', userSchema);