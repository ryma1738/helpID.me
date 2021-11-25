const { Post, Tip, User, Notification } = require("../models");
const fs = require('fs');
const path = require('path');

const tipControllers = {

    getAllTips(req, res) { // for dev use only / admin use?
        Tip.find({})
            .select('-__v -image')
            .populate("postId", "title userId")
            .lean()
            .then(tipData => {
                res.status(200).json(tipData)
            })
    },
    async createTip(req, res) {
        try {
            const postData = await Post.findById(req.body.id).select('userId').populate("userId")
            const userData = postData.toJSON()
            if (userData.userId.id === req.user._id) {
                return res.status(403).json({ errorMessage: "You can not add a tip to your own post" })
            }
        } catch (err) {
            if (err.name === "CastError") {
                return res.status(400).json({ errorMessage: "Post was not found" })
            }
            return res.status(500).json({ errorMessage: "Unknown Error", error: err });
        }

        Tip.create([{
            title: req.body.title,
            subject: req.body.subject,
            userId: req.user._id,
            postId: req.body.id,
            image: req.file ? {
                data: fs.readFileSync(path.join(__dirname + "../../imageUploads/" + req.file.filename)),
                contentType: req.file.mimetype
            } : undefined
        }], { new: true, runValidators: true })
            .then(data => {
                Tip.findOne({ subject: req.body.subject }).select("_id id").then(tipData => {
                    Post.findByIdAndUpdate(req.body.id, { $push: { tips: tipData._id } }, { new: true, runValidators: true }).lean()
                        .then(async postData => {
                            res.status(200).json({ message: 'Tip was added successfully' });
                            const notifyData = await Notification.create([{ //create notification for user so they know they got a tip
                                message: "Someone sent a tip to your post: " + postData.title,
                                postId: postData._id
                            }], { new: true, runValidators: true }).lean();
                            User.findByIdAndUpdate(postData.userId, 
                                { $push: { notifications: notifyData[0]._id } },
                                { new: true, runValidators: true }).lean()
                                .catch(err => console.log(err));
                        })
                        .catch(err => res.status(500).json({ errorMessage: "Unknown Error", error: err }));
                }).catch(err => res.status(500).json({ errorMessage: "Unknown Error", error: err }));
            })
            .catch(err => {
                if (err.name === "ValidationError") {
                    if (err.errors.subject && err.errors.title) {
                        return res.status(400).json({ errorMessage: "The title and subject of the tip are required!" })
                    }
                    if (err.errors.subject) {
                        return res.status(400).json({ errorMessage: "The subject of the tip is required!" })
                    }
                    if (err.errors.title) {
                        return res.status(400).json({ errorMessage: "The title of the tip is required!" })
                    }

                } else {
                    console.log(err)
                    res.status(500).json({ errorMessage: "Unknown Error", error: err });
                }
            });

        if (req.file) {
            fs.rm(path.join(__dirname + "../../imageUploads/" + req.file.filename), {}, (err) => {
                if (err) {
                    console.log(err);
                }
            });
        }
    },
    editTip(req, res) {
        let data = {}
        if (!req.file && req.query.deleteImage) {
            Tip.findOne({ _id: req.body.id, userId: req.user._id }, function (err, tipData) {
                tipData.image = undefined;
                tipData.save();
            })
        }
        if (req.file) {
            data.image = {
                data: fs.readFileSync(path.join(__dirname + "../../imageUploads/" + req.file.filename)),
                contentType: req.file.mimetype
            }
        }
        if (req.body.title) {
            data.title = req.body.title
        }
        if (req.body.subject) {
            data.subject = req.body.subject
        }
        if (Object.keys(data).length === 0 && !req.query.deleteImage) {
            return res.status(400).json({ errorMessage: "You must enter data to update tip" })
        }
        if (Object.keys(data).length === 0 && req.query.deleteImage && !req.file) {
            return res.status(200).json({ message: "Image deleted successfully" })
        }
        Tip.findOneAndUpdate({ _id: req.body.id, userId: req.user._id }, data, { new: true, runValidators: true })
            .then(tipData => {
                if (!tipData) {
                    return res.status(400).json({ errorMessage: "Tip not found" })
                }
                res.status(200).json({ message: "Tip updated successfully" });
            })
            .catch(err => {
                res.status(500).json({ errorMessage: "Unknown Error", error: err });
            });
        if (req.file) {
            fs.rm(path.join(__dirname + "../../imageUploads/" + req.file.filename), {}, (err) => {
                if (err) {
                    console.log(err);
                }
            });
        }
    },
    async deleteTip(req, res) {
        Tip.findOneAndDelete({ _id: req.body.id, userId: req.user._id })
            .then(tipData => {
                if (!tipData) {
                    return res.status(404).json({ message: "Tip not found or you do not have permissions to delete this tip" })
                }
                res.status(200).json({ message: 'Tip deleted successfully' })
            }).catch(err => {
                res.status(500).json({ errorMessage: "Unknown Error", error: err });
            })
    }
};

module.exports = tipControllers;