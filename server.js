const express = require("express");
const fs = require("fs");
const multer = require("multer");
const path = require("path");
const axios = require("axios");

const app = express();
const PORT = process.env.PORT || 3000;
const MAX_UPLOAD = 10;

/* =========================
DATABASE FILE
========================= */

const DATA_FILE = path.join(__dirname, "ebooks.json");
const DOWNLOAD_FILE = path.join(__dirname, "downloads.json");
const MEMBER_FILE = path.join(__dirname, "members.json");
const VIEW_FILE = path.join(__dirname, "views.json");

/* =========================
ANTI SPAM DOWNLOAD
========================= */

const ipLimit = {};

/* =========================
MIDDLEWARE
========================= */

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 🔥 FIXED (lebih aman)
app.use(express.static(path.join(__dirname, "public")));

// upload tetap
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

/* =========================
EBOOK PAGE
========================= */

app.get("/ebook/:id", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "ebook.html"));
});

/* =========================
AUTO CREATE FILES
========================= */

if (!fs.existsSync("uploads/covers"))
  fs.mkdirSync("uploads/covers", { recursive: true });

[DATA_FILE, DOWNLOAD_FILE, MEMBER_FILE, VIEW_FILE].forEach((file) => {
  if (!fs.existsSync(file)) fs.writeFileSync(file, "[]");
});

/* =========================
HELPER
========================= */

const readJSON = (file) => JSON.parse(fs.readFileSync(file));
const writeJSON = (file, data) =>
  fs.writeFileSync(file, JSON.stringify(data, null, 2));

function generateLicense() {
  return (
    "FW-" +
    Date.now().toString().slice(-6) +
    "-" +
    Math.floor(Math.random() * 999999)
  );
}

/* =========================
WHATSAPP
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
UPLOAD
========================= */

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/covers"),
  filename: (req, file, cb) =>
    cb(null, Date.now() + "-" + file.originalname.replace(/\s/g, "_")),
});

const upload = multer({ storage });

/* =========================
ROUTES (tidak diubah)
========================= */

app.post("/daftar-member", async (req, res) => {
  try {
    const { nama, tgl_lahir, email, facebook, instagram, wa } = req.body;

    const license = generateLicense();

    const member = {
      nama,
      tgl_lahir,
      email,
      facebook,
      instagram,
      wa,
      license,
      used: false,
      creator: null,
    };

    const members = readJSON(MEMBER_FILE);
    members.push(member);
    writeJSON(MEMBER_FILE, members);

    await kirimWA(member);

    res.json({ status: "success", license });
  } catch (err) {
    res.status(500).json({ status: "error", message: err.message });
  }
});

/* =========================
(SEMUA ROUTE LAIN TETAP)
========================= */
