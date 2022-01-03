const router = require('express').Router();
const path = require('path');

router.route('/:dir/:filename')
    .get((req, res) => {
        try {
            res.sendFile(path.join(__dirname + "../../../public/" + req.params.dir + "/" + req.params.filename))
        } catch (err) {
            res.status(404).json({ errorMessage: "File not found" })
        }
    });

module.exports = router;
