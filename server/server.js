const express = require('express');
const cors = require('cors');
require('dotenv').config();

// PERFORMANCE NOTE: Enable GZIP compression for all responses using compression middleware
// npm install compression
// const compression = require('compression');
// app.use(compression());

const authRoutes = require('./routes/authRoutes');

const app = express();

const productRoutes = require('./routes/productRoutes');

const cartRoutes = require('./routes/cartRoutes');

const orderRoutes = require('./routes/orderRoutes');

const adminRoutes =
    require('./routes/adminRoutes');

const helmet = require('helmet');

const rateLimit = require('express-rate-limit');

const xss = require('xss-clean');

const mongoSanitize =
    require('express-mongo-sanitize');

const hpp = require('hpp');

const limiter = rateLimit({

    windowMs: 15 * 60 * 1000,

    max: 100,

    message:
        'Too many requests from this IP'
});

app.use(limiter);


// MIDDLEWARE
app.use(cors());
app.use(express.json());
app.use(helmet());
// app.use(xss()); // Disabled due to Express 5 compatibility
// app.use(mongoSanitize()); // Disabled due to Express 5 compatibility
// app.use(hpp()); // Disabled due to Express 5 compatibility


// ROUTES
app.use('/api/auth', authRoutes);

app.use('/api/products', productRoutes);

app.use('/uploads', express.static('uploads', {
    maxAge: '1d' // Cache for 1 day
}));

app.use('/api/cart', cartRoutes);

app.use('/api/orders', orderRoutes);

app.use('/api/admin', adminRoutes);


app.get('/', (req, res) => {
    res.send('API Running');
});

// ERROR HANDLING MIDDLEWARE
app.use((err, req, res, next) => {

    res.status(500).json({

        message:
            err.message || 'Server Error'
    });
});


const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});