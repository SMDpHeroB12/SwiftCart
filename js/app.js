// Hero "Shop Now" smooth scroll
(function () {
  const btn = document.getElementById("shopNowBtn");
  if (!btn) return;

  btn.addEventListener("click", (e) => {
    e.preventDefault();
    const section = document.getElementById("trending");
    if (section) section.scrollIntoView({ behavior: "smooth" });
  });
})();
