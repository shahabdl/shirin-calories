const express = require('express');
const router = express.Router();
const { searchIngredientByName, getIngredientsByID } = require('../controllers/controller-ingredient');
const { saveUserFood, createUserFood, getFoodByID, getFoodDetailsByID, updateFood } = require('../controllers/controller-food');
const checkAuth = require('../middleware/check-auth');
const { uploadImage } = require('../controllers/upload-controller');
const multer = require('multer');
const { RandomAvatar } = require('../utils/random-avatar-gen');



const errorLog = (req, res, next) => {
    res.status(500).json(next);
}
router.use(checkAuth);

router.route('/ingredients').get(searchIngredientByName, getIngredientsByID)

router.route('/foods/save').put(saveUserFood);
router.route('/foods/update').put(updateFood);
router.route('/foods/:id/details').get(getFoodDetailsByID);
router.route('/foods/:id').get(getFoodByID);

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'upload/food-images')
    },
    filename: (req, file, cb) => {
        const usuffix = req.userData.userID + '-' + req.body.foodName + '-' + req.body.foodID;
        cb(null, file.fieldname + '-' + usuffix)
    }
})

const upload = multer({ storage: storage });

router.route('/image/upload').post(upload.single('foodImage'), uploadImage);
router.use(errorLog);
module.exports = router;