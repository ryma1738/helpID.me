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
            required: true
        },
        postId: {
            type: Types.ObjectId,
            required: true
        },
        image: {
            data: Buffer,
            contentType: String
        }
    }
);

const Tip = model('Tip', tipSchema);

module.exports = Tip;