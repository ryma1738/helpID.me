const router = require('express').Router();
const { verifyTokenAdmin, verifyToken } = require('../../utils/auth')
const {
    getAllPosts,
    getOnePost,
    getUsersPosts,
    getUserPost,
    createPost,
    addImageToPost,
    removeImageFromPost,
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
        fileSize: 1024 * 1024 * 2  // max file size is 5MB
    }
}).single('image');

// routes begin
router.route('/')
    .get(getAllPosts) // ✓ Need to edit so it can accept search / sort criteria
    .post(verifyToken, createPost) // ✓

router.route('/image')
    .put(verifyToken, (req, res) => {
        upload(req, res, function (err) { //middleware for multer error handling
            if (err instanceof multer.MulterError) {
                return res.status(400).json(err);
            } else if (err) {
                if (err.storageErrors) {
                    return res.status(400).json({ message: "Only .png, .jpg, and .jpeg image formats allowed!"})
                }
                return res.status(500).json({errorType: "Unknown", error:err});
            }
            addImageToPost(req, res);
        });
    }) // ✓
    .delete(verifyToken, removeImageFromPost) // ✓

router.route('/:id')
    .get(getOnePost)
    .delete(verifyToken, deletePost);

router.route('/user/posts')
    .get(verifyToken, getUsersPosts)

router.route('/user/:id')
    .get(verifyToken, getUserPost)
    .put(verifyToken, editPost) // ✓


module.exports = router;