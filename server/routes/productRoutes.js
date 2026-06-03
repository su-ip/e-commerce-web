const express = require('express');

const router = express.Router();

const {
    createProduct,
    getProducts,
    getSingleProduct,
    updateProduct,
    deleteProduct
} = require('../controllers/productController');

const admin =
    require('../middleware/adminMiddleware');

const protect = require('../middleware/authMiddleware');

const upload = require('../middleware/uploadMiddleware');


// CREATE PRODUCT
router.post(
    '/',
    protect,
    admin,
    upload.array('images', 4),
    createProduct
);


// GET ALL PRODUCTS
router.get('/', getProducts);


// GET SINGLE PRODUCT
router.get('/:id', getSingleProduct);


// UPDATE PRODUCT
router.put(
    '/:id',
    protect,
    admin,
    upload.array('images', 4),
    updateProduct
);


// DELETE PRODUCT
router.delete(
    '/:id',
    protect,
    admin,
    deleteProduct
);

module.exports = router;