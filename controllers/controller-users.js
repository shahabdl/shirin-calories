const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const User = require("../models/user-model");
const { RandomAvatar } = require("../utils/random-avatar-gen");

require("dotenv").config();


//this function validate user Token and send user data with a new token to client
const validateToken = async (req, res, next) => {
  if (req.method === "OPTIONS") {
    return next();
  }
  let decodedToken;
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      res.status(400).json({ error: "Authontication Failed!" });
      return res.status(401).json({ error: "Token is not provided" });
    }
    decodedToken = jwt.verify(
      token,
      process.env.TOKEN_SECRET,
      (error, decodedToken) => {
        if (error) {
          res.status(401).json({ error: "Authontication Failed!" });
          console.log(error);
          return;
        }
        return decodedToken;
      }
    );
  } catch (error) {
    res.status(500).json({
      message: "cannot retrive data from server! please try again later.",
    });
  }
  if (!decodedToken.userID) {
    res.status(404).json({ error: "User ID is not provided!" })
  }
  req.userData = { userID: decodedToken.userID };

  let identifiedUser;
  try {
    identifiedUser = await User.findById(decodedToken.userID);
  } catch (error) {
    res.status(500).json({ error: "Cannot find this user!" });
    return next(error);
  }

  let newToken;
  try {
    newToken = jwt.sign(
      { userID: identifiedUser._id, email: identifiedUser.email },
      process.env.TOKEN_SECRET,
      { expiresIn: "10d" }
    );
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "server error!" });
    return;
  }

  res.status(200).json({
    userID: identifiedUser._id,
    email: identifiedUser.email,
    userName: identifiedUser.name,
    avatar: identifiedUser.avatar,
    token: newToken,
  });
  return;
};

/** SIGN UP */
const signup = async (req, res, next) => {
  const { name, email, password, image } = req.body;
  console.log(name, email, password, image);
  let avatarImage;
  let existingUser;
  try {
    existingUser = await User.findOne({ email: email });
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ message: "Signing up failed, please try again later." });
    return;
  }

  if (existingUser) {
    res.status(422).json({ error: "User exists already!" });
    return;
  }

  let hashedPassword;
  try {
    hashedPassword = await bcrypt.hash(password, 12);
  } catch (error) {
    res.status(500).json({ error: "server error" });
    console.log(error);
  }

  if (!image || image === "random") {
    avatarImage = RandomAvatar(width = 40, height = 40, pixelCount = 32, border = false, borderSize = 2.5, grid = 8);
    avatarType = "svg"
  }else{
    avatarImage = image,
    avatarType = "image"
  }
  let avatar = {
    image: avatarImage,
    type: avatarType
  }
  const createdUser = {
    name,
    email,
    password: hashedPassword,
    avatar,
  };

  let newUser;
  try {
    newUser = await User.create(createdUser);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "server error!" });
    return;
  }

  let token;
  try {
    token = jwt.sign(
      { userID: newUser._id, email: newUser.email },
      process.env.TOKEN_SECRET,
      { expiresIn: "10d" }
    );
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "server error!" });
    return;
  }

  res.status(201).json({
    userID: newUser.id,
    email: newUser.email,
    userName: newUser.name,
    avatar: newUser.avatar,
    token: token,
  });
};

// LOGIN
const login = async (req, res, next) => {
  const { email, password } = req.body;

  const identifiedUser = await User.findOne({ email: email });
  if (!identifiedUser) {
    res.status(401).json({ error: "user does not exists" });
    return;
  }

  let isValidPassword = false;
  try {
    isValidPassword = await bcrypt.compare(password, identifiedUser.password);
  } catch (error) {
    res
      .status(500)
      .json({ error: "somthing went wrong! Please try again later." });
    console.log(error);
    return;
  }

  if (!isValidPassword) {
    res.status(401).json({ error: "password is wrong!" });
    return;
  }

  let token;
  try {
    token = jwt.sign(
      { userID: identifiedUser._id, email: identifiedUser.email },
      process.env.TOKEN_SECRET,
      { expiresIn: "10d" }
    );
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "server error!" });
    return;
  }

  res.status(201).json({
    userID: identifiedUser.id,
    email: identifiedUser.email,
    userName: identifiedUser.name,
    avatar: identifiedUser.avatar,
    token: token,
  });
};

const getUserFoods = async (req, res, next) => {
  try {
    const uuid = req.userData.userID;
    if (uuid) {
      let userFoods = await userModel.findById(uuid).select("userFoods -_id");

      //check to see if user wants to populate ingredients too or not
      if (
        req.body.hasOwnProperty("popingred") &&
        req.body.popingred === "true"
      ) {
        userFoods = await userFoods.populate("userFoods");
        userFoods = await userFoods.populate(
          "userFoods.ingredients.ingredientObj"
        );
        userFoods = await userFoods.populate("userFoods.foods.foodObj");
      } else {
        userFoods = await userFoods.populate({
          path: "userFoods",
        });
      }

      res.status(200).json(userFoods);
    } else {
      res.status(404).json({ error: "cannot find user" });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json(error);
  }
  return;
};

exports.validateToken = validateToken;
exports.signup = signup;
exports.login = login;
exports.getUserFoods = getUserFoods;
