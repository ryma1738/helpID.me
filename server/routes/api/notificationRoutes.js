const router = require('express').Router();
const { User, Notification } = require("../../models");
const { verifyTokenAdmin, verifyToken } = require('../../utils/auth')
const {
    notifyUser, 
    markAsRead,
    test
} = require("../../controllers/notificationControllers");

router.route('/')
    .get(verifyToken, notifyUser);

router.route('/:id')
    .put(verifyToken, markAsRead);

router.route('/test')
    .get(test);

module.exports = router;