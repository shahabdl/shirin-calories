const express = require("express");
const checkAuth = require('../middleware/check-auth')
const usersController = require('../controllers/controller-users')

const usersRouter = express.Router();

usersRouter.get('/',usersController.validateToken);


usersRouter.post('/signup',usersController.signup);
usersRouter.post('/login',usersController.login);

usersRouter.use(checkAuth);

usersRouter.get('/foods',usersController.getUserFoods);

module.exports = usersRouter;