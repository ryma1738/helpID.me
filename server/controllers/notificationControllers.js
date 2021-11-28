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
                if (Object.keys(userData).length === 0) {
                    return res.sendStatus(204);
                }
                let notifications = userData.notifications.sort((x, y) => {
                    a1 = x.read ? 1 : 0
                    b1 = y.read ? 1 : 0
                    return a1 - b1
                });
                res.status(200).json(notifications);
            }).catch(err => res.status(500).json({ errorMessage: "Unknown Error", error: err }));
    },
    markAsRead(req, res) { // mark notification as read 
        Notification.findById(req.params.id)
            .select("onReadDelete read")
            .lean()
            .then(notifyData => {
                if (notifyData.onReadDelete === true) {
                    User.findByIdAndUpdate(req.user._id,
                        { $pull: { notifications: req.params.id } },
                        { new: true, runValidators: true }).lean()
                        .then(userData => res.sendStatus(200))
                        
                } else if (notifyData.read === true) {
                    res.status(400).json({ errorMessage: "This notification is already marked as read"})
                } else {
                    Notification.findByIdAndUpdate(req.params.id, { read: true }, { new: true, runValidators: true }).lean()
                        .then(notifyData => {
                            if (Object.keys(notifyData).length === 0) {
                            return res.status(400).json({ errorMessage: "That notification was not found"});
                            }
                            res.sendStatus(200);
                        })
                        .catch(err => {
                            res.status(500).json({ errorMessage: "Unknown Error", error: err })
                        });
                }

            }).catch(err => {
                if (err.name === "CastError") {
                    return res.status(400).json({ errorMessage: "That Notification was not found" });
                }
                res.status(500).json({ errorMessage: "Unknown Error", error: err });
            });
    },
    communicationRequest(req, res) {
        // send a communication request notification to a user via tip: _id
        Post.findById(req.body.postId).select("_id userId").lean().then(async postData => {
            if (req.user._id === postData.userId) {
                try {
                    const tipData = await Tip.findById(req.body.tipId)
                        .select("userId postId anonymous")
                        .populate("userId", "_id username")
                        .lean()

                    //error Handling
                    if (Object.keys(tipData).length === 0) {
                        return res.status(404).json({ errorMessage: "Tip was not found" });
                    }
                    if (req.body.postId != tipData.postId) {
                        return res.status(400).json({ errorMessage: "The tip was not found attached to this post." });
                    }
                    if (!req.body.email && !req.body.phoneNumber && !req.body.other) {
                        return res.status(400).json({ errorMessage: "You must enter a form of contact to be able to send a contact request" })
                    }

                    let contactInfo = [];
                    if (req.body.email) {
                        contactInfo = contactInfo.push(" Email: " + req.body.email);
                    }
                    if (req.body.phoneNumber) {
                        contactInfo = contactInfo.push(" Phone Number: " + req.body.phoneNumber);
                    }
                    if (req.body.other) {
                        contactInfo = contactInfo.push(" Other: " + req.body.other)
                    }
                    const allContactInfo = contactInfo.join();
                    const notifyData = await Notification.create([{ //create notification for user so they know they got a tip
                        message: req.user.username
                            + " would like further contact with you regarding a tip you sent on the post titled: "
                            + postData.title + ". You can contact them via the following contact information: "
                            + allContactInfo
                            + ". Please use caution when replying to contact requests, and do not give them any of your personal information.",
                        postId: postData._id
                    }], { new: true, runValidators: true }).lean();
                    const userData = await User.findByIdAndUpdate(tipData.userId._id,
                        { $push: { notifications: notifyData[0]._id } },
                        { new: true, runValidators: true }).lean()

                    res.status(200).json({ message: "Communication request send successfully"})
                } catch (err) {
                    res.status(500).json({ errorMessage: "Unknown Error", error: err });
                }
                
            } else {
                return res.status(401).json({ errorMessage: "You are not the owner of this post and cannot send communication request to tipsters"})
            }
        }).catch(err => res.status(500).json({ errorMessage: "Unknown Error", error: err }))
    },
    deleteNotification(req, res) {

    },
    test(req, res) {
        Notification.find({}).lean().then(data => res.json(data));
    }
};

module.exports = notificationControllers;