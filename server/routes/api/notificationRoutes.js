const router = require('express').Router();
const { verifyTokenAdmin, verifyToken } = require('../../utils/auth')
const {
    notifyUser, 
    markAsRead,
    test,
    communicationRequest,
    deleteNotification
} = require("../../controllers/notificationControllers");

router.route('/')
    .get(verifyToken, notifyUser) // ✓ get all notifications
    .post(verifyToken, communicationRequest) // ✓

router.route('/:id')
    .put(verifyToken, markAsRead) // ✓
    .delete(verifyToken, deleteNotification); // ✓

router.route('/test')
    .get(test);

module.exports = router;