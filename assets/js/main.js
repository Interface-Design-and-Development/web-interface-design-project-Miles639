document.addEventListener("DOMContentLoaded", () => {
    if (localStorage.getItem("loggedIn") === "true") {
      document.querySelectorAll("a[href='account.html']")
        .forEach(a => (a.href = "account-dashboard.html"));
    }
  
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    const welcome = document.getElementById("welcome-msg");
    if (localStorage.getItem("loggedIn") === "true" && user.firstName && welcome) {
      welcome.textContent = `Welcome, ${user.firstName}`;
    }
  });
  
  /* ---------- 1. Global price list ---------- */
  const PRICE = {
    "Green Tea"     : 3.25,
    "Black Tea"     : 3.50,
    "White Tea"     : 3.75,
    "Vanilla Latte" : 4.50,
    "Espresso"      : 3.00,
    "Frappuccino"   : 4.75
  };
  
  /* ---------- 2. Toast Utility ---------- */
  function toast(msg) {
    let box = document.querySelector(".toast-container");
    if (!box) {
      box = document.createElement("div");
      box.className = "toast-container";
      document.body.appendChild(box);
    }
    const t = document.createElement("div");
    t.className = "toast-msg";
    t.textContent = msg;
    box.appendChild(t);
    setTimeout(() => t.remove(), 2500);
  }
  
  /* ---------- 3. Sidebar Toggle ---------- */
  (() => {
    const side  = document.getElementById("sidebar");
    const open  = document.getElementById("sidebarToggle");
    const close = document.getElementById("sidebarClose");
    if (side && open && close) {
      open .addEventListener("click", () => side.classList.add("open"));
      close.addEventListener("click", () => side.classList.remove("open"));
    }
  })();
  
  /* ---------- 4. Accessibility Toggles ---------- */
  (() => {
    const body = document.body;
    ["dark", "contrast", "font"].forEach(k => {
      const sw = document.getElementById(`toggle-${k}`);
      if (localStorage.getItem(k) === "on") body.classList.add(`pref-${k}`);
      if (sw) {
        sw.checked = localStorage.getItem(k) === "on";
        sw.addEventListener("change", () => {
          body.classList.toggle(`pref-${k}`, sw.checked);
          localStorage.setItem(k, sw.checked ? "on" : "off");
        });
      }
    });
  })();
/* ---------- 5. Cart & Customizations ---------- */
(() => {
  const BADGE = document.getElementById("cart-count");
  const CART_K = "cart";
  const CUST_K = "cust";

  const g = k => JSON.parse(localStorage.getItem(k) || "{}");
  const s = (k, v) => localStorage.setItem(k, JSON.stringify(v));
  const cart = () => g(CART_K);
  const saveC = v => s(CART_K, v);
  const cust = () => g(CUST_K);
  const saveU = v => s(CUST_K, v);

  const updBadge = () => {
    if (!BADGE) return;
    const tot = Object.values(cart()).reduce((n, q) => n + q, 0);
    BADGE.textContent = tot || "";
    BADGE.classList.toggle("d-none", tot === 0);
  };

  /* ---- Add‑to‑Cart buttons ---- */
  document.querySelectorAll(".add-cart-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const name = btn.closest(".card").dataset.name;
      const c = cart();
      c[name] = (c[name] || 0) + 1;
      saveC(c);
      updBadge();
      toast(`${name} added to cart`);
    });
  });

  /* ---- Customize Modal ---- */
  if (!document.getElementById("customModal")) {
    document.body.insertAdjacentHTML(
      "beforeend",
      `<div class="modal fade" id="customModal" tabindex="-1">\n        <div class="modal-dialog"><div class="modal-content">\n          <div class="modal-header"><h5 class="modal-title"></h5>\n            <button class="btn-close" data-bs-dismiss="modal"></button></div>\n          <div class="modal-body">\n            <form id="customForm">\n              <label class="form-label mt-2">Milk</label>\n              <select class="form-select" name="milk">\n                <option>None</option><option>Whole</option><option>Almond</option><option>Oat</option>\n              </select>\n              <label class="form-label mt-3">Ice</label>\n              <select class="form-select" name="ice">\n                <option>None</option><option>Light</option><option>Regular</option><option>Extra</option>\n              </select>\n              <label class="form-label mt-3">Add-ons</label><br>\n              <div class="form-check form-check-inline">\n                <input class="form-check-input" type="checkbox" value="Caramel">\n                <label class="form-check-label">Caramel</label>\n              </div>\n              <div class="form-check form-check-inline">\n                <input class="form-check-input" type="checkbox" value="Whipped Cream">\n                <label class="form-check-label">Whipped Cream</label>\n              </div>\n            </form>\n          </div>\n          <div class="modal-footer">\n            <button class="btn btn-secondary" data-bs-dismiss="modal">Close</button>\n            <button id="saveCustom" class="btn btn-primary">Save &amp; Add</button>\n          </div>\n        </div></div>\n      </div>`
    );
  }

  const customModal = new bootstrap.Modal("#customModal");
  let currentDrink = "";

  document.querySelectorAll(".customize-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      currentDrink = btn.dataset.drink || btn.closest(".card").dataset.name;
      document.querySelector("#customModal .modal-title").textContent =
        `Customize – ${currentDrink}`;
      document.getElementById("customForm").reset();
      customModal.show();
    });
  });

  document.getElementById("saveCustom")?.addEventListener("click", () => {
    const fd = new FormData(document.getElementById("customForm"));
    const addons = [
      ...document.querySelectorAll("#customForm input[type=checkbox]:checked")
    ].map(i => i.value);

    const u = cust();
    u[currentDrink] = { milk: fd.get("milk"), ice: fd.get("ice"), addons };
    saveU(u);

    const c = cart();
    c[currentDrink] = (c[currentDrink] || 0) + 1;
    saveC(c);

    updBadge();
    toast(`${currentDrink} customized and added to cart`);
    customModal.hide();
  });

  /* ---- Checkout page logic ---- */
  const TABLE = document.getElementById("cart-table");
  if (TABLE) {
    const TB = TABLE.querySelector("tbody");
    const rebuild = () => {
      TB.innerHTML = "";
      const c = cart(), u = cust();
      let tq = 0, tp = 0;

      Object.entries(c).forEach(([n, q]) => {
        const inf = u[n]
          ? `<small class="text-muted">(${u[n].milk}, ${u[n].ice}${u[n].addons.length ? ", " + u[n].addons.join("+") : ""})</small>`
          : "";
        TB.insertAdjacentHTML(
          "beforeend",
          `<tr>\n            <td>${n}<br>${inf}</td>\n            <td class="text-center">\n              <div class="qty-controls">\n                <button class="qty-btn" data-n="${n}" data-a="-1">−</button>\n                <span>${q}</span>\n                <button class="qty-btn" data-n="${n}" data-a="1">＋</button>\n              </div>\n            </td>\n            <td class="text-end">$${(PRICE[n] * q).toFixed(2)}</td>\n            <td class="text-center">\n              <button class="btn btn-sm btn-outline-danger del" data-n="${n}">×</button>\n            </td>\n          </tr>`
        );
        tq += q;
        tp += PRICE[n] * q;
      });

      document.getElementById("cart-total-qty").textContent = tq;
      document.getElementById("cart-total-price").textContent = `$${tp.toFixed(2)}`;
      document.getElementById("cart-empty").classList.toggle("d-none", tq > 0);
      document.getElementById("place-order").classList.toggle("d-none", tq === 0);
      TABLE.classList.toggle("d-none", tq === 0);
    };

    rebuild();

    TB.addEventListener("click", e => {
      const n = e.target.dataset.n;
      if (e.target.classList.contains("qty-btn")) {
        const a = +e.target.dataset.a;
        const c = cart();
        c[n] = (c[n] || 0) + a;
        if (c[n] <= 0) {
          delete c[n];
          toast(`${n} removed`);
        } else {
          toast(`${n} updated`);
        }
        saveC(c);
        rebuild();
        updBadge();
      }
      if (e.target.classList.contains("del")) {
        const c = cart();
        delete c[n];
        saveC(c);
        toast(`${n} removed`);
        rebuild();
        updBadge();
      }
    });

    document.getElementById("place-order").addEventListener("click", () => {
      localStorage.removeItem(CART_K);
      toast("Order placed!");
      updBadge();
      rebuild();
      setTimeout(() => (window.location.href = "location.html"), 900);
    });
  }

  updBadge();
})();

/* ---------- 6. Payment page ---------- */
(() => {
  const payBtn = document.getElementById("confirm-payment");
  if (!payBtn) return;

  const radios = document.querySelectorAll(".pay-option");
  const secCash = document.getElementById("section-cash");
  const secGift = document.getElementById("section-gift");
  const secCard = document.getElementById("section-card");

  const toggleSections = val => {
    secCash?.classList.toggle("d-none", val !== "cash");
    secGift?.classList.toggle("d-none", val !== "gift");
    secCard?.classList.toggle("d-none", val !== "card");
  };

  radios.forEach(r => r.addEventListener("change", () => toggleSections(r.value)));

  payBtn.addEventListener("click", () => {
    const sel = [...radios].find(r => r.checked)?.value;
    if (!sel) {
      toast("Select a payment method first");
      return;
    }

    if (sel === "gift" && !document.getElementById("gift-code").value.trim()) {
      toast("Enter your gift card code");
      return;
    }

    if (sel === "card") {
      const name = document.getElementById("card-name").value.trim();
      const num = document.getElementById("card-num").value.trim();
      const cvv = document.getElementById("cvv").value.trim();
      const mm = document.getElementById("exp-month").value;
      const yy = document.getElementById("exp-year").value;
      if (!(name && num && cvv && mm !== "MM" && yy !== "YY")) {
        toast("Complete all card fields");
        return;
      }
    }

    const cartObj = JSON.parse(localStorage.getItem("cart") || "{}");
    const receiptItems = Object.entries(cartObj).map(([item, qty]) => [item, qty, PRICE[item] * qty]);
    const location = localStorage.getItem("location") || "Unknown";

    localStorage.setItem("receipt", JSON.stringify({ location, items: receiptItems }));
    localStorage.removeItem("cart");

    toast("Payment successful! Redirecting…");
    setTimeout(() => (window.location.href = "confirm.html"), 1000);
  });
})();