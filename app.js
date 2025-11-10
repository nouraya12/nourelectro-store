/* app.js — كود JavaScript لعرض المنتجات والتكبير وإضافة للسلة (متوافق مع HTML/CSS المرسلين) */
"use strict";

/* ========== إعداد Backendless ========== */
const APP_ID  = "14D39C00-FA0E-4E48-B415-8214C199398E";
const API_KEY = "E466FDD7-C03A-4492-A795-EC7539A87F74";
const API_URL = `https://api.backendless.com/${APP_ID}/${API_KEY}/data/Products`;

/* ========== مراجع DOM ========== */
const productListContainer = document.getElementById("product-list-container");

/* ========== أدوات مساعدة ========== */
const placeholderSVG =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" width="800" height="500">
      <rect width="100%" height="100%" fill="#eeeeee"/>
      <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle"
            font-family="system-ui,-apple-system,sans-serif" font-size="24" fill="#888">
        لا توجد صورة
      </text>
    </svg>
  `);

function formatPrice(value) {
  const num = Number(value);
  if (Number.isNaN(num)) return "غير متوفر";
  return `د.م ${num.toLocaleString("ar-MA")}`;
}

function getCart() {
  try {
    return JSON.parse(localStorage.getItem("shoppingCart")) || [];
  } catch {
    return [];
  }
}

function saveCart(cart) {
  localStorage.setItem("shoppingCart", JSON.stringify(cart));
}

function addToCart(item) {
  const cart = getCart();
  const index = cart.findIndex(p => p.id === item.id);
  if (index >= 0) {
    cart[index].qty = (cart[index].qty || 1) + 1;
  } else {
    cart.push({ ...item, qty: 1 });
  }
  saveCart(cart);
}

/* ========== إنشاء بطاقة المنتج ========== */
function renderProductCard(product) {
  const card = document.createElement("div");
  card.className = "product-card";

  const img = document.createElement("img");
  img.loading = "lazy";
  img.alt = product.name || "منتج";
  img.src = product.imageUrl || placeholderSVG;
  img.addEventListener("click", () => img.classList.toggle("zoomed"));

  const info = document.createElement("div");
  info.className = "product-info";

  const title = document.createElement("h3");
  title.textContent = product.name || "منتج بدون اسم";

  const price = document.createElement("p");
  price.className = "price";
  price.textContent = formatPrice(product.price);

  const desc = document.createElement("p");
  desc.textContent = product.description || "";

  const btn = document.createElement("button");
  btn.className = "add-to-cart-btn";
  btn.type = "button";
  btn.textContent = "إضافة إلى السلة";
  btn.addEventListener("click", () => {
    addToCart({
      id: product.objectId || String(product.id || product.name),
      name: product.name || "منتج",
      price: Number(product.price) || 0
    });
    const original = btn.textContent;
    btn.textContent = "تمت الإضافة ✅";
    btn.disabled = true;
    setTimeout(() => {
      btn.textContent = original;
      btn.disabled = false;
    }, 1500);
  });

  info.appendChild(title);
  info.appendChild(price);
  info.appendChild(desc);

  card.appendChild(img);
  card.appendChild(info);
  card.appendChild(btn);

  return card;
}

/* ========== جلب المنتجات وعرضها ========== */
async function fetchAndRenderProducts() {
  if (!productListContainer) return;

  productListContainer.innerHTML = `
    <div style="padding:1rem;text-align:center;">جارِ تحميل المنتجات…</div>
  `;

  try {
    // يمكنك تعديل الاستعلام مثلاً بالفرز أو التحديد حسب حاجتك
    // مثال: const url = API_URL + '?pageSize=50&sortBy=created%20desc';
    const url = API_URL;
    const res = await fetch(url, { method: "GET" });

    if (!res.ok) throw new Error("فشل الاتصال بـ Backendless");
    const products = await res.json();
    const list = Array.isArray(products) ? products : [];

    if (!list.length) {
      productListContainer.innerHTML = `
        <div style="padding:1rem;text-align:center;">لا توجد منتجات حالياً.</div>
      `;
      return;
    }

    // مسح المحتوى ثم التعبئة
    productListContainer.innerHTML = "";
    list.forEach(p => productListContainer.appendChild(renderProductCard(p)));
  } catch (err) {
    console.error(err);
    productListContainer.innerHTML = `
      <div style="padding:1rem;text-align:center;">
        عذراً، حدث خطأ أثناء تحميل المنتجات. حاول لاحقاً.
      </div>
    `;
  }
}

/* ========== تشغيل عند التحميل ========== */
document.addEventListener("DOMContentLoaded", fetchAndRenderProducts);
```0