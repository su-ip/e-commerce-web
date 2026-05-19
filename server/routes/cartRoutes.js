const express = require('express');

const router = express.Router();

const protect = require('../middleware/authMiddleware');

const {
    addToCart,
    getCart,
    updateCart,
    removeCartItem
} = require('../controllers/cartController');


// ADD TO CART
router.post('/', protect, addToCart);


// GET CART
router.get('/', protect, getCart);


// UPDATE CART
router.put('/:id', protect, updateCart);


// REMOVE ITEM
router.delete('/:id', protect, removeCartItem);

module.exports = router;