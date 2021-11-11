const { Schema, model, Types, Model } = require('mongoose');


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
            type: String
        },
        contactNumber: {
            type: String,
            match: [/^(\()?\d{3}(\))?(-|\s)?\d{3}(-|\s)\d{4}$/, 'Phone number format is incorrect, must be in this format: 888-888-8888']
        },
        tips: [{
            type: Types.ObjectId,
            ref: 'Tip' 
        }],
        views: { // could create a localStorage variable that lists each post id visited and will only update the count if the post id is not found.
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
    if (this.tips) {
        return this.tips.length
    } else {
        return 0;
    }
    
}

const Post = model('Post', postSchema);

module.exports = Post;