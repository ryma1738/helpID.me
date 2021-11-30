const { User, Notification, Post, Tip } = require("../models");

const notificationControllers = {
    notifyUser(req, res) { // TODO: need to write a custom sort so the unread messages are first and in order by created at
        User.findById(req.user._id)
            .select("notifications")
            .populate("notifications", "-__v -onReadDelete")
            .sort({createdAt: "desc"})
            .lean()
            .then(userData => {
                delete userData._id;
                delete userData.id;
                if (!userData || Object.keys(userData).length === 0) {
                    return res.sendStatus(204);
                }
                let notifications = userData.notifications.sort((x, y) => {
                    a1 = x.read ? 1 : 0
                    b1 = y.read ? 1 : 0
                    return a1 - b1
                });
                res.status(200).json(notifications);
            }).catch(err => res.status(500).json({ errorMessage: "Unknown Error", error: err, errMessage: err.message }));
    },
    markAsRead(req, res) { // mark notification as read 
        Notification.findById(req.params.id)
            .select("onReadDelete read")
            .lean()
            .then(notifyData => {
                if (!notifyData || Object.keys(notifyData).length === 0) {
                    return res.status(400).json({ errorMessage: "That Notification was not found" });
                } else if (notifyData.onReadDelete === true) {
                    User.findByIdAndUpdate(req.user._id,
                        { $pull: { notifications: req.params.id } },
                        { new: true, runValidators: true }).lean()
                        .then(userData => res.sendStatus(200))
                        
                } else if (notifyData.read === true) {
                    res.status(400).json({ errorMessage: "This notification is already marked as read"})
                } else {
                    Notification.findByIdAndUpdate(req.params.id, { read: true }, { new: true, runValidators: true }).lean()
                        .then(notifyData => {
                            if (!notifyData || Object.keys(notifyData).length === 0) {
                            return res.status(400).json({ errorMessage: "That notification was not found"});
                            }
                            res.sendStatus(200);
                        })
                        .catch(err => {
                            res.status(500).json({ errorMessage: "Unknown Error", error: err, errMessage: err.message })
                        });
                }

            }).catch(err => {
                if (err.name === "CastError") {
                    return res.status(400).json({ errorMessage: "That Notification was not found" });
                }
                res.status(500).json({ errorMessage: "Unknown Error", error: err, errMessage: err.message });
            });
    },
    communicationRequest(req, res) {
        // send a communication request notification to a user via tip: _id
        Post.findById(req.body.postId).select("_id userId title").lean().then(async postData => {
            if (req.user._id == postData.userId) {
                try {
                    const tipData = await Tip.findById(req.body.tipId)
                        .select("userId postId")
                        .populate("userId", "_id username")
                        .lean()
                    //error Handling
                    if (Object.keys(tipData).length === 0) {
                        return res.status(404).json({ errorMessage: "Tip was not found" });
                    }
                    if (!(req.body.postId == tipData.postId)) {
                        return res.status(400).json({ errorMessage: "The tip was not found attached to this post." });
                    }
                    if (!req.body.email && !req.body.phoneNumber && !req.body.other) {
                        return res.status(400).json({ errorMessage: "You must enter a form of contact to be able to send a contact request" })
                    }

                    let contactInfo = [];
                    if (req.body.email) {
                        contactInfo.push(" Email: " + req.body.email);
                    }
                    if (req.body.phoneNumber) {
                        contactInfo.push(" Phone Number: " + req.body.phoneNumber);
                    }
                    if (req.body.other) {
                        contactInfo.push(" Other: " + req.body.other)
                    }
                    const allContactInfo = contactInfo.join();
                    const notifyData = await Notification.create([{ //create notification for user so they know they got a tip
                        message: req.user.username
                            + " would like further contact with you regarding a tip you sent on the post titled: "
                            + postData.title + ". You can contact them via the following contact information: "
                            + allContactInfo
                            + ". Please use caution when replying to contact requests, and do not give them any of your personal information.",
                        postId: postData._id
                    }], { new: true, runValidators: true });
                    await User.findByIdAndUpdate(tipData.userId._id,
                        { $push: { notifications: notifyData[0]._id } },
                        { new: true, runValidators: true })

                    res.status(200).json({ message: "Communication request send successfully"})
                } catch (err) {
                    if (err.name === "ValidationError") {
                        if (err.errors.message.properties.type === "maxlength") {
                            res.status(400).json({ errorMessage: "The length of your notification is too large. You can have upto 400 characters total.", notificationText: err.errors.message.properties.value})
                        }
                    }
                    if (err.name === "CastError") {
                        if (err.kind === "ObjectId" && err.message.includes("Tip")) {
                            return res.status(400).json({ errorMessage: "That Tip was not found" });
                        }
                        return res.status(400).json({ errorMessage: "That Notification was not found" });
                    }
                    res.status(500).json({ errorMessage: "Unknown Error", error: err, errMessage: err.message });
                }
                
            } else {
                return res.status(401).json({ 
                    errorMessage: "You are not the owner of this post and cannot send communication request to tipsters"
                })
            }
        }).catch(err => {
            if (err.name === "CastError") {
                return res.status(400).json({ errorMessage: "That Post was not found" });
            }
            res.status(500).json({ errorMessage: "Unknown Error", error: err, errMessage: err.message });
        })
    },
    deleteNotification(req, res) {
        Notification.findById(req.params.id).select("_id onReadDelete").then(async notifyData => {
            if (!notifyData || Object.keys(notifyData).length === 0 ) {
                return res.status(400).json({ errorMessage: "That Notification was not found" });
            } else if (notifyData.onReadDelete === true) {
                User.findById(req.user._id).select("notifications").lean().then(userData => {
                    let containsId = userData.notifications.some(function (notification) {
                        return notification.equals(req.params.id)
                    });
                    if (containsId === true) {
                        User.findByIdAndUpdate(req.user._id, { $pull: { notifications: req.params.id } }, { new: true, runValidators: true })
                            .then(userData => res.status(200).json({ message: "Notification Removed" }))
                            .catch(err => res.status(500).json({ errorMessage: "Unknown Error", error: err, errMessage: err.message }));
                    } else {
                        return res.status(400).json({ errorMessage: "This notification has already been removed or is not found"});
                    }
                }).catch(err => res.status(500).json({ errorMessage: "Unknown Error", error: err, errMessage: err.message }))
            } else {
                User.findById(req.user._id).select("notifications").lean().then(userData => {
                    let containsId = userData.notifications.some(function (notification) {
                        return notification.equals(req.params.id)
                    });
                    console.log(containsId)
                    if (containsId === true) {
                        User.findByIdAndUpdate(req.user._id, { $pull: { notifications: req.params.id } }, { new: true, runValidators: true }).lean()
                            .then(async () => {
                                await Notification.findByIdAndDelete(req.params.id);
                                res.status(200).json({ message: "Notification Deleted" });
                            })
                            .catch(err => res.status(500).json({ errorMessage: "Unknown Error", error: err, errMessage: err.message }));
                    } else {
                        res.status(403).json({ errorMessage: "You can not delete other users notifications" })
                    }
                }).catch(err => res.status(500).json({ errorMessage: "Unknown Error", error: err, errMessage: err.message }))
               
            }
        }).catch(err => {
            if (err.name === "CastError") {
                return res.status(400).json({ errorMessage: "That Notification was not found" });
            }
            res.status(500).json({ errorMessage: "Unknown Error", error: err, errMessage: err.message });
        })
    },
    test(req, res) {
        Notification.find({}).lean().then(data => res.json(data));
    }
};

module.exports = notificationControllers;