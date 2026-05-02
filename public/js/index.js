/* =========================
INIT
========================= */

document.addEventListener("DOMContentLoaded", () => {
  loadLatestEbooks();
  initHamburger();
});

document.addEventListener("DOMContentLoaded", () => {
  const popup = document.getElementById("ebookPopup");
  const closeBtn = document.getElementById("closePopup");

  if (closeBtn) {
    closeBtn.addEventListener("click", () => {
      popup.style.display = "none";
    });
  }

  /* klik area gelap menutup popup */

  popup.addEventListener("click", (e) => {
    if (e.target === popup) {
      popup.style.display = "none";
    }
  });
});

/* =========================
LOAD LATEST EBOOK
========================= */

async function loadLatestEbooks() {
  try {
    const res = await fetch("/api/ebooks");
    const data = await res.json();

    const latestBox = document.getElementById("latestEbooks");

    if (!latestBox || !data.length) return;

    const ebooks = [...data].reverse().slice(0, 4);

latestBox.innerHTML = ebooks
  .map(
    (e) => `
<div class="latestCard"
data-id="${e.id}"
data-title="${e.title}"
data-creator="${e.creator}"
data-cover="${e.cover}"
data-tutorial="${e.tutorial}">

<div class="ebook-mockup">

<div class="book-spine"></div>

<div class="book-pages"></div>

<div class="book-cover">
<img src="/uploads/covers/${e.cover}" alt="${e.title}">
</div>

</div>

</div>
`,
  )
  .join("");

    /* PASANG EVENT CLICK SETELAH HTML TERBUAT */

    document.querySelectorAll(".latestCard").forEach((card) => {
      card.addEventListener("click", () => {
        const id = card.dataset.id;
        const title = card.dataset.title;
        const creator = card.dataset.creator;
        const cover = card.dataset.cover;
        const tutorial = card.dataset.tutorial;

        document.getElementById("popupTitle").innerText = title;
        document.getElementById("popupCreator").innerText = creator;

        document.getElementById("popupCover").src = "/uploads/covers/" + cover;

        document.getElementById("popupTutorial").href = tutorial;
        document.getElementById("popupDownload").href = "/download/" + id;

        document.getElementById("ebookPopup").style.display = "flex";
      });
    });
  } catch (err) {
    console.error("Gagal load latest ebooks:", err);
  }
}
document.addEventListener("DOMContentLoaded", () => {
  const hamburger = document.getElementById("hamburger");
  const navMenu = document.getElementById("navMenu");

  if (!hamburger || !navMenu) return;

  hamburger.addEventListener("click", () => {
    hamburger.classList.toggle("active");
    navMenu.classList.toggle("active");
  });
});


// popup
document.addEventListener("DOMContentLoaded", function () {
  const btnTutorial = document.getElementById("btnTutorial");
  const popup = document.getElementById("popup");
  const closeTutorial = document.getElementById("closeTutorial");

  if (btnTutorial) {
    btnTutorial.addEventListener("click", function () {
      popup.style.display = "flex";
    });
  }

  if (closeTutorial) {
    closeTutorial.addEventListener("click", function () {
      popup.style.display = "none";
    });
  }

  window.addEventListener("click", function (e) {
    if (e.target === popup) {
      popup.style.display = "none";
    }
  });
});



const elements = document.querySelectorAll(".reveal");

window.addEventListener("scroll", () => {
  elements.forEach(el => {
    const position = el.getBoundingClientRect().top;
    const windowHeight = window.innerHeight;

    if(position < windowHeight - 100){
      el.classList.add("active");
    }
  });
});