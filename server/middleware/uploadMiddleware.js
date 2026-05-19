const multer = require('multer');

const path = require('path');


const storage = multer.diskStorage({

    destination: (req, file, cb) => {

        cb(null, 'uploads/products');
    },

    filename: (req, file, cb) => {

        cb(
            null,
            Date.now() +
            path.extname(file.originalname)
        );
    }
});


const fileFilter = (req, file, cb) => {

    const allowed = /jpg|jpeg|png/;

    const ext =
        allowed.test(
            path.extname(file.originalname)
            .toLowerCase()
        );

    const mime =
        allowed.test(file.mimetype);

    if (ext && mime) {

        cb(null, true);

    } else {

        cb('Images only');
    }
};


const upload = multer({

    storage,

    limits: {
        fileSize: 5 * 1024 * 1024
    },

    fileFilter
});

module.exports = upload;