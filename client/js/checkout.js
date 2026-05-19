const form =
    document.getElementById('checkoutForm');

const token =
    localStorage.getItem('token');

if (!token) {
    window.location.href = 'login.html';
}


form.addEventListener('submit', async (e) => {

    e.preventDefault();

    const token =
        localStorage.getItem('token');

    if (!token) {
        alert('Please login to checkout');
        window.location.href = 'login.html';
        return;
    }

    const shipping_address =
        document.querySelectorAll('input')[1].value;

    try {
        const response = await fetch(
            'http://localhost:5000/api/orders',
            {
                method: 'POST',

                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },

                body: JSON.stringify({
                    shipping_address,
                    payment_method:
                        'Cash On Delivery'
                })
            }
        );

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