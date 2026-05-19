const ordersContainer =
    document.getElementById('orders');


const token =
    localStorage.getItem('token');


async function getOrders() {

    if (!token) {
        window.location.href = 'login.html';
        return;
    }

    try {
        const response = await fetch(
            'http://localhost:5000/api/orders',
            {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        );

        if (!response.ok) {
            throw new Error('Failed to fetch orders');
        }

        const orders = await response.json();

        console.log(orders);

        ordersContainer.innerHTML = '';

        orders.forEach((order) => {

            ordersContainer.innerHTML += `

            <div class="product-card">

                <h3>
                    Order #${order.id}
                </h3>

                <p>
                    Total:
                    $${order.total_price}
                </p>

                <p>
                    Status:
                    ${order.status}
                </p>

                <p>
                    Payment:
                    ${order.payment_status}
                </p>

            </div>
        `;
        });
    } catch (error) {
        console.error('Error loading orders:', error);
        ordersContainer.innerHTML = '<p>Error loading orders. Please try again.</p>';
    }
}


getOrders();