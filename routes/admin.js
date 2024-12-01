require('dotenv').config()
const { Router, json } = require("express");
const adminRouter = Router();
const { adminModel } = require("../db");
const { courseModel } = require("../db");
const bcrypt = require("bcrypt");
const { z } = require("zod");
const jwt = require("jsonwebtoken");
// const { JWT_ADMIN_SECRET } = require("../config");
const JWT_ADMIN_SECRET = process.env.JWT_ADMIN_SECRET
const { adminMiddleware }  = require("../middlewares/admin");

adminRouter.use(json());

adminRouter.post("/signup", async (req, res) => {
  const requirebody = z.object({
    email: z.string().min(6).max(50).email(),
    name: z.string().min(3).max(100),
    password: z.string().min(4).max(40),
  });

  const parseDataWithSuccess = requirebody.safeParse(req.body);

  if (!parseDataWithSuccess.success) {
    res.json({
      message: "Incorrect format",
    });
    return;
  }

  const email = req.body.email;
  const password = req.body.password;
  const name = req.body.name;
  const hashedPassword = await bcrypt.hash(password, 5);

  console.log(hashedPassword);

  await adminModel.create({
    email: email,
    password: hashedPassword,
    name: name,
  });

  res.json({
    message: "Account created suxcessfullie",
  });
});

adminRouter.post("/signin", async (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  const user = await adminModel.findOne({
    email: email,
  });

  console.log(user._id);

  const passwordMatch = await bcrypt.compare(password, user.password);

  if (passwordMatch) {
    const token = jwt.sign(
      {
        id: user._id,
      },
      JWT_ADMIN_SECRET
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

adminRouter.post("/course", adminMiddleware, async (req, res) => {

  const adminId = req.userId;
  const title = req.body.title;
  const discription = req.body.description;
  const price = req.body.price;
  const imageUrl = req.body.imageUrl;

  const course = await courseModel.create({
    title: title,
    discription: discription,
    price: price,
    imageUrl: imageUrl,
    creatorId: adminId,
  });

  res.json({
    message: "course created",
    courseId: course._id
  });
});

adminRouter.put("/course", adminMiddleware, async (req, res) => {
  const adminId = req.userId;
  const title = req.body.title;
  const discription = req.body.description;
  const price = req.body.price;
  const imageUrl = req.body.imageUrl;
  const courseId = req.body.courseId;

  const course = await courseModel.updateOne({
    _id: courseId,
    creatorId: adminId
  },{
    title: title,
    discription: discription,
    price: price,
    imageUrl: imageUrl,
    creatorId: adminId,
  });

  res.json({
    message: "course updated",
    courseId: course._id
  });
});

adminRouter.get("/course/bulk", adminMiddleware, async (req, res) => {

  const adminId = req.userId;
  const courses = await courseModel.find({
    creatorId: adminId
  })
  res.json({
    message: "Course updated",
    courses
  });
});

module.exports = {
  adminRouter: adminRouter,
};
