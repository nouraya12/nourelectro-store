/* --- الخطوة 1: ربط Backendless --- */
// المفاتيح التي قمت بتزويدي بها
const APP_ID = '14D39C00-FA0E-4E48-B415-8214C199398E';
const API_KEY = 'E466FDD7-C03A-4492-A795-EC7539A87F74';

// الرابط الأساسي لـ Backendless API
const API_URL = `https://api.backendless.com/${APP_ID}/${API_KEY}/data/Products`;


/* --- الخطوة 2: العناصر الرئيسية في الصفحة --- */
const productListContainer = document.getElementById('product-list-container');


/* --- الخطوة 3: دالة لجلب وعرض المنتجات --- */
async function fetchAndRenderProducts() {
    try {
        // 1. جلب البيانات
        const response = await fetch(API_URL);
        if (!response.ok) {
            throw new Error('فشل الاتصال بـ Backendless');
        }
        const products = await response.json();

        // 2. التحقق من وجود الحاوية
        if (!productListContainer) {
            console.error('لم يتم العثور على حاوية المنتجات');
            return;
        }
        
        // 3. عرض كل منتج
        products.forEach(product => {
            const card = document.createElement('div');
            card.className = 'product-card';

            card.innerHTML = `
                <img src="${product.imageUrl}" alt="${product.name}">
                <div class="product-info">
                    <h3>${product.name}</h3>
                    <p class="price">د.م ${product.price}</p>
                    <p>${product.description}</p>
                </div>
                <button class="add-to-cart-btn" data-product-id="${product.objectId}" data-product-name="${product.name}" data-product-price="${product.price}">
                    إضافة إلى السلة
                </button>
            `;

            productListContainer.appendChild(card);
        });

        // 5. تفعيل وظائف الأزرار والصور (بعد عرضها)
        setupEventListeners();

    } catch (error) {
        console.error('حدث خطأ:', error);
        productListContainer.innerHTML = '<p>عفواً، حدث خطأ أثناء جلب المنتجات.</p>';
    }
}

/* --- الخطوة 4: تفعيل الأزرار (التكبير والسلة) --- */
function setupEventListeners() {
    
    // --- أ. وظيفة التكبير (كما طلبت) ---
    const productImages = document.querySelectorAll('.product-card img');
    productImages.forEach(img => {
        img.addEventListener('click', () => {
            img.classList.toggle('zoomed');
        });
    });

    // --- ب. وظيفة إضافة للسلة ---
    const addToCartButtons = document.querySelectorAll('.add-to-cart-btn');
    addToCartButtons.forEach(button => {
        button.addEventListener('click', (event) => {
            const productId = event.target.dataset.productId;
            const productName = event.target.dataset.productName;
            const productPrice = parseFloat(event.target.dataset.productPrice);

            addToCart({
                id: productId,
                name: productName,
                price: productPrice
            });

            event.target.textContent = 'تمت الإضافة! ✅';
            setTimeout(() => {
                event.target.textContent = 'إضافة إلى السلة';
            }, 2000); 
        });
    });
}

/* --- الخطوة 5: منطق السلة (باستخدام ذاكرة المتصفح) --- */
function addToCart(productToAdd) {
    let cart = JSON.parse(localStorage.getItem('shoppingCart')) || [];
    cart.push(productToAdd);
    localStorage.setItem('shoppingCart', JSON.stringify(cart));
}


/* --- الخطوة 6: تشغيل الكود عند تحميل الصفحة --- */
document.addEventListener('DOMContentLoaded', fetchAndRenderProducts);
