require('dotenv').config()
// console.log(process.env)
const express = require("express");
const { userRouter } = require("./routes/user")
const { courseRouter } = require("./routes/course")
const { adminRouter } = require("./routes/admin")
const app = express();
const mongoose = require("mongoose")

app.use("/user", userRouter);
app.use("/course", courseRouter);
app.use("/admin", adminRouter); 


async function main() {
  mongoose.connect(process.env.MONGO_URL)
  app.listen(3001);
}

main()



