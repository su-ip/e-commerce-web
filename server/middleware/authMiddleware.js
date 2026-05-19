const jwt = require('jsonwebtoken');
const pool = require('../config/db');

const protect = async (req, res, next) => {

    try {

        let token;

        // CHECK TOKEN
        if (
            req.headers.authorization &&
            req.headers.authorization.startsWith('Bearer')
        ) {

            token = req.headers.authorization.split(' ')[1];

            // VERIFY TOKEN
            const decoded = jwt.verify(
                token,
                process.env.JWT_SECRET
            );

            // GET USER
            const userResult = await pool.query(
                'SELECT id,name,email,role FROM users WHERE id=$1',
                [decoded.id]
            );

            req.user = userResult.rows[0];

            next();

        } else {

            return res.status(401).json({
                message: 'Not authorized'
            });
        }

    } catch (error) {

        console.log(error.message);

        return res.status(401).json({
            message: 'Token failed'
        });
    }
};

module.exports = protect;