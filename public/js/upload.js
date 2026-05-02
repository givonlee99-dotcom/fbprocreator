window.addEventListener("DOMContentLoaded", () => {
  document
    .getElementById("uploadForm")
    .addEventListener("submit", function (e) {
      e.preventDefault();

      const formData = new FormData(this);

      fetch("/upload-ebook", {
        method: "POST",
        body: formData,
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.success) {
            alert("Upload berhasil");

            window.location.href = "/";
          } else {
            alert(data.message);
          }
        });
    });
});
