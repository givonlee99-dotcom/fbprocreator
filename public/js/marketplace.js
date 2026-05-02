/* =========================
LOAD EBOOK
========================= */

async function loadEbooks() {
  try {
    const res = await fetch("/api/ebooks");
    const data = await res.json();

    const hero = document.getElementById("hero");
    const slider = document.getElementById("sliderTrack");

    if (!data || !data.length) return;

    const ebooks = [...data].reverse();
    const heroBook = ebooks[0];

    /* =========================
    HERO EBOOK
    ========================= */

    if (hero) {
      hero.innerHTML = `

<div class="heroBox">

  <div class="ebook-mockup">

    <div class="book-spine"></div>
    <div class="book-pages"></div>

    <div class="book-cover">
      <img src="/uploads/covers/${heroBook.cover}">
    </div>

  </div>

  <h3>${heroBook.title}</h3>

  <div class="heroButtons">

    <a class="btn" href="/download/${heroBook.id}">
      Download
    </a>

 <button class="btn btnDetail"
onclick="openDetail('${heroBook.id}')">
Detail
</button>

  </div>

</div>

`;
    }

    /* =========================
DETAIL EBOOK PAGE
========================= */

    function openDetail(id) {
      window.location.href = "/ebook/" + id;
    }
    /* =========================
    SLIDER
    ========================= */

    if (slider) {
      const covers = ebooks
        .map(
          (e) => `

<div class="ebook-mockup sliderBook"
onclick="window.location='/download/${e.id}'">

<div class="book-spine"></div>
<div class="book-pages"></div>

<div class="book-cover">
<img src="/uploads/covers/${e.cover}">
</div>

</div>

`,
        )
        .join("");

      slider.innerHTML = covers + covers;
    }
  } catch (err) {
    console.log("Gagal load ebook:", err);
  }
}

loadEbooks();

function openDetail(id) {
  window.location.href = "/ebook/" + id;
}
/* =========================
POPUP TUTORIAL
========================= */

const popup = document.getElementById("popup");
const btnTutorial = document.getElementById("btnTutorial");
const closePopup = document.getElementById("closePopup");

if (btnTutorial && popup) {
  btnTutorial.onclick = () => {
    popup.style.display = "flex";
  };
}

if (closePopup && popup) {
  closePopup.onclick = () => {
    popup.style.display = "none";
  };
}

if (popup) {
  popup.addEventListener("click", (e) => {
    if (e.target === popup) {
      popup.style.display = "none";
    }
  });
}

/* =========================
BLOKIR KLIK KANAN
========================= */

document.addEventListener("contextmenu", function (e) {
  e.preventDefault();
});

/* =========================
PREVIEW POPUP
========================= */

function previewEbook(id) {
  const popup = document.getElementById("previewPopup");
  const frame = document.getElementById("previewFrame");

  if (!popup || !frame) return;

  // reset dulu supaya reload
  frame.src = "";

  setTimeout(() => {
    frame.src = "/flipbook/flipper.html?id=" + id;
  }, 100);

  popup.style.display = "flex";
}

function closePreview() {
  const popup = document.getElementById("previewPopup");
  const frame = document.getElementById("previewFrame");

  if (popup) popup.style.display = "none";

  if (frame) frame.src = "";
}

async function getDownload(id) {
  const res = await fetch("/api/downloads/" + id);

  const data = await res.json();

  return data.total;
}