const express = require('express');

const router = express.Router();

const protect =
    require('../middleware/authMiddleware');

const admin =
    require('../middleware/adminMiddleware');

const {

    getUsers,

    getOrders,

    updateOrderStatus,

    dashboardStats

} = require('../controllers/adminController');


// DASHBOARD
router.get(
    '/dashboard',
    protect,
    admin,
    dashboardStats
);


// USERS
router.get(
    '/users',
    protect,
    admin,
    getUsers
);


// ORDERS
router.get(
    '/orders',
    protect,
    admin,
    getOrders
);


// UPDATE ORDER STATUS
router.put(
    '/orders/:id',
    protect,
    admin,
    updateOrderStatus
);

module.exports = router;