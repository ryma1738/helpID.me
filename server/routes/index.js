const router = require('express').Router();
const path = require('path');
const apiRoutes = require('./api');
const imageRoutes = require('./images')

router.use('/api', apiRoutes);
// router.use("/images", imageRoutes);

// router.use((req, res) => {
//     res.sendFile(path.join(__dirname, '../../client/build/index.html'));
// });

module.exports = router;