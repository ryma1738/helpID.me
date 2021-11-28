const router = require('express').Router();
const { verifyTokenAdmin, verifyToken } = require('../../utils/auth')
const {
    notifyUser, 
    markAsRead,
    test,
    communicationRequest
} = require("../../controllers/notificationControllers");

router.route('/')
    .get(verifyToken, notifyUser)
    .post(verifyToken, communicationRequest)

router.route('/:id')
    .put(verifyToken, markAsRead);

router.route('/test')
    .get(test);

module.exports = router;