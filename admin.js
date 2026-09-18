const PRODUCT_STORAGE_KEY = 'vyro_store_products';
const ORDER_STORAGE_KEY = 'vyro_store_orders';
const SESSION_STORAGE_KEY = 'vyro_store_session';
const ADMIN_PASSWORD = 'vyro123456';

let products = JSON.parse(localStorage.getItem(PRODUCT_STORAGE_KEY) || 'null') || [
  { id: 1, name: 'Aero Black Tee', category: 'basic', price: 449, stock: 15, active: true, image: '' },
  { id: 2, name: 'Core Oversize', category: 'oversize', price: 599, stock: 8, active: true, image: '' },
  { id: 3, name: 'Signal Graphic', category: 'basic', price: 529, stock: 11, active: true, image: '' },
  { id: 4, name: 'Urban Fade', category: 'oversize', price: 649, stock: 4, active: true, image: '' },
  { id: 5, name: 'Minimal White', category: 'basic', price: 470, stock: 18, active: true, image: '' },
  { id: 6, name: 'Night Drop', category: 'oversize', price: 699, stock: 6, active: true, image: '' }
];

let orders = JSON.parse(localStorage.getItem(ORDER_STORAGE_KEY) || '[]');
let editingProductId = null;
let selectedImage = '';

const money = (value) => `${Number(value).toLocaleString('ar-EG')} ج.م`;
const $ = (id) => document.getElementById(id);

function saveProducts() {
  localStorage.setItem(PRODUCT_STORAGE_KEY, JSON.stringify(products));
}

function saveOrders() {
  localStorage.setItem(ORDER_STORAGE_KEY, JSON.stringify(orders));
}

function renderStats() {
  $('totalOrders').textContent = String(orders.length);
  $('totalSales').textContent = money(orders.reduce((sum, order) => sum + Number(order.total || 0), 0));
  $('totalProducts').textContent = String(products.length);
  $('totalStock').textContent = String(products.reduce((sum, product) => sum + Number(product.stock || 0), 0));
}

function renderOrders() {
  if (!orders.length) {
    $('ordersTable').innerHTML = '<tr><td colspan="5" class="table-empty">لا توجد طلبات حتى الآن.</td></tr>';
    return;
  }

  $('ordersTable').innerHTML = orders.slice(0, 20).map((order) => `
    <tr>
      <td><strong>${order.id}</strong></td>
      <td>${order.user?.name || 'غير معروف'}<br><small>${order.phone || ''}</small></td>
      <td>${new Date(order.createdAt).toLocaleDateString('ar-EG')}</td>
      <td>${money(order.total || 0)}</td>
      <td><span class="status-pill on">${order.status || 'جديد'}</span></td>
    </tr>
  `).join('');
}

function renderProductsTable() {
  const query = $('searchInput').value.trim().toLowerCase();
  const filteredProducts = products.filter((product) => product.name.toLowerCase().includes(query));

  $('productsTable').innerHTML = filteredProducts.map((product) => `
    <tr>
      <td><div class="product-table-cell">${product.image ? `<img src="${product.image}" alt="${product.name}">` : '<span class="product-thumb">V</span>'}<strong>${product.name}</strong></div></td>
      <td>${product.category === 'oversize' ? 'أوفر سايز' : 'أساسي'}</td>
      <td>${money(product.price)}</td>
      <td>${product.stock}</td>
      <td><span class="status-pill ${product.active ? 'on' : 'off'}">${product.active ? 'ظاهر' : 'مخفي'}</span></td>
      <td><div class="actions"><button type="button" class="action-btn" data-edit-id="${product.id}">تعديل</button><button type="button" class="action-btn danger" data-delete-id="${product.id}">حذف</button></div></td>
    </tr>
  `).join('');

  document.querySelectorAll('[data-edit-id]').forEach((button) => button.addEventListener('click', () => fillFormForEdit(Number(button.dataset.editId))));
  document.querySelectorAll('[data-delete-id]').forEach((button) => button.addEventListener('click', () => deleteProduct(Number(button.dataset.deleteId))));
}

function renderDashboard() {
  renderStats();
  renderOrders();
  renderProductsTable();
}

function showImagePreview(image) {
  selectedImage = image || '';
  $('imagePreview').hidden = !selectedImage;
  $('imagePreviewImg').src = selectedImage;
}

function fillFormForEdit(productId) {
  const product = products.find((item) => item.id === productId);
  if (!product) return;

  editingProductId = productId;
  $('productName').value = product.name;
  $('productCategory').value = product.category;
  $('productPrice').value = product.price;
  $('productStock').value = product.stock;
  $('productActive').checked = product.active;
  $('productImage').value = '';
  showImagePreview(product.image || '');
  $('formTitle').textContent = 'تعديل منتج';
  $('cancelEditBtn').classList.remove('hidden-btn');
  window.scrollTo({ top: $('productForm').offsetTop - 30, behavior: 'smooth' });
}

function resetForm() {
  editingProductId = null;
  selectedImage = '';
  $('productForm').reset();
  $('productActive').checked = true;
  $('productImage').value = '';
  showImagePreview('');
  $('formTitle').textContent = 'إضافة منتج';
  $('cancelEditBtn').classList.add('hidden-btn');
}

function deleteProduct(productId) {
  if (!confirm('هل تريد حذف هذا المنتج؟')) return;
  products = products.filter((product) => product.id !== productId);
  saveProducts();
  renderDashboard();
}

function handleImageChange(event) {
  const file = event.target.files[0];
  if (!file) return;
  if (!file.type.startsWith('image/')) {
    $('productMessage').textContent = 'من فضلك اختر ملف صورة صحيح.';
    event.target.value = '';
    return;
  }
  if (file.size > 1024 * 1024) {
    $('productMessage').textContent = 'حجم الصورة يجب ألا يتجاوز 1 ميجابايت.';
    event.target.value = '';
    return;
  }

  const reader = new FileReader();
  reader.onload = () => showImagePreview(reader.result);
  reader.readAsDataURL(file);
}

function handleProductSubmit(event) {
  event.preventDefault();

  const oldProduct = editingProductId ? products.find((item) => item.id === editingProductId) : null;
  const product = {
    id: editingProductId || Date.now(),
    name: $('productName').value.trim(),
    category: $('productCategory').value,
    price: Number($('productPrice').value),
    stock: Number($('productStock').value),
    active: $('productActive').checked,
    image: selectedImage || oldProduct?.image || ''
  };

  if (!product.name || product.price < 0 || product.stock < 0) {
    $('productMessage').textContent = 'يرجى ملء بيانات المنتج بشكل صحيح.';
    return;
  }

  products = editingProductId
    ? products.map((item) => item.id === editingProductId ? product : item)
    : [product, ...products];

  saveProducts();
  renderDashboard();
  resetForm();
  $('productMessage').textContent = 'تم حفظ المنتج والصورة بنجاح.';
  setTimeout(() => $('productMessage').textContent = '', 1800);
}

function loginAdmin(event) {
  event.preventDefault();
  if ($('passwordInput').value === ADMIN_PASSWORD) {
    sessionStorage.setItem(SESSION_STORAGE_KEY, '1');
    showDashboard();
  } else {
    $('loginMessage').textContent = 'كلمة المرور غير صحيحة';
  }
}

function showDashboard() {
  $('loginScreen').classList.add('hidden');
  $('adminApp').classList.remove('hidden');
  renderDashboard();
}

function logoutAdmin() {
  sessionStorage.removeItem(SESSION_STORAGE_KEY);
  location.reload();
}

$('loginForm').addEventListener('submit', loginAdmin);
$('logoutBtn').addEventListener('click', logoutAdmin);
$('cancelEditBtn').addEventListener('click', resetForm);
$('productForm').addEventListener('submit', handleProductSubmit);
$('productImage').addEventListener('change', handleImageChange);
$('removeImageBtn').addEventListener('click', () => { selectedImage = ''; $('productImage').value = ''; showImagePreview(''); });
$('searchInput').addEventListener('input', renderProductsTable);
$('clearOrdersBtn').addEventListener('click', () => {
  if (!confirm('هل تريد حذف جميع الطلبات؟')) return;
  orders = [];
  saveOrders();
  renderDashboard();
});

if (sessionStorage.getItem(SESSION_STORAGE_KEY) === '1') showDashboard();
