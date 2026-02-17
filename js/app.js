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

/* ---------- Cart with Quantity (localStorage + qty + plus/minus) ---------- */
const CART_KEY = "swiftcart_cart_v2";

function getCart() {
  return JSON.parse(localStorage.getItem(CART_KEY)) || [];
}

function setCart(cart) {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
}

function getCartCount() {
  // total qty
  return getCart().reduce((sum, item) => sum + (item.qty || 1), 0);
}

function getCartTotal() {
  const total = getCart().reduce((sum, item) => {
    const qty = item.qty || 1;
    return sum + Number(item.price || 0) * qty;
  }, 0);
  return Number(total.toFixed(2));
}

function updateCartCount() {
  const el = document.getElementById("cartCount");
  if (!el) return;
  el.textContent = getCartCount();
}

function addToCart(product) {
  const cart = getCart();
  const idx = cart.findIndex((x) => String(x.id) === String(product.id));

  if (idx === -1) {
    cart.push({ ...product, qty: 1 });
  } else {
    cart[idx].qty = (cart[idx].qty || 1) + 1;
  }

  setCart(cart);
  updateCartCount();
  renderCart();
}

function increaseQty(id) {
  const cart = getCart();
  const idx = cart.findIndex((x) => String(x.id) === String(id));
  if (idx === -1) return;

  cart[idx].qty = (cart[idx].qty || 1) + 1;
  setCart(cart);
  updateCartCount();
  renderCart();
}

function decreaseQty(id) {
  const cart = getCart();
  const idx = cart.findIndex((x) => String(x.id) === String(id));
  if (idx === -1) return;

  const current = cart[idx].qty || 1;
  if (current <= 1) {
    cart.splice(idx, 1);
  } else {
    cart[idx].qty = current - 1;
  }

  setCart(cart);
  updateCartCount();
  renderCart();
}

function removeLine(id) {
  const cart = getCart().filter((x) => String(x.id) !== String(id));
  setCart(cart);
  updateCartCount();
  renderCart();
}

function openCartDrawer() {
  const drawer = document.getElementById("cartDrawer");
  const overlay = document.getElementById("drawerOverlay");
  if (!drawer || !overlay) return;
  drawer.classList.remove("translate-x-full");
  overlay.classList.remove("hidden");
  renderCart();
}

function closeCartDrawer() {
  const drawer = document.getElementById("cartDrawer");
  const overlay = document.getElementById("drawerOverlay");
  if (!drawer || !overlay) return;
  drawer.classList.add("translate-x-full");
  overlay.classList.add("hidden");
}

function renderCart() {
  const itemsEl = document.getElementById("cartItems");
  const totalEl = document.getElementById("cartTotal");
  if (!itemsEl || !totalEl) return;

  const cart = getCart();

  if (cart.length === 0) {
    itemsEl.innerHTML = `<p class="opacity-70">Cart is empty.</p>`;
  } else {
    itemsEl.innerHTML = cart
      .map((item) => {
        const qty = item.qty || 1;
        const lineTotal = Number(item.price || 0) * qty;

        return `
          <div class="card bg-base-200">
            <div class="card-body p-4">
              <div class="flex gap-3 items-center">
                <img class="w-14 h-14 object-contain bg-white rounded" src="${item.image}" alt="${escapeHtml(item.title)}" />
                <div class="flex-1">
                  <h4 class="font-semibold text-sm">${escapeHtml(item.title.slice(0, 45))}${item.title.length > 45 ? "..." : ""}</h4>
                  <p class="text-sm opacity-80">${money(item.price)} × ${qty} = ${money(lineTotal)}</p>

                  <div class="mt-2 flex items-center gap-2">
                    <button class="btn btn-xs text-white bg-red-500" data-qty-minus="${item.id}">−</button>
                    <span class="badge font-bold badge-neutral">${qty}</span>
                    <button class="btn btn-xs text-white bg-blue-500" data-qty-plus="${item.id}">+</button>

                    <button class="btn btn-xs btn-error ml-auto text-white " data-remove-line="${item.id}">Remove</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        `;
      })
      .join("");
  }

  totalEl.textContent = money(getCartTotal());
}

/* Wire cart UI + actions (single event delegation) */
(function cartInit() {
  updateCartCount();
  renderCart();

  document
    .getElementById("openCartBtn")
    ?.addEventListener("click", openCartDrawer);
  document
    .getElementById("closeCartBtn")
    ?.addEventListener("click", closeCartDrawer);
  document
    .getElementById("drawerOverlay")
    ?.addEventListener("click", closeCartDrawer);

  document.addEventListener("click", (e) => {
    // Add to cart buttons (cards/modal/trending)
    const addBtn = e.target.closest("[data-add]");
    if (addBtn) {
      try {
        const item = JSON.parse(addBtn.getAttribute("data-add"));
        addToCart(item);
      } catch (err) {
        console.error("Add to cart parse error:", err);
      }
      return;
    }

    // qty controls
    const plusBtn = e.target.closest("[data-qty-plus]");
    if (plusBtn) {
      increaseQty(plusBtn.getAttribute("data-qty-plus"));
      return;
    }

    const minusBtn = e.target.closest("[data-qty-minus]");
    if (minusBtn) {
      decreaseQty(minusBtn.getAttribute("data-qty-minus"));
      return;
    }

    // remove entire line
    const removeBtn = e.target.closest("[data-remove-line]");
    if (removeBtn) {
      removeLine(removeBtn.getAttribute("data-remove-line"));
      return;
    }
  });
})();

//======================================================================================================================
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

// Step-6: Product Details Modal (single product API)
(function () {
  const modal = document.getElementById("detailsModal");
  const content = document.getElementById("modalContent");

  // Run only on products page where modal exists
  if (!modal || !content) return;

  async function openDetails(id) {
    try {
      content.innerHTML = `
        <div class="flex justify-center py-10">
          <span class="loading loading-spinner loading-lg"></span>
        </div>
      `;
      modal.showModal();

      const res = await fetch(`https://fakestoreapi.com/products/${id}`);
      if (!res.ok) throw new Error("Single product fetch failed");
      const p = await res.json();

      const rating = p?.rating?.rate ?? 0;
      const count = p?.rating?.count ?? 0;

      const cartItem = {
        id: p.id,
        title: p.title,
        price: p.price,
        image: p.image,
      };

      content.innerHTML = `
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div class="bg-white rounded p-4">
            <img src="${p.image}" alt="${escapeHtml(p.title)}" class="w-full h-64 object-contain" />
          </div>

          <div>
            <h2 class="text-2xl font-bold mb-2">${escapeHtml(p.title)}</h2>

            <div class="flex flex-wrap gap-2 mb-4">
              <span class="badge badge-outline">${escapeHtml(p.category)}</span>
              <span class="badge badge-secondary">⭐ ${rating} (${count})</span>
            </div>

            <p class="text-lg font-semibold mb-3">${money(p.price)}</p>

            <p class="opacity-80 mb-6">${escapeHtml(p.description)}</p>

            <button class="btn btn-primary" data-add='${escapeHtml(JSON.stringify(cartItem))}'>
              Add to Cart
            </button>
          </div>
        </div>
      `;
    } catch (err) {
      console.error("Modal Details Error:", err);
      content.innerHTML = `
        <div class="alert alert-error">
          <span>Failed to load product details.</span>
        </div>
      `;
    }
  }

  // Details button click (event delegation)
  document.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-details-id]");
    if (!btn) return;
    openDetails(btn.getAttribute("data-details-id"));
  });
})();
