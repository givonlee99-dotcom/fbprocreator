/* =========================
INIT
========================= */

const express = require("express");
const fs = require("fs");
const multer = require("multer");
const path = require("path");
const axios = require("axios");

// 🔥 CLOUDINARY
const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");

const app = express();
const PORT = process.env.PORT || 3000;

/* =========================
ANTI CRASH GLOBAL
========================= */

process.on("uncaughtException", (err) => {
  console.error("🔥 UNCAUGHT ERROR:", err);
});

process.on("unhandledRejection", (err) => {
  console.error("🔥 PROMISE ERROR:", err);
});

/* =========================
CLOUDINARY CONFIG (FIXED)
========================= */

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME || "dvf8uk5tr",
  api_key: process.env.API_KEY || "275948988485589",
  api_secret: process.env.API_SECRET || "ISI_API_SECRET_KAMU",
});

/* =========================
DATABASE FILE
========================= */

const DATA_FILE = path.join(__dirname, "ebooks.json");
const DOWNLOAD_FILE = path.join(__dirname, "downloads.json");
const MEMBER_FILE = path.join(__dirname, "members.json");
const VIEW_FILE = path.join(__dirname, "views.json");

/* =========================
MIDDLEWARE
========================= */

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// static public
app.use(express.static(path.join(__dirname, "public")));

/* =========================
AUTO CREATE FILES
========================= */

try {
  [DATA_FILE, DOWNLOAD_FILE, MEMBER_FILE, VIEW_FILE].forEach((file) => {
    if (!fs.existsSync(file)) {
      fs.writeFileSync(file, "[]");
    }
  });
} catch (err) {
  console.error("Error init file:", err);
}

/* =========================
HELPER
========================= */

const readJSON = (file) => {
  try {
    if (!fs.existsSync(file)) return [];
    const data = fs.readFileSync(file, "utf-8");
    return data ? JSON.parse(data) : [];
  } catch (err) {
    console.error("❌ Error baca JSON:", file);
    return [];
  }
};

const writeJSON = (file, data) => {
  try {
    fs.writeFileSync(file, JSON.stringify(data, null, 2));
  } catch (err) {
    console.error("❌ Error write JSON:", file);
  }
};

/* =========================
UPLOAD CLOUDINARY
========================= */

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => ({
    folder: "ebook-covers",
    allowed_formats: ["jpg", "png", "jpeg"],
    public_id: Date.now() + "-" + file.originalname.replace(/\s/g, "_"),
  }),
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
});

/* =========================
ROUTES
========================= */

app.get("/ebook/:id", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "ebook.html"));
});

/* =========================
API EBOOKS
========================= */

app.get("/api/ebooks", (req, res) => {
  const data = readJSON(DATA_FILE);
  res.json(data);
});

/* =========================
UPLOAD EBOOK
========================= */

app.post("/upload-ebook", upload.single("cover"), (req, res) => {
  try {
    const { license, creator, title, tutorial, download } = req.body;

    if (!license || !title || !download) {
      return res.json({ success: false, message: "Data tidak lengkap" });
    }

    const ebooks = readJSON(DATA_FILE);

    const newBook = {
      id: Date.now(),
      creator: creator || "Unknown",
      title,
      tutorial,
      download,
      cover: req.file ? req.file.path : "", // 🔥 URL Cloudinary
      date: new Date(),
    };

    ebooks.push(newBook);
    writeJSON(DATA_FILE, ebooks);

    res.json({ success: true });
  } catch (err) {
    console.error("UPLOAD ERROR:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

/* =========================
DOWNLOAD TRACKING
========================= */

app.get("/download/:id", (req, res) => {
  try {
    const id = Number(req.params.id);
    const ebooks = readJSON(DATA_FILE);
    const book = ebooks.find((e) => e.id === id);

    if (!book) return res.send("Ebook tidak ditemukan");

    const downloads = readJSON(DOWNLOAD_FILE);
    downloads.push({ id, time: Date.now() });
    writeJSON(DOWNLOAD_FILE, downloads);

    res.redirect(book.download);
  } catch (err) {
    console.error("DOWNLOAD ERROR:", err);
    res.send("Terjadi error");
  }
});

/* =========================
SERVER START
========================= */

app.listen(PORT, () => {
  console.log("🚀 Server jalan di port", PORT);
});
