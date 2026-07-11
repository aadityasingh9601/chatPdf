import express from "express";
import { db } from "./db.js";

const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.get("/user", async (req, res) => {
  const val = await db.user.findMany({});
  res.json({
    data: val,
  });
});

app.listen(3000, () => {
  console.log("Listening on port 3000!");
});
