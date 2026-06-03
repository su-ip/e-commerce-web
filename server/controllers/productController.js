const pool = require('../config/db');
const PRODUCT_IMAGE_COLUMNS = ['image', 'image2', 'image3', 'image4'];
let cachedProductImageColumns = null;

async function getProductImageColumns() {
    if (cachedProductImageColumns) {
        return cachedProductImageColumns;
    }

    const result = await pool.query(
        `SELECT column_name
         FROM information_schema.columns
         WHERE table_name='products'
           AND column_name IN ('image','image2','image3','image4')
         ORDER BY ordinal_position`
    );

    cachedProductImageColumns = result.rows.map((row) => row.column_name);
    return cachedProductImageColumns;
}

// CREATE PRODUCT
exports.createProduct = async (req, res) => {
    try {
        const {
            name,
            description,
            price,
            stock,
            category_id
        } = req.body;

        if (!name || !description || !price || stock === undefined || !category_id) {
            return res.status(400).json({
                message: 'Please fill all required fields'
            });
        }

        if (parseFloat(price) <= 0) {
            return res.status(400).json({
                message: 'Price must be greater than 0'
            });
        }

        if (parseInt(stock) < 0) {
            return res.status(400).json({
                message: 'Stock cannot be negative'
            });
        }

        const files = req.files || [];
        const imageColumns = await getProductImageColumns();
        const images = imageColumns.map((_, index) => {
            const file = files[index];
            return file ? file.filename : null;
        });

        const insertColumns = ['name', 'description', 'price', 'stock', 'category_id', ...imageColumns];
        const placeholders = insertColumns.map((_, index) => `$${index + 1}`).join(', ');
        const values = [name, description, price, stock, category_id, ...images];

        const newProduct = await pool.query(
            `INSERT INTO products (${insertColumns.join(', ')})
             VALUES(${placeholders})
             RETURNING *`,
            values
        );

        const product = newProduct.rows[0];
        product.images = images.filter(Boolean);

        res.status(201).json(product);
    } catch (error) {
        console.log(error.message);
        res.status(500).json({
            message: 'Server Error'
        });
    }
};


// GET ALL PRODUCTS
exports.getProducts = async (req, res) => {
    try {
        const keyword = req.query.keyword || '';
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 8;
        const offset = (page - 1) * limit;

        const products = await pool.query(
            `SELECT
                products.*,
                categories.name AS category_name
             FROM products
             LEFT JOIN categories
             ON products.category_id = categories.id
             WHERE LOWER(products.name) LIKE LOWER($1)
             ORDER BY products.id DESC
             LIMIT $2 OFFSET $3`,
            [`%${keyword}%`, limit, offset]
        );

        const rows = products.rows.map((row) => ({
            ...row,
            images: [row.image, row.image2, row.image3, row.image4].filter(Boolean)
        }));

        res.json(rows);
    } catch (error) {
        console.log(error.message);
        res.status(500).json({
            message: 'Server Error'
        });
    }
};


// GET SINGLE PRODUCT
exports.getSingleProduct = async (req, res) => {
    try {
        const { id } = req.params;

        const product = await pool.query(
            `SELECT
                products.*,
                categories.name AS category_name
             FROM products
             LEFT JOIN categories
             ON products.category_id = categories.id
             WHERE products.id=$1`,
            [id]
        );

        if (product.rows.length === 0) {
            return res.status(404).json({
                message: 'Product not found'
            });
        }

        const row = product.rows[0];
        row.images = [row.image, row.image2, row.image3, row.image4].filter(Boolean);

        res.json(row);
    } catch (error) {
        console.log(error.message);
        res.status(500).json({
            message: 'Server Error'
        });
    }
};


// UPDATE PRODUCT
exports.updateProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const {
            name,
            description,
            price,
            stock,
            category_id
        } = req.body;

        const existingProduct = await pool.query('SELECT * FROM products WHERE id=$1', [id]);
        if (existingProduct.rows.length === 0) {
            return res.status(404).json({ message: 'Product not found' });
        }

        const current = existingProduct.rows[0];
        const files = req.files || [];
        const imageColumns = await getProductImageColumns();
        const updatedImages = imageColumns.map((col, index) => {
            if (files[index]) {
                return files[index].filename;
            }

            return current[col] || null;
        });

        const updatedName = name !== undefined ? name : current.name;
        const updatedDescription = description !== undefined ? description : current.description;
        const updatedPrice = price !== undefined && price !== null ? price : current.price;
        const updatedStock = stock !== undefined && stock !== null ? stock : current.stock;
        const updatedCategoryId = category_id !== undefined && category_id !== null ? category_id : current.category_id;

        const setClauses = [
            'name=$1',
            'description=$2',
            'price=$3',
            'stock=$4',
            'category_id=$5',
            ...imageColumns.map((col, index) => `${col}=$${6 + index}`)
        ];

        const queryValues = [
            updatedName,
            updatedDescription,
            updatedPrice,
            updatedStock,
            updatedCategoryId,
            ...updatedImages,
            id
        ];

        await pool.query(
            `UPDATE products
             SET ${setClauses.join(', ')}
             WHERE id=$${queryValues.length}`,
            queryValues
        );

        res.json({ message: 'Product updated' });
    } catch (error) {
        console.log(error.message);
        res.status(500).json({
            message: 'Server Error'
        });
    }
};


// DELETE PRODUCT
exports.deleteProduct = async (req, res) => {

    try {

        const { id } = req.params;

        await pool.query(
            'DELETE FROM products WHERE id=$1',
            [id]
        );

        res.json({
            message: 'Product deleted'
        });

    } catch (error) {

        console.log(error.message);

        res.status(500).json({
            message: 'Server Error'
        });
    }
};