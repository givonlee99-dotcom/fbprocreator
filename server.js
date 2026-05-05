/* =========================
INIT
========================= */

const express = require("express");
const fs = require("fs");
const multer = require("multer");
const path = require("path");
const axios = require("axios");

const app = express();
const PORT = process.env.PORT || 3000;
const MAX_UPLOAD = 10;

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

app.use(express.static(path.join(__dirname, "public")));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

/* =========================
AUTO CREATE FILES & FOLDER
========================= */

try {
  fs.mkdirSync(path.join(__dirname, "uploads", "covers"), { recursive: true });

  [DATA_FILE, DOWNLOAD_FILE, MEMBER_FILE, VIEW_FILE].forEach((file) => {
    if (!fs.existsSync(file)) {
      fs.writeFileSync(file, "[]");
    }
  });
} catch (err) {
  console.error("Error init file:", err);
}

/* =========================
HELPER (ANTI CRASH)
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

function generateLicense() {
  return (
    "FW-" +
    Date.now().toString().slice(-6) +
    "-" +
    Math.floor(Math.random() * 999999)
  );
}

/* =========================
WHATSAPP (SAFE)
========================= */

async function kirimWA(data) {
  try {
    await axios.post("https://api.callmebot.com/whatsapp.php", {
      phone: "6282354730849",
      text: `Creator: ${data.nama} (${data.email})`,
      apikey: "APIKEYANDA",
    });
  } catch (err) {
    console.log("WA gagal:", err.message);
  }
}

/* =========================
UPLOAD CONFIG (SAFE)
========================= */

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "uploads", "covers"));
  },
  filename: (req, file, cb) => {
    const safeName = file.originalname.replace(/\s/g, "_");
    cb(null, Date.now() + "-" + safeName);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // max 5MB
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
      cover: req.file ? req.file.filename : "",
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
