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

// footer year + newsletter
(function () {
  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  const emailInput = document.getElementById("newsletterEmail");
  const btn = document.getElementById("subscribeBtn");
  const msg = document.getElementById("newsletterMsg");

  if (!btn || !emailInput || !msg) return;

  btn.addEventListener("click", () => {
    const email = emailInput.value.trim();

    if (!email || !email.includes("@") || !email.includes(".")) {
      msg.textContent = "Please enter a valid email.";
      msg.className = "text-center mt-3 text-sm text-error";
      return;
    }

    msg.textContent = "Subscribed successfully ✅";
    msg.className = "text-center mt-3 text-sm text-success";
    emailInput.value = "";
  });
})();
