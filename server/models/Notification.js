const { Schema, model, Types } = require('mongoose');

const notificationSchema = new Schema(
    {
        read: {
            type: Boolean,
            default: false,
            required: true
        },
        message: {
            type: String,
            maxlength: 100,
            required: true
        },
        senderID: { //could be auto generated or send from a person. If its send add userId of sender
            type: Types.ObjectId,
            ref: "User"
        },
        createdAt: {
            type: Date,
            default: Date.now(),
            expires: '60d'
        }
    }
);

const Notification = model('Notification', notificationSchema);

module.exports = Notification;