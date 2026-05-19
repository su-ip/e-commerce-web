const pool = require('../config/db');


// GET ALL USERS
exports.getUsers = async (req, res) => {

    try {

        const users = await pool.query(

            `SELECT
                id,
                name,
                email,
                role,
                created_at

             FROM users

             ORDER BY id DESC`
        );

        res.json(users.rows);

    } catch (error) {

        console.log(error.message);

        res.status(500).json({
            message: 'Server Error'
        });
    }
};



// GET ALL ORDERS
exports.getOrders = async (req, res) => {

    try {

        const orders = await pool.query(

            `SELECT

                orders.*,
                users.name,
                users.email

             FROM orders

             JOIN users
             ON orders.user_id = users.id

             ORDER BY orders.created_at DESC`
        );

        res.json(orders.rows);

    } catch (error) {

        console.log(error.message);

        res.status(500).json({
            message: 'Server Error'
        });
    }
};



// UPDATE ORDER STATUS
exports.updateOrderStatus = async (req, res) => {

    try {

        const { id } = req.params;

        const { status } = req.body;

        await pool.query(

            `UPDATE orders

             SET status=$1

             WHERE id=$2`,

            [status, id]
        );

        res.json({
            message: 'Order status updated'
        });

    } catch (error) {

        console.log(error.message);

        res.status(500).json({
            message: 'Server Error'
        });
    }
};



// DASHBOARD STATS
exports.dashboardStats = async (req, res) => {

    try {

        const users =
            await pool.query(
                'SELECT COUNT(*) FROM users'
            );

        const products =
            await pool.query(
                'SELECT COUNT(*) FROM products'
            );

        const orders =
            await pool.query(
                'SELECT COUNT(*) FROM orders'
            );

        const revenue =
            await pool.query(

                `SELECT
                    COALESCE(SUM(total_price),0)

                 FROM orders`
            );

        res.json({

            totalUsers:
                users.rows[0].count,

            totalProducts:
                products.rows[0].count,

            totalOrders:
                orders.rows[0].count,

            totalRevenue:
                revenue.rows[0].coalesce
        });

    } catch (error) {

        console.log(error.message);

        res.status(500).json({
            message: 'Server Error'
        });
    }
};