const { Post, Tip, User, Notification } = require("../models");
const fs = require('fs');
const path = require('path');

function removeTempImage(req) {
    if (req.file) {
        fs.rm(path.join(__dirname + "../../public/temp/" + req.file.filename), {}, (err) => {
            if (err) {
                console.log(err);
            }
        });
    }
}

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
            const postData = await Post.findById(req.body.id).select('userId').lean();
            if (postData.userId === req.user._id) {
                removeTempImage(req);
                return res.status(403).json({ errorMessage: "You can not add a tip to your own post" })
            }
        } catch (err) {
            removeTempImage(req);
            if (err.name === "CastError") {
                return res.status(400).json({ errorMessage: "Post was not found" })
            }
            return res.status(500).json({ errorMessage: "Unknown Error", error: err, errMessage: err.message });
        }
        
        Tip.create([{
            title: req.body.title,
            subject: req.body.subject,
            anonymous: req.body.anonymous,
            userId: req.user._id,
            postId: req.body.id,
        }], { new: true, runValidators: true })
            .then(async data => {
                if (req.file) {
                    fs.readdir(path.join(__dirname + "../../public/"), (err, data) => {
                        if (err) console.log(err);
                        if (data.includes(req.body.id)) {
                            fs.copyFile(path.join(__dirname + "../../public/temp/" + req.file.filename),
                                path.join(__dirname + "../../public/" + req.body.id + "/" + req.file.filename), (err) => {
                                    if (err) console.log(err);
                                });
                        } else {
                            fs.mkdirSync(path.join(__dirname + "../../public/" + req.body.id));
                            fs.copyFile(path.join(__dirname + "../../public/temp/" + req.file.filename),
                                path.join(__dirname + "../../public/" + req.body.id + "/" + req.file.filename), (err) => {
                                    if (err) console.log(err);
                                });
                        }
                        removeTempImage(req);
                    });
                    
                    try {
                        await Tip.findByIdAndUpdate(data[0]._id,
                            { image: "/" + req.body.id + "/" + req.file.filename },
                            { new: true, runValidators: true }).lean();
                    } catch (err) {
                        await Tip.findByIdAndDelete(data[0]._id);
                        return res.status(500).json({ errorMessage: "Failed to upload Image, please try again.", error: err, errMessage: err.message });
                    }
                }
                Tip.findOne({ _id: data[0]._id }).select("_id postId id").then(tipData => {
                    Post.findByIdAndUpdate(req.body.id, { $push: { tips: tipData._id } }, { new: true, runValidators: true }).lean()
                        .then(postData => { 
                                Notification.create([{ //create notification for user so they know they got a tip
                                    message: "Someone sent a tip to your post: " + postData.title,
                                    postId: req.body.id
                                }], { new: true, runValidators: true})
                                .then(notifyData => {
                                    User.findByIdAndUpdate(postData.userId,
                                        { $push: { notifications: notifyData[0]._id } },
                                        { new: true, runValidators: true }).lean()
                                        .then(userData => res.status(200).json({ message: 'Tip was added successfully' }))
                                        .catch(err => res.status(500).json({ errorMessage: "Unknown Error", error: err, errMessage: err.message }))
                                })
                                .catch(err => res.status(500).json({ errorMessage: "Unknown Error", error: err, errMessage: err.message }));
                        })
                        .catch(async err => {
                            removeTempImage(req);
                            res.status(500).json({ errorMessage: "Unknown Error", error: err, errMessage: err.message })
                            await Tip.deleteOne({ _id: tipData._id });
                            await Post.findByIdAndUpdate(tipData.postId, { $pull: {tips: tipData._id } });

                        });
                }).catch(async err => {
                    removeTempImage(req);
                    res.status(500).json({ errorMessage: "Unknown Error", error: err, errMessage: err.message });
                    await Tip.deleteOne({ _id: tipData._id });
                    await Post.findByIdAndUpdate(tipData.postId, { $pull: { tips: tipData._id } });
                });
            })
            .catch(err => {
                removeTempImage(req);
                if (err.name === "ValidationError") {
                    if (err.errors.subject && err.errors.title) {
                        return res.status(400).json({ errorMessage: "The title and subject of the tip are required!" })
                    }
                    if (err.errors.subject) {
                        if (err.errors.subject.properties.type === "maxlength") {
                            return res.status(400).json({ errorMessage: "The subject of the tip can not exceed 1000 characters in length!" })
                        }
                        return res.status(400).json({ errorMessage: "The subject of the tip is required!" })
                    }
                    if (err.errors.title) {
                        return res.status(400).json({ errorMessage: "The title of the tip is required!" })
                    }

                } else {
                    res.status(500).json({ errorMessage: "Unknown Error", error: err, errMessage: err.message });
                }
            });
    },
    async editTip(req, res) {
        let data = {}
        if (!req.file && req.query.deleteImage) {
            Tip.findOne({ _id: req.body.id, userId: req.user._id }, function (err, tipData) {
                tipData.image = undefined;
                tipData.save();
            })
        }
        if (req.file) {
            const tipData = await Tip.findById(req.body.id).lean();
            fs.copyFile(path.join(__dirname + "../../public/temp/" + req.file.filename),
                path.join(__dirname + "../../public/" + tipData.postId + "/" + req.file.filename), (err) => {
                    if (err) console.log(err);
                });
            removeTempImage(req);
            data.image = "/" + tipData.postId + "/" + req.file.filename;
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
            return res.status(200).json({ message: "Image deleted successfully" });
        }
        Tip.findOneAndUpdate({ _id: req.body.id, userId: req.user._id }, data, { new: true, runValidators: true })
            .then(tipData => {
                if (!tipData) {
                    return res.status(400).json({ errorMessage: "Tip not found" })
                }
                res.status(200).json({ message: "Tip updated successfully" });
            })
            .catch(err => {
                fs.rm(path.join(__dirname + "../../public/" + tipData.postId + "/" + req.file[index].filename), {}, (err) => {
                    if (err) {
                        console.log(err);
                    }
                });
                res.status(500).json({ errorMessage: "Unknown Error", error: err, errMessage: err.message });
            });
    },
    async deleteTip(req, res) {
        Tip.findOneAndDelete({ _id: req.body.id, userId: req.user._id })
            .then(tipData => {
                if (!tipData) {
                    return res.status(404).json({ message: "Tip not found or you do not have permissions to delete this tip" })
                }
                fs.rm(path.join(__dirname + "../../public" + tipData.image), {}, (err) => {
                    if (err) {
                        console.log(err);
                    }
                });
                Post.findByIdAndUpdate(tipData.postId, { $pull: { tips: tipData._id } }, {runValidators: true}).lean()
                    .then(postData => res.status(200).json({ message: 'Tip deleted successfully' }))
                    .catch(err => {
                        res.status(200).json({ 
                            message: 'Tip deleted successfully with exception: Tip id was not removed from post due to error', 
                            error: err
                        });
                    })
                
                
            }).catch(err => {
                res.status(500).json({ errorMessage: "Unknown Error", error: err, errMessage: err.message });
            })
    }
};

module.exports = tipControllers;