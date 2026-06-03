const adminTabs = document.querySelectorAll('.tab-button');
const adminSections = document.querySelectorAll('.admin-section');
const newProductBtn = document.getElementById('newProductBtn');
const productSectionAddBtn = document.getElementById('productSectionAddBtn');
const productsBody = document.getElementById('products');
const ordersBody = document.getElementById('orders');
const recentOrdersBody = document.getElementById('recentOrders');
const usersBody = document.getElementById('users');
const totalProductsEl = document.getElementById('totalProducts');
const totalOrdersEl = document.getElementById('totalOrders');
const totalUsersEl = document.getElementById('totalUsers');
const totalRevenueEl = document.getElementById('totalRevenue');
const productFormSection = document.getElementById('productFormSection');
const productForm = document.getElementById('productForm');
const cancelFormBtn = document.getElementById('cancelFormBtn');
const productNameInput = document.getElementById('productName');
const productDescriptionInput = document.getElementById('productDescription');
const productPriceInput = document.getElementById('productPrice');
const productStockInput = document.getElementById('productStock');
const productCategoryInput = document.getElementById('productCategory');
const existingImages = document.getElementById('existingImages');
const imageInputs = Array.from(document.querySelectorAll('input[name="images"]'));

let editingProductId = null;

function escapeHtml(value) {
    return String(value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

function setActiveTab(targetId) {
    adminTabs.forEach((tab) => {
        tab.classList.toggle('active', tab.dataset.target === targetId);
    });
    adminSections.forEach((section) => {
        section.classList.toggle('hidden', section.id !== targetId);
    });
}

function updateDashboard(overview) {
    totalProductsEl.textContent = overview.totalProducts || 0;
    totalOrdersEl.textContent = overview.totalOrders || 0;
    totalUsersEl.textContent = overview.totalUsers || 0;
    totalRevenueEl.textContent = `$${Number(overview.totalRevenue || 0).toFixed(2)}`;
}

function formatDate(timestamp) {
    const date = new Date(timestamp);
    if (Number.isNaN(date.getTime())) {
        return '-';
    }
    return date.toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

function createProductRow(product) {
    const image = Array.isArray(product.images)
        ? product.images.find(Boolean)
        : product.image;

    return `
        <tr>
            <td>${product.id}</td>
            <td>
                <div class="product-cell">
                    ${image ? `<a class="product-link" href="admin-product-details.html?id=${product.id}"><img src="http://localhost:5000/uploads/products/${image}" alt="${escapeHtml(product.name)}" /></a>` : '<div class="product-thumb">?</div>'}
                    <div>
                        <a class="product-link" href="admin-product-details.html?id=${product.id}"><strong>${escapeHtml(product.name)}</strong></a>
                        <div class="product-meta">${escapeHtml(product.description || 'No description').slice(0, 55)}</div>
                    </div>
                </div>
            </td>
            <td>${escapeHtml(product.category_name || 'Uncategorized')}</td>
            <td>$${Number(product.price || 0).toFixed(2)}</td>
            <td>${product.stock ?? 0}</td>
            <td class="table-actions">
                <button class="secondary-button" type="button" onclick="startProductEdit(${product.id})">Edit</button>
                
                <button class="remove-button" type="button" onclick="deleteProduct(${product.id})">Delete</button>
            </td>
        </tr>
    `;
}

function createOrderRow(order) {
    return `
        <tr>
            <td>${order.id}</td>
            <td>${escapeHtml(order.name || order.email || 'Unknown')}</td>
            <td>$${Number(order.total_price || order.total || 0).toFixed(2)}</td>
            <td>${escapeHtml(order.status || 'Pending')}</td>
            <td>${formatDate(order.created_at || order.createdAt || '')}</td>
        </tr>
    `;
}

function createUserRow(user) {
    return `
        <tr>
            <td>${user.id}</td>
            <td>${escapeHtml(user.name || '—')}</td>
            <td>${escapeHtml(user.email || '—')}</td>
            <td>${escapeHtml(user.role || 'user')}</td>
            <td>${formatDate(user.created_at || user.createdAt || '')}</td>
        </tr>
    `;
}

async function loadProducts() {
    try {
        const response = await fetch('http://localhost:5000/api/products?page=1&limit=100');
        const products = await response.json();

        if (!Array.isArray(products) || products.length === 0) {
            productsBody.innerHTML = '<tr><td colspan="6" class="empty-state">No products available.</td></tr>';
            return;
        }

        productsBody.innerHTML = products.map(createProductRow).join('');
    } catch (error) {
        console.error('Products load failed', error);
        productsBody.innerHTML = '<tr><td colspan="6" class="empty-state">Unable to load products.</td></tr>';
    }
}

async function loadOrders() {
    try {
        const response = await fetch('http://localhost:5000/api/admin/orders', {
            headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`
            }
        });

        const orders = await response.json();

        if (!Array.isArray(orders) || orders.length === 0) {
            ordersBody.innerHTML = '<tr><td colspan="5" class="empty-state">No orders found.</td></tr>';
            recentOrdersBody.innerHTML = '<tr><td colspan="5" class="empty-state">No recent orders.</td></tr>';
            return;
        }

        ordersBody.innerHTML = orders.map(createOrderRow).join('');
        recentOrdersBody.innerHTML = orders.slice(0, 5).map(createOrderRow).join('');
    } catch (error) {
        console.error('Orders load failed', error);
        ordersBody.innerHTML = '<tr><td colspan="5" class="empty-state">Unable to load orders.</td></tr>';
        recentOrdersBody.innerHTML = '<tr><td colspan="5" class="empty-state">Unable to load recent orders.</td></tr>';
    }
}

async function loadUsers() {
    try {
        const response = await fetch('http://localhost:5000/api/admin/users', {
            headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`
            }
        });

        const users = await response.json();

        if (!Array.isArray(users) || users.length === 0) {
            usersBody.innerHTML = '<tr><td colspan="5" class="empty-state">No users found.</td></tr>';
            return;
        }

        usersBody.innerHTML = users.map(createUserRow).join('');
    } catch (error) {
        console.error('Users load failed', error);
        usersBody.innerHTML = '<tr><td colspan="5" class="empty-state">Unable to load users.</td></tr>';
    }
}

async function loadDashboard() {
    try {
        const response = await fetch('http://localhost:5000/api/admin/dashboard', {
            headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`
            }
        });

        const stats = await response.json();
        updateDashboard(stats);
    } catch (error) {
        console.error('Dashboard load failed', error);
    }
}

function resetProductForm() {
    editingProductId = null;
    productForm.reset();
    existingImages.innerHTML = '';
    document.getElementById('saveProductButton').textContent = 'Save product';
}

function openProductForm(titleText = 'Add Product') {
    productFormSection.classList.remove('hidden');
    document.getElementById('saveProductButton').textContent = titleText;
    setActiveTab('productsSection');
}

async function startProductEdit(id) {
    try {
        const response = await fetch(`http://localhost:5000/api/products/${id}`);
        if (!response.ok) {
            alert('Unable to load product for editing.');
            return;
        }

        const product = await response.json();
        editingProductId = id;
        productNameInput.value = product.name || '';
        productDescriptionInput.value = product.description || '';
        productPriceInput.value = product.price || '';
        productStockInput.value = product.stock || '';
        productCategoryInput.value = product.category_id || '';

        const images = Array.isArray(product.images) && product.images.length ? product.images : [product.image].filter(Boolean);
        existingImages.innerHTML = images.map((image) => `
            <div class="image-preview">
                <img src="http://localhost:5000/uploads/products/${image}" alt="Product image" />
            </div>
        `).join('');

        openProductForm('Update product');
    } catch (error) {
        console.error('Product edit load failed', error);
        alert('Unable to load product details.');
    }
}

async function submitProductForm(event) {
    event.preventDefault();

    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = 'login.html';
        return;
    }

    const formData = new FormData();
    formData.append('name', productNameInput.value.trim());
    formData.append('description', productDescriptionInput.value.trim());
    formData.append('price', productPriceInput.value);
    formData.append('stock', productStockInput.value);
    formData.append('category_id', productCategoryInput.value);

    imageInputs.forEach((input) => {
        if (input.files && input.files[0]) {
            formData.append('images', input.files[0]);
        }
    });

    const url = editingProductId
        ? `http://localhost:5000/api/products/${editingProductId}`
        : 'http://localhost:5000/api/products';
    const method = editingProductId ? 'PUT' : 'POST';

    try {
        const response = await fetch(url, {
            method,
            headers: {
                Authorization: `Bearer ${token}`
            },
            body: formData
        });

        const data = await response.json();
        if (!response.ok) {
            alert(data.message || 'Unable to save product.');
            return;
        }

        resetProductForm();
        productFormSection.classList.add('hidden');
        await loadProducts();
        setActiveTab('productsSection');
    } catch (error) {
        console.error('Save product failed:', error);
        alert('Unable to save product.');
    }
}

async function deleteProduct(id) {
    const confirmation = confirm('Delete this product? This action cannot be undone.');
    if (!confirmation) {
        return;
    }

    try {
        const response = await fetch(`http://localhost:5000/api/products/${id}`, {
            method: 'DELETE',
            headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`
            }
        });

        const data = await response.json();
        if (!response.ok) {
            alert(data.message || 'Unable to delete product.');
            return;
        }

        await loadProducts();
    } catch (error) {
        console.error('Delete product failed', error);
        alert('Unable to delete product.');
    }
}

function initializeTabs() {
    adminTabs.forEach((tab) => {
        tab.addEventListener('click', () => {
            setActiveTab(tab.dataset.target);
        });
    });
}

window.startProductEdit = startProductEdit;
window.deleteProduct = deleteProduct;

window.addEventListener('DOMContentLoaded', async () => {
    if (!requireAdmin()) {
        return;
    }

    initializeTabs();
    setActiveTab('dashboardSection');
    await Promise.all([loadProducts(), loadOrders(), loadUsers(), loadDashboard()]);

    if (newProductBtn) {
        newProductBtn.addEventListener('click', () => {
            resetProductForm();
            openProductForm('Add product');
        });
    }

    if (productSectionAddBtn) {
        productSectionAddBtn.addEventListener('click', () => {
            resetProductForm();
            openProductForm('Add product');
        });
    }

    cancelFormBtn.addEventListener('click', () => {
        productFormSection.classList.add('hidden');
        resetProductForm();
    });

    productForm.addEventListener('submit', submitProductForm);
});
