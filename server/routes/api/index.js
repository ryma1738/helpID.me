const router = require('express').Router();
const userRoutes = require('./userRoutes');
const postRoutes = require('./postRoutes');
const tipRoutes = require('./tipRoutes');

router.use('/user', userRoutes);
router.use('/post', postRoutes);
router.use('/tip', tipRoutes);

module.exports = router;