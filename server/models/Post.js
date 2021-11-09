const { Schema, model } = require('mongoose');
const { User } = require('./User');

const tipsSchema = new Schema(
    {

    }
);

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
        images: {
            type: Array,
            default: [],
        },
        video: {
            type: String,
            unique: true

        }
    }
);

const Post = model('Post', postSchema);

module.exports = Post;