/* =========================
INIT
========================= */

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("uploadForm");
  if (!form) return;

  form.addEventListener("submit", handleUpload);
});

/* =========================
HANDLE UPLOAD
========================= */

async function handleUpload(e) {
  e.preventDefault();

  const form = e.target;
  const formData = new FormData(form);
  const submitBtn = form.querySelector("button[type='submit']");

  /* =========================
  VALIDASI
  ========================= */

  const title = formData.get("title");
  const download = formData.get("download");
  const license = formData.get("license");
  const cover = formData.get("cover");

  if (!title || !download || !license) {
    alert("Semua field wajib diisi!");
    return;
  }

  if (!cover || cover.size === 0) {
    alert("Cover wajib diupload!");
    return;
  }

  // 🔥 VALIDASI FILE TYPE
  if (!cover.type.startsWith("image/")) {
    alert("File harus berupa gambar!");
    return;
  }

  // 🔥 VALIDASI SIZE
  if (cover.size > 5 * 1024 * 1024) {
    alert("Ukuran max 5MB");
    return;
  }

  try {
    // 🔥 disable tombol setelah validasi lolos
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.innerText = "Uploading...";
    }

    /* =========================
    REQUEST
    ========================= */

    const res = await fetch("/upload-ebook", {
      method: "POST",
      body: formData,
    });

    const data = await res.json();

    /* =========================
    RESPONSE
    ========================= */

    if (data.success) {
      alert("✅ Upload berhasil!");

      form.reset();

      // delay biar user lihat notif
      setTimeout(() => {
        window.location.href = "/";
      }, 500);

    } else {
      alert("❌ " + (data.message || "Upload gagal"));
    }

  } catch (err) {
    console.error(err);
    alert("Terjadi kesalahan saat upload");
  } finally {
    // aktifkan tombol lagi
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.innerText = "Upload Ebook";
    }
  }
}
