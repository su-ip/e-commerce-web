const ordersContainer = document.getElementById('orders');
const token = localStorage.getItem('token');

function formatOrderDate(order) {
    const dateValue = order.created_at || order.createdAt || order.date || order.order_date;
    if (!dateValue) return 'Unknown date';
    const date = new Date(dateValue);
    if (isNaN(date)) return dateValue;
    return date.toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
    });
}

function renderOrderStatus(status) {
    const normalized = (status || 'pending').toLowerCase();
    return normalized.charAt(0).toUpperCase() + normalized.slice(1);
}

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
            const orderDate = formatOrderDate(order);
            const orderStatus = renderOrderStatus(order.status);
            const totalValue = order.total_price || order.total || order.amount || 0;

            ordersContainer.innerHTML += `
            <article class="order-card">
                <div class="order-card-row">
                    <div>
                        <p class="secondary-label">Order</p>
                        <h3>Order #${order.id}</h3>
                    </div>
                    <div class="order-badge ${orderStatus.toLowerCase()}">${orderStatus}</div>
                </div>

                <div class="order-card-row">
                    <div>
                        <p class="secondary-label">Date</p>
                        <p>${orderDate}</p>
                    </div>
                    <div>
                        <p class="secondary-label">Total</p>
                        <p class="order-total">$${parseFloat(totalValue).toFixed(2)}</p>
                    </div>
                </div>
            </article>
        `;
        });
    } catch (error) {
        console.error('Error loading orders:', error);
        ordersContainer.innerHTML = '<p>Error loading orders. Please try again.</p>';
    }
}


getOrders();