// PERFORMANCE NOTE: Minify this JavaScript file in production using tools like UglifyJS or Terser
// PERFORMANCE NOTE: Enable GZIP compression on the server for JS files

const productsContainer = document.getElementById('products');
const loader = document.getElementById('loader');
const productCount = document.getElementById('productCount');
const priceRange = document.getElementById('priceRange');

let allProducts = [];
let currentCategory = 'All';

const getProducts = async () => {

    try {

        loader.style.display = 'block';

        const response = await fetch(
            'http://localhost:5000/api/products'
        );

        if (!response.ok) {
            throw new Error('Failed to fetch products');
        }

        const products = await response.json();
        allProducts = products;
        renderProducts(products);
        renderProductCount(products.length);

    } catch (error) {

        console.error('Error loading products:', error);
        productsContainer.innerHTML = '<p>Error loading products. Please try again.</p>';

    } finally {

        loader.style.display = 'none';
    }
};


async function searchProducts() {

    const keyword =
        document
        .getElementById('searchInput')
        .value;

    try {

        loader.style.display = 'block';

        productsContainer.innerHTML = '';

        const response = await fetch(

            `http://localhost:5000/api/products?keyword=${keyword}`
        );

        if (!response.ok) {
            throw new Error('Failed to search products');
        }

        const products = await response.json();
        allProducts = products;
        renderProducts(products);
        renderProductCount(products.length);

    } catch (error) {

        console.error('Error searching products:', error);
        productsContainer.innerHTML = '<p>Error searching products. Please try again.</p>';

    } finally {

        loader.style.display = 'none';
    }
}


function getProductImage(product) {
    if (Array.isArray(product.images)) {
        return product.images.find(Boolean) || product.image;
    }
    return product.image;
}

function renderProducts(products) {
    productsContainer.innerHTML = '';

    products.forEach((product) => {
        const image = getProductImage(product);
        productsContainer.innerHTML += `
            <div class="product-card">
                <a class="product-image" href="product-details.html?id=${product.id}">
                    ${image ? `
                        <img
                            src="http://localhost:5000/uploads/products/${image}"
                            loading="lazy"
                            alt="${product.name}"
                        />
                    ` : '<div class="product-thumb">No image</div>'}
                </a>
                <h3>
                    <a class="product-link" href="product-details.html?id=${product.id}">${product.name}</a>
                </h3>
                <p>${product.description}</p>
                <h4>$${product.price}</h4>
                <div class="card-actions">
                    <button class="view-button" onclick="viewProduct(${product.id})">View</button>
                    <button class="add-button" onclick="addToCart(${product.id})">Add to cart</button>
                </div>
            </div>
        `;
    });

    renderProductCount(products.length);
}

function renderProductCount(count) {
    if (!productCount) {
        return;
    }
    productCount.textContent = `Showing ${count} product${count !== 1 ? 's' : ''}`;
}

function applyFilter(category) {
    currentCategory = category;
    const filtered = category === 'All'
        ? allProducts
        : allProducts.filter((product) => product.category === category);
    renderProducts(filtered);
    updateFilterButtons(category);
}

function updateFilterButtons(category) {
    document.querySelectorAll('.filter-button').forEach((button) => {
        button.classList.toggle('active', button.textContent === category);
    });
}

function updatePriceLabel(value) {
    const label = document.getElementById('priceLabel');
    if (label) {
        label.textContent = `$${value}`;
    }
    if (!allProducts.length) {
        return;
    }
    const maxPrice = Number(value);
    const filtered = allProducts.filter((product) => Number(product.price) <= maxPrice);
    const categoryFiltered = currentCategory === 'All'
        ? filtered
        : filtered.filter((product) => product.category === currentCategory);

    renderProducts(categoryFiltered);
}

async function addToCart(id) {
    const token = localStorage.getItem('token');
    if (!token) {
        alert('Please login first');
        window.location.href = 'login.html';
        return;
    }

    try {
        const response = await fetch('http://localhost:5000/api/cart', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({
                product_id: id,
                quantity: 1
            })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Failed to add to cart');
        }

        alert(data.message || 'Product added to cart');
    } catch (error) {
        console.error('Error adding product to cart:', error);
        alert('Could not add product to cart. Please try again.');
    }
}

getProducts();


function viewProduct(id) {

    window.location.href =
        `product-details.html?id=${id}`;
}