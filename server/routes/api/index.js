const router = require('express').Router();
const userRoutes = require('./userRoutes');
const postRoutes = require('./postRoutes');
const tipRoutes = require('./tipRoutes');
const categoryRoutes = require('./categoryRoutes');

router.use('/user', userRoutes);
router.use('/post', postRoutes);
router.use('/tip', tipRoutes);
router.use('/category', categoryRoutes);

module.exports = router;