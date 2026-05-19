const pool = require('../config/db');
// PERFORMANCE NOTE: Implement image compression middleware (e.g., sharp) to reduce image file sizes
// PERFORMANCE NOTE: Consider using WebP format for better compression and performance


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

        const image = req.file
            ? req.file.filename
            : null;

        const newProduct = await pool.query(

            `INSERT INTO products
            (name,description,price,stock,category_id,image)

            VALUES($1,$2,$3,$4,$5,$6)

            RETURNING *`,

            [
                name,
                description,
                price,
                stock,
                category_id,
                image
            ]
        );

        res.status(201).json(newProduct.rows[0]);

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

        const keyword =
            req.query.keyword || '';

        const page =
            parseInt(req.query.page) || 1;

        const limit = 8;

        const offset =
            (page - 1) * limit;

        const products = await pool.query(

            `SELECT
                products.*,
                categories.name AS category_name

             FROM products

             LEFT JOIN categories
             ON products.category_id = categories.id

             WHERE
                LOWER(products.name)
                LIKE LOWER($1)

             ORDER BY products.id DESC

             LIMIT $2 OFFSET $3`,

            [
                `%${keyword}%`,
                limit,
                offset
            ]
        );

        res.json(products.rows);

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

        res.json(product.rows[0]);

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
            stock
        } = req.body;

        await pool.query(

            `UPDATE products

            SET
                name=$1,
                description=$2,
                price=$3,
                stock=$4

            WHERE id=$5`,

            [
                name,
                description,
                price,
                stock,
                id
            ]
        );

        res.json({
            message: 'Product updated'
        });

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