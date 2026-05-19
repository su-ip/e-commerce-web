// PERFORMANCE NOTE: Minify this JavaScript file in production using tools like UglifyJS or Terser
// PERFORMANCE NOTE: Enable GZIP compression on the server for JS files

const cartContainer =
    document.getElementById('cartItems');

const totalPrice =
    document.getElementById('totalPrice');


const token =
    localStorage.getItem('token');

if (!token) {
    alert('Please login first');
    window.location.href = 'login.html';
}


async function getCart() {

    if (!token) {
        cartContainer.innerHTML = '<p>Please login to view your cart.</p>';
        totalPrice.innerText = '';
        return;
    }

    try {

        const response = await fetch(
            'http://localhost:5000/api/cart',
            {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        );

        if (!response.ok) {
            throw new Error('Failed to fetch cart');
        }

        const cart = await response.json();

        cartContainer.innerHTML = '';

        if (cart.length === 0) {
            cartContainer.innerHTML = '<p>Your cart is empty.</p>';
            totalPrice.innerText = 'Total: $0.00';
            return;
        }

        let total = 0;


        cart.forEach((item) => {

            const subtotal =
                parseFloat(item.price) * item.quantity;

            total += subtotal;


            cartContainer.innerHTML += `

            <div class="product-card">

                <img
                    src="http://localhost:5000/uploads/products/${item.image}"
                    width="200"
                    loading="lazy"
                    alt="${item.name}"
                />

                <div class="product-info">
                    <h3>${item.name}</h3>
                    <h4>$${item.price}</h4>

                    <div class="quantity-controls">
                        <button onclick="changeQuantity(${item.id}, ${item.quantity - 1})">-</button>
                        <span>${item.quantity}</span>
                        <button onclick="changeQuantity(${item.id}, ${item.quantity + 1})">+</button>
                    </div>

                    <p>
                        Subtotal:
                        $${subtotal.toFixed(2)}
                    </p>

                    <button class="remove-button" onclick="removeItem(${item.id})">
                        Remove
                    </button>
                </div>

            </div>
        `;
        });

        totalPrice.innerText =
            `Total: $${total.toFixed(2)}`;

    } catch (error) {

        console.error('Error loading cart:', error);
        cartContainer.innerHTML = '<p>Error loading cart. Please try again.</p>';
        totalPrice.innerText = '';
    }
}


async function removeItem(id) {

    await fetch(
        `http://localhost:5000/api/cart/${id}`,
        {
            method: 'DELETE',

            headers: {
                Authorization: `Bearer ${token}`
            }
        }
    );

    getCart();
}


async function changeQuantity(id, quantity) {
    if (quantity < 1) {
        removeItem(id);
        return;
    }

    await fetch(
        `http://localhost:5000/api/cart/${id}`,
        {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({
                quantity
            })
        }
    );

    getCart();
}


function checkout() {

    const token = localStorage.getItem('token');

    if (!token) {
        alert('Please login to checkout');
        window.location.href = 'login.html';
        return;
    }

    window.location.href =
        'checkout.html';
}


getCart();