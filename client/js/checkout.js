const form = document.getElementById('checkoutForm');
const token = localStorage.getItem('token');
const orderItemsWrap = document.getElementById('orderItems');
const subtotalPrice = document.getElementById('subtotalPrice');
const shippingPrice = document.getElementById('shippingPrice');
const totalPriceEl = document.getElementById('totalPrice');

if (!token) {
    window.location.href = 'login.html';
}

async function loadCartSummary() {
    try {
        const res = await fetch('http://localhost:5000/api/cart', {
            headers: { Authorization: `Bearer ${token}` }
        });

        if (!res.ok) throw new Error('Failed to load cart');

        const cart = await res.json();

        if (!cart || cart.length === 0) {
            orderItemsWrap.innerHTML = '<p>Your cart is empty.</p>';
            subtotalPrice.textContent = '$0.00';
            totalPriceEl.textContent = '$0.00';
            return;
        }

        let subtotal = 0;
        orderItemsWrap.innerHTML = '';

        cart.forEach(item => {
            const qty = item.quantity || 1;
            const price = parseFloat(item.price || 0);
            const line = qty * price;
            subtotal += line;
            const image = Array.isArray(item.images)
                ? item.images.find(Boolean) || item.image
                : item.image;

            const div = document.createElement('div');
            div.className = 'order-item';
            div.innerHTML = `
                ${image ? `<img src="http://localhost:5000/uploads/products/${image}" alt="${item.name}" />` : '<div class="product-thumb">No image</div>'}
                <div class="info">
                    <div class="name">${item.name}</div>
                    <div class="meta">${qty} × $${price.toFixed(2)}</div>
                </div>
                <div class="line-price">$${line.toFixed(2)}</div>
            `;
            orderItemsWrap.appendChild(div);
        });

        const shipping = subtotal > 0 ? 5.0 : 0.0;
        subtotalPrice.textContent = `$${subtotal.toFixed(2)}`;
        shippingPrice.textContent = `$${shipping.toFixed(2)}`;
        totalPriceEl.textContent = `$${(subtotal + shipping).toFixed(2)}`;

    } catch (error) {
        console.error('Error loading cart summary:', error);
        orderItemsWrap.innerHTML = '<p>Unable to load order summary.</p>';
    }
}

form.addEventListener('submit', async (e) => {
    e.preventDefault();

    if (!token) {
        alert('Please login to checkout');
        window.location.href = 'login.html';
        return;
    }

    const shipping_address = document.getElementById('address').value;
    const payment_method = document.getElementById('paymentMethod').value;

    try {
        const response = await fetch('http://localhost:5000/api/orders', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({ shipping_address, payment_method })
        });

        const data = await response.json();

        if (!response.ok) {
            alert(data.message || 'Unable to place order.');
            return;
        }

        alert('Order Placed Successfully');
        window.location.href = 'orders.html';
    } catch (error) {
        console.error('Checkout error:', error);
        alert('Something went wrong while placing your order.');
    }
});

window.addEventListener('DOMContentLoaded', loadCartSummary);