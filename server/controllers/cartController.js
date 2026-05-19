const pool = require('../config/db');


// ADD TO CART
exports.addToCart = async (req, res) => {

    try {

        const user_id = req.user.id;

        const {
            product_id,
            quantity
        } = req.body;


        // CHECK PRODUCT EXISTS
        const product = await pool.query(
            'SELECT * FROM products WHERE id=$1',
            [product_id]
        );

        if (product.rows.length === 0) {

            return res.status(404).json({
                message: 'Product not found'
            });
        }


        // CHECK IF ALREADY IN CART
        const existingCart = await pool.query(

            `SELECT * FROM cart

             WHERE user_id=$1
             AND product_id=$2`,

            [user_id, product_id]
        );


        // UPDATE QUANTITY
        if (existingCart.rows.length > 0) {

            await pool.query(

                `UPDATE cart

                 SET quantity = quantity + $1

                 WHERE user_id=$2
                 AND product_id=$3`,

                [
                    quantity,
                    user_id,
                    product_id
                ]
            );

            return res.json({
                message: 'Cart updated'
            });
        }


        // INSERT NEW CART ITEM
        await pool.query(

            `INSERT INTO cart
             (user_id,product_id,quantity)

             VALUES($1,$2,$3)`,

            [
                user_id,
                product_id,
                quantity
            ]
        );

        res.status(201).json({
            message: 'Added to cart'
        });

    } catch (error) {

        console.log(error.message);

        res.status(500).json({
            message: 'Server Error'
        });
    }
};



// GET USER CART
exports.getCart = async (req, res) => {

    try {

        const user_id = req.user.id;

        const cart = await pool.query(

            `SELECT

                cart.id,
                cart.quantity,

                products.id AS product_id,
                products.name,
                products.price,
                products.image

            FROM cart

            JOIN products
            ON cart.product_id = products.id

            WHERE cart.user_id=$1`,

            [user_id]
        );

        res.json(cart.rows);

    } catch (error) {

        console.log(error.message);

        res.status(500).json({
            message: 'Server Error'
        });
    }
};



// UPDATE CART QUANTITY
exports.updateCart = async (req, res) => {

    try {

        const { id } = req.params;

        const { quantity } = req.body;

        if (quantity <= 0) {
            return res.status(400).json({
                message: 'Quantity must be at least 1'
            });
        }

        const cartItem = await pool.query(
            `SELECT cart.product_id, products.stock
             FROM cart
             JOIN products ON cart.product_id = products.id
             WHERE cart.id=$1`,
            [id]
        );

        if (cartItem.rows.length === 0) {
            return res.status(404).json({
                message: 'Cart item not found'
            });
        }

        const { stock } = cartItem.rows[0];

        if (quantity > stock) {
            return res.status(400).json({
                message: 'Quantity exceeds available stock'
            });
        }

        await pool.query(

            `UPDATE cart

             SET quantity=$1

             WHERE id=$2`,

            [quantity, id]
        );

        res.json({
            message: 'Cart updated'
        });

    } catch (error) {

        console.log(error.message);

        res.status(500).json({
            message: 'Server Error'
        });
    }
};



// REMOVE CART ITEM
exports.removeCartItem = async (req, res) => {

    try {

        const { id } = req.params;

        await pool.query(
            'DELETE FROM cart WHERE id=$1',
            [id]
        );

        res.json({
            message: 'Item removed'
        });

    } catch (error) {

        console.log(error.message);

        res.status(500).json({
            message: 'Server Error'
        });
    }
};