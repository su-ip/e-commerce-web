const productContainer =
    document.getElementById('product');


const params =
    new URLSearchParams(window.location.search);

const id = params.get('id');


async function addToCart(productId) {
    const token = localStorage.getItem('token');

    if (!token) {
        alert('Please login first');
        window.location.href = 'login.html';
        return;
    }

    const response = await fetch('http://localhost:5000/api/cart', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
            product_id: productId,
            quantity: 1
        })
    });

    const data = await response.json();
    alert(data.message);
}

const getProduct = async () => {

    const response = await fetch(
        `http://localhost:5000/api/products/${id}`
    );

    const product = await response.json();

    productContainer.innerHTML = `

        <img
            src="http://localhost:5000/uploads/products/${product.image}"
            width="300"
        />

        <h1>${product.name}</h1>

        <p>${product.description}</p>

        <h2>$${product.price}</h2>

        <button onclick="addToCart(${product.id})">
            Add To Cart
        </button>
    `;
};


getProduct();