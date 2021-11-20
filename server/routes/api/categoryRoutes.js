const router = require('express').Router();
const { Category } = require("../../models");

router.route('/')
.get((req, res) => {
    Category.find({}).select("-__v").lean().then(data => res.status(200).json(data)).catch(err => {
        console.log(err),
        res.status(500).json({errorMessage: "Unknown Error", error: err});
    });
});

module.exports = router;