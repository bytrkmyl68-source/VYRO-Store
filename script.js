const PRODUCT_STORAGE_KEY = 'vyro_store_products';
const CART_STORAGE_KEY = 'vyro_store_cart';
const ACCOUNT_STORAGE_KEY = 'vyro_store_account';
const ORDER_STORAGE_KEY = 'vyro_store_orders';

const defaultProducts = [
  {
    id: 1,
    name: 'Aero Black Tee',
    category: 'basic',
    price: 449,
    stock: 15,
    active: true,
    badge: 'Bestseller',
    image: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=900&q=80'
  },
  {
    id: 2,
    name: 'Core Oversize',
    category: 'oversize',
    price: 599,
    stock: 8,
    active: true,
    badge: 'New',
    image: 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=900&q=80'
  },
  {
    id: 3,
    name: 'Signal Graphic',
    category: 'basic',
    price: 529,
    stock: 11,
    active: true,
    badge: 'Trend',
    image: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=900&q=80'
  },
  {
    id: 4,
    name: 'Urban Fade',
    category: 'oversize',
    price: 649,
    stock: 4,
    active: true,
    badge: 'Limited',
    image: 'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=900&q=80'
  },
  {
    id: 5,
    name: 'Minimal White',
    category: 'basic',
    price: 470,
    stock: 18,
    active: true,
    badge: 'Classic',
    image: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=900&q=80'
  },
  {
    id: 6,
    name: 'Night Drop',
    category: 'oversize',
    price: 699,
    stock: 6,
    active: true,
    badge: 'Hot',
    image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=900&q=80'
  }
];

let products = JSON.parse(localStorage.getItem(PRODUCT_STORAGE_KEY) || 'null') || defaultProducts;
let cart = JSON.parse(localStorage.getItem(CART_STORAGE_KEY) || '[]');
let currentFilter = 'all';

const formatMoney = (value) => `${Number(value).toLocaleString('ar-EG')} ج.م`;

function saveCart() {
  localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
}

function saveProducts() {
  localStorage.setItem(PRODUCT_STORAGE_KEY, JSON.stringify(products));
}

function getProductById(productId) {
  return products.find((product) => product.id === productId);
}

function renderProducts() {
  const grid = document.getElementById('productGrid');
  const visibleProducts = products.filter((product) => {
    if (!product.active) return false;
    return currentFilter === 'all' || product.category === currentFilter;
  });

  if (!visibleProducts.length) {
    grid.innerHTML = '<p class="empty-cart">لا توجد منتجات في هذا التصنيف حالياً.</p>';
    return;
  }

  grid.innerHTML = visibleProducts.map((product) => `
    <article class="product-card">
      <div class="product-image">
        ${product.image ? `<img src="${product.image}" alt="${product.name}" />` : `<div class="product-placeholder">VYRO</div>`}
        ${product.badge ? `<span class="badge">${product.badge}</span>` : ''}
      </div>

      <button class="add-btn" type="button" data-add-id="${product.id}" aria-label="إضافة ${product.name} إلى السلة">+</button>

      <div class="product-body">
        <h3>${product.name}</h3>
        <div class="product-meta">
          <span>${product.category === 'oversize' ? 'أوفر سايز' : 'أساسي'}</span>
          <span>${product.stock > 0 ? 'متاح' : 'نفد'}</span>
        </div>
        <span class="product-price">${formatMoney(product.price)}</span>
      </div>
    </article>
  `).join('');

  document.querySelectorAll('[data-add-id]').forEach((button) => {
    button.addEventListener('click', () => addToCart(Number(button.dataset.addId)));
  });
}

function renderCart() {
  const cartItems = document.getElementById('cartItems');
  const cartCount = document.getElementById('cartCount');
  const cartTotal = document.getElementById('cartTotal');

  if (!cart.length) {
    cartItems.innerHTML = '<p class="empty-cart">السلة فارغة الآن.<br />أضف بعض القطع المفضلة.</p>';
    cartCount.textContent = '0';
    cartTotal.textContent = '0 ج.م';
    return;
  }

  let total = 0;
  let count = 0;

  cartItems.innerHTML = cart.map((item) => {
    const product = getProductById(item.id);
    if (!product) return '';

    total += product.price * item.qty;
    count += item.qty;

    return `
      <div class="cart-item">
        <div>
          <h4>${product.name}</h4>
          <small>${formatMoney(product.price)} × ${item.qty}</small>
        </div>
        <div class="qty-box">
          <button type="button" data-qty-action="minus" data-product-id="${product.id}">−</button>
          <strong>${item.qty}</strong>
          <button type="button" data-qty-action="plus" data-product-id="${product.id}">+</button>
        </div>
      </div>
    `;
  }).join('');

  cartCount.textContent = String(count);
  cartTotal.textContent = formatMoney(total);

  document.querySelectorAll('[data-qty-action]').forEach((button) => {
    button.addEventListener('click', () => {
      const productId = Number(button.dataset.productId);
      const action = button.dataset.qtyAction;
      changeQty(productId, action === 'plus' ? 1 : -1);
    });
  });
}

function addToCart(productId) {
  const product = getProductById(productId);
  if (!product || product.stock <= 0) return;

  const item = cart.find((entry) => entry.id === productId);
  if (item) {
    if (item.qty < product.stock) item.qty += 1;
  } else {
    cart.push({ id: productId, qty: 1 });
  }

  saveCart();
  renderCart();
  openCart();
}

function changeQty(productId, delta) {
  const item = cart.find((entry) => entry.id === productId);
  if (!item) return;

  item.qty += delta;
  if (item.qty <= 0) {
    cart = cart.filter((entry) => entry.id !== productId);
  }

  saveCart();
  renderCart();
}

function openCart() {
  document.getElementById('cartPanel').classList.add('open');
  document.getElementById('overlay').classList.add('visible');
}

function closeCart() {
  document.getElementById('cartPanel').classList.remove('open');
  document.getElementById('overlay').classList.remove('visible');
}

function openModal(modalId) {
  const modal = document.getElementById(modalId);
  if (!modal) return;
  modal.classList.add('open');
  modal.setAttribute('aria-hidden', 'false');
}

function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  if (!modal) return;
  modal.classList.remove('open');
  modal.setAttribute('aria-hidden', 'true');
}

function getAccount() {
  return JSON.parse(localStorage.getItem(ACCOUNT_STORAGE_KEY) || 'null');
}

function setAccount(account) {
  localStorage.setItem(ACCOUNT_STORAGE_KEY, JSON.stringify(account));
}

function handleCheckout() {
  if (!cart.length) {
    alert('أضف منتجًا للسلة أولًا.');
    return;
  }

  const account = getAccount();
  if (!account) {
    document.getElementById('authMessage').textContent = 'يجب إنشاء حساب قبل إتمام الشراء.';
    openModal('authModal');
    return;
  }

  document.getElementById('signedInUser').textContent = `مسجل الدخول باسم: ${account.name}`;
  openModal('orderModal');
}

function submitOrder(event) {
  event.preventDefault();

  const account = getAccount();
  if (!account) {
    return;
  }

  const phone = document.getElementById('customerPhone').value.trim();
  const address = document.getElementById('customerAddress').value.trim();

  if (!phone || !address) {
    document.getElementById('orderMessage').textContent = 'يرجى إدخال بيانات الطلب كاملة.';
    return;
  }

  const orderTotal = cart.reduce((sum, item) => {
    const product = getProductById(item.id);
    return sum + (product ? product.price * item.qty : 0);
  }, 0);

  const order = {
    id: `VY-${Date.now().toString().slice(-6)}`,
    user: account,
    phone,
    address,
    items: cart,
    total: orderTotal,
    status: 'جديد',
    createdAt: new Date().toISOString()
  };

  const orders = JSON.parse(localStorage.getItem(ORDER_STORAGE_KEY) || '[]');
  orders.unshift(order);
  localStorage.setItem(ORDER_STORAGE_KEY, JSON.stringify(orders));

  cart = [];
  saveCart();
  renderCart();

  document.getElementById('orderMessage').textContent = `تم تأكيد طلبك بنجاح: ${order.id}`;

  setTimeout(() => {
    closeModal('orderModal');
    document.getElementById('orderForm').reset();
    document.getElementById('orderMessage').textContent = '';
    closeCart();
  }, 1200);
}

function handleAccountSubmit(event) {
  event.preventDefault();

  const name = document.getElementById('authName').value.trim();
  const email = document.getElementById('authEmail').value.trim();
  const password = document.getElementById('authPassword').value.trim();

  if (!name || !email || !password) {
    document.getElementById('authMessage').textContent = 'يرجى ملء جميع الحقول.';
    return;
  }

  const account = { name, email, password, createdAt: new Date().toISOString() };
  setAccount(account);
  document.getElementById('authMessage').textContent = 'تم إنشاء الحساب بنجاح.';

  setTimeout(() => {
    closeModal('authModal');
    document.getElementById('authForm').reset();
    document.getElementById('authMessage').textContent = '';
    handleCheckout();
  }, 600);
}

document.getElementById('cartToggleBtn').addEventListener('click', () => {
  const panel = document.getElementById('cartPanel');
  if (panel.classList.contains('open')) {
    closeCart();
  } else {
    openCart();
  }
});

document.getElementById('closeCartBtn').addEventListener('click', closeCart);
document.getElementById('overlay').addEventListener('click', closeCart);
document.getElementById('checkoutBtn').addEventListener('click', handleCheckout);
document.getElementById('orderForm').addEventListener('submit', submitOrder);
document.getElementById('authForm').addEventListener('submit', handleAccountSubmit);
document.getElementById('accountBtn').addEventListener('click', () => {
  const account = getAccount();
  if (account) {
    alert(`أهلاً ${account.name}! حسابك موجود بالفعل وطلبك يمكن إكماله بسهولة.`);
    return;
  }
  openModal('authModal');
});

document.querySelectorAll('.filter-btn').forEach((button) => {
  button.addEventListener('click', () => {
    document.querySelectorAll('.filter-btn').forEach((btn) => btn.classList.remove('active'));
    button.classList.add('active');
    currentFilter = button.dataset.filter;
    renderProducts();
  });
});

document.querySelectorAll('[data-close]').forEach((button) => {
  button.addEventListener('click', () => closeModal(button.dataset.close));
});

renderProducts();
renderCart();































































