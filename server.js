import express from "express";
import connectDB from "./src/connectDB/connectDB.js";
import multer from "multer";
import { v2 as cloudinary } from "cloudinary";

import path from "path";
import mongoose from "mongoose";

const app = express();

cloudinary.config({
  cloud_name: "djcw19c8a",
  api_key: "395725942725978",
  api_secret: "Uo_wwvaalGyLNmI0-e-7Zl3KcAE",
});

connectDB();

const port = 3000;

// redering ejs file

app.get("/", (req, res) => {
  res.render("index.ejs", { url: null });
});

const storage = multer.diskStorage({
  destination: "./public/uploads",
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + path.extname(file.originalname);
    cb(null, file.fieldname + "-" + uniqueSuffix);
  },
});

const upload = multer({ storage: storage });

const imageSchema = new mongoose.Schema({
  filename: String,
  public_id: String,
  imageUrl: String,
});

const File = mongoose.model("cloudinary", imageSchema);

app.post("/upload", upload.single("file"), async (req, res) => {
  const file = req.file.path;
  const cloudinarRes = await cloudinary.uploader.upload(file, {
    folder: "PROJECT2",
  });

  //save to database
  const db = await File.create({
    filename: file.originalname,
    public_id: cloudinarRes.public_id,
    imageUrl: cloudinarRes.secure_url,
  });

  res.render("index.ejs", { url: cloudinarRes.secure_url });
  /* res.json({
    message: "file uploaded successfully",
    cloudinarRes,
  }); */
});

app.listen(port, () => console.log(`your server is running on port ${port}`));
