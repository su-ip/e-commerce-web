const pool = require('../config/db');
const sendEmail = require('../utils/sendEmail');


// CREATE ORDER
exports.createOrder = async (req, res) => {

    const client = await pool.connect();

    try {

        await client.query('BEGIN');

        const user_id = req.user.id;

        const {
            shipping_address,
            payment_method
        } = req.body;

        // Prevent accidental duplicate checkout requests.
        const pendingOrder = await client.query(
            `SELECT id FROM orders
             WHERE user_id=$1
             AND status='pending'
             ORDER BY created_at DESC
             LIMIT 1`,
            [user_id]
        );

        if (pendingOrder.rows.length > 0) {
            return res.status(409).json({
                message: 'There is already a pending order for this user. Please complete payment before creating a new order.'
            });
        }

        // GET CART ITEMS and lock product rows to avoid overselling.
        const cartItems = await client.query(

            `SELECT

                cart.*,
                products.price,
                products.stock

            FROM cart

            JOIN products
            ON cart.product_id = products.id

            WHERE cart.user_id=$1
            FOR UPDATE`,

            [user_id]
        );


        if (cartItems.rows.length === 0) {

            return res.status(400).json({
                message: 'Cart is empty'
            });
        }


        let total_price = 0;


        // CHECK STOCK
        for (const item of cartItems.rows) {

            if (item.quantity > item.stock) {

                return res.status(400).json({
                    message:
                        `Not enough stock for product ${item.product_id}`
                });
            }

            total_price +=
                item.price * item.quantity;
        }


        // CREATE ORDER
        const orderResult = await client.query(

            `INSERT INTO orders

            (
                user_id,
                total_price,
                payment_method,
                shipping_address
            )

            VALUES($1,$2,$3,$4)

            RETURNING *`,

            [
                user_id,
                total_price,
                payment_method,
                shipping_address
            ]
        );

        const order = orderResult.rows[0];


        // INSERT ORDER ITEMS
        for (const item of cartItems.rows) {

            await client.query(

                `INSERT INTO order_items

                (
                    order_id,
                    product_id,
                    quantity,
                    price
                )

                VALUES($1,$2,$3,$4)`,

                [
                    order.id,
                    item.product_id,
                    item.quantity,
                    item.price
                ]
            );


            // REDUCE STOCK
            await client.query(

                `UPDATE products

                 SET stock = stock - $1

                 WHERE id=$2`,

                [
                    item.quantity,
                    item.product_id
                ]
            );
        }


        // CLEAR CART
        await client.query(
            'DELETE FROM cart WHERE user_id=$1',
            [user_id]
        );


        await client.query('COMMIT');

        await sendEmail(

            req.user.email,

            'Order Confirmation',

            `Your order #${order.id}
             has been placed successfully`
        );

        res.status(201).json({
            message: 'Order created',
            order
        });

    } catch (error) {

        await client.query('ROLLBACK');

        console.log(error.message);

        res.status(500).json({
            message: 'Server Error'
        });

    } finally {

        client.release();
    }
};



// GET USER ORDERS
exports.getUserOrders = async (req, res) => {

    try {

        const orders = await pool.query(

            `SELECT *

             FROM orders

             WHERE user_id=$1

             ORDER BY created_at DESC`,

            [req.user.id]
        );

        res.json(orders.rows);

    } catch (error) {

        console.log(error.message);

        res.status(500).json({
            message: 'Server Error'
        });
    }
};



// GET SINGLE ORDER
exports.getSingleOrder = async (req, res) => {

    try {

        const { id } = req.params;

        const order = await pool.query(

            `SELECT *

             FROM orders

             WHERE id=$1
             AND user_id=$2`,

            [
                id,
                req.user.id
            ]
        );


        if (order.rows.length === 0) {

            return res.status(404).json({
                message: 'Order not found'
            });
        }


        const items = await pool.query(

            `SELECT

                order_items.*,
                products.name,
                products.image

             FROM order_items

             JOIN products
             ON order_items.product_id = products.id

             WHERE order_id=$1`,

            [id]
        );

        res.json({
            order: order.rows[0],
            items: items.rows
        });

    } catch (error) {

        console.log(error.message);

        res.status(500).json({
            message: 'Server Error'
        });
    }
};



// UPDATE ORDER PAYMENT STATUS
exports.updateOrderPaymentStatus = async (req, res) => {

    try {

        const { id } = req.params;

        const { status } = req.body;

        // Validate status
        const validStatuses = ['pending', 'paid', 'shipped', 'delivered', 'cancelled'];

        if (!validStatuses.includes(status)) {
            return res.status(400).json({
                message: 'Invalid status. Must be one of: ' + validStatuses.join(', ')
            });
        }

        // Check if order exists and belongs to user (or admin can update any)
        const orderQuery = req.user.role === 'admin' 
            ? 'SELECT * FROM orders WHERE id=$1'
            : 'SELECT * FROM orders WHERE id=$1 AND user_id=$2';

        const orderParams = req.user.role === 'admin' 
            ? [id]
            : [id, req.user.id];

        const orderResult = await pool.query(orderQuery, orderParams);

        if (orderResult.rows.length === 0) {
            return res.status(404).json({
                message: 'Order not found'
            });
        }

        // Update order status
        await pool.query(
            'UPDATE orders SET status=$1 WHERE id=$2',
            [status, id]
        );

        res.json({
            message: 'Order status updated successfully'
        });

    } catch (error) {

        console.log(error.message);

        res.status(500).json({
            message: 'Server Error'
        });
    }
};