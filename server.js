const express = require("express");
const fs = require("fs");
const multer = require("multer");
const path = require("path");
const axios = require("axios");

const app = express();
const PORT = 3000;
const MAX_UPLOAD = 10;
/* =========================
DATABASE FILE
========================= */

const DATA_FILE = path.join(__dirname, "ebooks.json");
const DOWNLOAD_FILE = path.join(__dirname, "downloads.json");
const MEMBER_FILE = path.join(__dirname, "members.json");

/* =========================
MIDDLEWARE
========================= */

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));
app.use("/uploads", express.static("uploads"));

/* =========================
AUTO CREATE FILES
========================= */

if (!fs.existsSync("uploads/covers"))
  fs.mkdirSync("uploads/covers", { recursive: true });

[DATA_FILE, DOWNLOAD_FILE, MEMBER_FILE].forEach((file) => {
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

async function kirimWA(data) {
  const pesan = `*PENDAFTARAN CREATOR BARU*

Nama : ${data.nama}
Email : ${data.email}
Instagram : ${data.instagram}
WA : ${data.wa}

Lisensi:
${data.license}`;

  try {
    await axios.post("https://api.callmebot.com/whatsapp.php", {
      phone: "6282354730849",
      text: pesan,
      apikey: "APIKEYANDA",
    });
  } catch (err) {
    console.log("WA gagal:", err.message);
  }
}

/* =========================
MULTER UPLOAD
========================= */

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/covers");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname.replace(/\s/g, "_"));
  },
});

const upload = multer({ storage });

/* =========================
REGISTER MEMBER
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
UPLOAD EBOOK
========================= */

app.post("/upload-ebook", upload.single("cover"), (req, res) => {
  try {

    const title = (req.body.title || "").trim();
    const tutorial = (req.body.tutorial || "").trim();
    const download = (req.body.download || "").trim();
    const license = (req.body.license || "").trim();

    if (!license) {
      return res.json({
        success: false,
        message: "Kode lisensi wajib diisi",
      });
    }

    /* VALIDASI LINKVERTISE */

    const validDomains = [
      "direct-link.net",
      "link-target.net",
      "link-center.net",
      "linkvertise.com",
      "link-hub.net",
    ];

    if (!validDomains.some((domain) => download.includes(domain))) {
      return res.json({
        success: false,
        message: "Gunakan link affiliate Linkvertise yang benar",
      });
    }

    /* VALIDASI LISENSI */

    const members = readJSON(MEMBER_FILE);

    const member = members.find(
      (m) => m.license.trim() === license
    );

    if (!member) {
      return res.json({
        success: false,
        message: "Kode lisensi tidak valid",
      });
    }

    /* ambil nama creator dari database */

    const creator = member.nama;

    /* cek apakah lisensi sudah dipakai */

    if (member.used === true && member.creator !== creator) {
      return res.json({
        success: false,
        message: "Lisensi sudah digunakan oleh creator lain",
      });
    }

    /* LIMIT UPLOAD PER LISENSI */

    const ebooks = readJSON(DATA_FILE);

    const jumlahUpload = ebooks.filter((e) => e.creator === creator).length;

    if (jumlahUpload >= MAX_UPLOAD) {
      return res.json({
        success: false,
        message: "Batas upload lisensi sudah tercapai",
      });
    }

    /* VALIDASI COVER */

    if (!req.file) {
      return res.json({
        success: false,
        message: "Cover belum dipilih",
      });
    }

    const cover = req.file.filename;

    const ebook = {
      id: Date.now(),
      creator,
      title,
      tutorial,
      download,
      cover,
      date: new Date(),
    };

    ebooks.push(ebook);

    writeJSON(DATA_FILE, ebooks);

    member.used = true;
    member.creator = creator;

    writeJSON(MEMBER_FILE, members);

    res.json({
      success: true,
      message: "Upload berhasil",
    });

  } catch (err) {
    console.log(err);

    res.json({
      success: false,
      message: "Upload gagal",
    });
  }
});

/* =========================
LIST EBOOK
========================= */

app.get("/api/ebooks", (req, res) => {
  res.json(readJSON(DATA_FILE));
});

app.get("/api/ebooks/:id", (req, res) => {
  const ebook = readJSON(DATA_FILE).find((e) => e.id === Number(req.params.id));

  if (!ebook) return res.status(404).json({ error: "Ebook tidak ditemukan" });

  res.json(ebook);
});

/* =========================
DOWNLOAD TRACKER
========================= */

app.get("/download/:id", (req, res) => {
  const id = Number(req.params.id);

  const ebooks = readJSON(DATA_FILE);

  const ebook = ebooks.find((e) => e.id === id);

  if (!ebook) return res.status(404).send("Ebook tidak ditemukan");

  const downloads = readJSON(DOWNLOAD_FILE);

  downloads.push({
    id,
    time: Date.now(),
  });

  writeJSON(DOWNLOAD_FILE, downloads);

  res.redirect(ebook.download);
});

/* =========================
DELETE EBOOK
========================= */

app.delete("/delete-ebook/:id", (req, res) => {
  const id = Number(req.params.id);

  let ebooks = readJSON(DATA_FILE);

  const ebook = ebooks.find((e) => e.id === id);

  if (!ebook) {
    return res.status(404).json({ success: false });
  }

  try {
    if (ebook.cover) {
      fs.unlinkSync("uploads/covers/" + ebook.cover);
    }
  } catch (err) {
    console.log("Gagal hapus cover");
  }

  ebooks = ebooks.filter((e) => e.id !== id);

  writeJSON(DATA_FILE, ebooks);

  res.json({
    success: true,
    message: "Ebook berhasil dihapus",
  });
});

/* =========================
DOWNLOAD COUNT
========================= */

app.get("/api/download-count", (req, res) => {
  res.json({
    total: readJSON(DOWNLOAD_FILE).length,
  });
});

/* =========================
TOP EBOOK RANKING
========================= */

app.get("/api/top-ebooks",(req,res)=>{

const ebooks = readJSON(DATA_FILE)

const downloads = readJSON(DOWNLOAD_FILE)

const ranking = ebooks.map(e=>{

const total = downloads.filter(d=>d.id===e.id).length

return {...e,total}

})

ranking.sort((a,b)=>b.total-a.total)

res.json(ranking.slice(0,5))

})

/* =========================
SERVER
========================= */

app.listen(PORT, () => {
  console.log("Server running http://localhost:" + PORT);
});



app.get("/ebook/:id", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "ebook.html"));
});




app.get("/api/creator/:name", (req, res) => {
  const ebooks = readJSON(DATA_FILE);

  const list = ebooks.filter(
    (e) => e.creator.toLowerCase() === req.params.name.toLowerCase(),
  );

  res.json(list);
});


app.get("/api/downloads/:id", (req, res) => {
  const id = Number(req.params.id);

  const downloads = readJSON(DOWNLOAD_FILE);

  const total = downloads.filter((d) => d.id === id).length;

  res.json({ total });
});


