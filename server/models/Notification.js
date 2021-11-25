const { Schema, model, Types } = require('mongoose');

const notificationSchema = new Schema(
    {
        read: {
            type: Boolean,
            default: false,
            required: true
        },
        onReadDelete: { //Should this notification be deleted off the users schema after it is read? 
                        //This is for when a mass notification is sent aka the admin sent a notification to everyone
                        //May change this in the future but right now this works.
            type: Boolean,
            default: false,
            required: true
        },
        message: {
            type: String,
            maxlength: 100,
            required: true
        },
        postId: {
            type: Types.ObjectId,
            ref: "Post"
        },
        createdAt: {
            type: Date,
            default: Date.now(),
            expires: '60d'
        }
    }
);

const Notification = model('Notification', notificationSchema);
//Notification.collection.deleteMany({})

module.exports = Notification;