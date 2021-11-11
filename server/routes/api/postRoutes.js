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
    limits: {
        fileSize: 1024 * 1024 * 5  // max file size is 5MB
    }
});

router.route('/')
.get(getAllPosts)
.post(verifyToken, createPost)

router.route('/image')
.put(verifyToken, upload.single('image'), addImageToPost)
.delete(verifyToken, removeImageFromPost)

router.route('/:id')
.get(getOnePost)
.delete(verifyToken, deletePost);

router.route('/user')
.get(verifyToken, getUsersPosts)

router.route('/user/:id')
.get(verifyToken, getUserPost)
.put(verifyToken, editPost)


module.exports = router;