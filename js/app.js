function money(n) {
  return `$${Number(n).toFixed(2)}`;
}

function escapeHtml(str) {
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

/* ---------- Hero "Shop Now" smooth scroll ---------- */
(function () {
  const btn = document.getElementById("shopNowBtn");
  if (!btn) return;

  btn.addEventListener("click", (e) => {
    e.preventDefault();
    const section = document.getElementById("trending");
    if (section) section.scrollIntoView({ behavior: "smooth" });
  });
})();

/* ---------- footer year + newsletter ---------- */
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

/* ---------- Cart minimal (for Add to Cart buttons) ---------- */
const CART_KEY = "swiftcart_cart";

function getCart() {
  return JSON.parse(localStorage.getItem(CART_KEY)) || [];
}
function setCart(cart) {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
}
function updateCartCount() {
  const el = document.getElementById("cartCount");
  if (!el) return;
  el.textContent = getCart().length;
}
function addToCart(item) {
  const cart = getCart();
  cart.push(item);
  setCart(cart);
  updateCartCount();
}

// Global click handler for Add to Cart buttons
(function () {
  updateCartCount();

  document.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-add]");
    if (!btn) return;

    try {
      const item = JSON.parse(btn.getAttribute("data-add"));
      addToCart(item);
    } catch (err) {
      console.error("Add to cart parse error:", err);
    }
  });
})();

/* ---------- Trending (Top Rated) products on home page ---------- */
(async function loadTrending() {
  const grid = document.getElementById("trendingGrid");
  const spinner = document.getElementById("trendingSpinner");
  const errorBox = document.getElementById("trendingError");

  // Only run on home page where trending exists
  if (!grid || !spinner || !errorBox) return;

  try {
    errorBox.classList.add("hidden");
    spinner.classList.remove("hidden");
    grid.innerHTML = "";

    const res = await fetch("https://fakestoreapi.com/products");
    if (!res.ok) throw new Error("Trending fetch failed");
    const products = await res.json();

    const top3 = products
      .slice()
      .sort((a, b) => (b.rating?.rate ?? 0) - (a.rating?.rate ?? 0))
      .slice(0, 3);

    grid.innerHTML = top3
      .map((p) => {
        const titleShort =
          p.title.length > 45 ? p.title.slice(0, 45) + "..." : p.title;
        const rating = p?.rating?.rate ?? 0;

        const cartItem = {
          id: p.id,
          title: p.title,
          price: p.price,
          image: p.image,
        };

        return `
          <div class="card bg-base-100 shadow">
            <figure class="p-4 bg-white">
              <img src="${p.image}" alt="${escapeHtml(p.title)}" class="h-48 object-contain" />
            </figure>
            <div class="card-body">
              <h3 class="card-title text-base">${escapeHtml(titleShort)}</h3>

              <div class="flex flex-wrap gap-2 items-center">
                <span class="badge badge-outline">${escapeHtml(p.category)}</span>
                <span class="badge badge-secondary">⭐ ${rating}</span>
              </div>

              <p class="text-lg font-semibold">${money(p.price)}</p>

              <div class="card-actions justify-end">
                <a class="btn btn-outline btn-sm" href="products.html">Details</a>
                <button class="btn btn-primary btn-sm" data-add='${escapeHtml(
                  JSON.stringify(cartItem),
                )}'>Add to Cart</button>
              </div>
            </div>
          </div>
        `;
      })
      .join("");
  } catch (err) {
    console.error("Trending Error:", err);
    errorBox.classList.remove("hidden");
  } finally {
    spinner.classList.add("hidden");
  }
})();

(function () {
  const modal = document.getElementById("detailsModal");
  if (!modal) return;

  document.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-open-modal]");
    if (!btn) return;
    modal.showModal();
  });
})();

/* ---------- Products page - categories + products + filter ---------- */
(async function productsPageLogic() {
  const categoriesBar = document.getElementById("categoriesBar");
  const grid = document.getElementById("productGrid");
  const spinner = document.getElementById("productSpinner");
  const errorBox = document.getElementById("productError");

  // Run only on products.html
  if (!categoriesBar || !grid || !spinner || !errorBox) return;

  let activeCategory = "all";

  function setActiveCategoryUI(cat) {
    categoriesBar.querySelectorAll("[data-cat]").forEach((btn) => {
      btn.classList.remove("btn-primary");
      btn.classList.add("btn-outline");

      if (btn.dataset.cat === cat) {
        btn.classList.add("btn-primary");
        btn.classList.remove("btn-outline");
      }
    });
  }

  function productCardHTML(p) {
    const titleShort =
      p.title.length > 45 ? p.title.slice(0, 45) + "..." : p.title;
    const rating = p?.rating?.rate ?? 0;

    const cartItem = {
      id: p.id,
      title: p.title,
      price: p.price,
      image: p.image,
    };

    return `
      <div class="card bg-base-100 shadow">
        <figure class="p-4 bg-white">
          <img src="${p.image}" alt="${escapeHtml(p.title)}" class="h-48 object-contain" />
        </figure>
        <div class="card-body">
          <h3 class="card-title text-base">${escapeHtml(titleShort)}</h3>

          <div class="flex flex-wrap gap-2 items-center">
            <span class="badge badge-outline">${escapeHtml(p.category)}</span>
            <span class="badge badge-secondary">⭐ ${rating}</span>
          </div>

          <p class="text-lg font-semibold">${money(p.price)}</p>

          <div class="card-actions justify-end">
            <button class="btn btn-outline btn-sm" data-details-id="${p.id}">
              Details
            </button>

            <button class="btn btn-primary btn-sm" data-add='${escapeHtml(
              JSON.stringify(cartItem),
            )}'>
              Add to Cart
            </button>
          </div>
        </div>
      </div>
    `;
  }

  async function fetchCategories() {
    const res = await fetch("https://fakestoreapi.com/products/categories");
    if (!res.ok) throw new Error("Category fetch failed");
    return res.json();
  }

  async function fetchProducts(cat) {
    const url =
      cat === "all"
        ? "https://fakestoreapi.com/products"
        : `https://fakestoreapi.com/products/category/${cat}`;

    const res = await fetch(url);
    if (!res.ok) throw new Error("Products fetch failed");
    return res.json();
  }

  async function renderProducts(cat) {
    try {
      errorBox.classList.add("hidden");
      spinner.classList.remove("hidden");
      grid.innerHTML = "";

      const products = await fetchProducts(cat);
      grid.innerHTML = products.map(productCardHTML).join("");
    } catch (err) {
      console.error("Products Error:", err);
      errorBox.classList.remove("hidden");
    } finally {
      spinner.classList.add("hidden");
    }
  }

  // Load categories
  try {
    const cats = await fetchCategories();
    categoriesBar.innerHTML = `
      <button class="btn btn-sm btn-primary" data-cat="all">All</button>
      ${cats
        .map(
          (c) =>
            `<button class="btn btn-sm btn-outline" data-cat="${c}">${c}</button>`,
        )
        .join("")}
    `;
  } catch (err) {
    console.error("Categories Error:", err);
    categoriesBar.innerHTML = `<div class="alert alert-error"><span>Failed to load categories.</span></div>`;
    return;
  }

  // Initial products
  setActiveCategoryUI(activeCategory);
  await renderProducts(activeCategory);

  // Category click
  categoriesBar.addEventListener("click", async (e) => {
    const btn = e.target.closest("[data-cat]");
    if (!btn) return;

    activeCategory = btn.dataset.cat;
    setActiveCategoryUI(activeCategory);
    await renderProducts(activeCategory);
  });
})();
