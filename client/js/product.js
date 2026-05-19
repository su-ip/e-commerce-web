// PERFORMANCE NOTE: Minify this JavaScript file in production using tools like UglifyJS or Terser
// PERFORMANCE NOTE: Enable GZIP compression on the server for JS files

const productsContainer =
    document.getElementById('products');

const loader = document.getElementById('loader');


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

        console.log(products);

        renderProducts(products);

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

        renderProducts(products);

    } catch (error) {

        console.error('Error searching products:', error);
        productsContainer.innerHTML = '<p>Error searching products. Please try again.</p>';

    } finally {

        loader.style.display = 'none';
    }
}


function renderProducts(products) {

    products.forEach((product) => {

        productsContainer.innerHTML += `
            <div class="product-card">

                <img
                    src="http://localhost:5000/uploads/products/${product.image}"
                    loading="lazy"
                    alt="${product.name}"
                />

                <h3>${product.name}</h3>

                <p>${product.description}</p>

                <h4>$${product.price}</h4>

                <button onclick="viewProduct(${product.id})">
                    View
                </button>

            </div>
        `;
    });
}


getProducts();


function viewProduct(id) {

    window.location.href =
        `product-details.html?id=${id}`;
}