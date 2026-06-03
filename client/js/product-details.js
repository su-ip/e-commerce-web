const params = new URLSearchParams(window.location.search);
const id = params.get('id');

const mainImage = document.getElementById('mainImage');
const thumbnailsWrap = document.getElementById('thumbnails');
const productName = document.getElementById('productName');
const productPrice = document.getElementById('productPrice');
const productDescription = document.getElementById('productDescription');
const addToCartBtn = document.getElementById('addToCartBtn');
const checkoutBtn = document.getElementById('checkoutBtn');
const qtyInput = document.getElementById('qtyInput');
const qtyMinus = document.getElementById('qtyMinus');
const qtyPlus = document.getElementById('qtyPlus');

async function addToCart(productId, quantity = 1) {
    const token = localStorage.getItem('token');

    if (!token) {
        alert('Please login first');
        window.location.href = 'login.html';
        return false;
    }

    try {
        const response = await fetch('http://localhost:5000/api/cart', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({
                product_id: productId,
                quantity: quantity
            })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Failed to add to cart');
        }

        alert(data.message || 'Product added to cart');
        return true;
    } catch (error) {
        console.error('Error adding to cart:', error);
        alert('Could not add product to cart.');
        return false;
    }
}

async function getProduct() {
    if (!id) {
        document.body.innerHTML = '<p>Product not found.</p>';
        return;
    }

    const response = await fetch(`http://localhost:5000/api/products/${id}`);
    if (!response.ok) {
        document.body.innerHTML = '<p>Failed to load product.</p>';
        return;
    }

    const product = await response.json();

    // Images: support multiple images if provided, otherwise repeat main image to populate thumbnails
    const images = Array.isArray(product.images) && product.images.length
        ? product.images.filter(Boolean)
        : product.image
            ? [product.image]
            : [];

    thumbnailsWrap.innerHTML = '';

    if (images.length > 0) {
        mainImage.src = `http://localhost:5000/uploads/products/${images[0]}`;
        mainImage.alt = product.name;

        images.forEach((img) => {
            const t = document.createElement('div');
            t.className = 'thumb';
            const i = document.createElement('img');
            i.src = `http://localhost:5000/uploads/products/${img}`;
            i.alt = product.name;
            t.appendChild(i);
            t.addEventListener('click', () => {
                mainImage.src = i.src;
            });
            thumbnailsWrap.appendChild(t);
        });
    } else {
        mainImage.src = '';
        mainImage.alt = 'No image available';
        thumbnailsWrap.innerHTML = '<div class="empty-state">No images available</div>';
    }

    // Fill details
    productName.textContent = product.name;
    productPrice.textContent = `$${product.price}`;
    productDescription.textContent = product.description;

    // Wire buttons
    // Quantity handlers
    if (qtyMinus && qtyPlus && qtyInput) {
        qtyMinus.addEventListener('click', () => {
            const v = Math.max(1, parseInt(qtyInput.value || '1') - 1);
            qtyInput.value = v;
        });

        qtyPlus.addEventListener('click', () => {
            const v = Math.max(1, parseInt(qtyInput.value || '1') + 1);
            qtyInput.value = v;
        });
    }

    addToCartBtn.addEventListener('click', async () => {
        const q = Math.max(1, parseInt(qtyInput.value || '1'));
        await addToCart(product.id, q);
    });

    checkoutBtn.addEventListener('click', async () => {
        const q = Math.max(1, parseInt(qtyInput.value || '1'));
        const ok = await addToCart(product.id, q);
        if (ok) {
            window.location.href = 'checkout.html';
        }
    });
}

getProduct();