require('dotenv').config()
const { Router, json } = require("express");
const { userModel, purchaseModel } = require("../db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
// const { JWT_USER_SECRET } = require("../config");
const JWT_USER_SECRET = process.env.JWT_USER_SECRET;
const { userMiddleware } = require("../middlewares/user");
const userRouter = Router();

userRouter.use(json());

userRouter.post("/signup", async (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const firstName = req.body.firstName;
  const lastName = req.body.lastName;

  const hashedPassword = await bcrypt.hash(password, 5);

  await userModel.create({
    email: email,
    password: hashedPassword,
    firstName: firstName,
    lastName: lastName,
  });

  res.json({
    message: "account created suxcessfullie",
  });
});

userRouter.post("/signin", async (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  const user = await userModel.findOne({
    email,
  });

  const passwordMatch = bcrypt.compare(password, user.password);

  if (passwordMatch) {
    const token = jwt.sign(
      {
        id: user._id,
      },
      JWT_USER_SECRET
    );
    res.json({
      token,
    });
  } else {
    res.status(403).json({
      message: "Incorrect credentials",
    });
  }
});

userRouter.get("/purchases", userMiddleware, async (req, res) => {
  const userId = req.userId;
  const purchases = await purchaseModel.find({
    userId
  })

  res.json({
    purchases
  })
});

module.exports = {
  userRouter: userRouter,
};
