const { Schema, model, Types } = require('mongoose');
const { Tip } = require('../models');

const postSchema = new Schema(
    {
        title: {
            type: String,
            required: true
        },
        date: {
            type: Date,
            default: Date.now
        },
        summary: {
            type: String,
            required: true,
            maxlength: 400
        },
        userId: {
            type: Types.ObjectId,
            ref: 'User',
            required: true
        },
        images: [{
            data: Buffer,
            contentType: String
        }],
        video: {
            type: String,
            unique: true

        },
        contactNumber: {
            type: String,
            match: [/^(\()?\d{3}(\))?(-|\s)?\d{3}(-|\s)\d{4}$/, 'Phone number format is incorrect, must be in this format: 888-888-8888']
        },
        tips: [{
            type: Types.ObjectId,
            ref: 'Tip' 
        }],
        views: { // could created a localStorage variable that lists each post id visited and will only update the count if the post id is not found.
            type: Number,
            default: 0
        },
        createdAt: {
            type: Date,
            default: Date.now(),
            expires: '1m'
        }
    },
    {
        toJSON: {
            virtuals: true,
        },
    }
);

postSchema.methods.tipsReceived = function () {
    return this.tips.length
}

const Post = model('Post', postSchema);

module.exports = Post;