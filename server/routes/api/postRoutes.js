const router = require('express').Router();
const { verifyTokenAdmin, verifyToken } = require('../../utils/auth')
const {
    getAllPosts,
    getOnePost,
    getUsersPosts,
    getUserPost,
    createPost,
    editPost,
    deletePost
} = require('../../controllers/postControllers');

// Set up image Uploading
const multer = require('multer');
const storage = multer.diskStorage({
    destination: (req, file, cb) => { // destination for files
        cb(null, './imageUploads')
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname)
    }
});

const upload = multer({ // upload multiple images upto 5
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
        fileSize: 1024 * 1024 * 2  // max file size is 2MB
    }
}).array('images', 5);


// routes begin
router.route('/')
    .get(getAllPosts) // ✓ Can accept search queries: ?search=SomeTextHere&categoryId=61984622061b19dbb057d6d9
    .post(verifyToken, (req, res) => {
        upload(req, res, function (err) { //middleware for multer error handling and file uploads
            if (err instanceof multer.MulterError) {
                if (err.message === "File too large") {
                    return res.status(400).json({ errorMessage: "Your file is too large. The maximum size for a file is 2MB" });
                } else if (err.code === "LIMIT_UNEXPECTED_FILE") {
                    return res.status(400).json({ errorMessage: "You can only upload a max of 5 images" });
                }
                return res.status(400).json({ errorType: "Unknown", error: err });
            } else if (err) {
                if (err.storageErrors) {
                    return res.status(400).json({ errorMessage: "Only .png, .jpg, and .jpeg image formats allowed!" })
                }
                return res.status(500).json({ errorType: "Unknown", error: err });
            }
            createPost(req, res);
        });
    }) // ✓ uses multipart/form-data

router.route('/:id')
    .get(getOnePost) // ✓
    .delete(verifyToken, deletePost); // ✓

router.route('/user/posts')
    .get(verifyToken, getUsersPosts)

router.route('/user/:id')
    .get(verifyToken, getUserPost)
    .put(verifyToken, (req, res) => {
        upload(req, res, function (err) { //middleware for multer error handling and file uploads
            if (err instanceof multer.MulterError) {
                if (err.message === "File too large") {
                    return res.status(400).json({ errorMessage: "Your file is too large. The maximum size for a file is 2MB" });
                } else if (err.code === "LIMIT_UNEXPECTED_FILE") {
                    return res.status(400).json({ errorMessage: "You can only upload a max of 5 images" });
                }
                return res.status(400).json({ errorType: "Unknown", error: err });
            } else if (err) {
                if (err.storageErrors) {
                    return res.status(400).json({ errorMessage: "Only .png, .jpg, and .jpeg image formats allowed!" })
                }
                return res.status(500).json({ errorType: "Unknown", error: err });
            }
            editPost(req, res);
        });
    }) // ✓ - may need more testing be seems to be working


module.exports = router;