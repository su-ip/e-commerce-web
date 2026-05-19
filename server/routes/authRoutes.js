const express = require('express');

const router = express.Router();

const {
    registerUser,
    loginUser
} = require('../controllers/authController');

const protect = require('../middleware/authMiddleware');


// REGISTER
router.post('/register', registerUser);


// LOGIN
router.post('/login', loginUser);


// PROFILE
router.get('/profile', protect, async (req, res) => {
    res.json(req.user);
});

module.exports = router;