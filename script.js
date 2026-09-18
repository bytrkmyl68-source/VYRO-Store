const ADMIN_PASSWORD = 'vyro123456';
const PRODUCT_KEY = 'vyro_products';
const ORDER_KEY = 'vyro_orders';
const ADMIN_SESSION_KEY = 'vyro_admin_logged_in';

const $ = (id) => document.getElementById(id);
let currentImage = '';
let editingProductId = null;

const money = (value) => `${Number(value).toLocaleString('ar-EG')} ج.م`;

function getProducts() {
  try {
    const stored = JSON.parse(localStorage.getItem(PRODUCT_KEY) || '[]');
    return Array.isArray(stored) ? stored : [];
  } catch {
    return [];
  }
}

function saveProducts(products) {
  localStorage.setItem(PRODUCT_KEY, JSON.stringify(products));
}

function getOrders() {
  try {
    const stored = JSON.parse(localStorage.getItem(ORDER_KEY) || '[]');
    return Array.isArray(stored) ? stored : [];
  } catch {
    return [];
  }
}

function saveOrders(orders) {
  localStorage.setItem(ORDER_KEY, JSON.stringify(orders));
}

function seedProducts() {
  if (getProducts().length) return;

  const starter = [
    { id: crypto.randomUUID(), name: 'تيشيرت كلاسيك', category: 'basic', price: 299, stock: 12, active: true, image: '' },
    { id: crypto.randomUUID(), name: 'جاكيت اوفر سايز', category: 'oversize', price: 499, stock: 8, active: true, image: '' },
    { id: crypto.randomUUID(), name: 'هودي أساسي', category: 'basic', price: 349, stock: 15, active: false, image: '' }
  ];

  saveProducts(starter);
}

function seedOrders() {
  if (getOrders().length) return;

  const starter = [
    { id: '#1001', customer: 'سارة ح', date: '2026-09-18', total: 598, status: 'مكتمل' },
    { id: '#1002', customer: 'أحمد م', date: '2026-09-18', total: 299, status: 'قيد التنفيذ' },
    { id: '#1003', customer: 'محمود س', date: '2026-09-17', total: 499, status: 'مكتمل' }
  ];

  saveOrders(starter);
}

function updateStats() {
  const products = getProducts();
  const orders = getOrders();

  $('totalOrders').textContent = String(orders.length);
  $('totalSales').textContent = money(
    orders.reduce((sum, order) => sum + (Number(order.total) || 0), 0)
  );
  $('totalProducts').textContent = String(products.length);
  $('totalStock').textContent = String(
    products.reduce((sum, item) => sum + (Number(item.stock) || 0), 0)
  );
}

function renderOrders() {
  const orders = getOrders();

  if (!orders.length) {
    $('ordersTable').innerHTML = '<tr><td colspan="5" class="table-empty">لا توجد طلبات حتى الآن</td></tr>';
    return;
  }

  $('ordersTable').innerHTML = orders
    .slice()
    .reverse()
    .map((order) => `
      <tr>
        <td>${order.id}</td>
        <td>${order.customer}</td>
        <td>${order.date}</td>
        <td>${money(order.total)}</td>
        <td><span class="status-pill ${order.status === 'مكتمل' ? 'on' : 'off'}">${order.status}</span></td>
      </tr>
    `)
    .join('');
}

function renderProducts() {
  const products = getProducts();
  const query = $('searchInput')?.value?.trim().toLowerCase() || '';
  const filtered = products.filter((product) => {
    const name = (product.name || '').toLowerCase();
    return !query || name.includes(query);
  });

  if (!filtered.length) {
    $('productsTable').innerHTML = '<tr><td colspan="6" class="table-empty">لا توجد منتجات</td></tr>';
    return;
  }

  $('productsTable').innerHTML = filtered
    .map((product) => {
      const thumb = product.image
        ? `<img src="${product.image}" alt="${product.name}" />`
        : `<span class="product-thumb">${(product.name || 'V').charAt(0)}</span>`;

      return `
        <tr>
          <td>
            <div class="product-table-cell">
              ${thumb}
              <span>${product.name}</span>
            </div>
          </td>
          <td>${product.category === 'oversize' ? 'أوفر سايز' : 'أساسي'}</td>
          <td>${money(product.price)}</td>
          <td>${product.stock}</td>
          <td><span class="status-pill ${product.active ? 'on' : 'off'}">${product.active ? 'ظاهر' : 'مخفي'}</span></td>
          <td>
            <div class="actions">
              <button type="button" class="action-btn" data-action="edit" data-id="${product.id}">تعديل</button>
              <button type="button" class="action-btn danger" data-action="delete" data-id="${product.id}">حذف</button>
            </div>
          </td>
        </tr>
      `;
    })
    .join('');

  document.querySelectorAll('[data-action="edit"]').forEach((button) => {
    button.addEventListener('click', () => editProduct(button.dataset.id));
  });

  document.querySelectorAll('[data-action="delete"]').forEach((button) => {
    button.addEventListener('click', () => deleteProduct(button.dataset.id));
  });
}

function setStatusMessage(element, message, isError = false) {
  element.textContent = message;
  element.style.color = isError ? '#b03939' : '#1f7a45';
}

function showPreview(src) {
  const wrap = $('imagePreviewWrap');
  const preview = $('imagePreview');

  if (!src) {
    wrap.classList.add('hidden');
    preview.src = '';
    currentImage = '';
    return;
  }

  wrap.classList.remove('hidden');
  preview.src = src;
  currentImage = src;
}

function resetForm() {
  $('productForm').reset();
  $('productActive').checked = true;
  $('productStock').value = 0;
  editingProductId = null;
  currentImage = '';
  showPreview('');
  $('formTitle').textContent = 'إضافة منتج';
  $('cancelEditBtn').classList.add('hidden-btn');
  $('productMessage').textContent = '';
}

function editProduct(id) {
  const product = getProducts().find((item) => item.id === id);
  if (!product) return;

  editingProductId = id;
  $('productName').value = product.name || '';
  $('productCategory').value = product.category || 'basic';
  $('productPrice').value = product.price || 0;
  $('productStock').value = product.stock || 0;
  $('productActive').checked = Boolean(product.active);
  $('formTitle').textContent = 'تعديل المنتج';
  $('cancelEditBtn').classList.remove('hidden-btn');
  showPreview(product.image || '');
  $('productMessage').textContent = '';
  $('productName').focus();
}

function deleteProduct(id) {
  const products = getProducts();
  const product = products.find((item) => item.id === id);
  if (!product) return;

  const confirmed = window.confirm(`هل تريد حذف المنتج: ${product.name}?`);
  if (!confirmed) return;

  const next = products.filter((item) => item.id !== id);
  saveProducts(next);
  renderProducts();
  updateStats();
}

function handleProductSubmit(event) {
  event.preventDefault();

  const name = $('productName').value.trim();
  const category = $('productCategory').value;
  const price = Number($('productPrice').value);
  const stock = Number($('productStock').value);
  const active = $('productActive').checked;

  if (!name || !Number.isFinite(price) || !Number.isFinite(stock)) {
    setStatusMessage($('productMessage'), 'يرجى إدخال بيانات المنتج بشكل صحيح.', true);
    return;
  }

  const products = getProducts();
  const payload = {
    id: editingProductId || crypto.randomUUID(),
    name,
    category,
    price,
    stock,
    active,
    image: currentImage
  };

  const nextProducts = editingProductId
    ? products.map((item) => (item.id === editingProductId ? payload : item))
    : [payload, ...products];

  saveProducts(nextProducts);
  renderProducts();
  updateStats();
  resetForm();
  setStatusMessage($('productMessage'), editingProductId ? 'تم تعديل المنتج بنجاح.' : 'تم إضافة المنتج بنجاح.');
}

function handleImageSelect(event) {
  const [file] = event.target.files;
  if (!file) return;

  const reader = new FileReader();
  reader.onload = () => showPreview(reader.result);
  reader.readAsDataURL(file);
}

function handleLoginSubmit(event) {
  event.preventDefault();
  const password = $('passwordInput').value;

  if (password === ADMIN_PASSWORD) {
    localStorage.setItem(ADMIN_SESSION_KEY, 'true');
    $('loginScreen').classList.add('hidden');
    $('adminApp').classList.remove('hidden');
    $('loginMessage').textContent = '';
    return;
  }

  $('loginMessage').textContent = 'كلمة المرور غير صحيحة';
  $('loginMessage').style.color = '#b03939';
}

function logout() {
  localStorage.removeItem(ADMIN_SESSION_KEY);
  $('adminApp').classList.add('hidden');
  $('loginScreen').classList.remove('hidden');
  $('passwordInput').value = '';
}

function init() {
  seedProducts();
  seedOrders();

  $('loginForm').addEventListener('submit', handleLoginSubmit);
  $('logoutBtn').addEventListener('click', logout);
  $('clearOrdersBtn').addEventListener('click', () => {
    const confirmClear = window.confirm('هل تريد حذف جميع الطلبات؟');
    if (!confirmClear) return;
    saveOrders([]);
    renderOrders();
    updateStats();
  });

  $('productForm').addEventListener('submit', handleProductSubmit);
  $('productImage').addEventListener('change', handleImageSelect);
  $('removeImageBtn').addEventListener('click', () => showPreview(''));
  $('cancelEditBtn').addEventListener('click', resetForm);
  $('searchInput').addEventListener('input', renderProducts);

  if (localStorage.getItem(ADMIN_SESSION_KEY) === 'true') {
    $('loginScreen').classList.add('hidden');
    $('adminApp').classList.remove('hidden');
  }

  renderProducts();
  renderOrders();
  updateStats();
  resetForm();
}

document.addEventListener('DOMContentLoaded', init);
