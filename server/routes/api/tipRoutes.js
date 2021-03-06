const router = require('express').Router();
const { verifyTokenAdmin, verifyToken } = require('../../utils/auth')
const multer = require('multer');
const {
    createTip,
    deleteTip,
    editTip,
    getAllTips
} = require('../../controllers/tipControllers');

// Set up image Uploading
const storage = multer.diskStorage({
    destination: (req, file, cb) => { // destination for files
        cb(null, './public/temp')
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname)
    }
});

const upload = multer({
    storage: storage,
    fileFilter: (req, file, cb) => {
        if (file.mimetype == "image/png" || file.mimetype == "image/jpg" || file.mimetype == "image/jpeg") {
            cb(null, true);
        } else {
            cb(null, false);
            return cb(new Error('Only .png, .jpg, and .jpeg image formats allowed!'))
        }
    },
    limits: {
        fileSize: 1024 * 1024 * .5  // max file size is 0.5MB
    }
}).single('image');

router.route('/')
    .get(getAllTips) // for dev use
    .post(verifyToken, (req, res) => { // ✓
        upload(req, res, function (err) { //middleware for multer error handling
            if (err instanceof multer.MulterError) {
                if (err.message === "File too large") {
                    return res.status(400).json({errorMessage: "Your file is too large. The maximum size for a file is 0.5MB"});
                }
                return res.status(400).json({ errorMessage: "Unknown", error: err });
            } else if (err) {
                if (err.storageErrors) {
                    return res.status(400).json({ errorMessage: "Only .png, .jpg, and .jpeg image formats allowed!" })
                }
                return res.status(500).json({ errorMessage: "Unknown", error: err });
            }
            createTip(req, res);
        });
    })
    .put(verifyToken, (req, res) => {// ✓ accepts queries: ?deleteImage as true or false, default is false
        upload(req, res, function (err) { //middleware for multer error handling
            if (err instanceof multer.MulterError) {
                if (err.message === "File too large") {
                    return res.status(400).json({ errorMessage: "Your file is too large. The maximum size for a file is 0.5MB" });
                }
                return res.status(400).json({ errorType: "Unknown", error: err });
            } else if (err) {
                if (err.storageErrors) {
                    return res.status(400).json({ message: "Only .png, .jpg, and .jpeg image formats allowed!" })
                }
                return res.status(500).json({ errorType: "Unknown", error: err });
            }
            editTip(req, res);
        });
    }) 
    .delete(verifyToken, deleteTip); // ✓

module.exports = router;