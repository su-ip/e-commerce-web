const express = require('express');

const router = express.Router();

const protect = require('../middleware/authMiddleware');

const {
    createOrder,
    getUserOrders,
    getSingleOrder,
    updateOrderPaymentStatus
} = require('../controllers/orderController');


// CREATE ORDER
router.post('/', protect, createOrder);


// GET USER ORDERS
router.get('/', protect, getUserOrders);


// GET SINGLE ORDER
router.get('/:id', protect, getSingleOrder);

// UPDATE ORDER PAYMENT STATUS
router.put('/:id/status', protect, updateOrderPaymentStatus);

module.exports = router;