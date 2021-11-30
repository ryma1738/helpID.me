const router = require('express').Router();
const { verifyTokenAdmin, verifyToken } = require('../../utils/auth')
const {
    getAllUsers,
    getOneUser,
    userLogin,
    createUser,
    updateUser,
    deleteUser,
    renewToken,
} = require('../../controllers/userControllers');

router.route('/')
    .get(verifyToken, getOneUser)
    .put(verifyToken, updateUser) //  - body: {username: <users name>, <email>, password: <password> } can include any of these fields
    .delete(verifyToken, deleteUser); //  - will delete the user who is logged in

router.route('/login')
    .post(userLogin); //  - body: {email: <email>, password: <password>}

router.route('/signup')
    .post(createUser); //  - body: {username: <username>, email: <email>, password: <password>, phoneNumber: <801-888-8888> }

router.route('/renew')
    .get(verifyToken, renewToken);

router.route('/admin')
    .get(verifyTokenAdmin, getAllUsers)

module.exports = router;