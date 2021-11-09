const router = require('express').Router();
const { verifyTokenAdmin, verifyToken } = require('../../utils/auth')
const {
    getAllUsers,
    getOneUser,
    userLogin,
    createUser,
    updateUser,
    deleteUser,

} = require('../../controllers/userControllers');

router.route('/')
    .get(verifyToken, getOneUser) // ✓
    .put(verifyToken, updateUser) // ✓ - body: {name: <users name>, <email>, password: <password> } can include any of these fields
    .delete(verifyToken, deleteUser); // ✓ - will delete the user who is logged in, users past orders will still be visible by admin

router.route('/login')
    .post(userLogin); // ✓ - body: {email: <email>, password: <password>}

router.route('/signup')
    .post(createUser); // ✓ - body: {name: <users name>, <email>, password: <password> }

router.route('/admin')
    .get(verifyTokenAdmin, getAllUsers) // ✓