const params = new URLSearchParams(window.location.search);
const productId = params.get('id');

const adminMainImage = document.getElementById('adminMainImage');
const adminThumbnails = document.getElementById('adminThumbnails');
const adminProductName = document.getElementById('adminProductName');
const adminProductPrice = document.getElementById('adminProductPrice');
const adminProductDescription = document.getElementById('adminProductDescription');
const adminProductCategory = document.getElementById('adminProductCategory');
const adminProductStock = document.getElementById('adminProductStock');
const adminProductSku = document.getElementById('adminProductSku');
const editProductBtn = document.getElementById('editProductBtn');
const backToListBtn = document.getElementById('backToListBtn');

async function loadAdminProduct() {
    if (!productId) {
        document.body.innerHTML = '<p>Product ID missing.</p>';
        return;
    }

    try {
        const response = await fetch(`http://localhost:5000/api/products/${productId}`);
        if (!response.ok) {
            document.body.innerHTML = '<p>Failed to load product details.</p>';
            return;
        }

        const product = await response.json();
        const images = Array.isArray(product.images) && product.images.length
            ? product.images
            : Array.from({ length: 4 }).map(() => product.image);

        adminMainImage.src = `http://localhost:5000/uploads/products/${images[0]}`;
        adminMainImage.alt = product.name;

        adminThumbnails.innerHTML = images
            .map((src) => `
                <div class="thumb">
                    <img src="http://localhost:5000/uploads/products/${src}" alt="${product.name}" />
                </div>
            `)
            .join('');

        adminThumbnails.querySelectorAll('.thumb img').forEach((img) => {
            img.addEventListener('click', () => {
                adminMainImage.src = img.src;
            });
        });

        adminProductName.textContent = product.name;
        adminProductPrice.textContent = `$${Number(product.price).toFixed(2)}`;
        adminProductDescription.textContent = product.description;
        adminProductCategory.textContent = product.category_name || 'Uncategorized';
        adminProductStock.textContent = product.stock;
        adminProductSku.textContent = `#${product.id}`;

        editProductBtn.addEventListener('click', () => {
            window.location.href = `admin-product-form.html?id=${product.id}`;
        });

        backToListBtn.addEventListener('click', () => {
            window.location.href = 'admin.html';
        });
    } catch (error) {
        console.error('Unable to load admin product:', error);
        document.body.innerHTML = '<p>Unable to load product details.</p>';
    }
}

window.addEventListener('DOMContentLoaded', () => {
    if (requireAdmin()) {
        loadAdminProduct();
    }
});