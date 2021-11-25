const { User, Notification } = require("../models");

const notificationControllers = {
    notifyUser(req, res) { // TODO: need to write a custom sort so the unread messages are first and in order by created at
        User.findById(req.user._id)
            .select("notifications")
            .populate("notifications", "-__v -onReadDelete")
            .lean()
            .then(userData => {
                delete userData._id;
                delete userData.id;
                if (Object.keys(userData).length === 0) {
                    return res.sendStatus(204);
                }
                res.status(200).json(userData);
            }).catch(err => res.status(500).json({ errorMessage: "Unknown Error", error: err }));
    },
    markAsRead(req, res) { // mark notification as read TODO: check if onReadDelete is true before marking as read
        Notification.findById(req.params.id)
            .select("onReadDelete read")
            .lean()
            .then(onReadDelete => {
                if (onReadDelete.onReadDelete === true) {
                    User.findByIdAndUpdate(req.user._id,
                        { $pull: { notifications: req.params.id } },
                        { new: true, runValidators: true }).lean()
                        .then(userData => res.sendStatus(200))
                        
                } else if (onReadDelete.read === true) {
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
    },
    test(req, res) {
        Notification.find({}).lean().then(data => res.json(data))
    }
};

module.exports = notificationControllers;