/* =========================
INIT
========================= */

document.addEventListener("DOMContentLoaded", () => {
  loadLatestEbooks();
  initHamburger();
  initPopup();
  initTutorialPopup();
  initScrollReveal();
});

/* =========================
CONFIG IMAGE SOURCE (FIX CLOUDINARY)
========================= */

function getImagePath(file) {
  if (!file) return "/images/brand.png"; // fallback

  // 🔥 kalau dari Cloudinary (URL langsung)
  if (typeof file === "string" && file.startsWith("http")) {
    return file;
  }

  // 🔥 kalau dari upload lama (lokal)
  return `/uploads/covers/${file}`;
}

/* =========================
LOAD LATEST EBOOK
========================= */

async function loadLatestEbooks() {
  try {
    const res = await fetch("/api/ebooks");
    const data = await res.json();

    const latestBox = document.getElementById("latestEbooks");

    if (!latestBox) return;

    // 🔥 kalau kosong kasih info
    if (!data || !data.length) {
      latestBox.innerHTML = `<p style="opacity:.7">Belum ada ebook</p>`;
      return;
    }

    const ebooks = [...data].reverse().slice(0, 4);

    latestBox.innerHTML = ebooks.map((e) => `
      <div class="latestCard"
        data-id="${e.id || ""}"
        data-title="${e.title || "Tanpa Judul"}"
        data-creator="${e.creator || "Unknown"}"
        data-cover="${e.cover || ""}"
        data-tutorial="${e.tutorial || ""}">

        <div class="ebook-mockup">
          <div class="book-spine"></div>
          <div class="book-pages"></div>

          <div class="book-cover">
            <img 
              src="${getImagePath(e.cover)}" 
              alt="${e.title}"
              loading="lazy"
              onerror="this.src='/images/default.png'"
            >
          </div>
        </div>

      </div>
    `).join("");

    /* =========================
    EVENT CLICK CARD
    ========================= */

    document.querySelectorAll(".latestCard").forEach((card) => {
      card.addEventListener("click", () => {
        const id = card.dataset.id;
        const title = card.dataset.title;
        const creator = card.dataset.creator;
        const cover = card.dataset.cover;
        const tutorial = card.dataset.tutorial;

        // 🔥 isi popup
        document.getElementById("popupTitle").innerText = title;
        document.getElementById("popupCreator").innerText = creator;

        const popupCover = document.getElementById("popupCover");
        popupCover.src = getImagePath(cover);
        popupCover.onerror = () => {
          popupCover.src = "/images/default.png";
        };

        // 🔥 tutorial safe
        const tutorialBtn = document.getElementById("popupTutorial");
        if (tutorial) {
          tutorialBtn.href = tutorial;
          tutorialBtn.style.display = "inline-block";
        } else {
          tutorialBtn.style.display = "none";
        }

        // 🔥 download
        document.getElementById("popupDownload").href = "/download/" + id;

        // 🔥 show popup
        document.getElementById("ebookPopup").style.display = "flex";
      });
    });

  } catch (err) {
    console.error("❌ Gagal load latest ebooks:", err);

    const latestBox = document.getElementById("latestEbooks");
    if (latestBox) {
      latestBox.innerHTML = `<p style="color:red">Gagal load data</p>`;
    }
  }
}

/* =========================
POPUP EBOOK
========================= */

function initPopup() {
  const popup = document.getElementById("ebookPopup");
  const closeBtn = document.getElementById("closePopup");

  if (!popup) return;

  if (closeBtn) {
    closeBtn.addEventListener("click", () => {
      popup.style.display = "none";
    });
  }

  popup.addEventListener("click", (e) => {
    if (e.target === popup) {
      popup.style.display = "none";
    }
  });
}

/* =========================
HAMBURGER MENU
========================= */

function initHamburger() {
  const hamburger = document.getElementById("hamburger");
  const navMenu = document.getElementById("navMenu");

  if (!hamburger || !navMenu) return;

  hamburger.addEventListener("click", () => {
    hamburger.classList.toggle("active");
    navMenu.classList.toggle("active");
  });
}

/* =========================
TUTORIAL POPUP
========================= */

function initTutorialPopup() {
  const popup = document.getElementById("popup");
  const closeTutorial = document.getElementById("closeTutorial");

  if (!popup) return;

  if (closeTutorial) {
    closeTutorial.addEventListener("click", () => {
      popup.style.display = "none";
    });
  }

  window.addEventListener("click", (e) => {
    if (e.target === popup) {
      popup.style.display = "none";
    }
  });
}

/* =========================
SCROLL REVEAL
========================= */

function initScrollReveal() {
  const elements = document.querySelectorAll(".reveal");

  window.addEventListener("scroll", () => {
    elements.forEach(el => {
      const position = el.getBoundingClientRect().top;
      const windowHeight = window.innerHeight;

      if (position < windowHeight - 100) {
        el.classList.add("active");
      }
    });
  });
}
