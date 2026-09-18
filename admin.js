const PRODUCT_STORAGE_KEY = 'vyro_store_products';
const ORDER_STORAGE_KEY = 'vyro_store_orders';
const SESSION_STORAGE_KEY = 'vyro_store_session';
const ADMIN_PASSWORD = 'vyro123456';

let products = JSON.parse(localStorage.getItem(PRODUCT_STORAGE_KEY) || 'null') || [
  { id: 1, name: 'Aero Black Tee', category: 'basic', price: 449, stock: 15, active: true },
  { id: 2, name: 'Core Oversize', category: 'oversize', price: 599, stock: 8, active: true },
  { id: 3, name: 'Signal Graphic', category: 'basic', price: 529, stock: 11, active: true },
  { id: 4, name: 'Urban Fade', category: 'oversize', price: 649, stock: 4, active: true },
  { id: 5, name: 'Minimal White', category: 'basic', price: 470, stock: 18, active: true },
  { id: 6, name: 'Night Drop', category: 'oversize', price: 699, stock: 6, active: true }
];

let orders = JSON.parse(localStorage.getItem(ORDER_STORAGE_KEY) || '[]');
let editingProductId = null;

const money = (value) => `${Number(value).toLocaleString('ar-EG')} ج.م`;

function saveProducts() {
  localStorage.setItem(PRODUCT_STORAGE_KEY, JSON.stringify(products));
}

function saveOrders() {
  localStorage.setItem(ORDER_STORAGE_KEY, JSON.stringify(orders));
}

function renderStats() {
  const totalProducts = products.length;
  const totalStock = products.reduce((sum, product) => sum + Number(product.stock || 0), 0);
  const totalSales = orders.reduce((sum, order) => sum + Number(order.total || 0), 0);

  document.getElementById('totalOrders').textContent = String(orders.length);
  document.getElementById('totalSales').textContent = money(totalSales);
  document.getElementById('totalProducts').textContent = String(totalProducts);
  document.getElementById('totalStock').textContent = String(totalStock);
}

function renderOrders() {
  const table = document.getElementById('ordersTable');

  if (!orders.length) {
    table.innerHTML = `
      <tr>
        <td colspan="5" style="text-align:center; color:#6d6a66; padding:24px;">لا توجد طلبات حتى الآن.</td>
      </tr>
    `;
    return;
  }

  table.innerHTML = orders.slice(0, 20).map((order) => `
    <tr>
      <td><strong>${order.id}</strong></td>
      <td>${order.user?.name || 'غير معروف'}<br /><small>${order.phone || ''}</small></td>
      <td>${new Date(order.createdAt).toLocaleDateString('ar-EG')}</td>
      <td>${money(order.total || 0)}</td>
      <td><span class="status-pill on">${order.status || 'جديد'}</span></td>
    </tr>
  `).join('');
}

function renderProductsTable() {
  const query = document.getElementById('searchInput').value.trim().toLowerCase();
  const table = document.getElementById('productsTable');

  const filteredProducts = products.filter((product) => product.name.toLowerCase().includes(query));

  table.innerHTML = filteredProducts.map((product) => `
    <tr>
      <td><strong>${product.name}</strong></td>
      <td>${product.category === 'oversize' ? 'أوفر سايز' : 'أساسي'}</td>
      <td>${money(product.price)}</td>
      <td>${product.stock}</td>
      <td><span class="status-pill ${product.active ? 'on' : 'off'}">${product.active ? 'ظاهر' : 'مخفي'}</span></td>
      <td>
        <div class="actions">
          <button type="button" class="action-btn" data-edit-id="${product.id}">تعديل</button>
          <button type="button" class="action-btn danger" data-delete-id="${product.id}">حذف</button>
        </div>
      </td>
    </tr>
  `).join('');

  document.querySelectorAll('[data-edit-id]').forEach((button) => {
    button.addEventListener('click', () => fillFormForEdit(Number(button.dataset.editId)));
  });

  document.querySelectorAll('[data-delete-id]').forEach((button) => {
    button.addEventListener('click', () => deleteProduct(Number(button.dataset.deleteId)));
  });
}

function renderDashboard() {
  renderStats();
  renderOrders();
  renderProductsTable();
}

function fillFormForEdit(productId) {
  const product = products.find((item) => item.id === productId);
  if (!product) return;

  editingProductId = productId;
  document.getElementById('productName').value = product.name;
  document.getElementById('productCategory').value = product.category;
  document.getElementById('productPrice').value = product.price;
  document.getElementById('productStock').value = product.stock;
  document.getElementById('productActive').checked = product.active;
  document.getElementById('formTitle').textContent = 'تعديل منتج';
  document.getElementById('cancelEditBtn').classList.remove('hidden-btn');
}

function resetForm() {
  editingProductId = null;
  document.getElementById('productForm').reset();
  document.getElementById('productActive').checked = true;
  document.getElementById('formTitle').textContent = 'إضافة منتج';
  document.getElementById('cancelEditBtn').classList.add('hidden-btn');
}

function deleteProduct(productId) {
  if (!confirm('هل تريد حذف هذا المنتج؟')) return;

  products = products.filter((product) => product.id !== productId);
  saveProducts();
  renderDashboard();
}

function handleProductSubmit(event) {
  event.preventDefault();

  const product = {
    id: editingProductId || Date.now(),
    name: document.getElementById('productName').value.trim(),
    category: document.getElementById('productCategory').value,
    price: Number(document.getElementById('productPrice').value),
    stock: Number(document.getElementById('productStock').value),
    active: document.getElementById('productActive').checked
  };

  if (!product.name || !product.price && product.price !== 0) {
    document.getElementById('productMessage').textContent = 'يرجى ملء بيانات المنتج بشكل صحيح.';
    return;
  }

  if (editingProductId) {
    products = products.map((item) => item.id === editingProductId ? product : item);
  } else {
    products.unshift(product);
  }

  saveProducts();
  renderDashboard();
  resetForm();
  document.getElementById('productMessage').textContent = 'تم حفظ المنتج بنجاح.';
  setTimeout(() => {
    document.getElementById('productMessage').textContent = '';
  }, 1500);
}

function loginAdmin(event) {
  event.preventDefault();
  const enteredPassword = document.getElementById('passwordInput').value;

  if (enteredPassword === ADMIN_PASSWORD) {
    sessionStorage.setItem(SESSION_STORAGE_KEY, '1');
    showDashboard();
  } else {
    document.getElementById('loginMessage').textContent = 'كلمة المرور غير صحيحة';
  }
}

function showDashboard() {
  document.getElementById('loginScreen').classList.add('hidden');
  document.getElementById('adminApp').classList.remove('hidden');
  renderDashboard();
}

function logoutAdmin() {
  sessionStorage.removeItem(SESSION_STORAGE_KEY);
  location.reload();
}

function initAdmin() {
  const isLogged = sessionStorage.getItem(SESSION_STORAGE_KEY) === '1';
  if (isLogged) {
    showDashboard();
  }
}

document.getElementById('loginForm').addEventListener('submit', loginAdmin);
document.getElementById('logoutBtn').addEventListener('click', logoutAdmin);
document.getElementById('cancelEditBtn').addEventListener('click', resetForm);
document.getElementById('productForm').addEventListener('submit', handleProductSubmit);
document.getElementById('searchInput').addEventListener('input', renderProductsTable);
document.getElementById('clearOrdersBtn').addEventListener('click', () => {
  if (!confirm('هل تريد حذف جميع الطلبات؟')) return;
  orders = [];
  saveOrders();
  renderDashboard();
});

initAdmin();






















































