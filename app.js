/* ===== Backendless REST ===== */
const APP_ID   = '14D39C00-FA0E-4E48-B415-8214C199398E';   // تأكد أنه الـ APP ID الصحيح
const REST_KEY = 'E466FDD7-C03A-4492-A795-EC7539A87F74';   // يجب أن يكون REST API KEY
const API_URL  = `https://api.backendless.com/${APP_ID}/${REST_KEY}/data/Products`;

/* ===== عناصر الصفحة ===== */
const container = document.getElementById('product-list-container');

/* رسالة خطأ مرئية على الصفحة */
function showError(msg) {
  if (!container) return;
  container.innerHTML = `
    <div style="background:#fff3cd;border:1px solid #ffeeba;color:#856404;padding:12px;border-radius:8px">
      ${msg}
    </div>`;
}

/* بطاقة المنتج */
function createProductCard(p) {
  const card = document.createElement('div');
  card.className = 'product-card';
  const safeImg = (p.imageUrl || '').startsWith('http') ? p.imageUrl : '';
  card.innerHTML = `
    <img src="${safeImg}" alt="${p.name || ''}" loading="lazy">
    <div class="product-info">
      <h3>${p.name || ''}</h3>
      <p class="price">د.م ${Number(p.price || 0).toLocaleString('ar-MA')}</p>
      <p>${p.description || ''}</p>
    </div>
    <button class="add-to-cart-btn"
      data-product-id="${p.objectId || ''}"
      data-product-name="${p.name || ''}"
      data-product-price="${p.price || 0}">
      إضافة إلى السلة
    </button>
  `;
  return card;
}

/* الاستماع للأحداث (تكبير الصورة + السلة) */
function wireEvents(scope=document) {
  scope.querySelectorAll('.product-card img').forEach(img => {
    img.addEventListener('click', () => img.classList.toggle('zoomed'));
  });

  scope.querySelectorAll('.add-to-cart-btn').forEach(btn => {
    btn.addEventListener('click', e => {
      const t = e.currentTarget;
      const item = {
        id:   t.dataset.productId,
        name: t.dataset.productName,
        price: Number(t.dataset.productPrice || 0)
      };
      const cart = JSON.parse(localStorage.getItem('shoppingCart') || '[]');
      cart.push(item);
      localStorage.setItem('shoppingCart', JSON.stringify(cart));
      t.textContent = 'تمت الإضافة! ✅';
      setTimeout(() => (t.textContent = 'إضافة إلى السلة'), 1500);
    });
  });
}

/* الجلب والعرض */
async function fetchAndRenderProducts() {
  if (!container) return;

  container.innerHTML = '<p style="opacity:.7">جاري تحميل المنتجات…</p>';

  try {
    const res = await fetch(API_URL, {
      headers: { 'Accept': 'application/json' },
      // ملاحظة: لا نُرسل مفاتيح في Headers لأننا نستخدم REST عبر المسار
      cache: 'no-store' // يقلل مشاكل الكاش على GitHub Pages
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`HTTP ${res.status} — ${text}`);
    }

    const products = await res.json();
    if (!Array.isArray(products) || products.length === 0) {
      container.innerHTML = '<p>لا توجد منتجات حالياً.</p>';
      return;
    }

    container.innerHTML = '';
    products.forEach(p => container.appendChild(createProductCard(p)));
    wireEvents(container);

  } catch (err) {
    console.error(err);
    showError(
      'تعذّر جلب المنتجات. تحقق من: REST API Key، صلاحية Find لغير المسجلين، إعدادات CORS، وروابط الصور https.'
    );
  }
}

/* تشغيل */
document.addEventListener('DOMContentLoaded', fetchAndRenderProducts);