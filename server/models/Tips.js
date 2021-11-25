const { Schema, model, Types } = require('mongoose');

const tipSchema = new Schema(
    {
        title: {
            type: String,
            required: true
        },
        subject: {
            type: String,
            required: true
        },
        userId: {
            type: Types.ObjectId,
            ref: "User",
            required: true
        },
        postId: {
            type: Types.ObjectId,
            ref: "Post",
            required: true
        },
        image: {
            data: Buffer,
            contentType: String
        },
        anonymous: {
            type: Boolean,
            default: false
        },
        createdAt: {
            type: Date,
            default: Date.now(),
            expires: '120d'
        }
    }
);

const Tip = model('Tip', tipSchema);

//Tip.collection.deleteMany({}) // this is used to delete all tips on file for dev use only
module.exports = Tip;