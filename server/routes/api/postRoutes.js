const router = require('express').Router();
const { verifyTokenAdmin, verifyToken } = require('../../utils/auth')
const multer = require('multer');

// Set up image Uploading
const storage = multer.diskStorage({
    destination: (req, file, cb) => { // destination for files
        cb(null, './models/imageUploads')
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname + '-' + Date.now())
    }
});

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 1024 * 1024 * 5  // max file size is 5MB
    }
});