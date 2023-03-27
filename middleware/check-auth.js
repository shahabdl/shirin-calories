const jwt = require("jsonwebtoken");
require("dotenv").config();

module.exports = (req, res, next) => {
  if (req.method === "OPTIONS") {
    return next();
  }
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      res.status(401).json({ message: "Authontication Failed!" });
      return;
    }
    jwt.verify(token, process.env.TOKEN_SECRET, (error, decodedToken) => {
      if (error) {
        res.status(401).json({ message: "Authontication Failed!" });
        return;
      }
      req.userData = { userID: decodedToken.userID };
      return next();
    });
    return;
  } catch (error) {
    res.status(500).json({ message: "server error" });
    return;
  }
};
