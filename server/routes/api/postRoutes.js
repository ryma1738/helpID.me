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
    editPost
} = require('../../controllers/postControllers');

router.route('/')
.get(getAllPosts)
.post(verifyToken, createPost)

router.route('/image')
.put(verifyToken, addImageToPost)
.delete(verifyToken, removeImageFromPost)

router.route('/:id')
.get(getOnePost)

router.route('/user')
.get(verifyToken, getUsersPosts)

router.route('/user/:id')
.get(verifyToken, getUserPost)
.put(verifyToken, editPost)


module.exports = router;