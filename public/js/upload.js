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

  try {
    // 🔥 disable tombol biar tidak double submit
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.innerText = "Uploading...";
    }

    /* =========================
    VALIDASI DASAR
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

      // reset form
      form.reset();

      // redirect ke home
      window.location.href = "/";
    } else {
      alert("❌ " + data.message);
    }

  } catch (err) {
    console.error(err);
    alert("Terjadi kesalahan saat upload");
  } finally {
    // aktifkan tombol lagi
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.innerText = "Upload";
    }
  }
}
