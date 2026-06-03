const params = new URLSearchParams(window.location.search);
const productId = params.get('id');

const productForm = document.getElementById('productForm');
const formTitle = document.getElementById('formTitle');
const formSubtitle = document.getElementById('formSubtitle');
const existingImages = document.getElementById('existingImages');
const cancelFormBtn = document.getElementById('cancelFormBtn');

const productNameInput = document.getElementById('productName');
const productDescriptionInput = document.getElementById('productDescription');
const productPriceInput = document.getElementById('productPrice');
const productStockInput = document.getElementById('productStock');
const productCategoryInput = document.getElementById('productCategory');
const imageInputs = Array.from(document.querySelectorAll('input[name="images"]'));

async function loadFormProduct() {
    if (!productId) {
        return;
    }

    try {
        const response = await fetch(`http://localhost:5000/api/products/${productId}`);
        if (!response.ok) {
            alert('Could not load product details.');
            window.location.href = 'admin.html';
            return;
        }

        const product = await response.json();

        formTitle.textContent = 'Edit product';
        formSubtitle.textContent = 'Update product details or replace existing images.';

        productNameInput.value = product.name;
        productDescriptionInput.value = product.description;
        productPriceInput.value = product.price;
        productStockInput.value = product.stock;
        productCategoryInput.value = product.category_id || '';

        const images = Array.isArray(product.images) && product.images.length
            ? product.images
            : [product.image].filter(Boolean);

        existingImages.innerHTML = images
            .map((image) => `
                <div class="image-preview">
                    <img src="http://localhost:5000/uploads/products/${image}" alt="Product image" />
                </div>
            `)
            .join('');
    } catch (error) {
        console.error('Load form product failed:', error);
        alert('Could not load product data.');
    }
}

async function submitForm(event) {
    event.preventDefault();

    const token = localStorage.getItem('token');
    if (!token) {
        alert('Please login first.');
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

    const url = productId
        ? `http://localhost:5000/api/products/${productId}`
        : 'http://localhost:5000/api/products';

    const method = productId ? 'PUT' : 'POST';

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

        window.location.href = productId
            ? `admin-product-details.html?id=${productId}`
            : 'admin.html';
    } catch (error) {
        console.error('Save product failed:', error);
        alert('Unable to save product.');
    }
}

window.addEventListener('DOMContentLoaded', () => {
    if (!requireAdmin()) {
        return;
    }

    loadFormProduct();

    productForm.addEventListener('submit', submitForm);
    cancelFormBtn.addEventListener('click', () => {
        window.location.href = 'admin.html';
    });
});