document.addEventListener("DOMContentLoaded", () => {
  const currentPath = window.location.pathname;

  document.querySelectorAll(".nav-item a.nav-link").forEach((link) => {
    const href = link.getAttribute("href");
    if (currentPath === href || currentPath.startsWith(href)) {
      // Tambahkan class 'active' ke li.nav-item
      link.closest(".nav-item")?.classList.add("active");
    } else {
      // Hilangkan class active jika bukan halaman aktif
      link.closest(".nav-item")?.classList.remove("active");
    }
  });
});
