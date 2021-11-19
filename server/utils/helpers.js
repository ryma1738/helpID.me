const { Post } = require("../models");
const fs = require("fs");
const path  =  require("path");

module.exports = {
    encodeImages: postData => {
        let images = [];
        for (let i = 0; i < postData.images.length; i++) {
            let image = Buffer.from(postData.images[i].data).toString('base64');
            images.push({
                _id: postData.images[i]._id,
                contentType: postData.images[i].contentType,
                imageBase64: image
            });
        }
        return images;
    },

    encodeImage: postData => {
        if (postData.images[0]) {
            let image = Buffer.from(postData.images[0].data).toString('base64');
            return {
                _id: postData.images[0]._id,
                contentType: postData.images[0].contentType,
                imageBase64: image
            };
        } else return [];

    },
    encodeSingleImage: image => {
            return Buffer.from(image).toString('base64');
            
    },
    addImages: async (index, req) => {
        try {
            const postData = await Post.findOneAndUpdate({ _id: req.params.id, userId: req.user._id }, {
                $push: {
                    images: {
                        data: fs.readFileSync(path.join(__dirname + "/../imageUploads/" + req.files[index].filename)),
                        contentType: req.files[index].mimetype
                    }
                }
            }, { new: true, runValidators: true })
            .select('-__v -userId')
            fs.rm(path.join(__dirname + "/../imageUploads/" + req.files[index].filename), {}, (err) => {
                if (err) {
                    console.log(err);
                }
            });
            if (!postData) {
                return { message: "That Post was not found or does not belong to you", status: 404 };
            } else {
                return { message: "Image added successfully", status: 200 };
            }
            
        } catch(err) {
            fs.rm(path.join(__dirname + "/../imageUploads/" + req.files[index].filename), {}, (err) => {
                if (err) {
                    console.log(err);
                }
            });
            if (err.name === "CastError") {
                if (err.kind === "ObjectId") {
                    return { message: "Post not found", status: 404 };
                }
            }
            return { message: err, status: 500 };
        }
    },
    removeImages: async (index, req) => {
        try {
            const postData = await Post.findOneAndUpdate({ _id: req.params.id, userId: req.user._id }, {
                $pull: {
                    images: {
                        _id: req.body.removeImages[index]
                    }
                }
            }, { new: true, runValidators: true })

            if (!postData) {
                return { message: "That Post was not found", status: 404 };
            } else if (postData.images.length === 0) {
                return { message: "This post contains no images", status: 200 };
            } else {
                return { message: "Image Removed Successfully", status: 200 };
            }
        } catch(err) {
            if (err.name === "CastError") {
                if (err.value === req.body.id) {
                    return { message: "That Post was not found", status: 404 };
                }
                return { message: "Image Id not found", status: 400 };
            }
            return { message: err, status: 500 };
        }
    }
}