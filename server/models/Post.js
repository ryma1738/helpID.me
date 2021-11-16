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
            type: String,
            match: [/^((?:https?:)?\/\/)?((?:www|m)\.)?((?:youtube\.com|youtu.be))(\/(?:[\w\-]+\?v=|embed\/|v\/)?)([\w\-]+)(\S+)?$/, "Not a valid Youtube link!"]
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
            expires: '120d'
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

postSchema.methods.expiresIn = async function () {
    const createdAt = this.createdAt
    const now = Date.now();
    const diff = now - createdAt; 
    const timeRemaining = ((10368000 * 1000) - diff) / 1000;
    if (timeRemaining < 3600) {
        return { timeRemaining: Math.ceil(timeRemaining / 60), value: "minutes"}
    } else if (timeRemaining < 86400) {
        return { timeRemaining: Math.ceil(timeRemaining / 60 / 60), value: "hours"}
    } else {
        return { timeRemaining: Math.ceil(timeRemaining / 60 / 60 / 24), value: "days"} 
    }  
}

postSchema.methods.totalImages = function () {
    return this.images.length;
}

const Post = model('Post', postSchema); 

//Post.collection.deleteMany({}); // this is used to delete all posts on file for dev use only
// async function test() {
//     console.log( await Post.collection.indexes())
// }
// test()    

module.exports = Post;