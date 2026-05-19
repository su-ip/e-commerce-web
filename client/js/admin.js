const user =
    JSON.parse(localStorage.getItem('user'));

if (!user) {
    alert('Please login as admin');
    window.location.href = 'login.html';
} else if (user.role !== 'admin') {
    alert('Unauthorized admin access');
    window.location.href = 'index.html';
}

const token =
    localStorage.getItem('token');


const statsContainer =
    document.getElementById('stats');

const ordersContainer =
    document.getElementById('orders');


// LOAD DASHBOARD
async function loadDashboard() {

    const response = await fetch(

        'http://localhost:5000/api/admin/dashboard',

        {
            headers: {
                Authorization: `Bearer ${token}`
            }
        }
    );

    const stats = await response.json();

    console.log(stats);

    statsContainer.innerHTML = `

        <div class="product-card">

            <h2>
                Users:
                ${stats.totalUsers}
            </h2>

            <h2>
                Products:
                ${stats.totalProducts}
            </h2>

            <h2>
                Orders:
                ${stats.totalOrders}
            </h2>

            <h2>
                Revenue:
                $${stats.totalRevenue}
            </h2>

        </div>
    `;
}


// LOAD ORDERS
async function loadOrders() {

    const response = await fetch(

        'http://localhost:5000/api/admin/orders',

        {
            headers: {
                Authorization: `Bearer ${token}`
            }
        }
    );

    const orders = await response.json();

    ordersContainer.innerHTML = '';

    orders.forEach((order) => {

        ordersContainer.innerHTML += `

            <div class="product-card">

                <h3>
                    Order #${order.id}
                </h3>

                <p>
                    Customer:
                    ${order.name}
                </p>

                <p>
                    Email:
                    ${order.email}
                </p>

                <p>
                    Total:
                    $${order.total_price}
                </p>

                <p>
                    Status:
                    ${order.status}
                </p>

                <button
                    onclick="markShipped(${order.id})"
                >
                    Mark Shipped
                </button>

            </div>
        `;
    });
}


// UPDATE STATUS
async function markShipped(id) {

    await fetch(

        `http://localhost:5000/api/admin/orders/${id}`,

        {
            method: 'PUT',

            headers: {

                'Content-Type':
                    'application/json',

                Authorization:
                    `Bearer ${token}`
            },

            body: JSON.stringify({
                status: 'shipped'
            })
        }
    );

    loadOrders();
}


loadDashboard();

loadOrders();