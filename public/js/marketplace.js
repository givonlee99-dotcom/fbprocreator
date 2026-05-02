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

  <p class="creator">
  Creator :
  <a href="/creator.html?name=${heroBook.creator}">
  ${heroBook.creator}
  </a>
  </p>

  <div class="heroButtons">

    <a class="btn" href="/download/${heroBook.id}">
      Download
    </a>



  </div>

</div>

`;
    }

    /* =========================
    SLIDER
    ========================= */

    if (slider) {
      const covers = ebooks
        .map(
          (e) => `

<div class="sliderItem">

<div class="ebook-mockup sliderBook"
onclick="window.location='/download/${e.id}'">

<div class="book-spine"></div>
<div class="book-pages"></div>

<div class="book-cover">
<img src="/uploads/covers/${e.cover}">
</div>

</div>

<p class="creator">
<a href="/creator.html?name=${e.creator}">
${e.creator}
</a>
</p>

</div>

`
        )
        .join("");

      slider.innerHTML = covers + covers;
    }

  } catch (err) {
    console.log("Gagal load ebook:", err);
  }
}

loadEbooks();

/* =========================
DETAIL PAGE
========================= */

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

/* =========================
DOWNLOAD COUNT
========================= */

async function getDownload(id) {
  const res = await fetch("/api/downloads/" + id);
  const data = await res.json();
  return data.total;
}