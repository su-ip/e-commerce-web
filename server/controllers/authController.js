const pool = require('../config/db');
const bcrypt = require('bcryptjs');
const generateToken = require('../utils/generateToken');


// REGISTER USER
exports.registerUser = async (req, res) => {
    try {

        const { name, email, password } = req.body;

        if (!email || !password || !name) {
            return res.status(400).json({
                message: 'Please fill all fields'
            });
        }

        if (password.length < 6) {
            return res.status(400).json({
                message: 'Password too short'
            });
        }

        const strongPassword = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).+$/;

        if (!strongPassword.test(password)) {
            return res.status(400).json({
                message: 'Password must include uppercase, lowercase, number, and symbol'
            });
        }

        // CHECK USER EXISTS
        const userExists = await pool.query(
            'SELECT * FROM users WHERE email=$1',
            [email]
        );

        if (userExists.rows.length > 0) {
            return res.status(400).json({
                message: 'User already exists'
            });
        }

        // HASH PASSWORD
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // INSERT USER
        const newUser = await pool.query(
            `INSERT INTO users(name,email,password)
             VALUES($1,$2,$3)
             RETURNING id,name,email,role`,
            [name, email, hashedPassword]
        );

        // GENERATE TOKEN
        const token = generateToken(newUser.rows[0].id);

        res.status(201).json({
            token,
            user: {
                id: newUser.rows[0].id,
                name: newUser.rows[0].name,
                email: newUser.rows[0].email,
                role: newUser.rows[0].role
            }
        });

    } catch (error) {
        console.log(error.message);

        res.status(500).json({
            message: 'Server Error'
        });
    }
};



// LOGIN USER
exports.loginUser = async (req, res) => {

    try {

        const { email, password } = req.body;

        // FIND USER
        const userResult = await pool.query(
            'SELECT * FROM users WHERE email=$1',
            [email]
        );

        if (userResult.rows.length === 0) {
            return res.status(400).json({
                message: 'Invalid credentials'
            });
        }

        const user = userResult.rows[0];

        // CHECK PASSWORD
        const isMatch = await bcrypt.compare(
            password,
            user.password
        );

        if (!isMatch) {
            return res.status(400).json({
                message: 'Invalid credentials'
            });
        }

        // GENERATE TOKEN
        const token = generateToken(user.id);

        res.json({
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });

    } catch (error) {

        console.log(error.message);

        res.status(500).json({
            message: 'Server Error'
        });
    }
};