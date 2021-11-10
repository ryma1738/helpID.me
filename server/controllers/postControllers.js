const { User, Post } = require("../models");
const fs = require('fs');
const path = require('path');

const postControllers = {
    getAllPosts(req, res) {
        Post.find({})
        .select('-userId -contactNumber -tips')
        .then(postData => res.status(200).json(postData))
        .catch(err => {
            console.log(err);
            res.sendStatus(500);
        });
    },
    getOnePost(req, res) {
        Post.findById(req.params.id)
        .select('-userId -tips')
        .then(postData => {
            postData.totalTips = postData.tipsReceived();
            res.status(200).json(postData)
        })
        .catch(err => {
            console.log(err);
            res.sendStatus(500);
        });
    },
    getUsersPosts(req, res) { // get all posts associated with a user.
        Post.find({userId: req.user._id})
            .select('-userId')
            .then(postData => res.status(200).json(postData))
            .catch(err => {
                console.log(err);
                res.sendStatus(500);
            });
    }, 
    getUserPost(req, res) { // only user has access to this post, this is when they can view tips and edit the post
        Post.findById(req.params.id)
            .select('-userId')
            .then(postData => {
                postData.totalTips = postData.tipsReceived();
                res.status(200).json(postData)
            })
            .catch(err => {
                console.log(err);
                res.sendStatus(500);
            });
    },
    createPost(req, res) {
        Post.create([{
            title: req.body.title,
            date: req.body.date,
            summary: req.body.summary,
            userId: req.user._id,
            video: req.body.videoLink || "",
            contactNumber: req.body.contactNumber || "000-000-0000"
        }],
            { new: true, runValidators: true })
            .select('-userId')
            .then(postData => res.status(200).json(postData))
            .catch(err => {
                console.log(err);
                res.sendStatus(500);
            });
            

    },
    addImageToPost(req, res) {
        Post.findOneAndUpdate({ _id: req.body.id, userId: req.user._id }, {
            $push: { images: { 
                data: fs.readFileSync(path.join(__dirname + "../imageUploads" + req.file.filename)),
                contentType: req.file.mimetype 
                }
            }
        }, { new: true, runValidators: true })
            .select('-userId')
            .then(postData => res.status(200).json(postData))
            .catch(err => {
                console.log(err);
                res.sendStatus(500);
            });
    },
    removeImageFromPost(req, res) {
        Post.findOneAndUpdate({ _id: req.body.id, userId: req.user._id  }, {
            $pull: {
                images: {
                    data: fs.readFileSync(path.join(__dirname + "../imageUploads" + req.file.filename)),
                    contentType: req.file.mimetype
                }
            }
        }, { new: true, runValidators: true })
            .select('-userId')
            .then(postData => res.status(200).json(postData))
            .catch(err => {
                console.log(err);
                res.sendStatus(500);
            });
    },
    editPost(req, res) {
        let postObj = {};
        if (req.body.title) {
            postObj.title = req.body.title;
        }
        if (req.body.summary) {
            postObj.summary = req.body.summary;
        }
        if (req.body.contactNumber) {
            postObj.contactNumber = req.body.contactNumber;
        }
        if (req.body.date) {
            postObj.date = req.body.date;
        }
        if (req.body.video) {
            postObj.video = req.body.videoLink;
        }
        if (!postObj) {
            return res.status(400).json({ message: 'You must enter a value to update!' })
        }
        Post.findOneAndUpdate({ _id: req.body.id, userId: req.user._id }, postObj, { new: true, runValidators: true })
            .select('-userId')
            .then(postData => res.status(200).json(postData))
            .catch(err => {
                console.log(err);
                res.sendStatus(500);
            });
    }
}

module.exports = postControllers;